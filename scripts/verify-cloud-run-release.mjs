import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Generate this exact upload inventory with gcloud meta list-files-for-upload.
// Credential values are read only for comparison, never printed or exported.
const upload = (await readFile('.sites-runtime/twin-upload-manifest.txt', 'utf8')).trim().split('\n').filter(Boolean);
assert.ok(upload.length > 0);
assert.ok(!upload.some(file => /(^|\/)\.(dev\.vars|env)(\.|$)/.test(file)), 'Private environment files must not enter the upload');
const vars = await readFile('.dev.vars', 'utf8').catch(() => '');
const keys = [...vars.matchAll(/^(?:GEMINI|XAI|GROQ)_API_KEY(?:_[2-4])?\s*=\s*(.*)$/gm)]
  .map(match => match[1].trim().replace(/^(["'])(.*)\1$/, '$2')).filter(Boolean);
async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(file));
    else if (entry.isFile()) files.push(file);
  }
  return files;
}
const build = await walk('dist/standalone');
assert.ok(build.length > 0);
let matches = 0;
for (const file of [...upload, ...build]) {
  const bytes = await readFile(file);
  if (keys.some(key => bytes.includes(Buffer.from(key)))) matches++;
}
assert.equal(matches, 0, 'Configured credentials found in release content; do not publish');
const worker = await readFile('dist/standalone/public/sw.js', 'utf8');
assert.equal(await readFile('dist/standalone/dist/client/sw.js', 'utf8'), worker);
const { allReferencePhotos } = await import(pathToFileURL(path.resolve('.sites-runtime/domain-tests/references.mjs')));
for (const photo of allReferencePhotos) {
  const bytes = await readFile(`dist/standalone/public${photo.src}`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), photo.sha256);
  assert.ok(worker.includes(photo.src.slice(1)));
}
for (const file of ['source-weather-v2.json', 'european-context-v2.json', 'river-twins/coimbra.json', 'river-twins/toulouse.json', 'river-twins/oslo.json', 'river-twins/coimbra-surface.jpg', 'river-twins/toulouse-surface.jpg', 'river-twins/oslo-surface.jpg', 'river-twins/CREDITS.md']) {
  const original = await readFile(`public/${file}`);
  assert.deepEqual(await readFile(`dist/standalone/public/${file}`), original);
  assert.ok(worker.includes(file), `${file} missing from the offline inventory`);
}
assert.equal(JSON.parse(await readFile('dist/standalone/public/source-weather-v2.json', 'utf8')).entries.length, 78);
const report = { checkedAt: new Date().toISOString(), uploadFiles: upload.length, standaloneFiles: build.length, configuredSecretsChecked: keys.length, configuredSecretMatches: matches, originalPhotoDigests: allReferencePhotos.length, retainedWeatherWindows: 78, geographicModels: 3, standaloneAssetsAndOfflineInventory: true, limitations: ['Configured credential comparison and retained-asset integrity checks; not a comprehensive security audit or an offline browser run.'] };
await writeFile('.sites-runtime/river-twin-release-check.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));

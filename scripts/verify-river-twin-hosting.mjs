import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const origin = new URL(process.argv[2]);
assert.equal(origin.protocol, 'https:');
assert.ok(origin.hostname.endsWith('.run.app'));
const report = { checkedAt: new Date().toISOString(), origin: origin.origin, routes: [], geographicAssets: [], aiConfigured: false, limitations: ['HTTP, asset integrity and capability checks; browser rendering and live model requests are recorded separately.'] };
const get = path => fetch(new URL(path, origin), { redirect: 'error', signal: AbortSignal.timeout(45000) });
for (const path of ['/', '/showcase', '/visuals?collection=showcase', '/twins?collection=showcase', '/manifest.webmanifest', '/sw.js']) {
  const response = await get(path);
  assert.equal(response.status, 200, `${path} is unavailable`);
  const text = await response.text();
  if (path === '/sw.js') for (const id of ['coimbra', 'toulouse', 'oslo']) assert.ok(text.includes(`river-twins/${id}.json`));
  report.routes.push({ path, status: response.status });
}
await Promise.all(['coimbra.json', 'toulouse.json', 'oslo.json', 'coimbra-surface.jpg', 'toulouse-surface.jpg', 'oslo-surface.jpg', 'CREDITS.md'].map(async file => {
  const response = await get(`/river-twins/${file}`);
  assert.equal(response.status, 200);
  const hosted = Buffer.from(await response.arrayBuffer()), local = await readFile(`public/river-twins/${file}`);
  assert.deepEqual(hosted, local, `${file} differs from the validated local source`);
  report.geographicAssets.push({ file, status: response.status, bytes: hosted.length, sha256: createHash('sha256').update(hosted).digest('hex'), matchesValidatedSource: true });
}));
report.geographicAssets.sort((a, b) => a.file.localeCompare(b.file));
const weather = await get('/source-weather-v2.json');
assert.equal(weather.status, 200);
assert.equal((await weather.json()).entries.length, 78);
const response = await get('/api/assess');
assert.equal(response.status, 200);
const capabilities = await response.json();
assert.equal(capabilities.liveAI, true);
assert.equal(capabilities.provider, 'Groq');
report.aiConfigured = true;
report.provider = capabilities.provider;
await writeFile('.sites-runtime/river-twin-hosted-verification.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));

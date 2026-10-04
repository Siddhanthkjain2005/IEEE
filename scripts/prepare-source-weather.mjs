import { readFile, writeFile, mkdir } from "node:fs/promises";
import { sourceWeatherModules } from "./source-weather-modules.mjs";

// Public, keyless context only. Preserve v1 and every retained retrieval time.
const { source, route, catalogue } = await sourceWeatherModules();
const target = `public${source.SOURCE_WEATHER_ASSET}`;
const checkpoint = `.sites-runtime${source.SOURCE_WEATHER_ASSET}.partial`;
const expected = catalogue.europeanPhotoLibrary.flatMap(photo => [7, 15].map(days => ({ photoId: photo.id, days })));
const identity = entry => `${entry.photoId}:${entry.days}`;
const complete = entries => entries.length === expected.length && expected.every(window => entries.some(entry => identity(entry) === identity(window)));
async function readBundle(path) {
  try { return source.sourceWeatherBundleSchema.parse(JSON.parse(await readFile(path, "utf8"))); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}
const existing = await readBundle(target);
if (existing) {
  if (!complete(existing.entries)) throw new Error("Incomplete immutable archive; use a new asset revision.");
  console.log(`Preserved ${existing.entries.length} recorded windows with their original retrieval times; no requests made.`);
} else {
  const original = await readBundle("public/source-weather-v1.json");
  const pending = await readBundle(checkpoint);
  const retained = new Map((pending?.entries ?? []).map(entry => [identity(entry), entry]));
  for (const entry of original?.entries ?? []) retained.set(identity(entry), entry);
  await mkdir(".sites-runtime", { recursive: true });
  const failures = [];
  for (const window of expected) {
    const id = identity(window);
    if (retained.has(id)) continue;
    const response = await route.GET(new Request(`https://source-preparation.test/api/source-weather?photoId=${encodeURIComponent(window.photoId)}&days=${window.days}`));
    if (response.ok) {
      retained.set(id, source.sourceWeatherSchema.parse(await response.json()));
      const partial = source.sourceWeatherBundleSchema.parse({ kind: "recorded_archive_context", entries: [...retained.values()] });
      await writeFile(checkpoint, JSON.stringify(partial, null, 2) + "\n");
      console.log(JSON.stringify({ photoId: window.photoId, days: window.days, retained: retained.size, kind: "historical_weather_model_context" }));
    } else { failures.push(id); console.log(JSON.stringify({ photoId: window.photoId, days: window.days, status: response.status, retained: false })); }
    // Bounded public-service pacing; no quota bypass or substitute values.
    await new Promise(resolve => setTimeout(resolve, 1100));
  }
  if (failures.length) throw new Error(`${failures.length} source windows remain unavailable. Progress is retained locally; no incomplete public bundle or replacement values written.`);
  const entries = expected.map(window => retained.get(identity(window)));
  const checked = source.sourceWeatherBundleSchema.parse({ kind: "recorded_archive_context", entries });
  if (!complete(checked.entries)) throw new Error("Source coverage is incomplete; no bundle written.");
  await writeFile(target, JSON.stringify(checked, null, 2) + "\n", { flag: "wx" });
  console.log(`Retained ${entries.length} genuine source windows; no AI, private evidence or generated readings.`);
}

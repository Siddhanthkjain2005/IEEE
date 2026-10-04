import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Three bounded public geographic extracts. Re-running preserves the recorded
// responses and their dates; it never refreshes an existing published model.
const sites = [
  { id: 'coimbra', river: 'Mondego', city: 'Coimbra', country: 'Portugal', center: [-8.4292, 40.2032], extent: 1700 },
  { id: 'toulouse', river: 'Garonne', city: 'Toulouse', country: 'France', center: [1.4345, 43.5982], extent: 1700 },
  { id: 'oslo', river: 'Hoffselva', city: 'Oslo', country: 'Norway', center: [10.6775, 59.9253], extent: 1400 },
];
const out = 'public/river-twins';
const cache = '.sites-runtime/river-twin-sources';
await mkdir(out, { recursive: true }); await mkdir(cache, { recursive: true });
const sha = b => createHash('sha256').update(b).digest('hex');
const merc = ([lon, lat]) => [lon * Math.PI / 180 * 6378137, Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * 6378137];
const inverse = ([x, y]) => [x / 6378137 * 180 / Math.PI, (2 * Math.atan(Math.exp(y / 6378137)) - Math.PI / 2) * 180 / Math.PI];
const tile = ([lon, lat], z) => [(lon + 180) / 360 * 2 ** z, (1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * 2 ** z];
async function retained(url, key) {
  const path = `${cache}/${key}`;
  try { return { bytes: await readFile(path), ...JSON.parse(await readFile(path + '.json', 'utf8')) }; }
  catch (e) { if (e.code !== 'ENOENT') throw e; }
  const response = await fetch(url, { signal: AbortSignal.timeout(55000), headers: { 'User-Agent': 'AquaLens geographic prototype / bounded public source preparation' } });
  if (!response.ok) throw new Error(`Public source ${response.status}: ${url.split('?')[0]}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const meta = { url, fetchedAt: new Date().toISOString(), sha256: sha(bytes) };
  await writeFile(path, bytes); await writeFile(path + '.json', JSON.stringify(meta));
  return { bytes, ...meta };
}
async function mosaic(bounds, z, type, site) {
  const nw = tile([bounds[0], bounds[3]], z), se = tile([bounds[2], bounds[1]], z);
  const x0 = Math.floor(nw[0]), y0 = Math.floor(nw[1]);
  const x1 = Math.floor(se[0]), y1 = Math.floor(se[1]);
  const width = (x1 - x0 + 1) * 256, height = (y1 - y0 + 1) * 256;
  const layers = [], sources = [];
  if ((x1 - x0 + 1) * (y1 - y0 + 1) > 25) throw new Error('Bounded tile limit exceeded');
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const url = type === 'dem'
      ? `https://elevation-tiles-prod.s3.amazonaws.com/terrarium/${z}/${x}/${y}.png`
      : `https://wmts.terrascope.be/?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=esa-worldcover-s2rgbnir-10m-2021-v2_tcc&STYLE=default&FORMAT=image%2Fpng&TILEMATRIXSET=EPSG%3A3857&TILEMATRIX=${z}&TILECOL=${x}&TILEROW=${y}&TIME=2021-01-01`;
    const result = await retained(url, `${type}-${z}-${x}-${y}.png`);
    const metadata = await sharp(result.bytes).metadata();
    if (metadata.width !== 256 || metadata.height !== 256) throw new Error('Unexpected source tile dimensions');
    layers.push({ input: result.bytes, left: (x - x0) * 256, top: (y - y0) * 256 });
    sources.push({ url: result.url, fetchedAt: result.fetchedAt, sha256: result.sha256 });
  }
  const png = await sharp({ create: { width, height, channels: 3, background: '#000000' } }).composite(layers).png().toBuffer();
  const left = Math.round((nw[0] - x0) * 256), top = Math.round((nw[1] - y0) * 256);
  const w = Math.min(width - left, Math.round((se[0] - nw[0]) * 256));
  const h = Math.min(height - top, Math.round((se[1] - nw[1]) * 256));
  const cropped = sharp(png).extract({ left, top, width: w, height: h });
  if (type === 'imagery') {
    const jpg = await cropped.resize(1024, 1024, { fit: 'fill' }).jpeg({ quality: 90 }).toBuffer();
    await writeFile(`${out}/${site.id}-surface.jpg`, jpg);
    return { sources, sha256: sha(jpg), sourcePixels: [w, h] };
  }
  // Decode before resampling: encoded RGB interpolation can corrupt heights.
  const { data, info } = await cropped.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const decoded = Array.from({ length: info.width * info.height }, (_, i) => data[i * 3] * 256 + data[i * 3 + 1] + data[i * 3 + 2] / 256 - 32768);
  const n = 129, heights = [];
  for (let row = 0; row < n; row++) for (let col = 0; col < n; col++) {
    const x = col / (n - 1) * (info.width - 1), y = row / (n - 1) * (info.height - 1);
    const ix = Math.floor(x), iy = Math.floor(y), dx = x - ix, dy = y - iy;
    const get = (xx, yy) => decoded[Math.min(info.height - 1, yy) * info.width + Math.min(info.width - 1, xx)];
    const value = get(ix, iy) * (1 - dx) * (1 - dy) + get(ix + 1, iy) * dx * (1 - dy) + get(ix, iy + 1) * (1 - dx) * dy + get(ix + 1, iy + 1) * dx * dy;
    if (!Number.isFinite(value) || value < -100 || value > 2500) throw new Error('Invalid terrain sample');
    heights.push(Math.round(value * 100) / 100);
  }
  return { sources, gridSize: n, heights, sourcePixels: [info.width, info.height], min: Math.min(...heights), max: Math.max(...heights) };
}
for (const site of sites) {
  try { await readFile(`${out}/${site.id}.json`); console.log(`${site.id}: existing model preserved`); continue; } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const origin = merc(site.center), cos = Math.cos(site.center[1] * Math.PI / 180), half = site.extent / cos / 2;
  const sw = inverse([origin[0] - half, origin[1] - half]), ne = inverse([origin[0] + half, origin[1] + half]);
  const bounds = [sw[0], sw[1], ne[0], ne[1]];
  const bbox = [bounds[1], bounds[0], bounds[3], bounds[2]].join(',');
  const query = `[out:json][timeout:40];(way[building](${bbox});way[natural=water](${bbox});way[waterway](${bbox});way[highway](${bbox});way[landuse=forest](${bbox});way[natural=wood](${bbox});node[natural=tree](${bbox}););out geom;`;
  const source = await retained('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query), `${site.id}-osm.json`);
  const osm = JSON.parse(source.bytes.toString());
  if (!Array.isArray(osm.elements) || osm.remark) throw new Error(`Incomplete OSM response for ${site.id}`);
  const local = point => { const m = merc([point.lon, point.lat]); return [Math.round((m[0] - origin[0]) * cos * 100) / 100, Math.round((origin[1] - m[1]) * cos * 100) / 100]; };
  const positive = value => { const number = Number.parseFloat(value); return Number.isFinite(number) && number > 0 && number <= 250 ? number : null; };
  const features = osm.elements.filter(e => e.type === 'node' || e.geometry?.length >= 2).map(e => ({
    id: `${e.type}/${e.id}`, kind: e.tags?.building ? 'building' : e.tags?.natural === 'water' || e.tags?.waterway === 'riverbank' ? 'water' : e.tags?.waterway ? 'waterway' : e.tags?.highway ? 'road' : e.tags?.natural === 'tree' ? 'tree' : 'vegetation',
    name: e.tags?.name ?? null, tags: e.tags ?? {}, points: e.type === 'node' ? [local(e)] : e.geometry.filter(p => p.lat != null && p.lon != null).map(local),
    height: positive(e.tags?.height), levels: positive(e.tags?.['building:levels']),
  }));
  const riverMatches = features.filter(f => (f.kind === 'waterway' || f.kind === 'water') && (f.name ?? '').includes(site.river));
  if (!riverMatches.length) throw new Error(`Named river missing from bounded ${site.id} extract; do not publish a wrong reach.`);
  const terrain = await mosaic(bounds, 13, 'dem', site);
  const imagery = await mosaic(bounds, 14, 'imagery', site);
  const model = { version: 'river-reach-v1', ...site, bounds, recordedAt: new Date().toISOString(), terrain, imagery: { ...imagery, asset: `/river-twins/${site.id}-surface.jpg`, year: 2021, source: 'ESA WorldCover annual Sentinel-2 RGB composite' }, osm: { url: source.url, fetchedAt: source.fetchedAt, sha256: source.sha256, timestamp: osm.osm3s?.timestamp_osm_base ?? null }, features,
    limitations: ['Static geographic reconstruction; no live sensors or hydraulic simulation.', 'Terrain is resampled source elevation; acquisition dates and local accuracy are not independently verified.', 'Imagery is an annual 2021 composite, not a current orthophoto.', 'Mapped footprints are source geometry; untagged building heights, windows, vegetation and water appearance are illustrative.', 'Photo viewing points are unknown; source photographs are context, not registered camera views.'] };
  await writeFile(`${out}/${site.id}.json`, JSON.stringify(model));
  console.log(JSON.stringify({ site: site.id, namedRiverFeatures: riverMatches.length, features: features.length, terrainRange: [terrain.min, terrain.max], imageryPixels: imagery.sourcePixels }));
}

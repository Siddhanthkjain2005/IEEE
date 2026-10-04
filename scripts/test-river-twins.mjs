import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const require = createRequire(import.meta.url), loaded = { exports: {} };
const code = ts.transpileModule(await readFile('lib/river-twins.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
vm.runInNewContext(code, { module: loaded, exports: loaded.exports, require });
const { riverTwinSchema, terrainHeight, localCoordinates, buildingHeight, clipRing } = loaded.exports;
let count = 0;
function test(name, body) { body(); count++; console.log(`PASS ${name}`); }
const models = [];
for (const id of ['coimbra', 'toulouse', 'oslo']) {
  const raw = JSON.parse(await readFile(`public/river-twins/${id}.json`, 'utf8'));
  const image = await readFile(`public/river-twins/${id}-surface.jpg`);
  test(`${id}: complete bounded geographic dataset validates`, () => { const model = riverTwinSchema.parse(raw); assert.equal(model.id, id); assert.equal(model.terrain.heights.length, 16641); models.push(model); });
  test(`${id}: retained imagery digest identifies the actual served texture`, () => assert.equal(createHash('sha256').update(image).digest('hex'), raw.imagery.sha256));
  test(`${id}: named river geometry exists in the selected reach`, () => assert.ok(raw.features.some(f => ['water', 'waterway'].includes(f.kind) && f.name?.includes(raw.river) && f.points.some(p => Math.abs(p[0]) < raw.extent / 2 && Math.abs(p[1]) < raw.extent / 2))));
  test(`${id}: projected center round-trips and model bounds contain it`, () => { const center = localCoordinates(raw, 0, 0); assert.ok(Math.abs(center[0] - raw.center[0]) < 1e-8); assert.ok(Math.abs(center[1] - raw.center[1]) < 1e-8); });
  test(`${id}: terrain interpolation remains finite at edges and outside bounds`, () => { for (const [x,z] of [[0,0],[-raw.extent/2,-raw.extent/2],[raw.extent/2,raw.extent/2],[raw.extent*2,-raw.extent*2]]) { const h=terrainHeight(raw,x,z);assert.ok(Number.isFinite(h));assert.ok(h>=raw.terrain.min-.01&&h<=raw.terrain.max+.01); } });
  test(`${id}: all visible water polygons clip within terrain bounds`, () => { for(const f of raw.features.filter(f=>f.kind==='water'))for(const p of clipRing(f.points,raw.extent)){assert.ok(p.every(Number.isFinite));assert.ok(p.every(v=>Math.abs(v)<=raw.extent/2+.001));} });
}
test('Hoffselva reach uses river coordinates rather than Oslo city overview', () => { const d=models[2]; assert.ok(d.center[0]<10.70);assert.ok(Math.abs(d.center[0]-10.738889)>.04); });
test('Source-only height, mapped levels and unknown height remain distinguishable', () => { assert.equal(buildingHeight({height:12,levels:null}).basis,'OSM height tag');assert.equal(buildingHeight({height:null,levels:3}).meters,9.600000000000001);assert.equal(buildingHeight({height:null,levels:null}).meters,8);assert.match(buildingHeight({height:null,levels:null}).basis,/unknown/); });
test('Changing image identity or geographic center rejects inconsistent models', () => { const d=structuredClone(models[0]);d.imagery.asset='/river-twins/oslo-surface.jpg';assert.equal(riverTwinSchema.safeParse(d).success,false);d.imagery.asset='/river-twins/coimbra-surface.jpg';d.center=[0,0];assert.equal(riverTwinSchema.safeParse(d).success,false); });
test('Removing named river geometry cannot publish an unrelated city model', () => { const d=structuredClone(models[0]);d.features=d.features.filter(f=>!f.name?.includes(d.river));assert.equal(riverTwinSchema.safeParse(d).success,false); });
test('Missing or invalid elevation is rejected rather than replaced by zero', () => {const d=structuredClone(models[0]);d.terrain.heights[0]=null;assert.equal(riverTwinSchema.safeParse(d).success,false);d.terrain.heights[0]=Infinity;assert.equal(riverTwinSchema.safeParse(d).success,false);});
test('Multipolygon river data retains source relation identity and island rings',()=>{for(const d of models.slice(0,2)){assert.ok(d.waterRelations);assert.ok(d.features.some(f=>f.kind==='water'&&f.id.startsWith('relation/')));}assert.ok(models[1].features.some(f=>f.kind==='water'&&(f.holes?.length??0)>0));});
test('Terrain and source metadata are free of invented measurements or AI results',()=>{for(const d of models){assert.equal(d.imagery.year,2021);assert.ok(d.limitations.some(s=>s.includes('no live sensors')));assert.equal(d.assessment,undefined);assert.equal(d.measurements,undefined);assert.ok(d.terrain.sources.every(s=>s.url.startsWith('https://elevation-tiles-prod.s3.amazonaws.com/terrarium/')));}});
console.log(`${count}/${count} authored river-twin data and geometry checks passed. Not a survey, ecological evaluation, or WebGL performance benchmark.`);

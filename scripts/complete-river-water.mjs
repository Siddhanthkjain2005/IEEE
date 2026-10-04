import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
// Supplement the same three bounded extracts with OSM multipolygon water.
// Outer/inner rings remain distinct; islands must never be filled as water.
for (const id of ['coimbra', 'toulouse', 'oslo']) {
  const path = `public/river-twins/${id}.json`, model = JSON.parse(await readFile(path, 'utf8'));
  if (model.waterRelations) { console.log(`${id}: retained water rings preserved`); continue; }
  const b = model.bounds, query = `[out:json][timeout:40];relation[natural=water](${b[1]},${b[0]},${b[3]},${b[2]});out geom;`;
  const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
  const cached = `.sites-runtime/river-twin-sources/${id}-water-relations.json`;
  let bytes, meta;
  try { bytes = await readFile(cached); meta = JSON.parse(await readFile(cached + '.meta', 'utf8')); }
  catch(e) { if (e.code !== 'ENOENT') throw e; const response = await fetch(url, { signal: AbortSignal.timeout(55000), headers: { 'User-Agent': 'AquaLens geographic prototype / bounded public source preparation' } }); if (!response.ok) throw new Error(`Water source unavailable: ${response.status}`); bytes = Buffer.from(await response.arrayBuffer()); meta = { url, fetchedAt: new Date().toISOString(), sha256: createHash('sha256').update(bytes).digest('hex') }; await writeFile(cached, bytes); await writeFile(cached + '.meta', JSON.stringify(meta)); }
  const source = JSON.parse(bytes); if (source.remark) throw new Error('Incomplete relation response');
  const r = 6378137, cos = Math.cos(model.center[1] * Math.PI / 180), mx = model.center[0] * Math.PI / 180 * r, my = Math.log(Math.tan(Math.PI / 4 + model.center[1] * Math.PI / 360)) * r;
  const local = p => [Math.round((p.lon * Math.PI / 180 * r - mx) * cos * 100) / 100, Math.round((my - Math.log(Math.tan(Math.PI / 4 + p.lat * Math.PI / 360)) * r) * cos * 100) / 100];
  const same = (a,b) => Math.abs(a[0]-b[0])<.1 && Math.abs(a[1]-b[1])<.1;
  function rings(members,role) {
    const parts = members.filter(m=>m.type==='way' && (m.role||'outer')===role && m.geometry?.length>1).map(m=>m.geometry.map(local));
    const result=[];
    while(parts.length){let ring=parts.shift(),progress=true;while(!same(ring[0],ring.at(-1))&&progress){progress=false;for(let i=0;i<parts.length;i++){let p=parts[i];if(same(ring.at(-1),p[0]))ring.push(...p.slice(1));else if(same(ring.at(-1),p.at(-1)))ring.push(...p.slice(0,-1).reverse());else if(same(ring[0],p.at(-1)))ring.unshift(...p.slice(0,-1));else if(same(ring[0],p[0]))ring.unshift(...p.slice(1).reverse());else continue;parts.splice(i,1);progress=true;break;}}if(same(ring[0],ring.at(-1)))result.push(ring);}
    return result;
  }
  const inside = (p,poly) => {let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a[1]>p[1])!==(b[1]>p[1]))&&(p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]))c=!c;}return c;};
  let count=0;
  for(const relation of source.elements){const outer=rings(relation.members??[],'outer'),inner=rings(relation.members??[],'inner');for(const polygon of outer){model.features.push({id:`relation/${relation.id}`,kind:'water',name:relation.tags?.name??null,tags:relation.tags??{},points:polygon,holes:inner.filter(h=>inside(h[0],polygon)),height:null,levels:null});count++;}}
  model.waterRelations=meta; await writeFile(path,JSON.stringify(model)); console.log(JSON.stringify({id,relations:source.elements.length,closedWaterRings:count}));
}

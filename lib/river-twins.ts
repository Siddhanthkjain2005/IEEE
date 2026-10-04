import { z } from 'zod';

export const twinSites = [
  { id: 'coimbra', river: 'Mondego', city: 'Coimbra', country: 'Portugal', subtitle: 'The river and the hillside city', photoId: 'mondego-coimbra', accent: '#d6b982' },
  { id: 'toulouse', river: 'Garonne', city: 'Toulouse', country: 'France', subtitle: 'Bridges across the pink city', photoId: 'garonne-toulouse', accent: '#d29a85' },
  { id: 'oslo', river: 'Hoffselva', city: 'Oslo', country: 'Norway', subtitle: 'A green corridor through the city', photoId: 'hoffselva-oslo', accent: '#9abaad' },
] as const;
export type TwinSiteId = typeof twinSites[number]['id'];
const point = z.tuple([z.number().finite(), z.number().finite()]);
const source = z.object({ url: z.string().url(), fetchedAt: z.string().datetime(), sha256: z.string().regex(/^[a-f0-9]{64}$/) });
export const twinFeatureSchema = z.object({ id: z.string().regex(/^(way|node|relation)\/\d+$/), kind: z.enum(['building', 'water', 'waterway', 'road', 'tree', 'vegetation']), name: z.string().nullable(), tags: z.record(z.string()), points: z.array(point).min(1).max(100000), holes: z.array(z.array(point)).optional(), height: z.number().positive().max(250).nullable(), levels: z.number().positive().max(250).nullable() });
export type TwinFeature = z.infer<typeof twinFeatureSchema>;
export const riverTwinSchema = z.object({
  version: z.literal('river-reach-v1'), id: z.enum(['coimbra', 'toulouse', 'oslo']), river: z.string(), city: z.string(), country: z.string(), center: point, extent: z.number().min(500).max(3000), bounds: z.tuple([z.number(), z.number(), z.number(), z.number()]), recordedAt: z.string().datetime(),
  terrain: z.object({ sources: z.array(source).min(1).max(25), gridSize: z.literal(129), heights: z.array(z.number().finite().min(-100).max(2500)).length(129 * 129), sourcePixels: point, min: z.number(), max: z.number() }),
  imagery: z.object({ sources: z.array(source).min(1).max(25), sha256: z.string().regex(/^[a-f0-9]{64}$/), sourcePixels: point, asset: z.string().regex(/^\/river-twins\/(coimbra|toulouse|oslo)-surface\.jpg$/), year: z.literal(2021), source: z.string() }),
  osm: source.extend({ timestamp: z.string().nullable() }), waterRelations: source.optional(), features: z.array(twinFeatureSchema).max(15000), limitations: z.array(z.string()).min(1),
}).superRefine((data, context) => {
  if (data.imagery.asset !== `/river-twins/${data.id}-surface.jpg`) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Surface belongs to a different reach' });
  const [w, s, e, n] = data.bounds, [lon, lat] = data.center;
  if (!(w < lon && lon < e && s < lat && lat < n)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Reach center must lie within its geographic bounds' });
  if (!data.features.some(f => ['water', 'waterway'].includes(f.kind) && f.name?.includes(data.river))) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Named river source is required' });
});
export type RiverTwin = z.infer<typeof riverTwinSchema>;

export function terrainHeight(data: RiverTwin, x: number, z: number): number {
  const n = data.terrain.gridSize, clamp = (v: number) => Math.max(0, Math.min(n - 1, v));
  const gx = clamp((x / data.extent + .5) * (n - 1)), gz = clamp((z / data.extent + .5) * (n - 1));
  const ix = Math.floor(gx), iz = Math.floor(gz), dx = gx - ix, dz = gz - iz;
  const at = (a: number, b: number) => data.terrain.heights[Math.min(n - 1, b) * n + Math.min(n - 1, a)];
  return at(ix, iz) * (1 - dx) * (1 - dz) + at(ix + 1, iz) * dx * (1 - dz) + at(ix, iz + 1) * (1 - dx) * dz + at(ix + 1, iz + 1) * dx * dz;
}
export function buildingHeight(feature: TwinFeature) {
  return feature.height != null ? { meters: feature.height, basis: 'OSM height tag', measured: true }
    : feature.levels != null ? { meters: Math.min(80, feature.levels * 3.2), basis: `${feature.levels} mapped levels × illustrative 3.2 m`, measured: false }
    : { meters: 8, basis: 'Illustrative 8 m; source height unknown', measured: false };
}
// Sutherland–Hodgman clipping prevents a long source polygon from extending
// beyond the retained terrain block. Source geometry itself stays unchanged.
export function clipRing(points: number[][], extent: number): number[][] {
  const h = extent / 2;
  let ring = points.slice();
  for (const [axis, boundary, sign] of [[0, -h, 1], [0, h, -1], [1, -h, 1], [1, h, -1]]) {
    const next: number[][] = [];
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length];
      const ain = (a[axis] - boundary) * sign >= 0, bin = (b[axis] - boundary) * sign >= 0;
      if (ain) next.push(a);
      if (ain !== bin) { const t = (boundary - a[axis]) / (b[axis] - a[axis]); next.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    ring = next;
  }
  return ring;
}
export function localCoordinates(data: RiverTwin, x: number, z: number): [number, number] {
  const r = 6378137, cos = Math.cos(data.center[1] * Math.PI / 180);
  const mx = data.center[0] * Math.PI / 180 * r + x / cos;
  const my = Math.log(Math.tan(Math.PI / 4 + data.center[1] * Math.PI / 360)) * r - z / cos;
  return [mx / r * 180 / Math.PI, (2 * Math.atan(Math.exp(my / r)) - Math.PI / 2) * 180 / Math.PI];
}

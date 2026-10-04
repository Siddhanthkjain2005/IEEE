import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { buildingHeight, clipRing, terrainHeight, type RiverTwin, type TwinFeature } from './river-twins';

export type TwinView = 'aerial' | 'river' | 'plan';
export type TwinLayers = { buildings: boolean; trees: boolean; water: boolean; surface: boolean };
export type TwinScene = { setView: (view: TwinView) => void; setLayers: (layers: TwinLayers) => void; setOrbit: (enabled: boolean) => void; setActive: (active: boolean) => void; setLight: (value: number) => void; turn: (degrees: number) => void; zoom: (factor: number) => void; reset: () => void; dispose: () => void };

const inside = (p: number[], extent: number) => Math.abs(p[0]) <= extent / 2 && Math.abs(p[1]) <= extent / 2;
function shape(points: number[][]) { return new THREE.Shape(points.map(p => new THREE.Vector2(p[0], -p[1]))); }
function featureAttribute(geometry: THREE.BufferGeometry, index: number) { geometry.setAttribute('featureIndex', new THREE.Float32BufferAttribute(new Array(geometry.getAttribute('position').count).fill(index), 1)); }

export async function createRiverTwinScene(host: HTMLElement, data: RiverTwin, onSelect: (feature: TwinFeature | null, location?: { x: number; z: number }) => void, onFailure: () => void, onBearing?: (degrees: number) => void): Promise<TwinScene> {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.setAttribute('aria-label', `Interactive geographic 3D reconstruction of ${data.river}, ${data.city}. Drag to orbit, scroll to zoom. Keyboard view controls are below.`);
  renderer.domElement.setAttribute('role', 'img'); host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#bdcacc'); scene.fog = new THREE.Fog('#bdcacc', data.extent * 2.2, data.extent * 5);
  const camera = new THREE.PerspectiveCamera(39, 1, 1, data.extent * 12);
  const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = .08; controls.minDistance = data.extent * .2; controls.maxDistance = data.extent * 2.7; controls.maxPolarAngle = Math.PI * .47; controls.autoRotateSpeed = .32;
  const updateBearing = () => onBearing?.(controls.getAzimuthalAngle() * 180 / Math.PI);
  controls.addEventListener('change', updateBearing);
  controls.target.set(0, (data.terrain.max - data.terrain.min) * .28, 0);
  const min = data.terrain.min, height = (x: number, z: number) => terrainHeight(data, x, z) - min;
  const extent = data.extent, n = data.terrain.gridSize;
  const hemisphere = new THREE.HemisphereLight('#e4eff6', '#746249', 2.4); scene.add(hemisphere);
  const sun = new THREE.DirectionalLight('#fff1d8', 3.2); sun.position.set(-extent * .7, extent * 1.1, extent * .45); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = -extent; sun.shadow.camera.right = extent; sun.shadow.camera.top = extent; sun.shadow.camera.bottom = -extent; sun.shadow.camera.far = extent * 4; sun.shadow.bias = -.0004; sun.shadow.normalBias = 1.2; scene.add(sun);
  const fill = new THREE.DirectionalLight('#c2dbea', .8); fill.position.set(extent, extent * .6, -extent); scene.add(fill);
  const terrainGeo = new THREE.PlaneGeometry(extent, extent, n - 1, n - 1); terrainGeo.rotateX(-Math.PI / 2);
  const pos = terrainGeo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) pos.setY(i, data.terrain.heights[i] - min);
  terrainGeo.computeVertexNormals();
  let texture: THREE.Texture;
  try { texture = await new THREE.TextureLoader().loadAsync(data.imagery.asset); } catch { renderer.dispose(); renderer.domElement.remove(); controls.dispose(); terrainGeo.dispose(); throw new Error('Surface imagery could not be loaded'); }
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const terrainMat = new THREE.MeshStandardMaterial({ map: texture, roughness: .93, metalness: 0 });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat); terrain.receiveShadow = true; terrain.userData.ground = true; scene.add(terrain);
  // Vertical edges follow the sampled terrain; the lower block is a display
  // plinth, not an invented cross-section of soil or riverbed layers.
  const edgeVertices: number[] = [];
  const edge = (a: number[], b: number[]) => { const ya = height(a[0], a[1]), yb = height(b[0], b[1]); edgeVertices.push(a[0], ya, a[1], b[0], yb, b[1], b[0], -32, b[1], a[0], ya, a[1], b[0], -32, b[1], a[0], -32, a[1]); };
  for (let i = 0; i < n - 1; i++) { const a = -extent / 2 + i / (n - 1) * extent, b = -extent / 2 + (i + 1) / (n - 1) * extent; edge([a, -extent / 2], [b, -extent / 2]); edge([b, extent / 2], [a, extent / 2]); edge([-extent / 2, b], [-extent / 2, a]); edge([extent / 2, a], [extent / 2, b]); }
  const edgeGeo = new THREE.BufferGeometry(); edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgeVertices, 3)); edgeGeo.computeVertexNormals();
  const edgeMat = new THREE.MeshStandardMaterial({ color: '#333f37', roughness: .88, side: THREE.DoubleSide }); scene.add(new THREE.Mesh(edgeGeo, edgeMat));
  const base = new THREE.Mesh(new THREE.BoxGeometry(extent, 6, extent), new THREE.MeshStandardMaterial({ color: '#24342e', roughness: .65 })); base.position.y = -35; base.receiveShadow = true; scene.add(base);
  const buildings = new THREE.Group(), water = new THREE.Group(), roads = new THREE.Group(), trees = new THREE.Group(); scene.add(buildings, water, roads, trees);
  const baseColor = data.id === 'toulouse' ? '#cbb8a5' : data.id === 'coimbra' ? '#dad5bd' : '#b7c1ba';
  const buildingMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: .86, metalness: .03 });
  // Facades are procedural illustration. Exact footprints and tagged heights
  // are inspectable independently; windows are not measured source features.
  buildingMat.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vTwinWorld;\nvarying vec3 vTwinNormal;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvTwinWorld=(modelMatrix*vec4(transformed,1.0)).xyz; vTwinNormal=normal;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vTwinWorld;\nvarying vec3 vTwinNormal;').replace('#include <color_fragment>', `#include <color_fragment>
      float wall=1.0-step(0.7,abs(vTwinNormal.y));
      float u=abs(vTwinNormal.x)>0.5?vTwinWorld.z:vTwinWorld.x;
      vec2 cell=fract(vec2(u/3.2,vTwinWorld.y/3.2));
      float windowMask=step(.28,cell.x)*step(cell.x,.65)*step(.32,cell.y)*step(cell.y,.75)*wall;
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.22,.31,.32),windowMask*.66);
      float roof=step(.7,vTwinNormal.y);
      diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.8,.72,.63),roof*.5);`);
  };
  const buildingGeos: THREE.BufferGeometry[] = [];
  for (let index = 0; index < data.features.length; index++) {
    const f = data.features[index]; if (f.kind !== 'building' || f.points.length < 4 || !f.points.every(p => inside(p, extent))) continue;
    const ring = f.points.slice(0, -1); if (ring.length < 3) continue;
    const geo = new THREE.ExtrudeGeometry(shape(ring), { depth: buildingHeight(f).meters, bevelEnabled: false, steps: 1, curveSegments: 1 }); geo.rotateX(-Math.PI / 2);
    const baseHeight = ring.reduce((sum, p) => sum + height(p[0], p[1]), 0) / ring.length; geo.translate(0, baseHeight, 0); geo.clearGroups(); featureAttribute(geo, index); buildingGeos.push(geo);
  }
  if (buildingGeos.length) { const merged = mergeGeometries(buildingGeos); if (merged) { const mesh = new THREE.Mesh(merged, buildingMat); mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.features = true; buildings.add(mesh); } buildingGeos.forEach(g => g.dispose()); }
  const waterMat = new THREE.ShaderMaterial({ uniforms: { time: { value: 0 }, waterColor: { value: new THREE.Color(data.id === 'oslo' ? '#3d7374' : '#416f71') } }, vertexShader: 'varying vec3 vWorld; void main(){vWorld=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}', fragmentShader: 'uniform float time; uniform vec3 waterColor; varying vec3 vWorld; void main(){float wave=sin(vWorld.x*.14+vWorld.z*.09+time*.45)*.5+sin(vWorld.x*.06-vWorld.z*.19-time*.32)*.3;float glint=pow(max(0.,wave),12.)*.025;float band=sin(vWorld.x*.025+vWorld.z*.034+time*.12)*.006;gl_FragColor=vec4(waterColor+glint+band,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}', side: THREE.DoubleSide });
  const waterGeos: THREE.BufferGeometry[] = [], roadGeos: THREE.BufferGeometry[] = [];
  const pointInRing = (p: number[], ring: number[][]) => { let result = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const a = ring[i], b = ring[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) result = !result; } return result; };
  const hasRiverSurface = data.features.some(f => f.kind === 'water' && (f.tags.water === 'river' || f.name?.includes(data.river)));
  const ribbon = (points: number[][], width: number, lift: number, index: number) => {
    const vertices: number[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i], b = points[i + 1]; if (!inside(a, extent) || !inside(b, extent)) continue;
      const dx = b[0] - a[0], dz = b[1] - a[1], distance = Math.hypot(dx, dz); if (distance < .1) continue;
      const ox = -dz / distance * width / 2, oz = dx / distance * width / 2;
      const corners = [[a[0] + ox, a[1] + oz], [a[0] - ox, a[1] - oz], [b[0] + ox, b[1] + oz], [b[0] - ox, b[1] - oz]];
      const v = corners.map(p => [p[0], height(p[0], p[1]) + lift, p[1]]);
      vertices.push(...v[0], ...v[1], ...v[2], ...v[2], ...v[1], ...v[3]);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geo.computeVertexNormals(); featureAttribute(geo, index); return geo;
  };
  const treePoints: number[][] = [];
  for (let index = 0; index < data.features.length; index++) {
    const f = data.features[index];
    if (f.kind === 'water') {
      const ring = clipRing(f.points, extent); if (ring.length < 3) continue;
      const waterShape = shape(ring);
      const holes = (f.holes ?? []).map(h => clipRing(h, extent)).filter(h => h.length >= 3);
      for (const clipped of holes) waterShape.holes.push(new THREE.Path(clipped.map(p => new THREE.Vector2(p[0], -p[1]))));
      const geo = new THREE.ShapeGeometry(waterShape); geo.rotateX(-Math.PI / 2); const p = geo.getAttribute('position');
      for (let i = 0; i < p.count; i++) p.setY(i, height(p.getX(i), p.getZ(i)) + .8);
      featureAttribute(geo, index); waterGeos.push(geo);
      // Match the terrain tessellation within the mapped water boundary. This
      // prevents DEM interpolation artifacts from protruding as false islands;
      // the visible surface remains illustrative, with no measured water level.
      const vertices: number[] = [], step = extent / (n - 1);
      const within = (q: number[]) => pointInRing(q, ring) && !holes.some(h => pointInRing(q, h));
      const lowerX = Math.min(...ring.map(q => q[0])), upperX = Math.max(...ring.map(q => q[0])), lowerZ = Math.min(...ring.map(q => q[1])), upperZ = Math.max(...ring.map(q => q[1]));
      for (let row = Math.max(0, Math.floor((lowerZ / extent + .5) * (n - 1))); row < Math.min(n - 1, Math.ceil((upperZ / extent + .5) * (n - 1))); row++) for (let col = Math.max(0, Math.floor((lowerX / extent + .5) * (n - 1))); col < Math.min(n - 1, Math.ceil((upperX / extent + .5) * (n - 1))); col++) {
        const x = -extent / 2 + col * step, z = -extent / 2 + row * step;
        for (const triangle of [[[x, z], [x, z + step], [x + step, z]], [[x, z + step], [x + step, z + step], [x + step, z]]]) if (triangle.every(within)) for (const q of triangle) vertices.push(q[0], height(q[0], q[1]) + 1.05, q[1]);
      }
      if (vertices.length) { const overlay = new THREE.BufferGeometry(); overlay.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); overlay.computeVertexNormals(); featureAttribute(overlay, index); waterGeos.push(overlay); }
    } else if (f.kind === 'waterway' && !f.tags.tunnel && ['river', 'stream', 'canal'].includes(f.tags.waterway)) {
      // Line-only streams have no surveyed width. A narrow visible ribbon is
      // explicitly illustrative, and does not supply a cross-section.
      if (!(hasRiverSurface && f.name?.includes(data.river))) waterGeos.push(ribbon(f.points, Number.parseFloat(f.tags.width) || (f.tags.waterway === 'river' ? 5 : 2), 1, index));
    } else if (f.kind === 'road' && !['proposed', 'construction'].includes(f.tags.highway)) {
      const width = ['primary', 'secondary', 'trunk'].includes(f.tags.highway) ? 8 : ['footway', 'path', 'steps'].includes(f.tags.highway) ? 1.7 : 4.5;
      const bridge = f.tags.bridge && f.tags.bridge !== 'no'; roadGeos.push(ribbon(f.points, width, bridge ? 5 : .65, index));
    } else if (f.kind === 'tree' && inside(f.points[0], extent)) treePoints.push(f.points[0]);
  }
  const merge = (geos: THREE.BufferGeometry[], group: THREE.Group, material: THREE.Material) => {
    const normalized = geos.filter(g => g.getAttribute('position').count).map(g => { const result = g.index ? g.toNonIndexed() : g; result.deleteAttribute('uv'); return result; });
    if (normalized.length) { const merged = mergeGeometries(normalized); if (merged) { const mesh = new THREE.Mesh(merged, material); mesh.receiveShadow = true; mesh.userData.features = true; group.add(mesh); } }
    new Set([...geos, ...normalized]).forEach(g => g.dispose());
  };
  merge(waterGeos, water, waterMat); merge(roadGeos, roads, new THREE.MeshStandardMaterial({ color: '#9b9f97', roughness: 1, side: THREE.DoubleSide }));
  if (treePoints.length) {
    const foliage = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(4.2, 1), new THREE.MeshStandardMaterial({ color: '#446c43', roughness: 1 }), treePoints.length);
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(.45, .7, 6, 5), new THREE.MeshStandardMaterial({ color: '#6e6850', roughness: 1 }), treePoints.length);
    const object = new THREE.Object3D(), color = new THREE.Color();
    treePoints.forEach((p, i) => { const size = .8 + (i % 7) * .065, y = height(p[0], p[1]); object.position.set(p[0], y + 8 * size, p[1]); object.scale.set(size, size * 1.18, size); object.rotation.y = i * 2.4; object.updateMatrix(); foliage.setMatrixAt(i, object.matrix); color.setHSL(.26 + (i % 5) * .012, .24, .27 + (i % 9) * .011); foliage.setColorAt(i, color); object.position.y = y + 3; object.scale.set(1, 1, 1); object.updateMatrix(); trunks.setMatrixAt(i, object.matrix); });
    foliage.castShadow = true; trees.add(foliage, trunks);
  }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(extent * 12, extent * 12), new THREE.MeshStandardMaterial({ color: '#b9c5c2', roughness: 1 })); ground.rotateX(-Math.PI / 2); ground.position.y = -40; ground.receiveShadow = true; scene.add(ground);
  const selection = new THREE.Mesh(new THREE.RingGeometry(8, 11, 32), new THREE.MeshBasicMaterial({ color: '#f5d394', side: THREE.DoubleSide, depthTest: false })); selection.rotateX(-Math.PI / 2); selection.visible = false; selection.renderOrder = 10; scene.add(selection);
  let disposed = false, active = true, orbit = false, frame = 0, previous = 0, elapsed = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const render = () => { if (!disposed) renderer.render(scene, camera); };
  const resize = () => { const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight); renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); render(); };
  const observer = new ResizeObserver(resize); observer.observe(host);
  const riverPoints = data.features.filter(f => f.kind === 'waterway' && f.tags.waterway === 'river' && f.name?.includes(data.river) && !f.tags.tunnel).flatMap(f => f.points.filter(p => inside(p, extent)));
  const focus = riverPoints.length ? riverPoints.reduce((sum, p) => [sum[0] + p[0] / riverPoints.length, sum[1] + p[1] / riverPoints.length], [0, 0]) : [0, 0];
  const setView = (view: TwinView) => {
    if (view === 'river') { const y = height(focus[0], focus[1]); controls.target.set(focus[0], y + 8, focus[1]); camera.position.set(focus[0] + extent * .24, y + extent * .18, focus[1] + extent * .24); }
    else { controls.target.set(0, (data.terrain.max - min) * .28, 0); camera.position.set(view === 'plan' ? 0 : extent * .73, view === 'plan' ? extent * 1.65 : extent * .83, view === 'plan' ? .1 : extent * .94); }
    controls.update(); render();
  };
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(); let down = [0, 0];
  const pointerDown = (event: PointerEvent) => { down = [event.clientX, event.clientY]; };
  const pointerUp = (event: PointerEvent) => { if (Math.hypot(event.clientX - down[0], event.clientY - down[1]) > 5) return; const rect = renderer.domElement.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1); raycaster.setFromCamera(pointer, camera); const hit = raycaster.intersectObjects([buildings, water, roads, terrain], true)[0]; if (!hit) return; const object = hit.object as THREE.Mesh; const attribute = object.geometry.getAttribute('featureIndex'); const feature = attribute && hit.face ? data.features[Math.round(attribute.getX(hit.face.a))] : null; selection.position.set(hit.point.x, hit.point.y + 1, hit.point.z); selection.visible = true; onSelect(feature, { x: hit.point.x, z: hit.point.z }); render(); };
  renderer.domElement.addEventListener('pointerdown', pointerDown); renderer.domElement.addEventListener('pointerup', pointerUp);
  const loss = (event: Event) => { event.preventDefault(); active = false; onFailure(); }; renderer.domElement.addEventListener('webglcontextlost', loss);
  const loop = (time: number) => { if (disposed) return; frame = requestAnimationFrame(loop); if (!active || document.hidden || time - previous < 33) return; const delta = previous ? Math.min(.1, (time - previous) / 1000) : 0; previous = time; elapsed += delta; waterMat.uniforms.time.value = reduced ? 0 : elapsed; controls.autoRotate = orbit && !reduced; controls.update(); try { render(); } catch { active = false; onFailure(); } };
  setView('aerial'); resize(); frame = requestAnimationFrame(loop);
  return {
    setView, setLayers: layers => { buildings.visible = layers.buildings; trees.visible = layers.trees; water.visible = layers.water; terrainMat.map = layers.surface ? texture : null; terrainMat.color.set(layers.surface ? '#ffffff' : '#95aa8b'); terrainMat.needsUpdate = true; render(); },
    setOrbit: enabled => { orbit = enabled; }, setActive: value => { active = value; previous = 0; },
    setLight: value => { const angle = value / 100 * Math.PI; sun.position.set(Math.cos(angle) * extent, Math.max(.3, Math.sin(angle)) * extent, extent * .4); sun.color.set(value < 25 || value > 80 ? '#ffd5a1' : '#fff1d8'); renderer.toneMappingExposure = .95 + Math.sin(angle) * .16; render(); },
    turn: degrees => { const offset = camera.position.clone().sub(controls.target); offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), degrees * Math.PI / 180); camera.position.copy(controls.target).add(offset); controls.update(); render(); },
    zoom: factor => { const offset = camera.position.clone().sub(controls.target).multiplyScalar(factor); if (offset.length() >= controls.minDistance && offset.length() <= controls.maxDistance) camera.position.copy(controls.target).add(offset); controls.update(); render(); },
    reset: () => { selection.visible = false; setView('aerial'); },
    dispose: () => { if (disposed) return; disposed = true; cancelAnimationFrame(frame); observer.disconnect(); controls.dispose(); renderer.domElement.removeEventListener('pointerdown', pointerDown); renderer.domElement.removeEventListener('pointerup', pointerUp); renderer.domElement.removeEventListener('webglcontextlost', loss); const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(); scene.traverse(object => { const mesh = object as THREE.Mesh; if (mesh.geometry) geometries.add(mesh.geometry); if (mesh.material) (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => materials.add(m)); }); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); texture.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); },
  };
}

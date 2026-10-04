import * as THREE from "three";

export type RiverView = "perspective" | "overhead" | "layers";

/** A procedural river section: an illustration of looking closely, never a map or measurement. */
export function createAquaScene(host: HTMLElement, onFailure: () => void, onRotate?: (degrees: number) => void) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const shadowLights: THREE.DirectionalLight[] = [];
  let observer: ResizeObserver | undefined;
  let disposed = false;
  let detach = () => {};
  function dispose() {
    if (disposed) return;
    disposed = true; observer?.disconnect(); renderer.setAnimationLoop(null); detach();
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    for (const light of shadowLights) light.shadow.dispose();
    renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
  }
  try {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 65);
    let view: RiverView = "perspective", rotation = 0;
    const sculpture = new THREE.Group();
    scene.add(sculpture);
    scene.add(new THREE.AmbientLight(0xf5f2e3, 1.25));
    const key = new THREE.DirectionalLight(0xfff8df, 2.8);
    key.position.set(-5, 9, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 24 });
    key.shadow.bias = -0.0004; key.shadow.normalBias = 0.035;
    key.shadow.radius = 2.5;
    shadowLights.push(key);
    const fill = new THREE.DirectionalLight(0xbacbbc, 0.85);
    fill.position.set(5, 4, -4);
    scene.add(key, fill);

    function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Group = sculpture) {
      geometries.push(geometry); materials.push(material);
      const object = new THREE.Mesh(geometry, material);
      object.castShadow = !(material instanceof THREE.MeshBasicMaterial || material instanceof THREE.ShadowMaterial);
      object.receiveShadow = true;
      parent.add(object);
      return object;
    }
    function matte(color: number, roughness = 0.88) {
      return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, side: THREE.DoubleSide });
    }
    function ink(color: number, opacity = 1) {
      return new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, side: THREE.DoubleSide, depthWrite: opacity === 1 });
    }
    function riverX(z: number) { return Math.sin(z * 1.02) * 0.64 + Math.cos(z * 0.55) * 0.12; }
    function riverWidth(z: number) { return 0.43 + Math.cos(z * 1.15) * 0.105; }
    function outerX(z: number) { return 2.74 - Math.pow(Math.abs(z) / 3.05, 8) * 0.26; }
    function landHeight(z: number, across: number, side: number) {
      const mound = Math.exp(-Math.pow((z + side * 0.8) / 1.65, 2));
      return 0.1 + Math.sin(across * Math.PI / 2) * (0.4 + mound * 0.55) + Math.sin(z * 1.8 + side) * across * 0.035;
    }
    function landX(z: number, across: number, side: number) {
      const shore = riverX(z) + side * (riverWidth(z) + 0.065);
      return shore + (side * outerX(z) - shore) * across;
    }

    // The subtly animated water is the only continually changing geometry.
    const water = new THREE.PlaneGeometry(1, 1, 14, 76);
    const positions = water.attributes.position;
    const original = Float32Array.from(positions.array);
    mesh(water, new THREE.MeshPhysicalMaterial({ color: 0x366c62, roughness: 0.22, metalness: 0.2, clearcoat: 0.95, clearcoatRoughness: 0.2, side: THREE.DoubleSide }));
    function surface(time: number) {
      for (let index = 0; index < positions.count; index++) {
        const u = original[index * 3] * 2;
        const z = original[index * 3 + 1] * 6.1;
        const y = 0.067 + Math.sin(z * 3.8 - time * 0.44 + u * 2) * 0.007 + Math.cos(z * 5 + u * 3 + time * 0.3) * 0.004;
        positions.setXYZ(index, riverX(z) + u * (riverWidth(z) + 0.07), y, z);
      }
      positions.needsUpdate = true;
      water.computeVertexNormals();
    }

    // An exposed paper-like section makes the material depth legible without implying geology.
    const slabs: { object: THREE.Mesh; y: number }[] = [];
    function slab(width: number, length: number, radius: number, depth: number, y: number, color: number) {
      const shape = new THREE.Shape();
      const x = -width / 2, z = -length / 2;
      shape.moveTo(x + radius, z); shape.lineTo(x + width - radius, z);
      shape.quadraticCurveTo(x + width, z, x + width, z + radius);
      shape.lineTo(x + width, z + length - radius); shape.quadraticCurveTo(x + width, z + length, x + width - radius, z + length);
      shape.lineTo(x + radius, z + length); shape.quadraticCurveTo(x, z + length, x, z + length - radius);
      shape.lineTo(x, z + radius); shape.quadraticCurveTo(x, z, x + radius, z);
      const base = mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 12 }), matte(color));
      base.rotation.x = -Math.PI / 2; base.position.y = y;
      slabs.push({ object: base, y });
    }
    slab(5.55, 6.16, 0.3, 0.2, -0.72, 0x9b9274);
    slab(5.55, 6.16, 0.3, 0.2, -0.51, 0xbfb08c);
    slab(5.55, 6.16, 0.3, 0.19, -0.30, 0xe0d6b7);
    slab(5.55, 6.16, 0.3, 0.09, -0.105, 0xc3c6a9);
    const ground = new THREE.Group(); scene.add(ground);
    const shadow = mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ color: 0x244239, opacity: 0.2 }), ground);
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.35;

    for (const side of [-1, 1]) {
      const rows = 64, columns = 18;
      const vertices: number[] = [], indices: number[] = [], colors: number[] = [];
      const nearColor = new THREE.Color(side === -1 ? 0x8b9d78 : 0xa5af8d);
      const farColor = new THREE.Color(side === -1 ? 0xb9bf9d : 0xc3c7a7);
      for (let row = 0; row <= rows; row++) {
        const z = row / rows * 6.1 - 3.05;
        for (let column = 0; column <= columns; column++) {
          const across = column / columns;
          vertices.push(landX(z, across, side), landHeight(z, across, side), z);
          const color = nearColor.clone().lerp(farColor, Math.min(1, across * 0.78 + Math.sin(z * 0.8) * 0.1 + 0.1));
          colors.push(color.r, color.g, color.b);
          if (row < rows && column < columns) {
            const a = row * (columns + 1) + column, b = a + columns + 1;
            indices.push(a, b, a + 1, b, b + 1, a + 1);
          }
        }
      }
      const terrain = new THREE.BufferGeometry();
      terrain.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      terrain.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      terrain.setIndex(indices); terrain.computeVertexNormals();
      mesh(terrain, new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.93, side: THREE.DoubleSide }));

      // Close the bank edges so the entire illustration reads as a tangible field specimen.
      const perimeter = [
        ...Array.from({ length: rows + 1 }, (_, i) => ({ z: i / rows * 6.1 - 3.05, u: 0 })),
        ...Array.from({ length: columns }, (_, i) => ({ z: 3.05, u: (i + 1) / columns })),
        ...Array.from({ length: rows }, (_, i) => ({ z: 3.05 - (i + 1) / rows * 6.1, u: 1 })),
        ...Array.from({ length: columns }, (_, i) => ({ z: -3.05, u: 1 - (i + 1) / columns })),
      ];
      const wallPositions: number[] = [], wallIndices: number[] = [];
      perimeter.forEach(({ z, u }, index) => {
        const x = landX(z, u, side);
        wallPositions.push(x, landHeight(z, u, side), z, x, -0.015, z);
        if (index < perimeter.length - 1) { const a = index * 2; wallIndices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      });
      const wall = new THREE.BufferGeometry();
      wall.setAttribute("position", new THREE.Float32BufferAttribute(wallPositions, 3)); wall.setIndex(wallIndices); wall.computeVertexNormals();
      mesh(wall, matte(side === -1 ? 0x8a9775 : 0x9ca584));

      // Evenly separated contour strokes follow the authored terrain, with no elevation labels.
      for (let layer = 0; layer < 8; layer++) {
        const u = 0.035 + layer * 0.129;
        const points = Array.from({ length: 70 }, (_, index) => {
          const z = index / 69 * 6.08 - 3.04;
          return new THREE.Vector3(landX(z, u, side), landHeight(z, u, side) + 0.009, z);
        });
        const line = new THREE.CatmullRomCurve3(points);
        mesh(new THREE.TubeGeometry(line, 76, layer === 0 ? 0.014 : 0.009, 4, false), ink(layer === 0 ? 0xd5dbbd : side === -1 ? 0xb9c9a1 : 0x697d5e, layer === 0 ? 0.96 : 0.68));
      }
    }

    for (const offset of [-0.55, -0.07, 0.52]) {
      const points = Array.from({ length: 68 }, (_, index) => {
        const z = index / 67 * 6.04 - 3.02;
        return new THREE.Vector3(riverX(z) + offset * riverWidth(z), 0.085, z);
      });
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 76, 0.0045, 4, false), ink(0xc3d6bf, 0.43));
    }

    // Three spatial bookmarks echo the real Observe → Question → Review workflow.
    const markers: { cap: THREE.Mesh; halo: THREE.Mesh; material: THREE.MeshStandardMaterial; group: THREE.Group }[] = [];
    const anchors = [{ z: 1.8, side: -1, u: 0.2 }, { z: -0.05, side: 1, u: 0.25 }, { z: -1.95, side: -1, u: 0.18 }];
    anchors.forEach(({ z, side, u }, index) => {
      const group = new THREE.Group();
      group.position.set(landX(z, u, side), landHeight(z, u, side), z);
      sculpture.add(group);
      const stem = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.55, 8), matte(0x8f8664), group);
      stem.position.y = 0.275;
      const material = matte(index === 0 ? 0xc3a05c : 0xe3e5d0, 0.58);
      const cap = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.045, 24), material, group);
      cap.position.y = 0.57;
      const halo = mesh(new THREE.TorusGeometry(0.2, 0.012, 6, 36), ink(0xb89c62, 0.85), group);
      halo.rotation.x = Math.PI / 2; halo.position.y = 0.59;
      halo.visible = index === 0;
      const foot = mesh(new THREE.TorusGeometry(0.11, 0.009, 5, 24), ink(0xe5e9d0, 0.9), group);
      foot.rotation.x = Math.PI / 2; foot.position.y = 0.012;
      markers.push({ cap, halo, material, group });
    });

    let failed = false, running = false, previous = 0, phase = 0;
    let pointerX = 0, pointerY = 0;
    let drag: { id: number; x: number; rotation: number } | null = null;
    const normalize = (degrees: number) => ((degrees + 180) % 360 + 360) % 360 - 180;
    const down = (event: PointerEvent) => {
      if (event.button !== 0) return;
      drag = { id: event.pointerId, x: event.clientX, rotation };
      host.setPointerCapture?.(event.pointerId);
      host.dataset.dragging = "true";
    };
    const pointer = (event: PointerEvent) => {
      if (drag && drag.id === event.pointerId) {
        rotation = normalize(drag.rotation + (event.clientX - drag.x) / Math.max(host.clientWidth, 1) * 240);
        sculpture.rotation.y = THREE.MathUtils.degToRad(rotation);
        onRotate?.(Math.round(rotation)); render();
        return;
      }
      if (event.pointerType === "touch") return;
      const bounds = host.getBoundingClientRect();
      pointerX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / Math.max(bounds.width, 1) * 2 - 1));
      pointerY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / Math.max(bounds.height, 1) * 2 - 1));
    };
    const up = () => { drag = null; delete host.dataset.dragging; };
    const leave = () => { pointerX = 0; pointerY = 0; };
    const fail = () => { if (failed) return; failed = true; renderer.setAnimationLoop(null); onFailure(); };
    const lost = (event: Event) => { event.preventDefault(); fail(); };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    host.addEventListener("pointermove", pointer, { passive: true });
    host.addEventListener("pointerdown", down);
    host.addEventListener("pointerup", up);
    host.addEventListener("pointercancel", up);
    host.addEventListener("pointerleave", leave);
    detach = () => {
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      host.removeEventListener("pointermove", pointer); host.removeEventListener("pointerleave", leave);
      host.removeEventListener("pointerdown", down); host.removeEventListener("pointerup", up); host.removeEventListener("pointercancel", up);
      delete host.dataset.dragging;
    };
    function render() {
      if (disposed || failed) return;
      try { renderer.render(scene, camera); } catch { fail(); }
    }
    function resize() {
      if (disposed || failed) return;
      const width = Math.max(host.clientWidth, 1), height = Math.max(host.clientHeight, 1);
      const ratio = width / height;
      camera.aspect = ratio;
      const vertical = THREE.MathUtils.degToRad(camera.fov), horizontal = 2 * Math.atan(Math.tan(vertical / 2) * ratio);
      const distance = 3.65 / Math.tan(Math.min(vertical, horizontal) / 2);
      const direction = view === "overhead" ? new THREE.Vector3(0.001, 1, 0) : view === "layers" ? new THREE.Vector3(7.6, 5.5, 11.5) : new THREE.Vector3(7.6, 7.2, 11.5);
      const focus = view === "layers" ? -0.1 : 0.15;
      camera.up.set(0, view === "overhead" ? 0 : 1, view === "overhead" ? -1 : 0);
      camera.position.copy(direction.normalize().multiplyScalar(distance)); camera.position.y += focus;
      camera.lookAt(0, focus, 0);
      camera.updateProjectionMatrix(); renderer.setSize(width, height); render();
    }
    function frame(time: number) {
      if (disposed || failed || !running) return;
      if (previous && time - previous < 1000 / 30) return;
      phase += previous ? Math.min((time - previous) / 1000, 0.1) : 0;
      previous = time;
      if (!drag) sculpture.rotation.y += (THREE.MathUtils.degToRad(rotation) + pointerX * 0.045 + Math.sin(phase * 0.15) * 0.02 - sculpture.rotation.y) * 0.045;
      sculpture.rotation.x += (pointerY * 0.028 - sculpture.rotation.x) * 0.045;
      surface(phase); render();
    }
    observer = new ResizeObserver(resize);
    surface(0); resize(); observer.observe(host);
    return {
      setRotation(degrees: number) {
        if (disposed || failed || !Number.isFinite(degrees)) return;
        rotation = normalize(degrees); sculpture.rotation.y = THREE.MathUtils.degToRad(rotation); render();
      },
      setView(value: RiverView) {
        if (disposed || failed || !["perspective", "overhead", "layers"].includes(value)) return;
        view = value;
        slabs.forEach((slab, index) => { slab.object.position.y = slab.y - (value === "layers" ? (3 - index) * 0.18 : 0); });
        resize();
      },
      setStage(index: number) {
        if (disposed || failed) return;
        markers.forEach((marker, i) => {
          marker.halo.visible = index === i;
          marker.material.color.setHex(index === i ? 0xc3a05c : 0xe3e5d0);
          marker.cap.scale.setScalar(index === i ? 1.17 : 1);
        });
        render();
      },
      setRunning(value: boolean) {
        if (disposed || failed || running === value) return;
        running = value; previous = 0;
        renderer.setAnimationLoop(value ? frame : null);
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}

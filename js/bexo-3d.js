import * as THREE from 'three';

const COPPER = 0xc9793d;
const COPPER_DEEP = 0xa35f28;
const COPPER_LIGHT = 0xe8b98c;

/**
 * The Signal Orb — a single warm sphere that breathes at rest and sends one
 * ring outward on a real event (see window.bxOrbPulse). Replaces the old
 * card-plus-orbiting-nodes scene, whose fixed-radius ring fell outside the
 * camera frustum at narrower container aspect ratios. This scene has no
 * geometry that extends past the sphere itself, and the container it mounts
 * into is always a fixed 1:1 stage, so there is nothing left to clip.
 */
export function mountSignalOrb(container) {
  if (!container) return null;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
  camera.position.set(0, 0, 5.4);

  const applySize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  applySize();

  scene.add(new THREE.AmbientLight(0xfff2e6, 0.6));
  const key = new THREE.DirectionalLight(0xfff2e6, 1.6);
  key.position.set(2.4, 3.2, 3.6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(COPPER_LIGHT, 1.1);
  rim.position.set(-3, -1.4, -2.2);
  scene.add(rim);

  const root = new THREE.Group();
  scene.add(root);

  // ---- the core sphere
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 48),
    new THREE.MeshStandardMaterial({
      color: COPPER,
      roughness: 0.32,
      metalness: 0.18,
      emissive: COPPER_DEEP,
      emissiveIntensity: 0.28
    })
  );
  root.add(core);

  // ---- soft outer glow shell (cheap fresnel-style rim light)
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(1.22, 48, 36),
    new THREE.MeshBasicMaterial({ color: COPPER, transparent: true, opacity: 0.14, side: THREE.BackSide })
  );
  root.add(glow);

  // ---- pulse rings, spawned on demand by bxOrbPulse()
  const ringPool = [];
  const MAX_RINGS = 2;
  function spawnRing() {
    let ring = ringPool.find((r) => !r.userData.active);
    if (!ring) {
      if (ringPool.length >= MAX_RINGS) return;
      const mesh = new THREE.Mesh(
        new THREE.RingGeometry(0.98, 1.05, 64),
        new THREE.MeshBasicMaterial({ color: COPPER_LIGHT, transparent: true, opacity: 0, side: THREE.DoubleSide })
      );
      mesh.userData = { active: false, t: 0 };
      root.add(mesh);
      ringPool.push(mesh);
      ring = mesh;
    }
    ring.scale.setScalar(1);
    ring.material.opacity = 0.6;
    ring.userData.active = true;
    ring.userData.t = 0;
  }
  window.bxOrbPulse = spawnRing;

  const pointer = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  const onPointer = (e) => {
    const r = container.getBoundingClientRect();
    target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  const onResize = () => applySize();
  window.addEventListener('resize', onResize, { passive: true });
  const ro = new ResizeObserver(onResize);
  ro.observe(container);

  let visible = true;
  const io = new IntersectionObserver((es) => { es.forEach((en) => { visible = en.isIntersecting; }); }, { threshold: 0 });
  io.observe(container);

  const t0 = performance.now();
  let raf = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    const t = (performance.now() - t0) / 1000;

    pointer.x += (target.x - pointer.x) * 0.06;
    pointer.y += (target.y - pointer.y) * 0.06;

    if (!reduce) {
      const breathe = 1 + Math.sin(t * 1.1) * 0.035;
      root.scale.setScalar(breathe);
      root.rotation.y = pointer.x * 0.5 + t * 0.06;
      root.rotation.x = pointer.y * -0.3;
    }

    ringPool.forEach((ring) => {
      if (!ring.userData.active) return;
      ring.userData.t += 1 / 60;
      const p = Math.min(1, ring.userData.t / 1.1);
      ring.scale.setScalar(1 + p * 1.8);
      ring.material.opacity = 0.6 * (1 - p);
      if (p >= 1) ring.userData.active = false;
    });

    renderer.render(scene, camera);
  };
  tick();

  return {
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
      if (window.bxOrbPulse === spawnRing) delete window.bxOrbPulse;
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
}

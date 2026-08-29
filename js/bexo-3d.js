import * as THREE from 'three';

const INK = 0x0b1220;
const GREEN = 0x2f6bff;
const AMBER = 0x9bb6ff;
const PAPER = 0xf8fafc;

function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

export function mountBexoScene(container) {
  if (!container) return null;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.35, 8.4);

  const applySize = () => {
    const rect = container.getBoundingClientRect();
    const w = container.clientWidth || rect.width;
    const h = container.clientHeight || rect.height;
    if (!w || !h) return false;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    return true;
  };
  applySize();

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(3.5, 5, 4.5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(GREEN, 0.9);
  rim.position.set(-4, -1.5, -3);
  scene.add(rim);
  const warm = new THREE.PointLight(AMBER, 1.1, 14);
  warm.position.set(-2.6, 2.2, 2.4);
  scene.add(warm);

  const root = new THREE.Group();
  root.name = 'bexo-identity';
  scene.add(root);

  // ---- the card
  const cardGroup = new THREE.Group();
  cardGroup.name = 'card';
  const cardShape = roundedRectShape(2.55, 3.5, 0.26);
  const cardGeo = new THREE.ExtrudeGeometry(cardShape, {
    depth: 0.11, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 4, curveSegments: 24
  });
  cardGeo.center();
  const cardMat = new THREE.MeshStandardMaterial({ color: INK, roughness: 0.34, metalness: 0.22 });
  cardMat.name = 'ink';
  const card = new THREE.Mesh(cardGeo, cardMat);
  card.name = 'card-body';
  cardGroup.add(card);

  const stripeGeo = new THREE.BoxGeometry(2.32, 0.12, 0.03);
  const greenMat = new THREE.MeshStandardMaterial({ color: GREEN, roughness: 0.28, metalness: 0.1, emissive: GREEN, emissiveIntensity: 0.85 });
  greenMat.name = 'signal';
  const stripe = new THREE.Mesh(stripeGeo, greenMat);
  stripe.name = 'accent-stripe';
  stripe.position.set(0, 1.44, 0.09);
  cardGroup.add(stripe);

  const avatarMat = new THREE.MeshStandardMaterial({ color: AMBER, roughness: 0.3, metalness: 0.35 });
  avatarMat.name = 'avatar';
  const avatar = new THREE.Mesh(new THREE.SphereGeometry(0.34, 40, 28), avatarMat);
  avatar.name = 'avatar-orb';
  avatar.position.set(-0.62, 0.72, 0.14);
  avatar.scale.set(1, 1, 0.55);
  cardGroup.add(avatar);

  const lineMat = new THREE.MeshStandardMaterial({ color: PAPER, roughness: 0.7, metalness: 0 });
  lineMat.name = 'text-line';
  [[0.34, 1.5], [0.02, 1.1], [-0.3, 1.32], [-0.62, 0.8]].forEach(([y, w], i) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(w, 0.075, 0.02), lineMat);
    bar.name = 'detail-line-' + i;
    bar.position.set(-1.275 + w / 2 + 0.28, y, 0.085);
    cardGroup.add(bar);
  });

  const chipMat = new THREE.MeshStandardMaterial({ color: GREEN, roughness: 0.4, metalness: 0.15, transparent: true, opacity: 0.85 });
  chipMat.name = 'chip';
  [-1.02, -1.28].forEach((y, i) => {
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.85 - i * 0.22, 0.13, 0.02), chipMat);
    chip.name = 'chip-' + i;
    chip.position.set(-1.275 + (0.85 - i * 0.22) / 2 + 0.28, y, 0.085);
    cardGroup.add(chip);
  });

  root.add(cardGroup);

  // ---- orbiting connection nodes
  const nodeMat = new THREE.MeshStandardMaterial({ color: GREEN, roughness: 0.25, metalness: 0.2, emissive: GREEN, emissiveIntensity: 0.55 });
  nodeMat.name = 'node';
  const nodeMatDim = new THREE.MeshStandardMaterial({ color: 0x2558e0, roughness: 0.5, metalness: 0.1 });
  nodeMatDim.name = 'node-dim';

  const orbit = new THREE.Group();
  orbit.name = 'connections';
  root.add(orbit);

  const NODES = 9;
  const nodes = [];
  const nodeGeo = new THREE.SphereGeometry(0.105, 20, 14);
  for (let i = 0; i < NODES; i++) {
    const t = i / NODES;
    const ang = t * Math.PI * 2;
    const radius = 1.98 + (i % 3) * 0.29;
    const mesh = new THREE.Mesh(nodeGeo, i % 3 === 0 ? nodeMat : nodeMatDim);
    mesh.name = 'node-' + i;
    const y = Math.sin(ang * 1.6) * 1.15;
    mesh.position.set(Math.cos(ang) * radius * 1.10, y, Math.sin(ang) * radius * 0.6);
    mesh.userData.base = mesh.position.clone();
    mesh.userData.phase = t * Math.PI * 2;
    orbit.add(mesh);
    nodes.push(mesh);
  }

  const linkMat = new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.34 });
  const linkGeo = new THREE.BufferGeometry();
  const linkPos = new Float32Array(NODES * 2 * 3);
  linkGeo.setAttribute('position', new THREE.BufferAttribute(linkPos, 3));
  const links = new THREE.LineSegments(linkGeo, linkMat);
  links.name = 'links';
  orbit.add(links);

  const ringMat = new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.24, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.16, 0.014, 6, 128), ringMat);
  ring.name = 'orbit-ring';
  ring.rotation.x = Math.PI / 2.55;
  root.add(ring);

  const pointer = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  const onPointer = (e) => {
    const r = container.getBoundingClientRect();
    target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  let scrollNorm = 0;
  const onScroll = () => {
    const r = container.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    scrollNorm = Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / vh));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const onResize = () => { applySize(); };
  window.addEventListener('resize', onResize, { passive: true });
  const ro = new ResizeObserver(() => { applySize(); });
  ro.observe(container);

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0;
  let visible = true;
  const io = new IntersectionObserver((es) => { es.forEach((en) => { visible = en.isIntersecting; }); }, { threshold: 0 });
  io.observe(container);

  const t0 = performance.now();
  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    const t = (performance.now() - t0) / 1000;

    pointer.x += (target.x - pointer.x) * 0.045;
    pointer.y += (target.y - pointer.y) * 0.045;

    if (!reduce) {
      cardGroup.rotation.y = -0.32 + pointer.x * 0.42 + Math.sin(t * 0.42) * 0.09;
      cardGroup.rotation.x = pointer.y * -0.24 + Math.sin(t * 0.33) * 0.045;
      cardGroup.position.y = Math.sin(t * 0.7) * 0.11;
      orbit.rotation.y = t * 0.13 + pointer.x * 0.2;
      ring.rotation.z = t * 0.08;
      root.rotation.z = scrollNorm * 0.09;
      root.position.y = scrollNorm * -0.35;

      const arr = links.geometry.attributes.position.array;
      nodes.forEach((n, i) => {
        const b = n.userData.base;
        n.position.y = b.y + Math.sin(t * 0.9 + n.userData.phase) * 0.16;
        const p = n.getWorldPosition(new THREE.Vector3());
        orbit.worldToLocal(p);
        arr[i * 6 + 0] = 0; arr[i * 6 + 1] = 0; arr[i * 6 + 2] = 0;
        arr[i * 6 + 3] = p.x; arr[i * 6 + 4] = p.y; arr[i * 6 + 5] = p.z;
      });
      links.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  };
  tick();

  return {
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
}

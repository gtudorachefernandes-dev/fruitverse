import { createCan } from './can-model.js';
import { createFruitSet, fruitLayouts } from './3d/fruits.js';
import { compositions, createOrbit } from './3d/camera.js';

function studioTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 128);
  gradient.addColorStop(0, '#7d7a91');
  gradient.addColorStop(0.47, '#39354e');
  gradient.addColorStop(1, '#14111d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 128);
  const panels = [
    [50, 35, 28, 55, '#fff6e8'], [111, 25, 11, 79, '#eef2ff'],
    [161, 10, 39, 38, '#e3e7ff'], [221, 34, 17, 52, '#ffeedf'],
  ];
  for (const [x, y, w, h, color] of panels) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createScene(THREE, container, { context, lite }, flavor, onLost, prints) {
  const canvas = context.canvas;
  if (context.isContextLost()) return;

  const renderer = new THREE.WebGLRenderer({ canvas, context });
  const compact = matchMedia('(max-width: 760px)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite || compact ? 1 : 1.4));
  renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = lite ? 1.05 : 1.12;
  canvas.dataset.renderer = lite ? 'webgl1' : 'webgl2';
  canvas.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 32);
  let environment;
  if (!lite) {
    const studio = studioTexture(THREE);
    const generator = new THREE.PMREMGenerator(renderer);
    try {
      environment = generator.fromEquirectangular(studio);
      scene.environment = environment.texture;
      scene.environmentIntensity = 0.9;
    } finally {
      studio.dispose();
      generator.dispose();
    }
  }

  const key = new THREE.DirectionalLight('#fff1e6', lite ? 2.05 : 1.8);
  key.position.set(2, 4, 5);
  const rim = new THREE.DirectionalLight(flavor.accent, lite ? 1.55 : 2.35);
  rim.position.set(-3, 1, -1);
  const fill = new THREE.HemisphereLight('#fff6eb', '#25152c', lite ? 1.14 : 0.95);
  const can = createCan(THREE, lite);
  const fruitRoot = new THREE.Group();
  scene.add(can.group, fruitRoot, key, rim, fill);
  const fruitCache = new Map();
  const cameraTarget = { travel: 0, yaw: 0, swing: 0 };
  const orbit = createOrbit();
  const motion = { ...compositions[flavor.id] };
  const keyColor = new THREE.Color();
  const rimColor = new THREE.Color();
  const maxPoints = 48;
  const dustGeometry = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(maxPoints * 3);
  for (let i = 0; i < maxPoints; i++) {
    const angle = i * 2.3999632;
    const radius = 1.35 + (i % 9) * 0.135;
    dustPositions.set([Math.cos(angle) * radius, Math.sin(angle) * radius * 1.28, ((i % 7) - 3) * 0.38], i * 3);
  }
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustSurface = new THREE.PointsMaterial({ color: flavor.accent, size: 0.035, transparent: true, opacity: 0.58, depthWrite: false });
  const dust = new THREE.Points(dustGeometry, dustSurface);
  scene.add(dust);

  let animation = 0;
  let last = 0;
  let elapsed = 0;
  let phase = 0;
  let idleWeight = 0;
  let inView = true;
  let lost = false;
  let scroll = 0;
  let pointerX = 0;
  let pointerY = 0;
  let view;
  let current;
  let fruits;
  let sizeReady = false;
  let reduced = false;
  let transitioning = false;
  let interactiveAt = -10;
  let frameInterval = lite || compact ? 45 : 28;

  function setFlavor(next) {
    if (next === current) return;
    current = next;
    const composition = compositions[next.id];
    keyColor.set(composition.key);
    rimColor.set(composition.accent);
    dustSurface.color.set(composition.accent);
    dustGeometry.setDrawRange(0, lite || compact ? Math.min(composition.points, 16) : composition.points);
    can.setPrint(prints[next.id]);
    fruitRoot.clear();
    if (!fruitCache.has(next.id)) fruitCache.set(next.id, createFruitSet(THREE, next.id, lite || compact));
    fruits = fruitCache.get(next.id).pieces;
    fruitRoot.add(...fruits);
  }

  function draw(dt) {
    orbit.update(dt, !reduced);
    const mix = reduced ? 1 : 1 - Math.exp(-dt * 0.008);
    const composition = compositions[current.id];
    for (const property of ['x', 'y', 'distance', 'fov', 'lean', 'pace']) {
      motion[property] += (composition[property] - motion[property]) * mix;
    }
    if (!reduced) phase += dt * .001 * motion.pace;
    const time = reduced ? 0 : phase;
    const idle = !orbit.active && elapsed - interactiveAt > 1.4 && !transitioning && !reduced;
    idleWeight += (Number(idle) - idleWeight) * mix;
    const sway = Math.sin(time * 0.43) * 0.17 * idleWeight;
    const pitch = 0.16 + orbit.state.pitch + pointerY * 0.12;
    can.group.rotation.set(pitch, Math.PI + orbit.state.yaw + sway + pointerX * 0.22 + cameraTarget.swing, motion.lean, 'YXZ');
    can.group.position.set(cameraTarget.yaw * 0.23, Math.sin(time * 1.55) * 0.085, -cameraTarget.travel * 0.18);
    key.color.lerp(keyColor, mix);
    rim.color.lerp(rimColor, mix);
    dust.rotation.z = time * 0.055 + cameraTarget.swing * 0.2;
    fruitRoot.scale.setScalar(1 + Math.max(-0.35, -cameraTarget.travel * 0.24));
    fruitRoot.rotation.y = cameraTarget.swing * 0.63;
    fruits.forEach((piece, i) => {
      const [x, y, z] = fruitLayouts[current.id][i];
      const drift = Math.sin(time * (0.53 + i * 0.12) + i) * (current.id === 'mango' ? 0.17 : 0.07);
      piece.position.set(x + drift + pointerX * (0.12 + i * 0.13), y + Math.sin(time * (0.9 + i * 0.27) + i) * 0.18, z);
      const showCut = (i === 1 && current.id !== 'mango') || (i === 2 && current.id === 'lime');
      piece.rotation.set((showCut ? -1.28 : 0.58) + time * (0.18 + i * 0.12), time * -0.3 + i, i * 0.54);
      piece.scale.setScalar(1 - i * 0.11);
    });
    const fov = motion.fov + Math.min(2.2, Math.max(-1, cameraTarget.travel * 1.25));
    camera.fov = fov;
    camera.updateProjectionMatrix();
    const scrollMotion = reduced ? 0 : scroll;
    camera.position.set(motion.x + cameraTarget.yaw + pointerX * 0.37,
      motion.y + pointerY * 0.25 + scrollMotion * 0.23, Math.max(motion.distance, 6.65 / camera.aspect) + cameraTarget.travel + scrollMotion * 1.04);
    camera.lookAt(0, -0.16 * scrollMotion, 0);
    if (view) {
      camera.position.set(0, 0, 8.6);
      camera.lookAt(0, 0, 0);
      can.group.position.set(0, 0, 0);
      const angles = { front: [0, 0], side: [0, Math.PI/2], back: [0, Math.PI], top: [Math.PI/2, 0] };
      const [x, y] = angles[view];
      can.group.rotation.set(x, Math.PI + y, 0, 'XYZ');
    }
    can.group.scale.set(0.88, 1, 0.88);
    fruitRoot.visible = !view;
    dust.visible = !view && !reduced;
    renderer.render(scene, camera);
  }

  function tick(time) {
    animation = 0;
    if (lost || !inView || document.hidden || !sizeReady) return;
    if (!last || time - last >= frameInterval) {
      const dt = last ? Math.min(time - last, 80) : 16;
      last = time;
      elapsed += dt * 0.001;
      const started = performance.now();
      draw(dt);
      if (performance.now() - started > 24) frameInterval = Math.min(65, frameInterval + 4);
    }
    if (!reduced) animation = requestAnimationFrame(tick);
  }

  function invalidate() {
    if (!animation && !lost && inView && !document.hidden) animation = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(animation);
    animation = 0;
    last = 0;
    invalidate();
  }

  function lose(event) {
    event.preventDefault();
    lost = true;
    sync();
    onLost();
  }

  const size = new ResizeObserver(() => {
    const { clientWidth, clientHeight } = container;
    if (!clientWidth || !clientHeight) return;
    camera.aspect = clientWidth / clientHeight;
    renderer.setSize(clientWidth, clientHeight, false);
    sizeReady = true;
    sync();
  });
  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  });

  setFlavor(flavor);
  key.color.copy(keyColor);
  rim.color.copy(rimColor);
  container.append(canvas);
  size.observe(container);
  visibility.observe(container);
  document.addEventListener('visibilitychange', sync);
  canvas.addEventListener('webglcontextlost', lose);

  return {
    cameraTarget,
    mode: lite ? 'WebGL 1' : 'WebGL 2',
    setFlavor(next) { setFlavor(next); sync(); },
    setPointer(x, y) {
      if (reduced || orbit.active || transitioning) return;
      pointerX = x;
      pointerY = y;
    },
    setScroll(progress) { scroll = progress; },
    setReduced(value) { reduced = value; dust.visible = !value; if (value) pointerX = pointerY = 0; sync(); },
    setTransitioning(value) {
      transitioning = value;
      if (value) { orbit.reset(); pointerX = pointerY = 0; }
      sync();
    },
    inspect(angle) { view = angle; sync(); },
    beginDrag() { view = null; if (!transitioning) orbit.begin(); },
    endDrag() { orbit.end(); interactiveAt = elapsed; },
    orbit(x, y = 0, dt = 16) {
      if (transitioning) return;
      view = null;
      orbit.move(x, y, dt);
      interactiveAt = elapsed;
      if (reduced) sync();
    },
    reset() { view = null; orbit.reset(); interactiveAt = elapsed; sync(); },
    dispose() {
      canvas.removeEventListener('webglcontextlost', lose);
      document.removeEventListener('visibilitychange', sync);
      cancelAnimationFrame(animation);
      size.disconnect();
      visibility.disconnect();
      can.dispose();
      fruitCache.forEach((fruit) => fruit.dispose());
      dustGeometry.dispose();
      dustSurface.dispose();
      environment?.dispose();
      renderer.dispose();
      if (!lost) renderer.forceContextLoss();
      canvas.remove();
    },
  };
}

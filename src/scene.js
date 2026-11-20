import * as THREE from 'three';
import { createCan, createMango } from './can-model.js';

function studioTexture() {
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

export function createScene(container, context, flavor, onLost) {
  const canvas = context.canvas;
  if (context.isContextLost()) return;

  const renderer = new THREE.WebGLRenderer({ canvas, context });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
  renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 40);
  const studio = studioTexture();
  const generator = new THREE.PMREMGenerator(renderer);
  const environment = generator.fromEquirectangular(studio);
  studio.dispose();
  generator.dispose();
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.85;

  const key = new THREE.DirectionalLight('#fff1e6', 1.7);
  key.position.set(2, 4, 5);
  const rim = new THREE.DirectionalLight(flavor.accent, 2.35);
  rim.position.set(-3, 1, -1);
  const fill = new THREE.HemisphereLight('#fff6eb', '#1b0c26', 0.86);
  const can = createCan();
  const mango = createMango();
  scene.add(can.group, key, rim, fill, ...mango.pieces);

  const cameraTarget = { travel: 0, yaw: 0, swing: 0 };
  let frame = 0;
  let last = 0;
  let elapsed = 0;
  let inView = true;
  let lost = false;
  let rotation = 0;
  let turn = 0;
  let pointerX = 0;
  let pointerY = 0;
  let scroll = 0;
  let currentFlavor;
  const accent = new THREE.Color(flavor.accent);

  function setFlavor(next) {
    if (next === currentFlavor) return;
    currentFlavor = next;
    accent.set(next.accent);
    can.setFlavor(next);
    mango.pieces.forEach((piece) => { piece.visible = next.id === 'mango'; });
  }

  const mangoPositions = [[-1.33, 0.72, 0.23], [1.28, -0.64, 0.73], [-1.04, -1.2, -0.9]];
  function tick(time) {
    frame = requestAnimationFrame(tick);
    if (last && time - last < 28) return;
    const delta = last ? Math.min(time - last, 65) : 0;
    last = time;
    elapsed += delta * 0.001;
    const damp = 1 - Math.exp(-delta * 0.006);
    rotation += (turn - rotation) * damp;
    can.group.rotation.set(0.17 + pointerY * 0.22, Math.PI + rotation + pointerX * 0.47 + cameraTarget.swing, 0.21);
    can.group.position.y = Math.sin(elapsed * 1.45) * 0.08;
    rim.color.lerp(accent, damp);
    mango.pieces.forEach((piece, index) => {
      if (!piece.visible) return;
      const [x, y, z] = mangoPositions[index];
      piece.position.set(x, y + Math.sin(elapsed * (1.1 + index * 0.3) + index) * 0.13, z);
      piece.rotation.set(elapsed * (0.22 + index * 0.1), elapsed * -0.35 + index, index * 0.9);
      piece.scale.setScalar(1 - index * 0.15);
    });
    camera.position.set(cameraTarget.yaw + pointerX * 0.33, 1.3 + pointerY * 0.26 + scroll * 0.25,
      7.2 + cameraTarget.travel + scroll * 1.05);
    camera.lookAt(0, -scroll * 0.22, 0);
    renderer.render(scene, camera);
  }

  function sync() {
    cancelAnimationFrame(frame);
    last = 0;
    if (!lost && inView && !document.hidden) frame = requestAnimationFrame(tick);
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
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight, false);
  });
  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  });

  setFlavor(flavor);
  container.append(canvas);
  size.observe(container);
  visibility.observe(container);
  document.addEventListener('visibilitychange', sync);
  canvas.addEventListener('webglcontextlost', lose);

  return {
    cameraTarget,
    setFlavor,
    setPointer(x, y) { pointerX = x; pointerY = y; },
    setScroll(progress) { scroll = progress; },
    orbit(delta) { turn += delta; },
    dispose() {
      canvas.removeEventListener('webglcontextlost', lose);
      document.removeEventListener('visibilitychange', sync);
      cancelAnimationFrame(frame);
      size.disconnect();
      visibility.disconnect();
      can.dispose();
      mango.dispose();
      environment.dispose();
      renderer.dispose();
      if (!lost) renderer.forceContextLoss();
      canvas.remove();
    },
  };
}

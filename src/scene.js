import * as THREE from 'three';

export function createScene(container, color) {
  if (!document.createElement('canvas').getContext('webgl2')) return;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  container.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 40);
  camera.position.z = 11;
  const geometry = new THREE.BufferGeometry();
  const coordinates = [];
  for (let point = 0; point < 65; point++) {
    coordinates.push((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 5);
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(coordinates, 3));
  const material = new THREE.PointsMaterial({ color, size: 0.044, opacity: 0.47, transparent: true });
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  let frame = 0;
  let previous = 0;
  let visible = true;
  let pointerX = 0;
  let pointerY = 0;
  let elapsed = 0;

  function tick(time) {
    frame = requestAnimationFrame(tick);
    if (time - previous < 32) return;
    if (previous) elapsed += Math.min(time - previous, 64);
    previous = time;
    particles.rotation.z = Math.sin(elapsed * 0.00014) * 0.13;
    particles.rotation.y += (pointerX * 0.32 - particles.rotation.y) * 0.065;
    particles.rotation.x += (pointerY * 0.28 - particles.rotation.x) * 0.065;
    renderer.render(scene, camera);
  }

  function sync() {
    cancelAnimationFrame(frame);
    previous = 0;
    if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  }

  const size = new ResizeObserver(() => {
    const { clientWidth, clientHeight } = container;
    if (!clientWidth || !clientHeight) return;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight, false);
  });
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  size.observe(container);
  intersection.observe(container);
  document.addEventListener('visibilitychange', sync);

  return {
    setColor(value) { material.color.set(value); },
    setPointer(x, y) { pointerX = x; pointerY = y; },
    dispose() {
      cancelAnimationFrame(frame);
      size.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', sync);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

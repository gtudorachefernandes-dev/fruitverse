import * as THREE from 'three';

const profile = [
  [0, -1.68], [0.50, -1.68], [0.56, -1.65], [0.59, -1.59],
  [0.65, -1.51], [0.68, -1.40], [0.68, 1.29], [0.66, 1.41],
  [0.59, 1.53], [0.55, 1.59], [0.55, 1.65],
].map(([x, y]) => new THREE.Vector2(x, y));

function labelTexture(flavor) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 768);
  gradient.addColorStop(0, flavor.dark);
  gradient.addColorStop(0.22, flavor.glow);
  gradient.addColorStop(0.48, new THREE.Color(flavor.accent).lerp(new THREE.Color(flavor.glow), 0.55).getStyle());
  gradient.addColorStop(0.83, flavor.glow);
  gradient.addColorStop(1, flavor.dark);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 768);

  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = i % 3 ? '#ffffff13' : '#16061117';
    ctx.fillRect(0, (i * 83) % 768, 1024, i % 2 + 1);
  }
  ctx.strokeStyle = '#180c2280';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.ellipse(512, 383, 515, 108 + i * 28, -0.24, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff1cf';
  ctx.font = '800 240px "Barlow Condensed", sans-serif';
  ctx.fillText('FRUIT', 512, 344, 286);
  ctx.fillText('VERSE', 512, 533, 286);
  ctx.font = '700 26px "Space Grotesk Variable", sans-serif';
  ctx.fillText(flavor.name.toUpperCase(), 512, 598, 295);
  ctx.font = '600 17px "Space Grotesk Variable", sans-serif';
  ctx.fillText('BEYOND THE FLAVOR  /  330 ML', 512, 637);
  ctx.fillText('FRUITVERSE®', 105, 402);
  ctx.fillText('BEYOND THE FLAVOR', 912, 402);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function createCan() {
  const group = new THREE.Group();
  const shell = new THREE.MeshPhysicalMaterial({ metalness: 0.62, roughness: 0.42, clearcoat: 0.22 });
  const alloy = new THREE.MeshStandardMaterial({ color: '#c4c8ce', metalness: 0.94, roughness: 0.27 });
  const seam = new THREE.MeshStandardMaterial({ color: '#737881', metalness: 0.84, roughness: 0.4 });
  const body = new THREE.LatheGeometry(profile, 56);
  const { uv, position } = body.attributes;
  // Map the print to physical height so dense profile points at the rims do not stretch the label.
  for (let i = 0; i < uv.count; i++) uv.setY(i, (position.getY(i) + 1.68) / 3.33);
  group.add(new THREE.Mesh(body, shell));

  function add(geometry, material, x, y, z, turn = false) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    if (turn) mesh.rotation.x = -Math.PI / 2;
    group.add(mesh);
    return mesh;
  }

  add(new THREE.CylinderGeometry(0.55, 0.55, 0.037, 56), alloy, 0, 1.65, 0);
  add(new THREE.TorusGeometry(0.55, 0.034, 8, 56), alloy, 0, 1.67, 0, true);
  add(new THREE.TorusGeometry(0.49, 0.012, 6, 56), seam, 0, 1.674, 0, true);
  add(new THREE.TorusGeometry(0.535, 0.027, 8, 56), alloy, 0, -1.656, 0, true);
  const score = add(new THREE.TorusGeometry(0.15, 0.009, 6, 24), seam, 0, 1.673, -0.245, true);
  score.scale.set(1.4, 0.72, 1);
  const tab = add(new THREE.TorusGeometry(0.112, 0.032, 8, 28), alloy, 0, 1.704, 0.12, true);
  tab.scale.set(1, 1.58, 1);
  add(new THREE.CylinderGeometry(0.063, 0.063, 0.039, 20), alloy, 0, 1.69, -0.053);

  return {
    group,
    setFlavor(flavor) {
      shell.map?.dispose();
      shell.map = labelTexture(flavor);
      shell.needsUpdate = true;
    },
    dispose() {
      group.children.forEach((mesh) => mesh.geometry.dispose());
      shell.map?.dispose();
      for (const material of [shell, alloy, seam]) material.dispose();
    },
  };
}

export function createMango() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.32, -0.12);
  shape.quadraticCurveTo(-0.22, -0.29, 0.18, -0.21);
  shape.quadraticCurveTo(0.36, -0.15, 0.34, 0.13);
  shape.quadraticCurveTo(0.21, 0.23, -0.18, 0.22);
  shape.quadraticCurveTo(-0.33, 0.18, -0.32, -0.12);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.24, bevelEnabled: true, bevelSize: 0.11, bevelThickness: 0.08, bevelSegments: 3, curveSegments: 5,
  });
  geometry.center();
  const material = new THREE.MeshPhysicalMaterial({ color: '#ed790c', roughness: 0.5, clearcoat: 0.32 });
  const pieces = Array.from({ length: 3 }, () => new THREE.Mesh(geometry, material));
  return { pieces, dispose() { geometry.dispose(); material.dispose(); } };
}

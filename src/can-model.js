const profile = [
  [0, -1.68], [0.50, -1.68], [0.56, -1.65], [0.59, -1.59],
  [0.65, -1.51], [0.68, -1.40], [0.68, 1.29], [0.66, 1.41],
  [0.59, 1.53], [0.55, 1.59], [0.55, 1.65],
];

function labelTexture(THREE, flavor, lite) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = lite ? 512 : 1024;
  const ctx = canvas.getContext('2d');
  ctx.scale(1, canvas.height / 768);
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
    ctx.ellipse(512, 383, 472, 108 + i * 28, -0.24, 0, Math.PI * 2);
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
  ctx.fillText(flavor.name.toUpperCase(), 105, 429, 180);
  ctx.fillText('FRUIT SODA / 330 ML', 912, 429, 180);
  ctx.fillStyle = '#fff7dc48';
  for (let i = 0; i < 190; i++) {
    const x = (i * 137.51) % 1024;
    const y = 118 + ((i * 91.73) % 540);
    if (x > 339 && x < 685) continue;
    ctx.beginPath();
    ctx.ellipse(x, y, 0.75 + i % 4 * 0.37, 1.2 + i % 3 * 0.54, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function condensationTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#242424';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 128; i++) {
    const x = 6 + i * 89.83 % 244;
    const y = 30 + i * 47.71 % 196;
    const radius = 1 + i % 5 * 0.42;
    const drop = ctx.createRadialGradient(x - 0.2, y - 0.25, 0, x, y, radius);
    drop.addColorStop(0, '#eef0f0');
    drop.addColorStop(0.48, '#a5a5a5');
    drop.addColorStop(1, '#242424');
    ctx.fillStyle = drop;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  return new THREE.CanvasTexture(canvas);
}

export function createCan(THREE, lite = false) {
  const group = new THREE.Group();
  const shell = lite
    ? new THREE.MeshPhongMaterial({ shininess: 45, specular: '#74717e' })
    : new THREE.MeshPhysicalMaterial({ metalness: 0.62, roughness: 0.36, clearcoat: 0.25 });
  const alloy = lite
    ? new THREE.MeshPhongMaterial({ color: '#b4b9c4', shininess: 71, specular: '#e6eefb' })
    : new THREE.MeshStandardMaterial({ color: '#c4c8ce', metalness: 0.94, roughness: 0.27 });
  const seam = lite
    ? new THREE.MeshPhongMaterial({ color: '#737881', shininess: 47 })
    : new THREE.MeshStandardMaterial({ color: '#737881', metalness: 0.84, roughness: 0.4 });
  const body = new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), lite ? 32 : 56);
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
  add(new THREE.CylinderGeometry(0.501, 0.51, 0.025, 32), alloy, 0, -1.666, 0);
  const score = add(new THREE.TorusGeometry(0.15, 0.009, 6, 24), seam, 0, 1.673, -0.245, true);
  score.scale.set(1.4, 0.72, 1);
  const tab = add(new THREE.TorusGeometry(0.112, 0.032, 8, 28), alloy, 0, 1.704, 0.12, true);
  tab.scale.set(1, 1.58, 1);
  add(new THREE.CylinderGeometry(0.063, 0.063, 0.039, 20), alloy, 0, 1.69, -0.053);

  let condensation;
  return {
    group,
    setFlavor(flavor) {
      shell.map?.dispose();
      shell.map = labelTexture(THREE, flavor, lite);
      if (!lite && !condensation) {
        condensation = condensationTexture(THREE);
        shell.bumpMap = condensation;
        shell.bumpScale = 0.014;
      }
      shell.needsUpdate = true;
    },
    dispose() {
      group.children.forEach((mesh) => mesh.geometry.dispose());
      shell.map?.dispose();
      condensation?.dispose();
      for (const material of [shell, alloy, seam]) material.dispose();
    },
  };
}

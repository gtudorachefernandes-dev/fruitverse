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
    [35, 0, 92, 26, '#fff7e9'], [150, 103, 88, 25, '#e5e7ef'], [50, 35, 28, 55, '#fff6e8'], [111, 25, 11, 79, '#eef2ff'],
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

export function lightStudio(THREE, renderer, scene, lite) {
  let environment;
  if (!lite) {
    const studio = studioTexture(THREE);
    const generator = new THREE.PMREMGenerator(renderer);
    try {
      environment = generator.fromEquirectangular(studio);
      scene.environment = environment.texture;
      scene.environmentIntensity = 1.05;
    } finally {
      studio.dispose();
      generator.dispose();
    }
  }

  return environment;
}

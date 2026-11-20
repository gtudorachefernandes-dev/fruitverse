const profile = [
  [0.50, -1.65], [0.515, -1.68], [0.56, -1.65], [0.59, -1.59],
  [0.65, -1.51], [0.68, -1.40], [0.68, 1.29], [0.66, 1.41],
  [0.59, 1.53], [0.55, 1.59], [0.55, 1.65],
];

function condensationTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#a8a8a8';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 128; i++) {
    const x = 6 + i * 89.83 % 244;
    const y = 30 + i * 47.71 % 196;
    const radius = 1 + i % 5 * 0.42;
    const drop = ctx.createRadialGradient(x - 0.2, y - 0.25, 0, x, y, radius);
    drop.addColorStop(0, '#eef0f0');
    drop.addColorStop(0.48, '#a5a5a5');
    drop.addColorStop(1, '#a8a8a8');
    ctx.fillStyle = drop;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  return new THREE.CanvasTexture(canvas);
}

export function createCan(THREE, lite = false) {
  const group = new THREE.Group();
  const shell = lite
    ? new THREE.MeshPhongMaterial({ shininess: 45, specular: '#74717e' })
    : new THREE.MeshPhysicalMaterial({ metalness: 0.36, roughness: 0.42, clearcoat: 0.25 });
  const alloy = lite
    ? new THREE.MeshPhongMaterial({ color: '#b4b9c4', shininess: 71, specular: '#e6eefb' })
    : new THREE.MeshStandardMaterial({ color: '#c4c8ce', metalness: 0.82, roughness: 0.32 });
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

  const lidProfile = [[.55,0],[.54,.018],[.51,.02],[.49,-.002],[.465,-.009],
    [.438,.003],[.416,.019],[.39,.022],[.365,.018],[0,.018]];
  const lid = new THREE.LatheGeometry(lidProfile.map(([r,y]) => new THREE.Vector2(r,y)),64);
  add(lid, alloy, 0, 1.65, 0);
  add(new THREE.TorusGeometry(0.55, 0.034, 8, 56), alloy, 0, 1.67, 0, true);
  add(new THREE.TorusGeometry(0.49, 0.012, 6, 56), seam, 0, 1.674, 0, true);
  add(new THREE.TorusGeometry(0.535, 0.027, 8, 56), alloy, 0, -1.656, 0, true);
  // The standing ring supports a concave, bare aluminium dome.
  const dome = [[0,-1.49],[.13,-1.50],[.27,-1.525],[.38,-1.57],[.46,-1.635],[.50,-1.672],[.53,-1.66]];
  const base = new THREE.LatheGeometry(dome.map(([r,y]) => new THREE.Vector2(r,y)), 64);
  add(base, alloy, 0, 0, 0);
  for (const radius of [.32,.43]) {
    add(new THREE.TorusGeometry(radius,.005,6,64), alloy,0,radius === .32 ? -1.55 : -1.615,0,true);
  }
  const score = add(new THREE.TorusGeometry(0.15, 0.009, 6, 24), seam, 0, 1.673, -0.245, true);
  score.scale.set(1.4, 0.72, 1);
  const recess = add(new THREE.CylinderGeometry(0.136, 0.136, 0.007, 32), seam, 0, 1.672, -0.24);
  recess.scale.set(1.38, 1, 0.7);
  // A stamped aluminium tongue connects the finger hole to the scored panel.
  const tab = new THREE.Shape();
  tab.moveTo(-.12,-.20);
  tab.bezierCurveTo(-.21,-.38,.19,-.39,.15,-.20);
  tab.lineTo(.105,.095);
  tab.quadraticCurveTo(0,.17,-.105,.095);
  tab.closePath();
  const opening = new THREE.Shape();
  opening.absellipse(0,-.19,.102,.107,0,2*Math.PI,false,0);
  tab.holes.push(opening);
  add(new THREE.ExtrudeGeometry(tab, {depth:.016,bevelSize:.008,bevelThickness:.006,
    bevelSegments:2,curveSegments:20}), alloy,0,1.694,-.025,true);
  add(new THREE.CylinderGeometry(0.063, 0.063, 0.039, 20), alloy, 0, 1.715, -0.053);


  let condensation;
  let brushed;
  return {
    group,
    setPrint(image) {
      shell.map?.dispose();
      shell.map = new THREE.Texture(image);
      shell.map.colorSpace = THREE.SRGBColorSpace;
      shell.map.anisotropy = 4;
      shell.map.needsUpdate = true;
      if (!condensation) {
        const grain = document.createElement('canvas');
        grain.width = grain.height = 256;
        const ctx = grain.getContext('2d');
        ctx.fillStyle = '#e1e2e4';
        ctx.fillRect(0,0,256,256);
        for (let i=0; i<1024; i++) {
          ctx.fillStyle = i%3 ? '#46546718' : '#ffffff65';
          ctx.fillRect(i*127%256,i*73%257,4+i%31,0.8);
        }
        brushed = new THREE.CanvasTexture(grain);
        brushed.colorSpace = THREE.SRGBColorSpace;
        alloy.map = brushed;
        alloy.needsUpdate = true;
        condensation = condensationTexture(THREE);
        shell.bumpMap = condensation;
        shell.bumpScale = 0.011;
        if (!lite) shell.roughnessMap = condensation;
      }
      shell.needsUpdate = true;
    },
    dispose() {
      group.children.forEach((mesh) => mesh.geometry.dispose());
      shell.map?.dispose();
      condensation?.dispose();
      brushed?.dispose();
      for (const material of [shell, alloy, seam]) material.dispose();
    },
  };
}

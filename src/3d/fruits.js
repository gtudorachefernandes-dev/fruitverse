export const fruitLayouts = {
  strawberry: [[-1.27, 0.92, -0.47], [1.1, -0.68, 0.67], [-0.98, -1.25, -0.2]],
  mango: [[-1.3, 0.68, -0.52], [1.08, -0.71, 0.48], [-1.18, -1.15, -0.08]],
  blueberry: [[-1.28, -0.65, 0.55], [1.24, 0.8, -0.38], [1.05, -1.27, -0.25]],
  lime: [[-1.29, 1.04, 0.22], [1.24, -1.04, 0.46], [-0.98, -1.28, -0.67]],
};

export function createFruitSet(T, id, lite = false) {
  const segments = lite ? 16 : 28;
  const material = (color, roughness = 0.48) => new T.MeshStandardMaterial({ color, roughness });
  const mesh = (geometry, surface) => new T.Mesh(geometry, surface);
  const sphere = (r, end = Math.PI) => new T.SphereGeometry(r, segments, lite ? 10 : 16, 0, Math.PI * 2, 0, end);
  function elliptical(group, surface, size) {
    const body = mesh(sphere(1), surface);
    body.scale.set(...size);
    group.add(body);
    return body;
  }
  function cap(group, radius, surface) {
    const disk = mesh(new T.CircleGeometry(radius, segments), surface);
    disk.rotation.x = Math.PI / 2;
    disk.position.y = -0.003;
    group.add(disk);
  }
  function points(group, positions, color, size) {
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
    group.add(new T.Points(geometry, new T.PointsMaterial({ color, size })));
  }

  const pieces = Array.from({ length: 3 }, () => new T.Group());
  if (id === 'strawberry') {
    const skin = material('#aa1634', 0.38);
    const leaves = material('#335817', 0.62);
    pieces.forEach((group, i) => {
      if (i === 1) {
        const half = mesh(sphere(0.45, Math.PI / 2), skin);
        group.add(half);
        cap(group, 0.45, material('#ff7472'));
        const heart = mesh(new T.CircleGeometry(0.25, segments), material('#ffc4a1'));
        heart.rotation.x = Math.PI / 2;
        heart.position.y = -0.007;
        heart.scale.set(0.7, 1.32, 1);
        group.add(heart);
        group.rotation.z = 0.74;
        return;
      }
      const outline = [[0,-0.47],[0.11,-0.43],[0.23,-0.33],[0.35,-0.17],[0.45,0.04],[0.46,0.21],[0.38,0.33],[0.21,0.39],[0,0.38]];
      group.add(mesh(new T.LatheGeometry(outline.map(([r,y]) => new T.Vector2(r,y)), segments), skin));
      const seeds = [];
      for (let row = 1; row < 7; row++) {
        const [r, y] = outline[row];
        const count = 4 + row;
        for (let n = 0; n < count; n++) {
          const a = (n / count + row * 0.083) * Math.PI * 2;
          seeds.push(Math.sin(a) * (r + 0.008), y, Math.cos(a) * (r + 0.008));
        }
      }
      points(group, seeds, '#efc466', 0.027);
      for (let n = 0; n < 5; n++) {
        const a = n * Math.PI * 0.4;
        const leaf = mesh(new T.SphereGeometry(1, 8, 5), leaves);
        leaf.scale.set(0.24, 0.036, 0.075);
        leaf.position.set(Math.cos(a) * 0.17, 0.375, Math.sin(a) * 0.17);
        leaf.rotation.y = -a;
        group.add(leaf);
      }
    });
  } else if (id === 'mango') {
    const skin = material('#df7031');
    const flesh = material('#ffb32d', 0.34);
    elliptical(pieces[0], skin, [0.4, 0.51, 0.34]).rotation.z = -0.35;
    const shape = new T.Shape();
    shape.moveTo(-0.48, 0.14);
    shape.quadraticCurveTo(-0.03, -0.51, 0.49, 0.17);
    shape.quadraticCurveTo(0.2, 0.08, -0.48, 0.14);
    pieces[1].add(mesh(new T.ExtrudeGeometry(shape, {
      depth: 0.14, bevelSize: 0.055, bevelThickness: 0.054, bevelSegments: 2, curveSegments: 10,
    }).center(), flesh));
    pieces[2].add(mesh(new T.BoxGeometry(0.52, 0.45, 0.47), flesh));
  } else if (id === 'blueberry') {
    const skin = material('#38327b', 0.58);
    const crown = material('#211951', 0.63);
    pieces.forEach((group, i) => {
      if (i === 1) {
        group.add(mesh(sphere(0.42, Math.PI / 2), skin));
        cap(group, 0.42, material('#ae8fce'));
        const detail = [];
        for (let n = 0; n < 19; n++) {
          const a = n * 2.39996;
          const r = 0.043 * Math.sqrt(n);
          detail.push(r * Math.cos(a), -0.009, r * Math.sin(a));
        }
        points(group, detail, '#504589', 0.028);
        return;
      }
      elliptical(group, skin, [0.41, 0.38, 0.4]);
      for (let n = 0; n < 5; n++) {
        const angle = n * Math.PI * 0.4;
        const tip = mesh(new T.SphereGeometry(0.07, 8, 5), crown);
        tip.position.set(Math.cos(angle) * 0.085, 0.357, Math.sin(angle) * 0.085);
        tip.scale.y = 0.44;
        group.add(tip);
      }
    });
  } else if (id === 'lime') {
    const rind = material('#568613', 0.58);
    const pith = material('#d3e691');
    const flesh = material('#a5ce44', 0.4);
    pith.side = flesh.side = T.DoubleSide;
    elliptical(pieces[0], rind, [0.4, 0.35, 0.37]);
    for (let i = 1; i < 3; i++) {
      const group = pieces[i];
      const arc = i === 1 ? Math.PI * 2 : Math.PI * 0.75;
      group.add(mesh(new T.CylinderGeometry(0.49, 0.49, 0.14, segments, 1, false, 0, arc), rind));
      for (const sign of [-1, 1]) {
        const disk = mesh(new T.CircleGeometry(0.458, segments, -Math.PI / 2, arc), pith);
        disk.rotation.x = -Math.PI / 2;
        disk.position.y = sign * 0.072;
        group.add(disk);
        const count = i === 1 ? 9 : 4;
        for (let n = 0; n < count; n++) {
          const cell = mesh(new T.CircleGeometry(0.418, 5, -Math.PI / 2 + arc * n / count + 0.045, arc / count - 0.09), flesh);
          cell.rotation.x = -Math.PI / 2;
          cell.position.y = sign * 0.075;
          group.add(cell);
        }
      }
    }
  }
  return {
    pieces,
    dispose() {
      const resources = new Set();
      pieces.forEach((piece) => piece.traverse((node) => {
        if (node.geometry) resources.add(node.geometry);
        if (node.material) resources.add(node.material);
      }));
      resources.forEach((resource) => resource.dispose());
    },
  };
}

import outlines from './fruit-outlines.json' with { type:'json' };

export const fruitLayouts = {
  strawberry: [[-1.27, 0.92, -0.47], [1.1, -0.68, 0.67], [-0.98, -1.25, -0.2]],
  mango: [[-1.3, 0.68, -0.52], [1.08, -0.71, 0.48], [-1.18, -1.15, -0.08]],
  blueberry: [[-1.28, -0.65, 0.55], [1.24, 0.8, -0.38], [1.05, -1.27, -0.25]],
  lime: [[-1.29, 1.04, 0.22], [1.24, -1.04, 0.46], [-0.98, -1.28, -0.67]],
};

// Each front/back pair shares a photographed outline. Depth behind the photographed face is inferred.
function fittedFruit(T, shape, thickness, lite) {
  const [w,h] = shape.size;
  const [cx,cy] = shape.center;
  const contour = lite ? shape.outline.filter((_,i) => i%2 === 0) : shape.outline;
  const spokes = contour.length;
  const bands = lite ? 12 : 20;
  const positions = [], uvs = [], indices = [];
  function vertex(x,y,z) {
    positions.push((x-w/2)/Math.max(w,h), (h/2-y)/Math.max(w,h), z);
    uvs.push((x+.5)/w, 1-(y+.5)/h);
  }
  vertex(cx,cy,thickness);
  for (let band=1; band<bands; band++) {
    const latitude = Math.PI*band/bands;
    const radius = Math.sin(latitude);
    for (const [edgeX,edgeY] of contour) {
      const folded = .94 + .06*Math.cos((edgeX+edgeY)*.043);
      vertex(cx+(edgeX-cx)*radius, cy+(edgeY-cy)*radius,
        thickness*Math.cos(latitude)*(1+(folded-1)*radius));
    }
  }
  const end = positions.length/3;
  vertex(cx,cy,-thickness);
  for (let i=0; i<spokes; i++) {
    const next=(i+1)%spokes;
    indices.push(0,1+next,1+i);
    for (let row=0; row<bands-2; row++) {
      const a=1+row*spokes+i, b=1+row*spokes+next;
      indices.push(a,b,b+spokes,a,b+spokes,a+spokes);
    }
    const last=1+(bands-2)*spokes;
    indices.push(last+i,last+next,end);
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function createFruitSet(T,id,lite=false,images={}) {
  const keys = Object.keys(outlines).filter(key => key.startsWith(id+'-'));
  const surfaces = new Map();
  const pieces = Array.from({length:3}, (_,i) => {
    const key = keys[i%keys.length];
    if (!surfaces.has(key)) {
      const texture = images[key] ? new T.Texture(images[key]) : null;
      if (texture) {
        texture.colorSpace = T.SRGBColorSpace;
        texture.needsUpdate = true;
        texture.anisotropy = 4;
      }
      const surface = new T.MeshStandardMaterial({
        map:texture, alphaTest:.3, roughness:id === 'blueberry' ? .78 : .58,
        bumpMap:texture, bumpScale:lite ? .001 : .005
      });
      surfaces.set(key,surface);
    }
    const shallow = id === 'lime' || i === 1;
    return new T.Mesh(fittedFruit(T,outlines[key],shallow ? .20 : .36,lite),surfaces.get(key));
  });
  return {pieces,dispose() {
    pieces.forEach(piece => piece.geometry.dispose());
    surfaces.forEach(surface => {surface.map?.dispose(); surface.dispose();});
  }};
}

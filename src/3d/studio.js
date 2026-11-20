import { createCan } from '../can-model.js';

export function createStudio(THREE, config, floor, flavors, prints) {
  const canvas = config.context.canvas;
  const renderer = new THREE.WebGLRenderer({canvas, context: config.context});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.4));
  renderer.setClearColor(0, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, .1, 50);
  const cans = flavors.map(({id}, i) => {
    const can = createCan(THREE, config.lite);
    can.setPrint(prints[id]);
    can.group.position.set((i - 1.5) * 1.75, i % 2 ? -.12 : .12, i % 2 ? .28 : -.28);
    can.group.rotation.set(.07, Math.PI, (1.5-i)*.05);
    can.group.scale.set(.88, 1, .88);
    scene.add(can.group);
    return can;
  });
  scene.add(new THREE.HemisphereLight('#fff9ee', '#746976', 1.65));
  for (const [x, y, z, power] of [[-4,6,5,2.3],[4,1,4,1.2],[2,4,-2,2.5]]) {
    const light = new THREE.DirectionalLight('#fff9f3', power);
    light.position.set(x,y,z);
    scene.add(light);
  }
  const shot = {x:0, zoom:1};
  function draw() {
    const w = floor.clientWidth, h = floor.clientHeight;
    if (!h || !w) return;
    if (camera.aspect !== w/h || !canvas.width) renderer.setSize(w,h,false);
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    const distance = Math.max(8.3, 14 / camera.aspect) / shot.zoom;
    camera.position.set(shot.x*.86, .55, distance);
    camera.lookAt(shot.x, 0, 0);
    renderer.render(scene,camera);
  }
  floor.append(canvas);
  const size = new ResizeObserver(draw);
  size.observe(floor);
  draw();
  return {shot, draw, dispose() {
    size.disconnect();
    cans.forEach(can => can.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  }};
}

import { lightStudio } from './lighting.js';
import { createCan } from '../can-model.js';

export function createStudio(THREE, config, floor, flavors, prints) {
  const canvas = config.context.canvas;
  const renderer = new THREE.WebGLRenderer({canvas, context: config.context});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.4));
  renderer.setClearColor(0, 0);
  const scene = new THREE.Scene();
  const environment = lightStudio(THREE, renderer, scene, config.lite);
  const camera = new THREE.PerspectiveCamera(31, 1, .1, 50);
  const cans = flavors.map(({id}, i) => {
    const can = createCan(THREE, config.lite);
    can.setPrint(prints[id]);
    can.group.position.set((i - 1.5) * 1.75, -.06 * Math.abs(i - 1.5), .6 - .54 * (i - 1.5) ** 2);
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
  const shot = {x:0, zoom:1, focus:0, strength:0};
  let width, height;
  function draw() {
    const w = floor.clientWidth, h = floor.clientHeight;
    if (!h || !w) return;
    if (width !== w || height !== h) {
      renderer.setSize(w,h,false);
      width = w; height = h;
    }
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    cans.forEach(({group}, index) => {
      const weight = Math.exp(-2 * (index - shot.focus) ** 2) * shot.strength;
      group.rotation.y = Math.PI + (index - 1.5) * .21 * (1 - weight);
      group.rotation.z = (1.5 - index) * .09 * (1 - weight);
      group.position.y = -.08 + weight * .19;
      group.children[0].material.color.setScalar(1 - .48 * (shot.strength - weight));
    });
    const distance = Math.max(8, Math.max(9.2, 15 / camera.aspect) / shot.zoom);
    camera.position.set(shot.x * .74, .68 + .22 * shot.strength, distance);
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
    environment?.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  }};
}

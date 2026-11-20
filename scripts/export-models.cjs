// Run against Vite's development server so the exporter uses the same geometry and prints as the page.
const {chromium} = require('playwright-core');
const {writeFileSync, mkdirSync} = require('node:fs');
const {join} = require('node:path');

(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROME_BIN || '/usr/bin/chromium',args:['--no-sandbox']});
  try {
    const page = await browser.newPage();
    await page.goto(process.argv[2] || 'http://localhost:5173');
    const folder = process.argv[3] || 'review/models';
    mkdirSync(folder,{recursive:true});
    for (const id of ['strawberry','mango','blueberry','lime']) {
      const data = await page.evaluate(async id => {
        const T = await import('/node_modules/three/build/three.module.js');
        const {GLTFExporter} = await import('/node_modules/three/examples/jsm/exporters/GLTFExporter.js');
        const {createCan} = await import('/src/can-model.js');
        const {createFruitSet, fruitLayouts} = await import('/src/3d/fruits.js');
        const {loadPrint} = await import('/src/3d/labels.js');
        const {loadFruitImages} = await import('/src/3d/fruit-images.js');
        const can = createCan(T);
        can.setPrint(await loadPrint(id));
        can.group.name = id+'-can';
        can.group.rotation.y = Math.PI;
        can.group.scale.set(.88,1,.88);
        const scene = new T.Scene();
        scene.add(can.group);
        const fruit = createFruitSet(T,id,false,await loadFruitImages());
        fruit.pieces.forEach((piece,i) => {
          piece.name = id+'-fruit-'+(i+1);
          piece.position.fromArray(fruitLayouts[id][i]);
          scene.add(piece);
        });
        const binary = await new GLTFExporter().parseAsync(scene,{binary:true});
        const base64 = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(new Blob([binary]));
        });
        can.dispose(); fruit.dispose();
        return base64;
      }, id);
      writeFileSync(join(folder,id+'.glb'),Buffer.from(data,'base64'));
    }
  } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exitCode=1;});

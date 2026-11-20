import assert from 'node:assert/strict';
import test from 'node:test';
import * as modern from 'three';
import * as compatible from 'three-webgl1';
import { createCan } from '../src/can-model.js';
import { createFruitSet, fruitLayouts } from '../src/3d/fruits.js';

for (const [THREE, lite] of [[modern, false], [compatible, true]]) {
  test(`renderer r${THREE.REVISION} builds a round can with a lid and proportional UVs`, () => {
    const can = createCan(THREE, lite);
    try {
      const [body, lid] = can.group.children;
      const bounds = new THREE.Box3().setFromObject(can.group).getSize(new THREE.Vector3());
      assert.ok(bounds.y > 3.3 && bounds.x > 1.3 && bounds.z > 1.3);
      assert.ok(lid.position.y > 1.6);
      assert.equal(body.material.type, lite ? 'MeshPhongMaterial' : 'MeshPhysicalMaterial');
      const { uv, position } = body.geometry.attributes;
      for (let i = 0; i < uv.count; i++) {
        assert.ok(Math.abs(uv.getY(i) - (position.getY(i) + 1.68) / 3.33) < 0.0001);
      }
    } finally {
      can.dispose();
    }
  });

  for (const id of Object.keys(fruitLayouts)) {
    test(`renderer r${THREE.REVISION} builds and disposes volumetric ${id} fruit`, () => {
      const fruit = createFruitSet(THREE, id, lite);
      const geometries = new Set();
      let disposed = 0;
      for (const piece of fruit.pieces) {
        const size = new THREE.Box3().setFromObject(piece).getSize(new THREE.Vector3());
        assert.ok(size.x > 0.2 && size.y > 0.1 && size.z > 0.1);
        piece.traverse((node) => {
          if (node.geometry && !geometries.has(node.geometry)) {
            geometries.add(node.geometry);
            node.geometry.addEventListener('dispose', () => { disposed++; });
          }
        });
      }
      assert.equal(fruit.pieces.length, 3);
      fruit.dispose();
      assert.equal(disposed, geometries.size);
    });
  }
}

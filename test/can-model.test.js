import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, Vector3 } from 'three';
import { createCan, createMango } from '../src/can-model.js';

test('the metal can has a deep shell, lid and label UVs proportional to shell height', () => {
  const can = createCan();
  try {
    const [body, lid] = can.group.children;
    const bounds = new Box3().setFromObject(can.group).getSize(new Vector3());
    assert.ok(bounds.y > 3.3);
    assert.ok(bounds.x > 1.3 && bounds.z > 1.3);
    assert.ok(lid.position.y > 1.6);
    assert.ok(body.material.metalness > 0.5);
    const { uv, position } = body.geometry.attributes;
    for (let i = 0; i < uv.count; i++) {
      assert.ok(Math.abs(uv.getY(i) - (position.getY(i) + 1.68) / 3.33) < 0.0001);
    }
  } finally {
    can.dispose();
  }
});

test('Mango Sunset uses three independently positioned meshes with shared solid geometry', () => {
  const mango = createMango();
  try {
    assert.equal(mango.pieces.length, 3);
    assert.equal(new Set(mango.pieces.map((piece) => piece.geometry)).size, 1);
    const size = new Box3().setFromObject(mango.pieces[0]).getSize(new Vector3());
    assert.ok(size.z > 0.24 && size.x > 0.5 && size.y > 0.3);
    assert.notEqual(mango.pieces[0].position, mango.pieces[1].position);
  } finally {
    mango.dispose();
  }
});

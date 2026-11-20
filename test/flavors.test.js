import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { flavors, nextIndex } from '../src/flavors.js';

test('the collection cycles through all four flavors and returns to Strawberry Rush', () => {
  const visited = [];
  let index = 0;
  for (const flavor of flavors) {
    visited.push(flavors[index].name);
    assert.equal(flavors[index], flavor);
    index = nextIndex(index);
  }
  assert.deepEqual(visited, ['Strawberry Rush', 'Mango Sunset', 'Blueberry Galaxy', 'Lime Energy']);
  assert.equal(index, 0);
});

test('every flavor ships a distinct WebP packshot and accessible description', async () => {
  assert.equal(new Set(flavors.map((flavor) => flavor.image)).size, flavors.length);
  for (const { image, alt, name } of flavors) {
    assert.ok(alt.includes(name));
    const file = await readFile(new URL(`../public/${image}`, import.meta.url));
    assert.equal(file.toString('ascii', 0, 4), 'RIFF');
    assert.equal(file.toString('ascii', 8, 12), 'WEBP');
  }
});

test('each desktop composition ships a base and at least two independent fruit layers', async () => {
  const layout = JSON.parse(await readFile(new URL('../src/fruit-layout.json', import.meta.url), 'utf8'));
  for (const { id } of flavors) {
    const layers = layout[id];
    assert.ok(layers.length >= 2);
    for (const [left, top, width, height] of layers) {
      assert.ok(left >= 0 && top >= 0 && width > 0 && height > 0);
      assert.ok(left + width <= 1.0001 && top + height <= 1.0001);
    }
    const files = ['base', ...layers.map((_, index) => index + 1)];
    for (const piece of files) {
      const file = await readFile(new URL(`../public/flavors/layers/${id}-${piece}.webp`, import.meta.url));
      assert.equal(file.toString('ascii', 8, 12), 'WEBP');
    }
  }
});

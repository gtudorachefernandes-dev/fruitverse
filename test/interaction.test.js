import assert from 'node:assert/strict';
import test from 'node:test';
import { createOrbit } from '../src/3d/camera.js';
import { createFlavorFlow } from '../src/flavor-flow.js';
import { requestRenderer } from '../src/3d/context.js';

test('renderer detection prefers WebGL 2, tries WebGL 1 on a separate canvas and accepts neither', () => {
  const attempts = [];
  const context = { isContextLost: () => false };
  const createCanvas = (supported) => () => ({
    getContext(api) { attempts.push([this, api]); return api === supported ? context : null; },
  });
  assert.deepEqual(requestRenderer(createCanvas('webgl2')), { context, lite: false });
  assert.deepEqual(requestRenderer(createCanvas('webgl')), { context, lite: true });
  assert.equal(requestRenderer(createCanvas('none')), null);
  assert.deepEqual(attempts.map(([, api]) => api), ['webgl2', 'webgl2', 'webgl', 'webgl2', 'webgl']);
  assert.notEqual(attempts[1][0], attempts[2][0]);
});

test('drag continues with damping, clamps pitch and resets the model to the front', () => {
  const orbit = createOrbit();
  orbit.begin();
  orbit.move(1, 3, 30);
  orbit.update(16, true);
  assert.ok(orbit.state.yaw > 0 && orbit.state.yaw < 1);
  orbit.end();
  for (let i = 0; i < 90; i++) orbit.update(16, true);
  assert.ok(orbit.state.yaw > 1);
  assert.ok(orbit.state.pitch <= 1.08);
  orbit.reset();
  orbit.update(16, false);
  assert.equal(orbit.state.pitch, 0);
  assert.ok(Math.abs(Math.sin(orbit.state.yaw)) < 1e-8);
});

test('rapid flavor requests invalidate earlier asset loads and keep the last selection', () => {
  const flow = createFlavorFlow();
  const first = flow.request(1);
  const second = flow.request(2);
  const third = flow.request(3);
  assert.equal(flow.requested, 3);
  assert.equal(flow.isCurrent(first), false);
  assert.equal(flow.isCurrent(second), false);
  assert.equal(flow.isCurrent(third), true);
  flow.commit(3);
  flow.request(1);
  flow.reject();
  assert.equal(flow.requested, 3);
  assert.equal(flow.pristine, false);
});

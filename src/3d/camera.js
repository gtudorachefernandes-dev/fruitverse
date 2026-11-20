export const compositions = {
  strawberry: { x: -0.34, y: 1.04, distance: 7.45, fov: 32, lean: 0.24, key: '#ffd6ce', accent: '#ff487e', pace: 1.3, points: 32 },
  mango: { x: 0.58, y: 1.62, distance: 7.8, fov: 30, lean: 0.16, key: '#ffe2a8', accent: '#ff9d2a', pace: 0.84, points: 20 },
  blueberry: { x: -0.65, y: 0.83, distance: 7.6, fov: 32, lean: -0.13, key: '#d9d7ff', accent: '#9873ff', pace: 0.91, points: 48 },
  lime: { x: 0.45, y: 1.26, distance: 7.25, fov: 34, lean: 0.27, key: '#f0ffd4', accent: '#9bef42', pace: 1.55, points: 28 },
};

export function createOrbit() {
  const state = { yaw: 0, pitch: 0 };
  const target = { yaw: 0, pitch: 0 };
  const velocity = { yaw: 0, pitch: 0 };
  let active = false;
  const pitchLimit = 1.08;
  const clampPitch = (value) => Math.max(-pitchLimit, Math.min(pitchLimit, value));
  return {
    state,
    get active() { return active; },
    begin() { active = true; velocity.yaw = velocity.pitch = 0; },
    move(x, y, dt) {
      target.yaw += x;
      target.pitch = clampPitch(target.pitch + y);
      if (active) {
        velocity.yaw = Math.max(-0.008, Math.min(0.008, x / Math.max(16, dt)));
        velocity.pitch = Math.max(-0.006, Math.min(0.006, y / Math.max(16, dt)));
      }
    },
    end() { active = false; },
    reset() {
      active = false;
      velocity.yaw = velocity.pitch = 0;
      // Return to the front along the shortest remaining arc.
      target.yaw = Math.round(state.yaw / (2 * Math.PI)) * 2 * Math.PI;
      target.pitch = 0;
    },
    update(dt, kinetic) {
      if (!active && kinetic) {
        target.yaw += velocity.yaw * dt;
        target.pitch = clampPitch(target.pitch + velocity.pitch * dt);
        const friction = Math.exp(-dt * 0.012);
        velocity.yaw *= friction;
        velocity.pitch *= friction;
      }
      const mix = kinetic ? 1 - Math.exp(-dt * 0.013) : 1;
      state.yaw += (target.yaw - state.yaw) * mix;
      state.pitch += (target.pitch - state.pitch) * mix;
      if (Math.abs(state.yaw) > Math.PI * 80) {
        const offset = Math.round(state.yaw / (2 * Math.PI)) * 2 * Math.PI;
        state.yaw -= offset;
        target.yaw -= offset;
      }
    },
  };
}

export function requestRenderer(createCanvas = () => document.createElement('canvas')) {
  const options = { alpha: true, antialias: true, powerPreference: 'low-power' };
  for (const api of ['webgl2', 'webgl']) {
    try {
      const canvas = createCanvas();
      const context = canvas.getContext(api, options);
      if (context && !context.isContextLost()) return { context, lite: api === 'webgl' };
    } catch {
      // Some browsers reject one context type while allowing another.
    }
  }
  return null;
}

export function loadRenderer(lite) {
  return lite ? import('./compatible.js') : import('./modern.js');
}

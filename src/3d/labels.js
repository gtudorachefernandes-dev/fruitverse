import strawberry from '../labels/strawberry.webp?inline';
import mango from '../labels/mango.webp?inline';
import blueberry from '../labels/blueberry.webp?inline';
import lime from '../labels/lime.webp?inline';

const sources = { strawberry, mango, blueberry, lime };
const prints = new Map();

export function loadPrint(id) {
  if (!prints.has(id)) {
    const image = new Image();
    image.src = sources[id];
    prints.set(id, image.decode().then(() => image).catch(error => {
      prints.delete(id);
      throw error;
    }));
  }
  return prints.get(id);
}

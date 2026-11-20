import layout from './fruit-layout.json';

const asset = (file) => `${import.meta.env.BASE_URL}flavors/layers/${file}.webp`;

function image(src, alt = '') {
  const node = new Image();
  node.src = src;
  node.alt = alt;
  node.draggable = false;
  return node;
}

export function createArtwork(flavor, layered) {
  const artwork = document.createElement('div');
  artwork.className = 'artwork';
  const can = image(layered ? asset(`${flavor.id}-base`) : flavor.image, flavor.alt);
  can.className = 'can';
  artwork.append(can);
  if (layered) {
    for (const [index, [left, top, width, height]] of layout[flavor.id].entries()) {
      const fruit = image(asset(`${flavor.id}-${index + 1}`));
      fruit.className = 'fruit';
      fruit.style.left = `${left * 100}%`;
      fruit.style.top = `${top * 100}%`;
      fruit.style.width = `${width * 100}%`;
      fruit.style.height = `${height * 100}%`;
      artwork.append(fruit);
    }
  }
  return artwork;
}

export function decodeArtwork(artwork) {
  return Promise.all([...artwork.querySelectorAll('img')].map((node) => node.decode()));
}

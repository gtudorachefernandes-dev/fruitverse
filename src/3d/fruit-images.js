const sources = import.meta.glob('../../public/flavors/layers/*-[123].webp', {
  eager:true, query:'?inline', import:'default'
});
export async function loadFruitImages() {
  const images = await Promise.all(Object.entries(sources).map(async ([path, src]) => {
    const image = new Image();
    image.src = src;
    await image.decode();
    return [path.split('/').pop().replace('.webp',''), image];
  }));
  return Object.fromEntries(images);
}

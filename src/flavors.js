const image = (name) => `${import.meta.env?.BASE_URL ?? './'}flavors/${name}.webp`;

export const flavors = [
  {
    id: 'strawberry', note: 'Intenso e fresco', name: 'Strawberry Rush', title: ['STRAWBERRY', 'RUSH'], image: image('strawberry'),
    alt: 'Lata de Strawberry Rush com morangos', accent: '#ff597e', glow: '#851131', dark: '#190810',
    description: 'Morango intenso. Frescor elétrico. Uma explosão de sabor a cada gole.',
  },
  {
    id: 'mango', note: 'Tropical e suculento', name: 'Mango Sunset', title: ['MANGO', 'SUNSET'], image: image('mango'),
    alt: 'Lata de Mango Sunset com pedaços de manga', accent: '#ffb753', glow: '#884110', dark: '#211008',
    description: 'Manga madura e suculenta, com o calor dourado de um fim de tarde.',
  },
  {
    id: 'blueberry', note: 'Aveludado e ácido', name: 'Blueberry Galaxy', title: ['BLUEBERRY', 'GALAXY'], image: image('blueberry'),
    alt: 'Lata de Blueberry Galaxy com mirtilos', accent: '#b0a3ff', glow: '#383080', dark: '#100d23',
    description: 'Mirtilo aveludado, acidez delicada e um universo de sabor por descobrir.',
  },
  {
    id: 'lime', note: 'Cítrico e vibrante', name: 'Lime Energy', title: ['LIME', 'ENERGY'], image: image('lime'),
    alt: 'Lata de Lime Energy com fatias de limão', accent: '#c1f665', glow: '#436415', dark: '#111a0a',
    description: 'Limão fresco, cítrico e vibrante. Um gole que acende os sentidos.',
  },
];

export function nextIndex(index, total = flavors.length) {
  return (index + 1) % total;
}

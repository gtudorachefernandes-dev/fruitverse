import '@fontsource/barlow-condensed/latin-800.css';
import '@fontsource-variable/space-grotesk';
import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { flavors, nextIndex } from './flavors.js';
import { createArtwork, decodeArtwork } from './artwork.js';

gsap.registerPlugin(ScrollTrigger);

const hero = document.querySelector('.hero');
const picker = document.querySelector('#flavor-picker');
const product = document.querySelector('.product');
const frame = document.querySelector('.product-frame');
const description = document.querySelector('#flavor-description');
const words = [...document.querySelectorAll('.title-line > span')];
const loader = document.querySelector('.loader');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const desktopPointer = matchMedia('(min-width: 761px) and (pointer: fine)');
const lowPower = navigator.connection?.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
const useLayers = () => desktopPointer.matches && !reducedMotion.matches && !lowPower;
let activeArt = frame.querySelector('.artwork');
let selected = 0;
let requested = 0;
let requestId = 0;
let transition;
let intro;
let scene;
let scenePending = false;

const number = (index) => String(index + 1).padStart(2, '0');

const choices = flavors.map((flavor, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.style.setProperty('--swatch', flavor.accent);
  button.innerHTML = `<span class="chip" aria-hidden="true"></span><span class="flavor-name">${flavor.name}</span><span class="choice-index" aria-hidden="true">${number(index)}</span>`;
  button.addEventListener('click', () => select(index));
  picker.append(button);
  return button;
});

const grid = document.querySelector('#collection-grid');
const cards = flavors.map((flavor, index) => {
  const card = document.createElement('article');
  card.className = 'flavor-card';
  card.style.setProperty('--card-accent', flavor.accent);
  card.style.setProperty('--card-glow', flavor.glow);
  card.innerHTML = `
    <div class="card-image">
      <span aria-hidden="true">${number(index)} / 04</span>
      <img src="${flavor.image}" alt="" loading="lazy" decoding="async" width="922" height="1152">
    </div>
    <div class="card-info">
      <h3>${flavor.name}</h3><p>${flavor.note}</p>
      <a href="#sabores" aria-label="Ver ${flavor.name} no destaque">
        <svg aria-hidden="true" viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12L12 4M5 4h7v7"/></svg>
      </a>
    </div>`;
  card.querySelector('a').addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (location.hash !== '#sabores') history.pushState(null, '', '#sabores');
    hero.scrollIntoView();
    select(index);
    choices[index].focus({ preventScroll: true });
  });
  grid.append(card);
  return card;
});

function render(index, announce = false) {
  const flavor = flavors[index];
  selected = index;
  hero.style.setProperty('--accent', flavor.accent);
  hero.style.setProperty('--glow', flavor.glow);
  hero.style.setProperty('--dark', flavor.dark);
  words.forEach((word, position) => { word.textContent = flavor.title[position]; });
  document.querySelector('#flavor-index').textContent = number(index);
  document.querySelector('#figure-index').textContent = number(index);
  description.textContent = flavor.description;
  choices.forEach((button, position) => button.setAttribute('aria-pressed', String(position === index)));
  scene?.setColor(flavor.accent);
  if (announce) document.querySelector('#flavor-announcement').textContent = flavor.name;
}

function finishTransition() {
  transition?.progress(1);
  transition = undefined;
}

function mountArtwork(artwork) {
  const previous = activeArt;
  previous.setAttribute('aria-hidden', 'true');
  previous.querySelector('.can').removeAttribute('id');
  activeArt = artwork;
  activeArt.querySelector('.can').id = 'packshot';
  frame.append(activeArt);
  return previous;
}

async function select(index) {
  requested = index;
  const id = ++requestId;
  if (selected === index) return;
  const flavor = flavors[index];
  let artwork = createArtwork(flavor, useLayers());
  try {
    await decodeArtwork(artwork);
  } catch {
    artwork = createArtwork(flavor, false);
    try {
      await decodeArtwork(artwork);
    } catch {
      if (id === requestId) {
        requested = selected;
        document.querySelector('#flavor-announcement').textContent = `Não foi possível carregar ${flavor.name}. Tente novamente.`;
      }
      return;
    }
  }
  if (id !== requestId) return;

  intro?.progress(1);
  finishTransition();
  const previous = mountArtwork(artwork);
  render(index, true);
  if (reducedMotion.matches) {
    previous.remove();
    return;
  }

  transition = gsap.timeline({ onComplete: () => previous.remove() });
  transition
    .to(previous, { opacity: 0, duration: 0.46, ease: 'power2.inOut' }, 0)
    .from(artwork, { opacity: 0, duration: 0.56, ease: 'power2.out', clearProps: 'opacity' }, 0)
    .from(artwork.querySelector('.can'), { scale: 0.95, rotation: -5, y: 12, duration: 0.8, ease: 'power3.out', clearProps: 'transform' }, 0)
    .from(words, { yPercent: 108, duration: 0.62, stagger: 0.07, ease: 'power4.out', clearProps: 'transform' }, 0)
    .from(description, { opacity: 0, y: 8, duration: 0.42, clearProps: 'opacity,transform' }, 0.16);
  const fruit = artwork.querySelectorAll('.fruit');
  if (fruit.length) {
    transition.from(fruit, { opacity: 0, scale: 0.82, stagger: 0.06, duration: 0.64, clearProps: 'opacity,scale' }, 0.09);
  }
}

render(0);
document.querySelector('.next-flavor').addEventListener('click', () => select(nextIndex(requested)));

async function start() {
  await Promise.race([decodeArtwork(activeArt).catch(() => {}), new Promise((resolve) => setTimeout(resolve, 1200))]);
  if (reducedMotion.matches || requestId) loader.remove();
  else {
    intro = gsap.timeline({ onComplete: () => loader.remove() })
      .to(loader, { yPercent: -105, duration: 0.64, ease: 'power3.inOut' })
      .from(words, { yPercent: 110, duration: 0.75, stagger: 0.09, ease: 'power4.out', clearProps: 'transform' }, '-=0.23')
      .from(frame, {
        rotation: -14, rotationY: 32, y: 42, z: -110, opacity: 0, duration: 1.06,
        ease: 'power3.out', clearProps: 'transform,opacity',
      }, '<');
  }

  if (!useLayers() || requestId) return;
  const artwork = createArtwork(flavors[0], true);
  try {
    await decodeArtwork(artwork);
    if (!requestId && useLayers()) mountArtwork(artwork).remove();
  } catch {
    // Retain the original composite if an optional layer fails to decode.
  }
}

start();

const media = gsap.matchMedia();
media.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.from('.collection-heading h2', {
    y: 32, opacity: 0, duration: 0.72, clearProps: 'opacity,transform',
    scrollTrigger: { trigger: '.collection-heading', start: 'top 87%', once: true },
  });
  for (const card of cards) {
    gsap.from(card.querySelector('img'), {
      y: 22, duration: 0.8, clearProps: 'transform',
      scrollTrigger: { trigger: card, start: 'top 90%', once: true },
    });
  }
  gsap.from('.manifesto > div', {
    opacity: 0, y: 40, duration: 0.85, clearProps: 'opacity,transform',
    scrollTrigger: { trigger: '.manifesto', start: 'top 86%', once: true },
  });
});

media.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', () => {
  gsap.to('.product-stage', {
    yPercent: 13, scale: 0.91, ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 },
  });
  gsap.to('.orbit-one', {
    rotation: 38, scale: 1.14, ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.7 },
  });
});

const navLinks = [...document.querySelectorAll('.masthead nav a')];
const sections = navLinks.map((link) => document.querySelector(link.hash)).reverse();
const masthead = document.querySelector('.masthead');
let currentSection;
let navFrame;

function syncNavigation() {
  navFrame = undefined;
  const nearBottom = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
  const threshold = masthead.offsetHeight + 40;
  const current = nearBottom ? sections[0] : sections.find((section) => section.getBoundingClientRect().top <= threshold);
  if (!current || currentSection === current) return;
  currentSection = current;
  for (const link of navLinks) {
    if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}

function scheduleNavigation() {
  if (navFrame === undefined) navFrame = requestAnimationFrame(syncNavigation);
}

window.addEventListener('scroll', scheduleNavigation, { passive: true });
window.addEventListener('resize', scheduleNavigation);
syncNavigation();
const visibility = new IntersectionObserver(([entry]) => {
  frame.classList.toggle('offscreen', !entry.isIntersecting);
});
visibility.observe(frame);

const tiltX = gsap.quickTo(product, 'rotationX', { duration: 0.6, ease: 'power3.out' });
const tiltY = gsap.quickTo(product, 'rotationY', { duration: 0.6, ease: 'power3.out' });
const shiftX = gsap.quickTo(product, 'x', { duration: 0.6, ease: 'power3.out' });
const shiftY = gsap.quickTo(product, 'y', { duration: 0.6, ease: 'power3.out' });

function pointAt(x, y) {
  tiltX(y * -9);
  tiltY(x * 15);
  shiftX(x * 24);
  shiftY(y * 18);
  scene?.setPointer(x, y);
}

function move(event) {
  const bounds = hero.getBoundingClientRect();
  pointAt((event.clientX - bounds.left) / bounds.width - 0.5, (event.clientY - bounds.top) / bounds.height - 0.5);
}

function resetPointer() {
  pointAt(0, 0);
}

async function syncEffects() {
  if (reducedMotion.matches) {
    intro?.progress(1);
    finishTransition();
  }
  if (!desktopPointer.matches || reducedMotion.matches) {
    hero.removeEventListener('pointermove', move);
    hero.removeEventListener('pointerleave', resetPointer);
    for (const setter of [tiltX, tiltY, shiftX, shiftY]) setter.tween.pause();
    gsap.set(product, { x: 0, y: 0, rotationX: 0, rotationY: 0 });
    scene?.dispose();
    scene = undefined;
    return;
  }
  hero.addEventListener('pointermove', move);
  hero.addEventListener('pointerleave', resetPointer);
  if (scene || scenePending || lowPower) return;
  scenePending = true;
  try {
    const { createScene } = await import('./scene.js');
    if (useLayers()) scene = createScene(document.querySelector('.scene'), flavors[selected].accent);
  } catch {
    // The CSS composition remains available without 3D.
  } finally {
    scenePending = false;
  }
}

reducedMotion.addEventListener('change', syncEffects);
desktopPointer.addEventListener('change', syncEffects);
syncEffects();

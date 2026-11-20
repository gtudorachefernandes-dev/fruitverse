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
const modelView = document.querySelector('#model-view');
const modelToggle = document.querySelector('.view-toggle');
const modelStatus = document.querySelector('#model-announcement');
const orbits = [...document.querySelectorAll('.orbit')];
const pageMotion = { scroll: 0 };
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
let sceneRequest = 0;
let modelLoading = false;

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
  hero.dataset.flavor = flavor.id;
  hero.style.setProperty('--accent', flavor.accent);
  hero.style.setProperty('--glow', flavor.glow);
  hero.style.setProperty('--dark', flavor.dark);
  words.forEach((word, position) => { word.textContent = flavor.title[position]; });
  document.querySelector('#flavor-index').textContent = number(index);
  document.querySelector('#figure-index').textContent = number(index);
  description.textContent = flavor.description;
  choices.forEach((button, position) => button.setAttribute('aria-pressed', String(position === index)));
  scene?.setFlavor(flavor);
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
  finishTransition();
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
  const swap = () => {
    mountArtwork(artwork).remove();
    render(index, true);
  };
  if (reducedMotion.matches) {
    swap();
    return;
  }

  const outgoing = activeArt;
  const incomingCan = artwork.querySelector('.can');
  transition = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  transition
    .to(words, { yPercent: -106, stagger: 0.025, duration: 0.25 }, 0)
    .to(description, { opacity: 0, y: -6, duration: 0.23 }, 0)
    .to(outgoing, { opacity: 0, scale: 0.94, rotation: 8, duration: 0.33 }, 0)
    .to(orbits, { opacity: 0.04, duration: 0.28 }, 0)
    .call(swap, [], 0.33)
    .fromTo(artwork, { opacity: 0 }, { opacity: 1, duration: 0.42, clearProps: 'opacity', immediateRender: false }, 0.33)
    .fromTo(incomingCan, { scale: 0.91, rotation: -9, y: 14 }, {
      scale: 1, rotation: 0, y: 0, duration: 0.74, ease: 'power3.out', clearProps: 'transform', immediateRender: false,
    }, 0.33)
    .fromTo(words, { yPercent: 109 }, {
      yPercent: 0, duration: 0.54, stagger: 0.06, ease: 'power4.out', clearProps: 'transform', immediateRender: false,
    }, 0.36)
    .to(description, { opacity: 1, y: 0, duration: 0.37, clearProps: 'opacity,transform' }, 0.44)
    .to(orbits, { opacity: (index) => index ? 0.17 : 0.25, duration: 0.54, clearProps: 'opacity' }, 0.36);
  const outgoingFruit = outgoing.querySelectorAll('.fruit');
  const incomingFruit = artwork.querySelectorAll('.fruit');
  if (outgoingFruit.length) {
    transition.to(outgoingFruit, { x: (i) => i % 2 ? 24 : -20, y: -8, duration: 0.3 }, 0);
  }
  if (incomingFruit.length) {
    transition.fromTo(incomingFruit, { x: (i) => i % 2 ? 18 : -16, y: 12, opacity: 0 }, {
      x: 0, y: 0, opacity: 1, stagger: 0.045, duration: 0.58, clearProps: 'transform,opacity', immediateRender: false,
    }, 0.37);
  }
  if (scene) {
    transition
      .to(scene.cameraTarget, { travel: 1.2, yaw: -0.79, swing: -0.55, duration: 0.34 }, 0)
      .to(modelView, { opacity: 0, duration: 0.31 }, 0)
      .to(modelView, { opacity: 1, duration: 0.36, clearProps: 'opacity' }, 0.34)
      .set(scene.cameraTarget, { swing: 0.6 }, 0.34)
      .to(scene.cameraTarget, { travel: -0.16, yaw: 0.13, swing: 0, duration: 0.51, ease: 'power3.out' }, 0.34)
      .to(scene.cameraTarget, { travel: 0, yaw: 0, duration: 0.26, ease: 'sine.out' }, 0.85);
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
  gsap.timeline({ scrollTrigger: { trigger: '.manifesto', start: 'top 86%', once: true } })
    .from('.manifesto-label', { opacity: 0, x: -14, duration: 0.4, clearProps: 'opacity,transform' })
    .from('.manifesto h2', { opacity: 0, y: 28, duration: 0.6, ease: 'power3.out', clearProps: 'opacity,transform' }, 0.12)
    .from('.manifesto div p, .manifesto a', {
      opacity: 0, y: 16, duration: 0.48, stagger: 0.08, clearProps: 'opacity,transform',
    }, 0.26);
});

media.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', () => {
  gsap.to('.product-stage', {
    yPercent: 13, scale: 0.91, ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 },
  });
  gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.7 } })
    .to('.orbit-one', { rotation: 24, scale: 1.14, ease: 'none' }, 0)
    .to('.orbit-two', { rotation: -18, y: -31, ease: 'none' }, 0)
    .to('.cross-top', { y: -40, ease: 'none' }, 0)
    .to('.cross-bottom', { y: 25, ease: 'none' }, 0)
    .to(pageMotion, { scroll: 1, ease: 'none', onUpdate() { scene?.setScroll(pageMotion.scroll); } }, 0);
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

function closeModel(message = '') {
  sceneRequest++;
  modelLoading = false;
  const restoreFocus = modelView.contains(document.activeElement);
  scene?.dispose();
  scene = undefined;
  frame.classList.remove('show-model');
  modelView.hidden = true;
  modelToggle.disabled = false;
  modelToggle.setAttribute('aria-pressed', 'false');
  modelToggle.textContent = 'Explorar em 3D';
  modelStatus.textContent = message;
  if (restoreFocus) (modelToggle.hidden ? choices[selected] : modelToggle).focus({ preventScroll: true });
}

async function openModel() {
  const request = ++sceneRequest;
  modelLoading = true;
  modelToggle.disabled = true;
  modelStatus.textContent = 'Carregando a embalagem 3D.';
  try {
    const [{ createScene }] = await Promise.all([import('./scene.js'), document.fonts.ready]);
    if (request !== sceneRequest || !useLayers()) return;
    finishTransition();
    modelView.hidden = false;
    scene = createScene(modelView, flavors[selected], () => {
      closeModel('A sessão WebGL foi interrompida. A arte original foi restaurada.');
    });
    if (!scene) {
      closeModel('A visualização 3D está indisponível neste dispositivo.');
      return;
    }
    scene.setScroll(pageMotion.scroll);
    frame.classList.add('show-model');
    modelToggle.setAttribute('aria-pressed', 'true');
    modelToggle.textContent = 'Ver arte original';
    modelStatus.textContent = 'Visualização 3D ativa. Arraste ou use as setas para girar.';
    modelView.focus({ preventScroll: true });
  } catch {
    if (request === sceneRequest) closeModel('Não foi possível abrir o 3D. A arte original continua disponível.');
  } finally {
    if (request === sceneRequest) {
      modelLoading = false;
      modelToggle.disabled = false;
    }
  }
}

modelToggle.addEventListener('click', () => scene ? closeModel() : openModel());

let dragStart;
modelView.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  dragStart = event.clientX;
  modelView.setPointerCapture(event.pointerId);
});
modelView.addEventListener('pointermove', (event) => {
  if (dragStart === undefined || !modelView.hasPointerCapture(event.pointerId)) return;
  scene?.orbit((event.clientX - dragStart) * 0.014);
  dragStart = event.clientX;
});
modelView.addEventListener('lostpointercapture', () => { dragStart = undefined; });
modelView.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModel();
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    scene?.orbit(event.key === 'ArrowLeft' ? -0.35 : 0.35);
  }
});

function syncEffects() {
  modelToggle.hidden = !useLayers();
  if (!useLayers() && (scene || modelLoading)) closeModel();
  if (reducedMotion.matches) {
    intro?.progress(1);
    finishTransition();
  }
  if (!desktopPointer.matches || reducedMotion.matches) {
    hero.removeEventListener('pointermove', move);
    hero.removeEventListener('pointerleave', resetPointer);
    for (const setter of [tiltX, tiltY, shiftX, shiftY]) setter.tween.pause();
    gsap.set(product, { x: 0, y: 0, rotationX: 0, rotationY: 0 });
    return;
  }
  hero.addEventListener('pointermove', move);
  hero.addEventListener('pointerleave', resetPointer);
}

reducedMotion.addEventListener('change', syncEffects);
desktopPointer.addEventListener('change', syncEffects);
syncEffects();

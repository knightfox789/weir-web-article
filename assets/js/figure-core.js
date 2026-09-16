const SVG_NS = 'http://www.w3.org/2000/svg';
export const REDUCED_MOTION = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export function ensureFigureStyles() {
  if (document.querySelector('link[data-phase4-figures]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'assets/css/figures.css';
  link.dataset.phase4Figures = 'true';
  document.head.append(link);
}

export function svgEl(name, attrs = {}, text = null) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== null && value !== undefined) node.setAttribute(key, String(value));
  }
  if (text !== null) node.textContent = text;
  return node;
}

export function htmlEl(name, className = '', text = null) {
  const node = document.createElement(name);
  if (className) node.className = className;
  if (text !== null) node.textContent = text;
  return node;
}

export function clamp(value, lo, hi) {
  return Math.min(hi, Math.max(lo, value));
}

export function scale(value, domainMin, domainMax, rangeMin, rangeMax) {
  if (domainMax === domainMin) return (rangeMin + rangeMax) / 2;
  const t = (value - domainMin) / (domainMax - domainMin);
  return rangeMin + t * (rangeMax - rangeMin);
}

export function fmt(value, digits = 2) {
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

export async function loadJson(source) {
  const response = await fetch(source, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Could not load ${source} (${response.status})`);
  return response.json();
}

export function showFigureError(mount, error) {
  mount.classList.add('is-live', 'p4-figure--error');
  mount.replaceChildren();
  const card = htmlEl('div', 'p4-error');
  card.innerHTML = '<strong>Figure data could not be loaded.</strong>';
  const message = htmlEl('p', '', error?.message || 'Required figure data are unavailable.');
  card.append(message);
  mount.append(card);
}

export function frameFigure(mount, { id, title, kicker, caveat }) {
  mount.classList.add('is-live', 'p4-figure');
  mount.replaceChildren();

  const header = htmlEl('div', 'p4-figure__header');
  const heading = htmlEl('div', 'p4-figure__heading');
  heading.append(htmlEl('span', 'p4-figure__id', id));
  heading.append(htmlEl('strong', 'p4-figure__title', title));
  if (kicker) heading.append(htmlEl('p', 'p4-figure__kicker', kicker));
  header.append(heading);

  const body = htmlEl('div', 'p4-figure__body');
  const canvas = htmlEl('div', 'p4-figure__canvas');
  const controls = htmlEl('div', 'p4-figure__controls');
  const readout = htmlEl('div', 'p4-figure__readout');
  const summary = htmlEl('p', 'p4-figure__summary');
  summary.setAttribute('aria-live', 'polite');
  const note = htmlEl('div', 'p4-figure__caveat');
  note.setAttribute('role', 'note');
  note.innerHTML = `<strong>Boundary.</strong> ${caveat}`;
  body.append(canvas, controls, readout, summary, note);
  mount.append(header, body);
  return { header, body, canvas, controls, readout, summary, note };
}

export function makeSvg(canvas, viewBox = '0 0 760 440', label = '') {
  const svg = svgEl('svg', { viewBox, role: 'img', 'aria-label': label, focusable: 'false' });
  canvas.append(svg);
  return svg;
}

export function observeOnce(mount, callback) {
  if (REDUCED_MOTION || !('IntersectionObserver' in window)) {
    callback();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect();
      callback();
    }
  }, { threshold: 0.25 });
  observer.observe(mount);
}

export function makeRangeControl({ label, min, max, value, step, unit = '', onInput }) {
  const wrap = htmlEl('label', 'p4-control');
  const line = htmlEl('span', 'p4-control__line');
  const name = htmlEl('span', 'p4-control__label', label);
  const output = htmlEl('output', 'p4-control__value', `${fmt(value, 2)}${unit ? ` ${unit}` : ''}`);
  line.append(name, output);
  const input = htmlEl('input', 'p4-control__range');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.value = String(value);
  input.step = String(step);
  input.addEventListener('input', () => {
    const next = Number(input.value);
    output.textContent = `${fmt(next, 2)}${unit ? ` ${unit}` : ''}`;
    onInput?.(next);
  });
  wrap.append(line, input);
  return { wrap, input, output };
}

export function makeSelectControl({ label, options, value, onChange }) {
  const wrap = htmlEl('label', 'p4-control');
  const name = htmlEl('span', 'p4-control__label', label);
  const select = htmlEl('select', 'p4-control__select');
  for (const option of options) {
    const el = htmlEl('option', '', option.label);
    el.value = option.value;
    if (option.value === value) el.selected = true;
    select.append(el);
  }
  select.addEventListener('change', () => onChange?.(select.value));
  wrap.append(name, select);
  return { wrap, select };
}

export function shortFamily(value = '') {
  const match = String(value).match(/F[1-4]/);
  return match ? match[0] : value;
}


import { ensureFigureStyles, loadJson, showFigureError } from './figure-core.js';
import { renderFig01, renderFig02 } from './figures-01-02.js';
import { renderFig03, renderFig04 } from './figures-03-04.js';
import { renderFig05, renderFig06 } from './figures-05-06.js';
import { renderFig07, renderFig08 } from './figures-07-08.js';
import { renderFig09, renderFig10, renderFig11 } from './figures-09-11.js';
import { renderFig12, initFoundationTransition } from './figures-12.js';
import { renderFig13, renderFig14 } from './figures-13-14.js';
import { renderFig15, renderFig16 } from './figures-15-16.js';
import { renderFig17 } from './figures-17.js';


function ensurePhase5Styles() {
  if (document.querySelector('link[data-phase5-figures]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'assets/css/figures-phase5.css';
  link.dataset.phase5Figures = 'true';
  document.head.append(link);
}


function ensurePhase6Styles() {
  if (document.querySelector('link[data-phase6-figures]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'assets/css/figures-phase6.css';
  link.dataset.phase6Figures = 'true';
  document.head.append(link);
}


function ensurePhase7Styles() {
  if (document.querySelector('link[data-phase7-figures]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'assets/css/figures-phase7.css';
  link.dataset.phase7Figures = 'true';
  document.head.append(link);
}

function ensurePhase8Styles() {
  if (document.querySelector('link[data-phase8-figures]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'assets/css/figures-phase8.css';
  link.dataset.phase8Figures = 'true';
  document.head.append(link);
}

function ensurePhase9Styles() {
  if (document.querySelector('link[data-phase9-figures]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'assets/css/figures-phase9.css';
  link.dataset.phase9Figures = 'true';
  document.head.append(link);
}

const RENDERERS = {
  'FIG-01': renderFig01,
  'FIG-02': renderFig02,
  'FIG-03': renderFig03,
  'FIG-04': renderFig04,
  'FIG-05': renderFig05,
  'FIG-06': renderFig06,
  'FIG-07': renderFig07,
  'FIG-08': renderFig08,
  'FIG-09': renderFig09,
  'FIG-10': renderFig10,
  'FIG-11': renderFig11,
  'FIG-12': renderFig12,
  'FIG-13': renderFig13,
  'FIG-14': renderFig14,
  'FIG-15': renderFig15,
  'FIG-16': renderFig16,
  'FIG-17': renderFig17
};

export async function initPhase4Figures() {
  ensureFigureStyles();
  ensurePhase5Styles();
  ensurePhase6Styles();
  ensurePhase7Styles();
  ensurePhase8Styles();
  ensurePhase9Styles();
  initFoundationTransition();
  const mounts = [...document.querySelectorAll('[data-figure]')].filter((mount) => RENDERERS[mount.dataset.figure]);
  await Promise.all(mounts.map(async (mount) => {
    try {
      const data = await loadJson(mount.dataset.source);
      await RENDERERS[mount.dataset.figure](mount, data);
    } catch (error) {
      console.error(`[${mount.dataset.figure}]`, error);
      showFigureError(mount, error);
    }
  }));
}

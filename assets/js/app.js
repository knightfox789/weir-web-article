import { initPhase4Figures } from './figures.js';

const menuButton = document.querySelector('[data-menu-button]');
const chapterDrawer = document.querySelector('[data-chapter-drawer]');
const progressBar = document.querySelector('[data-progress-bar]');
const chapterLinks = [...document.querySelectorAll('.chapter-list a')];
const chapters = [...document.querySelectorAll('[data-chapter]')];

function setDrawer(open) {
  if (!menuButton || !chapterDrawer) return;
  menuButton.setAttribute('aria-expanded', String(open));
  chapterDrawer.classList.toggle('is-open', open);
}

menuButton?.addEventListener('click', () => {
  setDrawer(menuButton.getAttribute('aria-expanded') !== 'true');
});

chapterDrawer?.addEventListener('click', (event) => {
  if (event.target.closest('a')) setDrawer(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setDrawer(false);
});

function updateProgress() {
  if (!progressBar) return;
  const root = document.documentElement;
  const max = root.scrollHeight - root.clientHeight;
  const ratio = max > 0 ? Math.min(1, Math.max(0, root.scrollTop / max)) : 0;
  progressBar.style.transform = `scaleX(${ratio})`;
}

updateProgress();
document.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);

if ('IntersectionObserver' in window && chapters.length) {
  const linkById = new Map(chapterLinks.map((link) => [link.hash.slice(1), link]));
  const visible = new Map();

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
      else visible.delete(entry.target.id);
    }

    const active = [...visible.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    if (!active) return;

    for (const link of chapterLinks) link.removeAttribute('aria-current');
    linkById.get(active)?.setAttribute('aria-current', 'location');
  }, {
    rootMargin: '-20% 0px -55% 0px',
    threshold: [0.05, 0.2, 0.45, 0.7]
  });

  chapters.forEach((chapter) => observer.observe(chapter));
}

initPhase4Figures();

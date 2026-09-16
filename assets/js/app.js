import { initPhase4Figures } from './figures.js';

const menuButton = document.querySelector('[data-menu-button]');
const chapterDrawer = document.querySelector('[data-chapter-drawer]');
const progressBar = document.querySelector('[data-progress-bar]');
const chapterLinks = [...document.querySelectorAll('.chapter-list a')];
const chapters = [...document.querySelectorAll('[data-chapter]')];

function injectReferences() {
  const host = document.querySelector('#chapter-16 .methods-grid > div:first-child');
  if (!host || host.querySelector('.references-details')) return;

  const details = document.createElement('details');
  details.className = 'references-details';
  details.innerHTML = `
    <summary>References</summary>
    <ol class="reference-list">
      <li>Hager, W. H., &amp; Schwalt, M. (1994). Broad-Crested Weir. <em>Journal of Irrigation and Drainage Engineering</em>, 120(1). <a href="https://doi.org/10.1061/(ASCE)0733-9437(1994)120:1(13)" target="_blank" rel="noopener">DOI</a></li>
      <li>Sargison, J. E., &amp; Percy, A. (2009). Hydraulics of Broad-Crested Weirs with Varying Side Slopes. <em>Journal of Irrigation and Drainage Engineering</em>, 135(1). <a href="https://doi.org/10.1061/(ASCE)0733-9437(2009)135:1(115)" target="_blank" rel="noopener">DOI</a></li>
      <li>Felder, S., &amp; Chanson, H. (2012). Free-Surface Profiles, Velocity and Pressure Distributions on a Broad-Crested Weir: A Physical Study. <em>Journal of Irrigation and Drainage Engineering</em>, 138(12). <a href="https://doi.org/10.1061/(ASCE)IR.1943-4774.0000515" target="_blank" rel="noopener">DOI</a></li>
      <li>Zachoval, Z., Knéblová, M., Roušar, L., Rumann, J., &amp; Šulc, J. (2014). Discharge coefficient of a rectangular sharp-edged broad-crested weir. <em>Journal of Hydrology and Hydromechanics</em>, 62(2), 145–149. <a href="https://doi.org/10.2478/johh-2014-0014" target="_blank" rel="noopener">DOI</a></li>
      <li>Zerihun, Y. T. (2020). Free Flow and Discharge Characteristics of Trapezoidal-Shaped Weirs. <em>Fluids</em>, 5(4), 238. <a href="https://doi.org/10.3390/fluids5040238" target="_blank" rel="noopener">DOI</a></li>
      <li>Bormann, N. E., &amp; Julien, P. Y. (1991). Scour Downstream of Grade-Control Structures. <em>Journal of Hydraulic Engineering</em>, 117(5), 579–594. <a href="https://doi.org/10.1061/(ASCE)0733-9429(1991)117:5(579)" target="_blank" rel="noopener">DOI</a></li>
      <li>D’Agostino, V., &amp; Ferro, V. (2004). Scour on Alluvial Bed Downstream of Grade-Control Structures. <em>Journal of Hydraulic Engineering</em>, 130(1), 24–37. <a href="https://doi.org/10.1061/(ASCE)0733-9429(2004)130:1(24)" target="_blank" rel="noopener">DOI</a></li>
      <li>Lenzi, M. A., Marion, A., &amp; Comiti, F. (2003). Local scouring at grade-control structures in alluvial mountain rivers. <em>Water Resources Research</em>, 39(7), 1176. <a href="https://doi.org/10.1029/2002WR001815" target="_blank" rel="noopener">DOI</a></li>
      <li>U.S. Bureau of Reclamation. (2016). <em>Rock Weir Design Guidance</em>. Technical Service Center. <a href="https://www.usbr.gov/tsc/techreferences/mands/mands-pdfs/RockWeirDesignGuidance_final_ADAcompliant_031716.pdf" target="_blank" rel="noopener">Source</a></li>
      <li>Peterka, A. J. (1984). <em>Hydraulic Design of Stilling Basins and Energy Dissipators</em>. Engineering Monograph No. 25. U.S. Bureau of Reclamation.</li>
      <li>U.S. Army Corps of Engineers. (1990). <em>Hydraulic Design of Spillways</em>. Engineer Manual EM 1110-2-1603.</li>
      <li>Jansen, M. J. W. (1999). Analysis of variance designs for model output. <em>Computer Physics Communications</em>, 117(1–2), 35–43. <a href="https://doi.org/10.1016/S0010-4655(98)00154-4" target="_blank" rel="noopener">DOI</a></li>
      <li>Saltelli, A., Annoni, P., Azzini, I., Campolongo, F., Ratto, M., &amp; Tarantola, S. (2010). Variance based sensitivity analysis of model output: Design and estimator for the total sensitivity index. <em>Computer Physics Communications</em>, 181(2), 259–270. <a href="https://doi.org/10.1016/j.cpc.2009.09.018" target="_blank" rel="noopener">DOI</a></li>
      <li>Bureau of Indian Standards. (2026). <em>IS 4997:2026 — Design of Hydraulic Jump Type Stilling Basins with Horizontal and Sloping Apron — Criteria (First Revision)</em>. Established 21 April 2026; Gazette notification Ref. HQ-PUB013/1/2020-PUB-BIS (1526), 22 April 2026.</li>
    </ol>`;

  host.append(details);

  if (!document.querySelector('#reference-list-styles')) {
    const style = document.createElement('style');
    style.id = 'reference-list-styles';
    style.textContent = `
      .reference-list { margin: 18px 0 4px; padding-left: 1.35rem; display: grid; gap: 14px; color: #34434e; font-size: .9rem; line-height: 1.55; }
      .reference-list li { padding-left: .25rem; }
      .reference-list a { color: var(--teal); text-underline-offset: 3px; overflow-wrap: anywhere; }
    `;
    document.head.append(style);
  }
}

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
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    setDrawer(false);
    menuButton.focus();
  }
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

injectReferences();
initPhase4Figures();

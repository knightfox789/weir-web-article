import { svgEl, htmlEl, frameFigure, makeSvg, observeOnce, makeSelectControl, fmt, scale } from './figure-core.js';

const STABILITY_LABELS = {
  cohesion_kPa: 'Cohesion',
  structure_height_m: 'Height',
  downstream_slope_h_per_v: 'Downstream slope',
  Q_m3s: 'Discharge Q',
  tailwater_ratio: 'Tailwater ratio'
};

export function renderFig07(mount, data) {
  if (!Array.isArray(data.coefficients) || data.coefficients.length < 5) throw new Error('FIG-07 requires pooled stability coefficients.');
  const ui = frameFigure(mount, {
    id: 'FIG-07',
    title: 'Conditional stability drivers',
    kicker: 'Signed standardized coefficients, with the range seen across four replicated seeds.',
    caveat: data.caveat || 'Diagnostic applicability-conditioned relationship; not a field factor-of-safety equation.'
  });
  const svg = makeSvg(ui.canvas, '0 0 780 420', 'Horizontal signed standardized stability coefficients with seed-range whiskers.');
  const plot = { x: 205, y: 58, w: 500, row: 58 };
  const maxAbs = Math.max(...data.coefficients.flatMap(d => [Math.abs(d.standardized_coef_min), Math.abs(d.standardized_coef_max)])) * 1.12;
  const zeroX = scale(0, -maxAbs, maxAbs, plot.x, plot.x + plot.w);
  svg.append(svgEl('line', { x1: zeroX, y1: 34, x2: zeroX, y2: 356, class: 'p5-zero-line' }));
  svg.append(svgEl('text', { x: plot.x, y: 32, class: 'p4-small-label' }, 'adverse ←'));
  svg.append(svgEl('text', { x: plot.x + plot.w, y: 32, 'text-anchor': 'end', class: 'p4-small-label' }, '→ favourable'));

  const rows = [];
  data.coefficients.forEach((d, i) => {
    const y = plot.y + i * plot.row;
    const xMean = scale(d.standardized_coef_mean, -maxAbs, maxAbs, plot.x, plot.x + plot.w);
    const xMin = scale(d.standardized_coef_min, -maxAbs, maxAbs, plot.x, plot.x + plot.w);
    const xMax = scale(d.standardized_coef_max, -maxAbs, maxAbs, plot.x, plot.x + plot.w);
    const g = svgEl('g', { class: 'p5-stability-row', tabindex: '0', role: 'img', 'aria-label': `${STABILITY_LABELS[d.variable] || d.variable}: mean coefficient ${fmt(d.standardized_coef_mean,3)}, seed range ${fmt(d.standardized_coef_min,3)} to ${fmt(d.standardized_coef_max,3)}` });
    g.style.setProperty('--row-delay', `${i * 90}ms`);
    g.append(svgEl('text', { x: plot.x - 16, y: y + 5, 'text-anchor': 'end', class: 'p4-label' }, STABILITY_LABELS[d.variable] || d.variable));
    g.append(svgEl('line', { x1: xMin, y1: y, x2: xMax, y2: y, class: 'p5-whisker' }));
    g.append(svgEl('line', { x1: xMin, y1: y - 7, x2: xMin, y2: y + 7, class: 'p5-whisker-cap' }));
    g.append(svgEl('line', { x1: xMax, y1: y - 7, x2: xMax, y2: y + 7, class: 'p5-whisker-cap' }));
    const barX = Math.min(zeroX, xMean);
    const barW = Math.max(2, Math.abs(xMean - zeroX));
    g.append(svgEl('rect', { x: barX, y: y - 12, width: barW, height: 24, rx: '7', class: d.standardized_coef_mean >= 0 ? 'p5-coef-bar p5-coef-bar--positive' : 'p5-coef-bar p5-coef-bar--negative' }));
    g.append(svgEl('circle', { cx: xMean, cy: y, r: '6.5', class: d.standardized_coef_mean >= 0 ? 'p5-coef-dot p5-coef-dot--positive' : 'p5-coef-dot p5-coef-dot--negative' }));
    g.append(svgEl('text', { x: d.standardized_coef_mean >= 0 ? xMean + 12 : xMean - 12, y: y + 5, 'text-anchor': d.standardized_coef_mean >= 0 ? 'start' : 'end', class: 'p4-small-label' }, `${d.standardized_coef_mean >= 0 ? '+' : ''}${fmt(d.standardized_coef_mean,3)}`));
    svg.append(g); rows.push(g);
  });

  ui.readout.innerHTML = `<div class="p4-stat"><strong>${fmt(data.pooled_r2_mean,3)}</strong><span>pooled diagnostic R²</span></div><div class="p4-stat"><strong>${data.replicated_seeds?.length || 4}</strong><span>replicated conditioned subsets</span></div><div class="p4-stat"><strong>conditioned</strong><span>not an unconditional Sobol ranking</span></div>`;
  ui.summary.textContent = 'Within the applicability-conditioned diagnostic, cohesion is strongly favourable while greater height is adverse. The whiskers show how each standardized coefficient varies across the four replicated seeds.';
  observeOnce(mount, () => mount.classList.add('p4-entered', 'p5-entered'));
}

const PARETO_OBJECTIVES = {
  body_area_m2_per_m: { label: 'Body area', unit: 'm²/m' },
  forcing_kW_m: { label: 'Forcing', unit: 'kW/m' },
  tailwater_mismatch_abs: { label: '|yt/y2 − 1|', unit: '' },
  rock_threshold_ratio: { label: 'Rock threshold ratio', unit: '' }
};

export function renderFig08(mount, data) {
  if (!Array.isArray(data.points) || !Array.isArray(data.objectives)) throw new Error('FIG-08 requires Pareto objectives and display points.');
  const ui = frameFigure(mount, {
    id: 'FIG-08',
    title: 'Pareto trade space',
    kicker: 'Every displayed state is nondominated in the published frontier sample. Changing axes changes the view, not the four-objective test.',
    caveat: data.caveat || 'No scalar winner; exact nondominated membership is sample-sensitive.'
  });
  const svg = makeSvg(ui.canvas, '0 0 820 500', 'Interactive objective-pair scatter of a deterministic subset of nondominated Pareto states.');
  const plot = { x: 90, y: 45, w: 630, h: 350 };
  let xKey = data.objectives[0];
  let yKey = data.objectives[1];
  let fullRetentionOnly = false;
  const pointLayer = svgEl('g');
  const axisLayer = svgEl('g');
  svg.append(axisLayer, pointLayer);

  function extent(key, points) {
    const values = points.map(d => Number(d[key])).filter(Number.isFinite);
    const lo = Math.min(...values), hi = Math.max(...values);
    const pad = (hi - lo || 1) * .07;
    return [Math.max(0, lo - pad), hi + pad];
  }

  function render() {
    const visible = fullRetentionOnly ? data.points.filter(d => Number(d.retention_fraction) === 1) : data.points;
    const xExt = extent(xKey, data.points); const yExt = extent(yKey, data.points);
    axisLayer.replaceChildren(); pointLayer.replaceChildren();
    axisLayer.append(svgEl('line', { x1: plot.x, y1: plot.y + plot.h, x2: plot.x + plot.w, y2: plot.y + plot.h, class: 'p5-axis' }));
    axisLayer.append(svgEl('line', { x1: plot.x, y1: plot.y, x2: plot.x, y2: plot.y + plot.h, class: 'p5-axis' }));
    axisLayer.append(svgEl('text', { x: plot.x + plot.w / 2, y: 460, 'text-anchor': 'middle', class: 'p4-axis-label' }, `${PARETO_OBJECTIVES[xKey]?.label || xKey}${PARETO_OBJECTIVES[xKey]?.unit ? ` (${PARETO_OBJECTIVES[xKey].unit})` : ''}`));
    axisLayer.append(svgEl('text', { x: 24, y: plot.y + plot.h / 2, transform: `rotate(-90 24 ${plot.y + plot.h / 2})`, 'text-anchor': 'middle', class: 'p4-axis-label' }, `${PARETO_OBJECTIVES[yKey]?.label || yKey}${PARETO_OBJECTIVES[yKey]?.unit ? ` (${PARETO_OBJECTIVES[yKey].unit})` : ''}`));
    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      const xv = xExt[0] + t * (xExt[1] - xExt[0]);
      const yv = yExt[0] + t * (yExt[1] - yExt[0]);
      const x = plot.x + t * plot.w; const y = plot.y + plot.h - t * plot.h;
      axisLayer.append(svgEl('text', { x, y: plot.y + plot.h + 22, 'text-anchor': 'middle', class: 'p4-tick' }, fmt(xv, xKey.includes('mismatch') || xKey.includes('ratio') ? 2 : 1)));
      axisLayer.append(svgEl('text', { x: plot.x - 12, y: y + 4, 'text-anchor': 'end', class: 'p4-tick' }, fmt(yv, yKey.includes('mismatch') || yKey.includes('ratio') ? 2 : 1)));
    }
    visible.forEach((d, i) => {
      const x = scale(d[xKey], xExt[0], xExt[1], plot.x, plot.x + plot.w);
      const y = scale(d[yKey], yExt[0], yExt[1], plot.y + plot.h, plot.y);
      const c = svgEl('circle', { cx: x, cy: y, r: 6, class: Number(d.retention_fraction) === 1 ? 'p5-pareto-point p5-pareto-point--full' : 'p5-pareto-point', tabindex: '0', role: 'img', 'aria-label': `${d.scenario_id}. ${PARETO_OBJECTIVES[xKey]?.label}: ${fmt(d[xKey],3)}; ${PARETO_OBJECTIVES[yKey]?.label}: ${fmt(d[yKey],3)}; retention ${fmt(d.retention_fraction * 100,0)} percent.` });
      c.style.setProperty('--point-delay', `${i * 12}ms`);
      c.append(svgEl('title', {}, `${d.scenario_id}\n${PARETO_OBJECTIVES[xKey]?.label}: ${fmt(d[xKey],3)}\n${PARETO_OBJECTIVES[yKey]?.label}: ${fmt(d[yKey],3)}\nretention: ${fmt(d.retention_fraction * 100,0)}%`));
      pointLayer.append(c);
    });
    ui.readout.innerHTML = `<div class="p4-stat"><strong>${data.nondominated_n}</strong><span>nondominated in full source seed</span></div><div class="p4-stat"><strong>${data.display_population}</strong><span>deterministic frontier states published</span></div><div class="p4-stat"><strong>${visible.length}</strong><span>${fullRetentionOnly ? 'retention = 100% display states' : 'states currently shown'}</span></div>`;
    ui.summary.textContent = `All four objectives are minimized together in the original nondominance test. This view shows ${PARETO_OBJECTIVES[xKey]?.label} against ${PARETO_OBJECTIVES[yKey]?.label}; there is no scalar best state and no trendline is implied.`;
  }

  const objectiveOptions = data.objectives.map(key => ({ value: key, label: PARETO_OBJECTIVES[key]?.label || key }));
  const xControl = makeSelectControl({ label: 'Horizontal objective', options: objectiveOptions, value: xKey, onChange: v => { if (v === yKey) yKey = xKey; xKey = v; render(); } });
  const yControl = makeSelectControl({ label: 'Vertical objective', options: objectiveOptions, value: yKey, onChange: v => { if (v === xKey) xKey = yKey; yKey = v; render(); } });
  const toggle = htmlEl('button', 'p4-button', 'Show retention = 100% only');
  toggle.type = 'button'; toggle.setAttribute('aria-pressed', 'false');
  toggle.addEventListener('click', () => { fullRetentionOnly = !fullRetentionOnly; toggle.setAttribute('aria-pressed', String(fullRetentionOnly)); toggle.textContent = fullRetentionOnly ? 'Show all published frontier states' : 'Show retention = 100% only'; render(); });
  const toggleWrap = htmlEl('div', 'p4-control'); toggleWrap.append(htmlEl('span', 'p4-control__label', 'Robustness view'), toggle);
  ui.controls.append(xControl.wrap, yControl.wrap, toggleWrap);
  render(); observeOnce(mount, () => mount.classList.add('p4-entered', 'p5-entered'));
}

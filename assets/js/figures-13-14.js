import { svgEl, htmlEl, frameFigure, makeSvg, observeOnce, makeSelectControl, fmt, scale } from './figure-core.js';

const FAMILY_ORDER = ['F2', 'F3', 'F4', 'Transition'];
const FAMILY_CLASS = { F2: 'p7-family-f2', F3: 'p7-family-f3', F4: 'p7-family-f4', Transition: 'p7-family-transition' };

function log10(value) { return Math.log10(Number(value)); }
function logScale(value, d0, d1, r0, r1) { return scale(log10(value), log10(d0), log10(d1), r0, r1); }
function positiveExtent(values, pad = 0.14) {
  const clean = values.map(Number).filter(v => Number.isFinite(v) && v > 0);
  let lo = Math.min(...clean), hi = Math.max(...clean);
  const l0 = log10(lo), l1 = log10(hi), span = l1 - l0 || 1;
  return [10 ** (l0 - span * pad), 10 ** (l1 + span * pad)];
}
function ticksLog(lo, hi) {
  const out = [];
  const start = Math.floor(log10(lo));
  const end = Math.ceil(log10(hi));
  for (let p = start; p <= end; p++) {
    for (const m of [1, 2, 5]) {
      const v = m * 10 ** p;
      if (v >= lo && v <= hi) out.push(v);
    }
  }
  return out;
}
function pct(v, digits = 1) { return `${fmt(Number(v) * 100, digits)}%`; }

function makeBandPath({ factor, domain, plot }) {
  const [lo, hi] = domain;
  const xs = Array.from({ length: 80 }, (_, i) => 10 ** (log10(lo) + (i / 79) * (log10(hi) - log10(lo))));
  const upper = xs.map(x => [logScale(x, lo, hi, plot.x, plot.x + plot.w), logScale(factor * x, lo, hi, plot.y + plot.h, plot.y)]);
  const lower = [...xs].reverse().map(x => [logScale(x, lo, hi, plot.x, plot.x + plot.w), logScale(x / factor, lo, hi, plot.y + plot.h, plot.y)]);
  const pts = [...upper, ...lower];
  return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ') + ' Z';
}

export function renderFig13(mount, data) {
  if (!Array.isArray(data.points) || data.points.length !== 30) throw new Error('FIG-13 requires the published deterministic 30-point BJ–DAF display sample.');
  if (!Array.isArray(data.daf_exact_elasticities) || data.daf_exact_elasticities.length !== 5) throw new Error('FIG-13 requires five published DAF exact term effects.');

  const ui = frameFigure(mount, {
    id: 'FIG-13',
    title: 'BJ vs DAF alluvial comparison',
    kicker: '25,000 alluvial states; 14,369 common positive comparison states. The scatter shows a deterministic 30-state display sample while the headline statistics come from the full overlap.',
    caveat: data.caveat || 'Structured model disagreement is not site validation and neither equation is treated as truth.'
  });
  const svg = makeSvg(ui.canvas, '0 0 860 610', 'Log-log comparison of Bormann–Julien and D’Agostino–Ferro scour estimates with equality and factor bands.');
  const plot = { x: 92, y: 48, w: 650, h: 420 };
  const values = data.points.flatMap(d => [d.bj_scour_m, d.daf_scour_m]);
  const raw = positiveExtent(values, 0.09);
  const domain = [10 ** Math.floor(log10(raw[0])), 10 ** Math.ceil(log10(raw[1]))];
  let factor = 2;
  let termKey = data.daf_exact_elasticities[0].DAF_dimensionless_term;
  const defs = svgEl('defs');
  const clip = svgEl('clipPath', { id: 'p7-fig13-clip' }); clip.append(svgEl('rect', { x: plot.x, y: plot.y, width: plot.w, height: plot.h })); defs.append(clip); svg.append(defs);
  const axes = svgEl('g'); const bandLayer = svgEl('g', { 'clip-path': 'url(#p7-fig13-clip)' }); const pointLayer = svgEl('g', { 'clip-path': 'url(#p7-fig13-clip)' }); svg.append(axes, bandLayer, pointLayer);

  axes.append(svgEl('line', { x1: plot.x, y1: plot.y + plot.h, x2: plot.x + plot.w, y2: plot.y + plot.h, class: 'p7-axis' }));
  axes.append(svgEl('line', { x1: plot.x, y1: plot.y, x2: plot.x, y2: plot.y + plot.h, class: 'p7-axis' }));
  for (const t of ticksLog(...domain)) {
    const x = logScale(t, domain[0], domain[1], plot.x, plot.x + plot.w);
    const y = logScale(t, domain[0], domain[1], plot.y + plot.h, plot.y);
    axes.append(svgEl('line', { x1: x, y1: plot.y + plot.h, x2: x, y2: plot.y + plot.h + 7, class: 'p7-tick-line' }));
    axes.append(svgEl('text', { x, y: plot.y + plot.h + 24, 'text-anchor': 'middle', class: 'p4-tick' }, fmt(t, t < 1 ? 2 : 0)));
    axes.append(svgEl('line', { x1: plot.x - 7, y1: y, x2: plot.x, y2: y, class: 'p7-tick-line' }));
    axes.append(svgEl('text', { x: plot.x - 12, y: y + 4, 'text-anchor': 'end', class: 'p4-tick' }, fmt(t, t < 1 ? 2 : 0)));
  }
  axes.append(svgEl('text', { x: plot.x + plot.w / 2, y: 535, 'text-anchor': 'middle', class: 'p4-axis-label' }, 'BJ scour estimate (m) · logarithmic scale'));
  axes.append(svgEl('text', { x: 24, y: plot.y + plot.h / 2, transform: `rotate(-90 24 ${plot.y + plot.h / 2})`, 'text-anchor': 'middle', class: 'p4-axis-label' }, 'DAF scour estimate (m) · logarithmic scale'));
  axes.append(svgEl('text', { x: plot.x, y: 24, class: 'p4-small-label' }, 'Agreement is assessed as model-to-model ratio, not against field truth.'));

  function renderScatter() {
    bandLayer.replaceChildren(); pointLayer.replaceChildren();
    bandLayer.append(svgEl('path', { d: makeBandPath({ factor, domain, plot }), class: 'p7-factor-band' }));
    const eq0 = [logScale(domain[0], ...domain, plot.x, plot.x + plot.w), logScale(domain[0], ...domain, plot.y + plot.h, plot.y)];
    const eq1 = [logScale(domain[1], ...domain, plot.x, plot.x + plot.w), logScale(domain[1], ...domain, plot.y + plot.h, plot.y)];
    bandLayer.append(svgEl('line', { x1: eq0[0], y1: eq0[1], x2: eq1[0], y2: eq1[1], class: 'p7-equality-line', pathLength: '1' }));
    for (const f of [factor, 1 / factor]) {
      const p0 = [logScale(domain[0], ...domain, plot.x, plot.x + plot.w), logScale(domain[0] * f, ...domain, plot.y + plot.h, plot.y)];
      const p1 = [logScale(domain[1], ...domain, plot.x, plot.x + plot.w), logScale(domain[1] * f, ...domain, plot.y + plot.h, plot.y)];
      bandLayer.append(svgEl('line', { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], class: 'p7-factor-line' }));
    }
    data.points.forEach((d, i) => {
      const ratio = d.daf_scour_m / d.bj_scour_m;
      const inside = ratio >= 1 / factor && ratio <= factor;
      const c = svgEl('circle', {
        cx: logScale(d.bj_scour_m, ...domain, plot.x, plot.x + plot.w),
        cy: logScale(d.daf_scour_m, ...domain, plot.y + plot.h, plot.y),
        r: inside ? 5.2 : 6.4,
        class: inside ? 'p7-model-point p7-model-point--inside' : 'p7-model-point p7-model-point--outside',
        tabindex: '0', role: 'img',
        'aria-label': `${d.scenario_id}: BJ ${fmt(d.bj_scour_m,2)} m; DAF ${fmt(d.daf_scour_m,2)} m; DAF/BJ ${fmt(ratio,2)}; ${inside ? 'inside' : 'outside'} factor-${factor} band`
      });
      c.style.setProperty('--point-delay', `${Math.min(i * 22, 480)}ms`); pointLayer.append(c);
    });
  }

  function updateTerm() {
    const term = data.daf_exact_elasticities.find(d => d.DAF_dimensionless_term === termKey) || data.daf_exact_elasticities[0];
    const factorShare = factor === 2 ? data.within_factor_2_pct : data.within_factor_5_pct;
    ui.readout.innerHTML = `<div class="p4-stat"><strong>${fmt(data.common_overlap_n,0)}</strong><span>common comparison states</span></div><div class="p4-stat"><strong>${fmt(data.median_ratio,3)}</strong><span>median DAF/BJ</span></div><div class="p4-stat"><strong>${fmt(data.spearman,3)}</strong><span>Spearman ρ across overlap</span></div><div class="p4-stat"><strong>${fmt(factorShare,1)}%</strong><span>within factor ${factor} (full overlap)</span></div><div class="p7-term-card"><strong>${term.DAF_dimensionless_term}</strong><span>DAF exact exponent ${term.exponent >= 0 ? '+' : ''}${fmt(term.exponent,3)} · +10% term → ${term.effect_of_10pct_increase_pct >= 0 ? '+' : ''}${fmt(term.effect_of_10pct_increase_pct,1)}% DAF response · doubled term → ×${fmt(term.response_factor_if_doubled,3)}</span></div>`;
    ui.summary.textContent = `Across the full 14,369-state common comparison space, median DAF/BJ is ${fmt(data.median_ratio,3)}, p10–p90 is ${fmt(data.p10_ratio,3)}–${fmt(data.p90_ratio,3)}, and rank correlation is ${fmt(data.spearman,3)}. Only ${fmt(data.within_factor_2_pct,1)}% fall within a factor of two; changing the agreement band does not select a true model or justify averaging the equations.`;
  }

  const bandControl = makeSelectControl({ label: 'Agreement band', value: '2', options: [{ value: '2', label: 'Within factor 2' }, { value: '5', label: 'Within factor 5' }], onChange: v => { factor = Number(v); renderScatter(); updateTerm(); } });
  const termControl = makeSelectControl({ label: 'Exact DAF term effect', value: termKey, options: data.daf_exact_elasticities.map(d => ({ value: d.DAF_dimensionless_term, label: d.DAF_dimensionless_term })), onChange: v => { termKey = v; updateTerm(); } });
  ui.controls.append(bandControl.wrap, termControl.wrap);
  renderScatter(); updateTerm(); observeOnce(mount, () => mount.classList.add('p4-entered', 'p7-entered'));
}

function weightedOverall(families) {
  const n = families.reduce((s, d) => s + d.n, 0);
  const w = key => families.reduce((s, d) => s + d.n * d[key], 0) / n;
  const highN = families.reduce((s, d) => s + d.n * d.high_confidence_share, 0);
  const highAcc = families.reduce((s, d) => s + d.n * d.high_confidence_share * d.high_confidence_accuracy, 0) / highN;
  return { family: 'All', n, coverage80: w('coverage80'), regime_accuracy: w('regime_accuracy'), high_confidence_share: highN / n, high_confidence_accuracy: highAcc };
}

function diagnosticRows(data, mode) {
  if (mode === 'models') return data.interaction_model_comparison.map(d => ({ label: d.model, coverage: d.coverage80, second: d.regime, secondLabel: 'regime accuracy' }));
  return data.family_diagnostics.map(d => ({ label: d.family, coverage: d.coverage80, second: d.regime_accuracy, secondLabel: 'regime accuracy' }));
}

export function renderFig14(mount, data) {
  if (!Array.isArray(data.predictions) || data.predictions.length !== 30) throw new Error('FIG-14 requires the published deterministic 30-state disagreement sample.');
  if (!Array.isArray(data.family_diagnostics) || data.family_diagnostics.length !== 4) throw new Error('FIG-14 requires four published family diagnostics.');
  if (!Array.isArray(data.model_v0_3_terms) || data.model_v0_3_terms.length !== 7) throw new Error('FIG-14 requires the frozen seven-term v0.3 structure.');

  const ui = frameFigure(mount, {
    id: 'FIG-14',
    title: 'Compact disagreement envelope',
    kicker: 'The envelope describes where BJ and DAF tend to disagree and how wide that disagreement can be. It predicts model-to-model ratio uncertainty; it does not predict physical scour truth.',
    caveat: data.caveat || 'Meta-model of BJ–DAF disagreement, not a physical scour equation.'
  });
  const svg = makeSvg(ui.canvas, '0 0 900 700', 'Out-of-fold BJ–DAF disagreement ratio intervals with observed ratios and calibration diagnostics.');
  const plot = { x: 80, y: 55, w: 735, h: 385 };
  const diag = { x: 150, y: 525, w: 610, row: 32 };
  let family = 'All'; let diagnostic = 'families';
  const allStats = weightedOverall(data.family_diagnostics);
  const intervalLayer = svgEl('g'); const diagLayer = svgEl('g'); svg.append(intervalLayer, diagLayer);

  function selectedPredictions() {
    const rows = family === 'All' ? data.predictions : data.predictions.filter(d => d.family === family);
    return [...rows].sort((a, b) => a.pred_q50_ratio - b.pred_q50_ratio);
  }
  function statsForFamily() { return family === 'All' ? allStats : data.family_diagnostics.find(d => d.family === family) || allStats; }

  function renderIntervals() {
    intervalLayer.replaceChildren();
    const rows = selectedPredictions();
    const vals = rows.flatMap(d => [d.ratio, d.pred_q10_ratio, d.pred_q50_ratio, d.pred_q90_ratio]);
    const [lo0, hi0] = positiveExtent(vals, 0.08); const lo = 10 ** Math.floor(log10(lo0)); const hi = 10 ** Math.ceil(log10(hi0));
    intervalLayer.append(svgEl('line', { x1: plot.x, y1: plot.y + plot.h, x2: plot.x + plot.w, y2: plot.y + plot.h, class: 'p7-axis' }));
    intervalLayer.append(svgEl('line', { x1: plot.x, y1: plot.y, x2: plot.x, y2: plot.y + plot.h, class: 'p7-axis' }));
    for (const t of ticksLog(lo, hi)) {
      const y = logScale(t, lo, hi, plot.y + plot.h, plot.y);
      intervalLayer.append(svgEl('line', { x1: plot.x - 7, y1: y, x2: plot.x, y2: y, class: 'p7-tick-line' }));
      intervalLayer.append(svgEl('text', { x: plot.x - 12, y: y + 4, 'text-anchor': 'end', class: 'p4-tick' }, fmt(t, t < 1 ? 2 : 0)));
    }
    const yOne = logScale(1, lo, hi, plot.y + plot.h, plot.y);
    intervalLayer.append(svgEl('line', { x1: plot.x, y1: yOne, x2: plot.x + plot.w, y2: yOne, class: 'p7-ratio-one' }));
    intervalLayer.append(svgEl('text', { x: plot.x + plot.w, y: yOne - 6, 'text-anchor': 'end', class: 'p4-small-label' }, 'DAF/BJ = 1'));
    const spacing = plot.w / Math.max(rows.length, 1);
    rows.forEach((d, i) => {
      const x = plot.x + spacing * (i + 0.5);
      const y10 = logScale(d.pred_q10_ratio, lo, hi, plot.y + plot.h, plot.y);
      const y50 = logScale(d.pred_q50_ratio, lo, hi, plot.y + plot.h, plot.y);
      const y90 = logScale(d.pred_q90_ratio, lo, hi, plot.y + plot.h, plot.y);
      const yObs = logScale(d.ratio, lo, hi, plot.y + plot.h, plot.y);
      const g = svgEl('g', { class: `p7-envelope-state ${FAMILY_CLASS[d.family] || ''}`, tabindex: '0', role: 'img', 'aria-label': `${d.scenario_id}, ${d.family}: observed DAF/BJ ${fmt(d.ratio,2)}, predicted q10 ${fmt(d.pred_q10_ratio,2)}, median ${fmt(d.pred_q50_ratio,2)}, q90 ${fmt(d.pred_q90_ratio,2)}` });
      g.style.setProperty('--state-delay', `${Math.min(i * 22, 420)}ms`);
      g.append(svgEl('line', { x1: x, y1: y10, x2: x, y2: y90, class: 'p7-envelope-whisker' }));
      g.append(svgEl('line', { x1: x - 4, y1: y10, x2: x + 4, y2: y10, class: 'p7-envelope-cap' }));
      g.append(svgEl('line', { x1: x - 4, y1: y90, x2: x + 4, y2: y90, class: 'p7-envelope-cap' }));
      g.append(svgEl('circle', { cx: x, cy: y50, r: '4.2', class: 'p7-envelope-median' }));
      g.append(svgEl('circle', { cx: x, cy: yObs, r: '4.8', class: 'p7-envelope-observed' }));
      intervalLayer.append(g);
    });
    intervalLayer.append(svgEl('text', { x: plot.x + plot.w / 2, y: 482, 'text-anchor': 'middle', class: 'p4-axis-label' }, `${family === 'All' ? 'Published 30-state display sample' : `${family} display states`} · sorted by predicted median ratio`));
    intervalLayer.append(svgEl('text', { x: 22, y: plot.y + plot.h / 2, transform: `rotate(-90 22 ${plot.y + plot.h / 2})`, 'text-anchor': 'middle', class: 'p4-axis-label' }, 'DAF/BJ ratio · logarithmic scale'));
    intervalLayer.append(svgEl('text', { x: plot.x, y: 30, class: 'p4-small-label' }, 'Whisker = predicted q10–q90 · teal dot = predicted median · coral dot = observed model ratio'));
  }

  function renderDiagnostics() {
    diagLayer.replaceChildren();
    const rows = diagnosticRows(data, diagnostic);
    diagLayer.append(svgEl('text', { x: diag.x - 100, y: diag.y - 28, class: 'p4-label' }, diagnostic === 'families' ? 'Family calibration' : 'Interaction-model checks'));
    const targetX = scale(0.8, 0.7, 1.0, diag.x, diag.x + diag.w);
    diagLayer.append(svgEl('line', { x1: targetX, y1: diag.y - 12, x2: targetX, y2: diag.y + rows.length * diag.row - 8, class: 'p7-coverage-target' }));
    diagLayer.append(svgEl('text', { x: targetX + 5, y: diag.y - 14, class: 'p4-small-label' }, '0.80 coverage reference'));
    rows.forEach((d, i) => {
      const y = diag.y + i * diag.row;
      const x0 = diag.x; const x1 = scale(d.coverage, 0.7, 1.0, diag.x, diag.x + diag.w);
      const x2 = scale(d.second, 0.7, 1.0, diag.x, diag.x + diag.w);
      diagLayer.append(svgEl('text', { x: diag.x - 12, y: y + 5, 'text-anchor': 'end', class: 'p4-small-label' }, d.label));
      diagLayer.append(svgEl('line', { x1: x0, y1: y, x2: x1, y2: y, class: 'p7-coverage-bar' }));
      diagLayer.append(svgEl('circle', { cx: x1, cy: y, r: '4.5', class: 'p7-coverage-dot' }));
      diagLayer.append(svgEl('circle', { cx: x2, cy: y, r: '4.5', class: 'p7-regime-dot' }));
      diagLayer.append(svgEl('text', { x: diag.x + diag.w + 12, y: y + 5, class: 'p4-small-label' }, `${pct(d.coverage)} / ${pct(d.second)}`));
    });
    diagLayer.append(svgEl('text', { x: diag.x, y: diag.y + rows.length * diag.row + 18, class: 'p4-small-label' }, 'teal = q10–q90 coverage · coral = regime accuracy'));
  }

  function updateReadout() {
    const s = statsForFamily();
    ui.readout.innerHTML = `<div class="p4-stat"><strong>${fmt(s.n,0)}</strong><span>${family === 'All' ? 'common overlap states' : `${family} states in full overlap`}</span></div><div class="p4-stat"><strong>${pct(s.coverage80)}</strong><span>q10–q90 coverage</span></div><div class="p4-stat"><strong>${pct(s.regime_accuracy)}</strong><span>regime accuracy</span></div><div class="p4-stat"><strong>${pct(s.high_confidence_accuracy)}</strong><span>high-confidence accuracy</span></div><div class="p7-meta-terms"><strong>v0.3 structure</strong><span>${data.model_v0_3_terms.join(' · ')}</span></div>`;
    ui.summary.textContent = `${family === 'All' ? 'Across the full 14,369-state overlap' : `Within ${family}`}, the disagreement envelope has ${pct(s.coverage80)} q10–q90 coverage and ${pct(s.regime_accuracy)} regime accuracy. The interval width is itself part of the uncertainty result; it is not a confidence interval for true field scour.`;
  }

  const familyControl = makeSelectControl({ label: 'Family filter', value: family, options: [{ value: 'All', label: 'All families' }, ...FAMILY_ORDER.map(v => ({ value: v, label: v }))], onChange: v => { family = v; renderIntervals(); updateReadout(); } });
  const diagControl = makeSelectControl({ label: 'Calibration view', value: diagnostic, options: [{ value: 'families', label: 'Family calibration' }, { value: 'models', label: 'Interaction-model checks' }], onChange: v => { diagnostic = v; renderDiagnostics(); } });
  ui.controls.append(familyControl.wrap, diagControl.wrap);
  renderIntervals(); renderDiagnostics(); updateReadout(); observeOnce(mount, () => mount.classList.add('p4-entered', 'p7-entered'));
}

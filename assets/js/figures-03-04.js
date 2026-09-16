import { svgEl, frameFigure, makeSvg, observeOnce, makeRangeControl, fmt, scale } from './figure-core.js';

export function renderFig03(mount, data) {
  const rep = data.replication;
  if (!rep || rep.total_lhs_scenarios !== 200000 || !data.counts) throw new Error('FIG-03 runtime contract is missing the audited replication counts.');
  const ui = frameFigure(mount, {
    id: 'FIG-03',
    title: 'Experiment scale and filtering',
    kicker: 'Four independent samples expand the search space; filters then expose smaller analytical populations.',
    caveat: 'Synthetic coverage design, not real-world probability. Dots are symbolic; exact counts are written explicitly.'
  });
  const svg = makeSvg(ui.canvas, '0 0 800 410', 'Four Latin hypercube sample blocks and study-population filtering counts.');
  const seeds = Object.entries(rep.eligible_by_seed || {});
  const clusterW = 165;
  const startX = 45;
  seeds.forEach(([seed, eligible], seedIndex) => {
    const x0 = startX + seedIndex * 185;
    svg.append(svgEl('text', { x: x0, y: 35, class: 'p4-label' }, `Seed ${seed.slice(-2)}`));
    svg.append(svgEl('text', { x: x0, y: 56, class: 'p4-small-label' }, '50,000 scenarios'));
    for (let i = 0; i < 100; i++) {
      const x = x0 + (i % 10) * 13;
      const y = 82 + Math.floor(i / 10) * 13;
      const approxEligibleDots = Math.round((eligible / 50000) * 100);
      const circle = svgEl('circle', { cx: x, cy: y, r: 4.2, class: i < approxEligibleDots ? 'p4-dot p4-dot--eligible' : 'p4-dot' });
      circle.style.setProperty('--dot-delay', `${(seedIndex * 100 + i) * 2}ms`);
      svg.append(circle);
    }
    svg.append(svgEl('text', { x: x0, y: 236, class: 'p4-small-label' }, `${eligible.toLocaleString()} eligible`));
  });
  svg.append(svgEl('path', { d: 'M70 280 H730', class: 'p4-filter-line' }));
  const stages = [
    ['200,000', 'replicated LHS'],
    [rep.pooled_eligible_family_cases.toLocaleString(), 'pooled eligible family cases'],
    [data.counts.pareto_eligible.toLocaleString(), 'source-seed Pareto eligible'],
    [data.counts.pareto_nondominated.toLocaleString(), 'nondominated'],
    [data.counts.hydraulic_jump.toLocaleString(), 'jump states'],
    [data.counts.alluvial_common_overlap.toLocaleString(), 'BJ–DAF overlap']
  ];
  stages.forEach(([value, label], index) => {
    const x = 55 + index * 125;
    svg.append(svgEl('circle', { cx: x, cy: 280, r: 7, class: 'p4-filter-node' }));
    svg.append(svgEl('text', { x, y: 316, 'text-anchor': 'middle', class: 'p4-filter-value' }, value));
    const t = svgEl('text', { x, y: 338, 'text-anchor': 'middle', class: 'p4-filter-label' }, label);
    svg.append(t);
  });
  ui.readout.innerHTML = `<div class="p4-stat"><strong>${rep.total_lhs_scenarios.toLocaleString()}</strong><span>replicated LHS scenarios</span></div><div class="p4-stat"><strong>${rep.pooled_eligible_family_cases.toLocaleString()}</strong><span>pooled eligible family cases</span></div><div class="p4-stat"><strong>${data.global_sensitivity?.base_N?.toLocaleString() || '8,192'}</strong><span>Sobol base N</span></div>`;
  ui.summary.textContent = 'The experiment maps a declared synthetic study domain. Filtering and specialist lanes reduce the population for specific questions; they are not estimates of real-world frequency.';
  observeOnce(mount, () => mount.classList.add('p4-entered'));
}

export function renderFig04(mount, data) {
  const ranges = data.ranges;
  if (!ranges?.Q_m3s || !ranges?.overflow_length_m || !ranges?.C_bcw) throw new Error('FIG-04 requires Q, L and C ranges.');
  const ui = frameFigure(mount, {
    id: 'FIG-04',
    title: 'Q × L → head response',
    kicker: 'An exact analytical relationship: no fitted regression is needed.',
    caveat: 'Exact within the selected broad-crested formulation; applicability limits remain separate.'
  });
  const svg = makeSvg(ui.canvas, '0 0 760 470', 'Interactive response field showing head as discharge and overflow length change.');
  const plot = { x: 86, y: 48, w: 590, h: 315 };
  const qRange = ranges.Q_m3s, lRange = ranges.overflow_length_m, cRange = ranges.C_bcw;
  let Q = (qRange[0] + qRange[1]) / 2;
  let L = (lRange[0] + lRange[1]) / 2;
  let C = (cRange[0] + cRange[1]) / 2;
  const gridLayer = svgEl('g');
  const axisLayer = svgEl('g');
  const crossLayer = svgEl('g');
  svg.append(gridLayer, axisLayer, crossLayer);
  axisLayer.append(svgEl('text', { x: plot.x + plot.w / 2, y: 452, 'text-anchor': 'middle', class: 'p4-axis-label' }, 'Effective overflow length L (m)'));
  const yLabel = svgEl('text', { x: 20, y: plot.y + plot.h / 2, transform: `rotate(-90 20 ${plot.y + plot.h / 2})`, 'text-anchor': 'middle', class: 'p4-axis-label' }, 'Discharge Q (m³/s)');
  axisLayer.append(yLabel);
  [qRange[0], (qRange[0]+qRange[1])/2, qRange[1]].forEach((v) => {
    const y = scale(v, qRange[0], qRange[1], plot.y + plot.h, plot.y);
    axisLayer.append(svgEl('text', { x: plot.x - 14, y: y + 4, 'text-anchor': 'end', class: 'p4-tick' }, fmt(v, 0)));
  });
  [lRange[0], (lRange[0]+lRange[1])/2, lRange[1]].forEach((v) => {
    const x = scale(v, lRange[0], lRange[1], plot.x, plot.x + plot.w);
    axisLayer.append(svgEl('text', { x, y: plot.y + plot.h + 23, 'text-anchor': 'middle', class: 'p4-tick' }, fmt(v, 0)));
  });

  function head(q, l, c) { return Math.pow(q / (c * l), 2 / 3); }
  const hMin = head(qRange[0], lRange[1], cRange[1]);
  const hMax = head(qRange[1], lRange[0], cRange[0]);
  const cols = 18, rows = 14;

  function drawGrid() {
    gridLayer.replaceChildren();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const q = qRange[1] - (row + 0.5) / rows * (qRange[1] - qRange[0]);
        const l = lRange[0] + (col + 0.5) / cols * (lRange[1] - lRange[0]);
        const h = head(q, l, C);
        const opacity = scale(h, hMin, hMax, 0.12, 0.92);
        gridLayer.append(svgEl('rect', {
          x: plot.x + col * plot.w / cols,
          y: plot.y + row * plot.h / rows,
          width: plot.w / cols + 0.5,
          height: plot.h / rows + 0.5,
          class: 'p4-surface-cell p4-surface-cell--hydraulic',
          opacity: opacity.toFixed(3)
        }));
      }
    }
  }

  function update() {
    drawGrid();
    crossLayer.replaceChildren();
    const x = scale(L, lRange[0], lRange[1], plot.x, plot.x + plot.w);
    const y = scale(Q, qRange[0], qRange[1], plot.y + plot.h, plot.y);
    crossLayer.append(svgEl('line', { x1: x, y1: plot.y, x2: x, y2: plot.y + plot.h, class: 'p4-crosshair' }));
    crossLayer.append(svgEl('line', { x1: plot.x, y1: y, x2: plot.x + plot.w, y2: y, class: 'p4-crosshair' }));
    crossLayer.append(svgEl('circle', { cx: x, cy: y, r: 8, class: 'p4-selected-point' }));
    const H = head(Q, L, C);
    ui.readout.innerHTML = `<div class="p4-stat"><strong>${fmt(H, 3)} m</strong><span>exact head at selected state</span></div><div class="p4-stat"><strong>+2/3</strong><span>Q elasticity</span></div><div class="p4-stat"><strong>−2/3</strong><span>L and C elasticities</span></div>`;
    ui.summary.textContent = `At Q ${fmt(Q,1)} m³/s, L ${fmt(L,1)} m and C ${fmt(C,2)}, the exact broad-crested relation gives H ${fmt(H,3)} m. This is an analytical equation, not a fitted trend.`;
  }

  const qControl = makeRangeControl({ label:'Discharge Q', min:qRange[0], max:qRange[1], value:Q, step:(qRange[1]-qRange[0])/100, unit:'m³/s', onInput:(v)=>{Q=v;update();} });
  const lControl = makeRangeControl({ label:'Overflow length L', min:lRange[0], max:lRange[1], value:L, step:(lRange[1]-lRange[0])/100, unit:'m', onInput:(v)=>{L=v;update();} });
  const cControl = makeRangeControl({ label:'Coefficient C', min:cRange[0], max:cRange[1], value:C, step:(cRange[1]-cRange[0])/100, onInput:(v)=>{C=v;update();} });
  ui.controls.append(qControl.wrap, lControl.wrap, cControl.wrap);
  update();
  observeOnce(mount, () => mount.classList.add('p4-entered'));
}


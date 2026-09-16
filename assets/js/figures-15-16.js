import { svgEl, htmlEl, frameFigure, makeSvg, observeOnce, makeSelectControl, fmt, scale } from './figure-core.js';

const RESPONSE_META = {
  head_m: { label: 'Head', short: 'Head', evidence: 'Q and overflow length dominate the selected head formulation.' },
  forcing_kW_m: { label: 'Downstream forcing', short: 'Forcing', evidence: 'Froude number, discharge and overflow length share the forcing response through interactions.' },
  jump_energy_loss_m: { label: 'Hydraulic-jump response', short: 'Jump', evidence: 'Froude number dominates normalized jump-energy response over the frozen range.' },
  body_area_m2_per_m: { label: 'Body area', short: 'Body area', evidence: 'Structure height dominates the material-proxy response.' },
  weight_kN_m: { label: 'Structural weight', short: 'Weight', evidence: 'The same geometry hierarchy carries into the companion weight response.' },
  log10_rock_threshold_ratio: { label: 'Rock threshold ratio', short: 'Rock', evidence: 'Available power and erodibility index govern the released rock review response.' }
};

const VARIABLE_LABELS = {
  Q_m3s: 'Discharge Q',
  overflow_length_m: 'Overflow length L',
  C_bcw: 'Discharge coefficient C',
  Fr1_target: 'Froude number Fr1',
  structure_height_m: 'Structure height',
  downstream_slope_h_per_v: 'Downstream slope',
  top_width_m: 'Top width',
  log10_Pav_kW_m2: 'log10 available power Pav',
  log10_K: 'log10 erodibility index K',
  F_c: 'Foundation factor Fc'
};

const MODES = {
  ST: { label: 'Total order ST', field: 'ST', lo: 'ST_lo95', hi: 'ST_hi95', description: 'includes interactions' },
  S1: { label: 'First order S1', field: 'S1', lo: 'S1_lo95', hi: 'S1_hi95', description: 'variable acting on its own' },
  gap: { label: 'Interaction contribution ST − S1', field: 'interaction_gap_ST_minus_S1', description: 'difference between total and first-order influence' }
};

function pct(value, digits = 1) { return `${fmt(Number(value) * 100, digits)}%`; }
function cleanResponse(value) { return RESPONSE_META[value] || { label: value, short: value, evidence: '' }; }
function cleanVariable(value) { return VARIABLE_LABELS[value] || value; }

function responseRows(data, response) {
  return data.indices.filter(d => d.response === response);
}

function replicationRow(data, response) {
  return data.replication_check.find(d => d.response === response) || null;
}

function chartDomain(rows, mode) {
  if (mode === 'gap') {
    const values = rows.map(d => Number(d.interaction_gap_ST_minus_S1));
    const lo = Math.min(0, ...values) - 0.012;
    const hi = Math.max(0.03, ...values) * 1.15;
    return [lo, hi];
  }
  const hi = Math.max(...rows.map(d => Number(d[MODES[mode].hi] ?? d[MODES[mode].field]))) * 1.08;
  const lo = mode === 'S1' ? Math.min(0, ...rows.map(d => Number(d.S1_lo95))) * 1.08 : 0;
  return [lo, Math.max(0.1, hi)];
}

function tickValues([lo, hi], mode) {
  if (mode === 'gap') {
    const step = hi > 0.2 ? 0.05 : 0.025;
    const ticks = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi + step * 0.2; v += step) ticks.push(Number(v.toFixed(3)));
    return ticks;
  }
  const step = hi > 0.7 ? 0.2 : hi > 0.35 ? 0.1 : 0.05;
  const ticks = [];
  for (let v = 0; v <= hi + step * 0.2; v += step) ticks.push(Number(v.toFixed(3)));
  return ticks;
}

export function renderFig15(mount, data) {
  const responses = [...new Set(data.indices?.map(d => d.response) || [])];
  if (!data.design || data.design.method !== 'scrambled Sobol/Jansen' || Number(data.design.base_N) !== 8192) throw new Error('FIG-15 requires the frozen scrambled Sobol/Jansen design with base N=8192.');
  if (responses.length < 5 || !Array.isArray(data.replication_check)) throw new Error('FIG-15 requires the frozen response indices and scramble-replication checks.');
  if (responses.some(r => /stability|sliding|fos/i.test(r))) throw new Error('FIG-15 must not publish unconditional stability Sobol indices.');

  const ui = frameFigure(mount, {
    id: 'FIG-15',
    title: 'What matters when everything varies together?',
    kicker: 'S1 asks how much variance a variable explains on its own. ST asks how much it contributes including interactions. Rankings are specific to the frozen synthetic ranges.',
    caveat: 'Sobol indices are specific to the frozen synthetic ranges. Stability is intentionally excluded from unconditional Sobol interpretation; its applicability-conditioned subset violates the standard assumptions.'
  });

  const svg = makeSvg(ui.canvas, '0 0 900 540', 'Selectable Sobol sensitivity bars showing first-order, total-order, interaction contribution and uncertainty intervals by response.');
  const plot = { x: 245, y: 92, w: 555, rowH: 105 };
  let response = responses.includes('head_m') ? 'head_m' : responses[0];
  let mode = 'ST';

  const responseControl = makeSelectControl({
    label: 'Response',
    value: response,
    options: responses.map(r => ({ value: r, label: cleanResponse(r).label })),
    onChange: value => { response = value; draw(); }
  });
  const modeControl = makeSelectControl({
    label: 'Sensitivity view',
    value: mode,
    options: Object.entries(MODES).map(([value, meta]) => ({ value, label: meta.label })),
    onChange: value => { mode = value; draw(); }
  });
  ui.controls.append(responseControl.wrap, modeControl.wrap);

  function draw() {
    svg.replaceChildren();
    const rows = responseRows(data, response).sort((a, b) => Number(b[MODES[mode].field]) - Number(a[MODES[mode].field]));
    const domain = chartDomain(rows, mode);
    const zeroX = scale(0, domain[0], domain[1], plot.x, plot.x + plot.w);
    const meta = cleanResponse(response);
    const modeMeta = MODES[mode];

    svg.append(svgEl('text', { x: plot.x, y: 34, class: 'p8-chart-title' }, `${meta.label} · ${modeMeta.label}`));
    svg.append(svgEl('text', { x: plot.x, y: 58, class: 'p4-small-label' }, modeMeta.description));

    const axisY = plot.y + rows.length * plot.rowH + 4;
    svg.append(svgEl('line', { x1: plot.x, y1: axisY, x2: plot.x + plot.w, y2: axisY, class: 'p8-axis' }));
    if (domain[0] < 0) svg.append(svgEl('line', { x1: zeroX, y1: plot.y - 24, x2: zeroX, y2: axisY, class: 'p8-zero-line' }));

    tickValues(domain, mode).forEach(t => {
      const x = scale(t, domain[0], domain[1], plot.x, plot.x + plot.w);
      svg.append(svgEl('line', { x1: x, y1: axisY, x2: x, y2: axisY + 7, class: 'p8-tick' }));
      svg.append(svgEl('text', { x, y: axisY + 26, 'text-anchor': 'middle', class: 'p4-tick' }, fmt(t, 2)));
    });

    rows.forEach((d, i) => {
      const y = plot.y + i * plot.rowH;
      const value = Number(d[modeMeta.field]);
      const endX = scale(value, domain[0], domain[1], plot.x, plot.x + plot.w);
      const group = svgEl('g', {
        class: 'p8-sobol-row', tabindex: '0', role: 'img',
        'aria-label': `${cleanVariable(d.variable)}: ${modeMeta.label} ${fmt(value, 3)}${mode === 'gap' ? '' : `, 95 percent interval ${fmt(d[modeMeta.lo],3)} to ${fmt(d[modeMeta.hi],3)}`}`
      });
      group.style.setProperty('--row-delay', `${i * 90}ms`);
      group.append(svgEl('text', { x: plot.x - 18, y: y + 10, 'text-anchor': 'end', class: 'p8-var-label' }, cleanVariable(d.variable)));
      group.append(svgEl('line', { x1: Math.min(zeroX, endX), y1: y, x2: Math.max(zeroX, endX), y2: y, class: mode === 'gap' ? 'p8-gap-bar' : 'p8-index-bar' }));

      if (mode !== 'gap') {
        const loX = scale(Number(d[modeMeta.lo]), domain[0], domain[1], plot.x, plot.x + plot.w);
        const hiX = scale(Number(d[modeMeta.hi]), domain[0], domain[1], plot.x, plot.x + plot.w);
        group.append(svgEl('line', { x1: loX, y1: y, x2: hiX, y2: y, class: 'p8-ci-line' }));
        group.append(svgEl('line', { x1: loX, y1: y - 6, x2: loX, y2: y + 6, class: 'p8-ci-cap' }));
        group.append(svgEl('line', { x1: hiX, y1: y - 6, x2: hiX, y2: y + 6, class: 'p8-ci-cap' }));
        if (mode === 'ST') {
          const s1x = scale(Number(d.S1), domain[0], domain[1], plot.x, plot.x + plot.w);
          group.append(svgEl('circle', { cx: s1x, cy: y, r: '5', class: 'p8-s1-marker' }));
        }
      }
      group.append(svgEl('circle', { cx: endX, cy: y, r: '7', class: 'p8-index-dot' }));
      group.append(svgEl('text', { x: Math.min(plot.x + plot.w - 4, Math.max(plot.x + 8, endX + (value >= 0 ? 12 : -12))), y: y - 12, 'text-anchor': value >= 0 ? 'start' : 'end', class: 'p8-value-label' }, fmt(value, 3)));
      svg.append(group);
    });

    const rep = replicationRow(data, response);
    const oof = rows[0]?.surrogate_oof_r2;
    ui.readout.innerHTML = `<div class="p4-stat"><strong>${fmt(data.design.base_N,0)}</strong><span>Sobol base N</span></div><div class="p4-stat"><strong>${fmt(oof,4)}</strong><span>surrogate OOF R² (companion diagnostic)</span></div><div class="p4-stat"><strong>${rep ? fmt(rep.max_abs_ST_diff_for_ST_ge_0_01,4) : '—'}</strong><span>max |ΔST| across independent scramble</span></div><div class="p8-method-card"><strong>${data.design.method}</strong><span>The chart shows sensitivity indices; the R² value is shown only as a surrogate-quality companion statistic, not as a sensitivity score.</span></div>`;
    ui.summary.textContent = `${meta.evidence} The leading total-order effect for this response is ${cleanVariable([...responseRows(data,response)].sort((a,b)=>b.ST-a.ST)[0].variable)} at ST ${fmt(Math.max(...responseRows(data,response).map(d=>d.ST)),3)}. These rankings apply to the frozen synthetic parameter ranges, not universally.`;
  }

  draw();
  observeOnce(mount, () => mount.classList.add('p4-entered', 'p8-entered'));
}

const DIMENSION_META = [
  { title: 'Normalized response regime', short: 'Regime', source: 'FIG-09 / FIG-11', note: 'Dimensionless family occupancy and replication describe recurring behavioural regimes without turning them into design types.', glyph: 'families' },
  { title: 'Response magnitude', short: 'Magnitude', source: 'FIG-04 / FIG-05', note: 'Head and downstream forcing answer how large a response becomes under the selected analytical formulation.', glyph: 'response' },
  { title: 'Dissipation-development demand', short: 'Dissipation', source: 'FIG-12', note: 'Hydraulic-jump development demand is a separate response axis from forcing magnitude.', glyph: 'jump' },
  { title: 'Material/stability trade-off', short: 'Material + stability', source: 'FIG-06 / FIG-07 / FIG-08 / FIG-10', note: 'Geometry, material proxy, conditioned stability diagnostics and Pareto/family trade-offs must remain connected rather than collapsed into one optimum.', glyph: 'tradeoff' },
  { title: 'Foundation/scour uncertainty', short: 'Foundation + scour', source: 'FIG-13 / FIG-14', note: 'Foundation response and alluvial model disagreement carry uncertainty that cannot be resolved by the hydraulic or geometry axes alone.', glyph: 'uncertainty' }
];

function dimensionGlyph(group, type, x, y, active) {
  const cls = `p8-dim-glyph ${active ? 'is-active' : ''}`;
  if (type === 'families') {
    [[-16,-10],[10,-14],[-5,12],[18,12]].forEach(([dx,dy],i) => group.append(svgEl('circle',{cx:x+dx,cy:y+dy,r:String(5+i%2*2),class:cls})));
  } else if (type === 'response') {
    group.append(svgEl('path',{d:`M${x-25},${y+14} C${x-8},${y+10} ${x+2},${y-18} ${x+28},${y-20}`,class:cls}));
  } else if (type === 'jump') {
    group.append(svgEl('path',{d:`M${x-28},${y+12} L${x-6},${y+12} C${x+4},${y+12} ${x+2},${y-18} ${x+15},${y-18} L${x+30},${y-18}`,class:cls}));
  } else if (type === 'tradeoff') {
    group.append(svgEl('line',{x1:x-25,y1:y+16,x2:x+25,y2:y-16,class:cls}));
    group.append(svgEl('circle',{cx:x-18,cy:y+12,r:'6',class:cls}));
    group.append(svgEl('circle',{cx:x+18,cy:y-12,r:'6',class:cls}));
  } else {
    group.append(svgEl('path',{d:`M${x-28},${y+12} C${x-14},${y-18} ${x+2},${y+28} ${x+30},${y-8}`,class:cls}));
    group.append(svgEl('path',{d:`M${x-28},${y-4} C${x-8},${y+24} ${x+8},${y-26} ${x+30},${y+10}`,class:cls}));
  }
}

export function renderFig16(mount, data) {
  if (!Array.isArray(data.dimensions) || data.dimensions.length !== 5) throw new Error('FIG-16 requires exactly the five frozen synthesis dimensions.');
  const normalized = data.dimensions.map(v => String(v).toLowerCase());
  for (const expected of DIMENSION_META.map(d => d.title.toLowerCase())) {
    if (!normalized.includes(expected)) throw new Error(`FIG-16 is missing frozen dimension: ${expected}`);
  }

  const ui = frameFigure(mount, {
    id: 'FIG-16',
    title: 'Five dimensions, one connected research picture',
    kicker: 'The synthesis reconnects earlier evidence without collapsing it into one score, one family or one empirical equation.',
    caveat: 'Research interpretation framework, not a design code. It does not output recommended dimensions or a single optimum.'
  });
  mount.classList.add('p8-synthesis');
  const svg = makeSvg(ui.canvas, '0 0 980 500', 'Five connected research dimensions assembled from earlier released evidence.');
  let stage = 0;

  const buttons = htmlEl('div', 'p8-stage-buttons');
  DIMENSION_META.forEach((d, i) => {
    const b = htmlEl('button', 'p8-stage-button', `${i + 1}. ${d.short}`);
    b.type = 'button'; b.dataset.stage = String(i); b.addEventListener('click', () => { stage = i; draw(); syncButtons(); }); buttons.append(b);
  });
  const all = htmlEl('button', 'p8-stage-button p8-stage-button--all', 'All five connected');
  all.type = 'button'; all.dataset.stage = 'all'; all.addEventListener('click', () => { stage = 'all'; draw(); syncButtons(); }); buttons.append(all);
  ui.controls.append(buttons);

  function syncButtons() {
    [...buttons.querySelectorAll('button')].forEach(b => {
      const selected = String(stage) === b.dataset.stage;
      b.classList.toggle('is-selected', selected); b.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  }

  function draw() {
    svg.replaceChildren();
    const xs = [110, 300, 490, 680, 870];
    const y = 205;
    const allActive = stage === 'all';

    for (let i = 0; i < 4; i++) {
      const active = allActive;
      svg.append(svgEl('line',{x1:xs[i]+54,y1:y,x2:xs[i+1]-54,y2:y,class:`p8-connector ${active?'is-active':''}`}));
    }

    DIMENSION_META.forEach((d, i) => {
      const active = allActive || stage === i;
      const g = svgEl('g',{class:`p8-dimension ${active?'is-active':''}`,tabindex:'0',role:'img','aria-label':`${i+1}. ${d.title}. ${d.note} Source evidence ${d.source}.`});
      g.style.setProperty('--dim-delay', `${i * 90}ms`);
      g.append(svgEl('circle',{cx:xs[i],cy:y,r:'54',class:'p8-dim-node'}));
      dimensionGlyph(g,d.glyph,xs[i],y,active);
      g.append(svgEl('text',{x:xs[i],y:y+82,'text-anchor':'middle',class:'p8-dim-number'},String(i+1)));
      const words = d.short.split(' ');
      g.append(svgEl('text',{x:xs[i],y:y+106,'text-anchor':'middle',class:'p8-dim-label'},words[0]));
      if (words.length>1) g.append(svgEl('text',{x:xs[i],y:y+125,'text-anchor':'middle',class:'p8-dim-label'},words.slice(1).join(' ')));
      g.append(svgEl('text',{x:xs[i],y:y-82,'text-anchor':'middle',class:'p8-dim-source'},d.source));
      svg.append(g);
    });

    const current = allActive ? null : DIMENSION_META[Number(stage)];
    ui.readout.innerHTML = allActive
      ? `<div class="p8-synthesis-card"><strong>All five dimensions connected</strong><span>No single family, sensitivity index or empirical equation captures the whole research problem. The five dimensions retain different evidence types and uncertainty boundaries.</span></div>`
      : `<div class="p8-synthesis-card"><strong>${Number(stage)+1}. ${current.title}</strong><span>${current.note}</span><small>Evidence carried forward from ${current.source}; no new analysis is introduced here.</small></div>`;
    ui.summary.textContent = allActive
      ? 'The final synthesis keeps normalized regime, response magnitude, dissipation-development demand, material/stability trade-off, and foundation/scour uncertainty distinct but connected. It is a research framework, not a design score or code.'
      : `${current.title}: ${current.note} This stage reuses the interpretation of ${current.source} without adding a new fitted relationship.`;
  }

  syncButtons(); draw();
  observeOnce(mount, () => mount.classList.add('p4-entered', 'p8-entered'));
}

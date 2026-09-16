import { svgEl, htmlEl, frameFigure, makeSvg, observeOnce, fmt, scale } from './figure-core.js';

const METRICS = {
  y2_y1: { label: 'Conjugate-depth ratio y2/y1', short: 'y2/y1', digits: 2 },
  dE_y1: { label: 'Energy loss ΔE/y1', short: 'ΔE/y1', digits: 2 },
  Lcwc_y1: { label: 'CWC reference length / y1', short: 'CWC/y1', digits: 1 },
  Lusace_y1: { label: 'USACE natural length / y1', short: 'USACE/y1', digits: 1 },
  Lcwc_Lusace: { label: 'CWC / USACE length ratio', short: 'CWC/USACE', digits: 3 }
};

function extent(values) {
  const lo = Math.min(...values), hi = Math.max(...values);
  const pad = (hi - lo || 1) * 0.08;
  return [Math.max(0, lo - pad), hi + pad];
}

function makeIndexSlider({ count, value, onInput }) {
  const wrap = htmlEl('label', 'p4-control p6-fr-control');
  const line = htmlEl('span', 'p4-control__line');
  line.append(htmlEl('span', 'p4-control__label', 'Froude number Fr1'), htmlEl('output', 'p4-control__value', ''));
  const output = line.querySelector('output') || line.children[1];
  const input = htmlEl('input', 'p4-control__range');
  input.type = 'range'; input.min = '0'; input.max = String(count - 1); input.step = '1'; input.value = String(value);
  input.addEventListener('input', () => onInput(Number(input.value), output));
  wrap.append(line, input);
  return { wrap, input, output };
}

function makeMetricSelector({ value, onChange }) {
  const wrap = htmlEl('label', 'p4-control');
  wrap.append(htmlEl('span', 'p4-control__label', 'Curve metric'));
  const select = htmlEl('select', 'p4-control__select');
  for (const [key, meta] of Object.entries(METRICS)) {
    const option = htmlEl('option', '', meta.label); option.value = key; if (key === value) option.selected = true; select.append(option);
  }
  select.addEventListener('change', () => onChange(select.value)); wrap.append(select); return { wrap, select };
}

export function renderFig12(mount, data) {
  if (!Array.isArray(data.curve) || data.curve.length !== 60) throw new Error('FIG-12 requires the published 60-state hydraulic-jump curve.');
  if (!data.domain?.Fr1 || !Array.isArray(data.quantiles) || data.quantiles.length !== 3) throw new Error('FIG-12 requires the frozen Fr1 domain and p10/p50/p90 summaries.');

  const ui = frameFigure(mount, {
    id: 'FIG-12',
    title: 'Hydraulic-jump development demand',
    kicker: '22,500 formal-jump states; scrub the 60-state published display curve (full-population median Fr1 ≈ 6.75). Fr1 controls normalized jump development; this is a different axis from the q-driven forcing magnitude shown earlier.',
    caveat: data.caveat || 'Reference scaling only; not final IS 4997:2026 basin dimensions.'
  });

  const svg = makeSvg(ui.canvas, '0 0 900 650', 'Hydraulic-jump schematic linked to the published normalized jump-development curve over Froude number 4.5 to 9.');
  const schematic = svgEl('g', { class: 'p6-jump-schematic' });
  const chart = svgEl('g', { class: 'p6-jump-chart' });
  svg.append(schematic, chart);

  const plot = { x: 95, y: 390, w: 700, h: 185 };
  let metric = 'Lcwc_y1';
  const medianFr = data.quantiles[1].Fr1;
  let index = data.curve.reduce((best, row, i) => Math.abs(row.Fr1 - medianFr) < Math.abs(data.curve[best].Fr1 - medianFr) ? i : best, 0);

  function drawSchematic(row) {
    schematic.replaceChildren();
    const baseY = 290; const left = 70; const toe = 280;
    const y1px = 25;
    const y2px = scale(row.y2_y1, data.curve[0].y2_y1, data.curve.at(-1).y2_y1, 78, 150);
    const rollerLen = scale(row.Lcwc_y1, data.curve[0].Lcwc_y1, data.curve.at(-1).Lcwc_y1, 230, 420);
    const end = toe + rollerLen;
    schematic.append(svgEl('line', { x1: 45, y1: baseY, x2: 855, y2: baseY, class: 'p6-channel-bed' }));
    schematic.append(svgEl('path', { d: `M${left},${baseY-y1px} L${toe},${baseY-y1px} C${toe+45},${baseY-y1px-18} ${toe+70},${baseY-y2px-26} ${toe+120},${baseY-y2px} C${toe+180},${baseY-y2px+22} ${end-55},${baseY-y2px+8} ${end},${baseY-y2px} L850,${baseY-y2px}`, class: 'p6-water-profile' }));
    schematic.append(svgEl('path', { d: `M${toe},${baseY-y1px} C${toe+55},${baseY-y2px-38} ${toe+145},${baseY-y2px-30} ${Math.min(end,830)},${baseY-y2px+8}`, class: 'p6-roller' }));
    schematic.append(svgEl('line', { x1: 125, y1: baseY, x2: 125, y2: baseY-y1px, class: 'p6-depth-marker' }));
    schematic.append(svgEl('line', { x1: end-20, y1: baseY, x2: end-20, y2: baseY-y2px, class: 'p6-depth-marker' }));
    schematic.append(svgEl('text', { x: 135, y: baseY-y1px-8, class: 'p4-small-label' }, 'y1'));
    schematic.append(svgEl('text', { x: end-10, y: baseY-y2px-8, class: 'p4-small-label' }, 'y2'));
    schematic.append(svgEl('line', { x1: toe, y1: 320, x2: end, y2: 320, class: 'p6-length-line' }));
    schematic.append(svgEl('text', { x: (toe+end)/2, y: 344, 'text-anchor': 'middle', class: 'p4-small-label' }, `reference development length grows with Fr1`));
    schematic.append(svgEl('text', { x: 70, y: 52, class: 'p4-label' }, `Fr1 = ${fmt(row.Fr1,2)}`));
    schematic.append(svgEl('text', { x: 70, y: 78, class: 'p4-small-label' }, `schematic depth/roller geometry is visually scaled; numeric ratios are shown below`));
  }

  function drawChart(row) {
    chart.replaceChildren();
    const meta = METRICS[metric]; const vals = data.curve.map(d => Number(d[metric])); const yExt = extent(vals);
    chart.append(svgEl('line', { x1: plot.x, y1: plot.y+plot.h, x2: plot.x+plot.w, y2: plot.y+plot.h, class: 'p6-axis' }));
    chart.append(svgEl('line', { x1: plot.x, y1: plot.y, x2: plot.x, y2: plot.y+plot.h, class: 'p6-axis' }));
    const points = data.curve.map(d => [scale(d.Fr1,data.domain.Fr1[0],data.domain.Fr1[1],plot.x,plot.x+plot.w), scale(d[metric],yExt[0],yExt[1],plot.y+plot.h,plot.y)]);
    chart.append(svgEl('path', { d: points.map((p,i)=>`${i?'L':'M'}${p[0]},${p[1]}`).join(' '), class: 'p6-curve', pathLength: '1' }));
    const px = scale(row.Fr1,data.domain.Fr1[0],data.domain.Fr1[1],plot.x,plot.x+plot.w); const py = scale(row[metric],yExt[0],yExt[1],plot.y+plot.h,plot.y);
    chart.append(svgEl('line', { x1:px,y1:plot.y,x2:px,y2:plot.y+plot.h,class:'p6-crosshair' }));
    chart.append(svgEl('circle', { cx:px,cy:py,r:'7',class:'p6-selected-dot' }));
    for (const q of data.quantiles) {
      const qx=scale(q.Fr1,data.domain.Fr1[0],data.domain.Fr1[1],plot.x,plot.x+plot.w);
      chart.append(svgEl('line',{x1:qx,y1:plot.y+plot.h-7,x2:qx,y2:plot.y+plot.h+7,class:'p6-quantile-tick'}));
    }
    chart.append(svgEl('text',{x:plot.x+plot.w/2,y:625,'text-anchor':'middle',class:'p4-axis-label'},'Froude number Fr1'));
    chart.append(svgEl('text',{x:25,y:plot.y+plot.h/2,transform:`rotate(-90 25 ${plot.y+plot.h/2})`,'text-anchor':'middle',class:'p4-axis-label'},meta.short));
    chart.append(svgEl('text',{x:plot.x,y:plot.y-15,class:'p4-small-label'},`${meta.label} · selected ${fmt(row[metric],meta.digits)}`));
  }

  function update(nextIndex = index) {
    index = Math.max(0, Math.min(data.curve.length-1, nextIndex)); const row = data.curve[index];
    drawSchematic(row); drawChart(row);
    slider.input.value = String(index); slider.output.textContent = fmt(row.Fr1,2);
    ui.readout.innerHTML = `<div class="p4-stat"><strong>${fmt(row.y2_y1,2)}</strong><span>conjugate depth y2/y1</span></div><div class="p4-stat"><strong>${fmt(row.dE_y1,2)}</strong><span>energy loss ΔE/y1</span></div><div class="p4-stat"><strong>${fmt(row.Lcwc_y1,1)} / ${fmt(row.Lusace_y1,1)}</strong><span>CWC / USACE reference lengths, each normalized by y1</span></div>`;
    ui.summary.textContent = `At Fr1 ${fmt(row.Fr1,2)}, the published reference curve gives y2/y1 ${fmt(row.y2_y1,2)} and CWC/USACE length ratio ${fmt(row.Lcwc_Lusace,3)}. These normalized jump-development measures should not be read as forcing magnitude or final stilling-basin dimensions.`;
  }

  const slider = makeIndexSlider({ count:data.curve.length, value:index, onInput:(i)=>update(i) });
  const selector = makeMetricSelector({ value:metric, onChange:(v)=>{metric=v;update(index);} });
  const medianButton = htmlEl('button','p4-button','Return to median-nearest curve state'); medianButton.type='button';
  medianButton.addEventListener('click',()=>{const i=data.curve.reduce((best,row,j)=>Math.abs(row.Fr1-medianFr)<Math.abs(data.curve[best].Fr1-medianFr)?j:best,0);update(i);});
  const medianWrap=htmlEl('div','p4-control'); medianWrap.append(htmlEl('span','p4-control__label','Reference state'),medianButton);
  ui.controls.append(slider.wrap,selector.wrap,medianWrap);
  update(index); observeOnce(mount,()=>mount.classList.add('p4-entered','p6-entered'));
}

export function initFoundationTransition() {
  const chapter = document.querySelector('#chapter-11 .shell-wide');
  if (!chapter || chapter.querySelector('[data-phase6-foundation-transition]')) return;

  const intro = chapter.querySelector('.lede');
  const card = htmlEl('div', 'foundation-transition');
  card.dataset.phase6FoundationTransition = 'true';
  card.setAttribute('role', 'note');
  card.setAttribute('aria-label', 'Foundation-context transition from hydraulic forcing to rock and alluvial response');
  card.innerHTML = `
    <div class="foundation-transition__intro">
      <h3>The foundation question changes the response variable</h3>
      <p>Understanding forcing and jump development does not by itself determine foundation response. The competent-rock branch uses a separate incipient-erodibility review diagnostic; the alluvial branch then introduces a different problem — disagreement between scour models.</p>
    </div>
    <div class="foundation-transition__grid">
      <div class="foundation-transition__step">
        <span class="foundation-transition__eyebrow">Hydraulic response</span>
        <span class="foundation-transition__formula">P′ [kW/m]</span>
        <p>The per-width forcing proxy from the hydraulic analysis stays on its own axis. The research did not convert P′ into area-specific available power Pav.</p>
      </div>
      <div class="foundation-transition__step">
        <span class="foundation-transition__eyebrow">Competent-rock review</span>
        <span class="foundation-transition__formula">R = Pav / Pc</span>
        <p>For the released rock diagnostic, Pc = 0.48 K<sup>0.44</sup> when K ≤ 0.1 and Pc = K<sup>0.75</sup> when K &gt; 0.1. R ≥ 1 is a review threshold, not a scour-depth equation.</p>
        <div class="foundation-transition__stat"><strong>11,775 / 25,000</strong><br>synthetic rock stress-test states reached the review threshold — not a site failure probability.</div>
      </div>
      <div class="foundation-transition__step">
        <span class="foundation-transition__eyebrow">Still unresolved</span>
        <span class="foundation-transition__formula">foundation depth ≠ released</span>
        <p>Final rock foundation depth and protection remain open evidence branches. The diagnostic cannot be turned into construction-ready depth, apron or protection guidance.</p>
      </div>
    </div>
    <div class="foundation-transition__handoff">
      <strong>Next: alluvial uncertainty</strong>
      <span>In alluvium, the research moves from a rock review threshold to direct comparison of BJ and DAF. Their disagreement is the Phase 7 interactive story.</span>
    </div>`;

  if (intro) intro.before(card); else chapter.append(card);

  const chapter10 = document.querySelector('#chapter-10 .chapter__copy');
  if (chapter10 && !chapter10.querySelector('[data-phase6-foundation-bridge]')) {
    const bridge = htmlEl('p', 'chapter-bridge', 'Even when hydraulic response is understood, the foundation question remains. Rock and alluvial conditions move the research onto different response measures.');
    bridge.dataset.phase6FoundationBridge = 'true';
    chapter10.append(bridge);
  }
}

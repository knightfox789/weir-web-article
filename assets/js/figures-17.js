import { svgEl, htmlEl, frameFigure, makeSvg, makeSelectControl, fmt, scale, loadJson } from './figure-core.js';
import { VIEW_META, EXPECTED_REUSE, safeNumber, formatValue, initState } from './figures-17-models-a.js';
import { buildModel, buildContextControls } from './figures-17-models-b.js';

function renderChart(canvas, model) {
  canvas.replaceChildren();
  const rows = model.rows.filter(r => safeNumber(r.value) !== null);
  if (!rows.length) {
    canvas.append(htmlEl('div','p9-empty','No released rows are available for this selection.'));
    return;
  }
  const svg = makeSvg(canvas, '0 0 920 450', `${model.statistic}. Released figure-level summary only.`);
  const plot = { x: 250, y: 70, w: 570, rowH: Math.min(82, 285 / Math.max(rows.length,1)) };
  const vals = rows.flatMap(r => [r.value, r.lo, r.hi].map(safeNumber).filter(v => v !== null));
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (lo >= 0) lo = 0;
  if (hi <= 0) hi = 0;
  if (hi === lo) { hi += 1; lo -= 1; }
  const pad = (hi - lo) * 0.08;
  lo -= pad; hi += pad;
  const zeroX = scale(0, lo, hi, plot.x, plot.x + plot.w);
  svg.append(svgEl('text',{x:plot.x,y:30,class:'p9-chart-title'},model.statistic));
  svg.append(svgEl('line',{x1:plot.x,y1:390,x2:plot.x+plot.w,y2:390,class:'p9-axis'}));
  if (lo < 0 && hi > 0) svg.append(svgEl('line',{x1:zeroX,y1:52,x2:zeroX,y2:390,class:'p9-zero'}));
  rows.forEach((r,i) => {
    const y = plot.y + i * plot.rowH;
    const valueX = scale(Number(r.value), lo, hi, plot.x, plot.x + plot.w);
    const g = svgEl('g',{class:'p9-row',tabindex:'0',role:'img','aria-label':`${r.label}: ${formatValue(r.value,r.unit)}${safeNumber(r.lo)!==null ? `, released range ${formatValue(r.lo,r.unit)} to ${formatValue(r.hi,r.unit)}`:''}`});
    g.append(svgEl('text',{x:plot.x-18,y:y+5,'text-anchor':'end',class:'p9-label'},r.label));
    if (safeNumber(r.lo) !== null && safeNumber(r.hi) !== null) {
      const lx=scale(Number(r.lo),lo,hi,plot.x,plot.x+plot.w), hx=scale(Number(r.hi),lo,hi,plot.x,plot.x+plot.w);
      g.append(svgEl('line',{x1:lx,y1:y,x2:hx,y2:y,class:'p9-range'}));
      g.append(svgEl('line',{x1:lx,y1:y-6,x2:lx,y2:y+6,class:'p9-cap'}));
      g.append(svgEl('line',{x1:hx,y1:y-6,x2:hx,y2:y+6,class:'p9-cap'}));
    } else {
      g.append(svgEl('line',{x1:Math.min(zeroX,valueX),y1:y,x2:Math.max(zeroX,valueX),y2:y,class:'p9-bar'}));
    }
    g.append(svgEl('circle',{cx:valueX,cy:y,r:'7',class:'p9-dot'}));
    g.append(svgEl('text',{x:Math.min(plot.x+plot.w-4,Math.max(plot.x+6,valueX+12)),y:y-12,class:'p9-value'},formatValue(r.value,r.unit)));
    svg.append(g);
  });
  svg.append(svgEl('text',{x:plot.x,y:425,class:'p4-small-label'},'Whisker = released p10–p90 or 95% interval where the selected asset publishes one. No interval is invented when none is released.'));
}

function renderTable(canvas, model) {
  canvas.replaceChildren();
  const wrap = htmlEl('div','p9-table-wrap');
  const table = htmlEl('table','p9-table');
  const caption = htmlEl('caption','',model.statistic);
  const thead=htmlEl('thead'), trh=htmlEl('tr');
  ['Released row','Value','Lower','Upper'].forEach(t=>trh.append(htmlEl('th','',t)));
  thead.append(trh);
  const tbody=htmlEl('tbody');
  model.rows.forEach(r => {
    const tr=htmlEl('tr');
    [r.label,formatValue(r.value,r.unit),safeNumber(r.lo)!==null?formatValue(r.lo,r.unit):'—',safeNumber(r.hi)!==null?formatValue(r.hi,r.unit):'—'].forEach(v=>tr.append(htmlEl('td','',v)));
    tbody.append(tr);
  });
  table.append(caption,thead,tbody); wrap.append(table); canvas.append(wrap);
}

function renderCards(readout, cards) {
  readout.replaceChildren();
  cards.forEach(([label,value]) => {
    const card=htmlEl('div','p4-stat');
    card.append(htmlEl('strong','',String(value)),htmlEl('span','',label));
    readout.append(card);
  });
}

function renderMeaning(container, model) {
  container.replaceChildren();
  const yes=htmlEl('div','p9-meaning-card p9-meaning-card--means');
  yes.append(htmlEl('strong','','What this means'),htmlEl('p','',model.meaning));
  const no=htmlEl('div','p9-meaning-card p9-meaning-card--not');
  no.append(htmlEl('strong','','What this does not mean'),htmlEl('p','',model.notMeaning));
  container.append(yes,no);
}

function downloadReleasedJson(meta, data) {
  const payload = JSON.stringify(data, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = meta.file;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function renderFig17(mount, contract) {
  if (!Array.isArray(contract.reuse) || contract.reuse.length !== EXPECTED_REUSE.length) throw new Error('FIG-17 requires exactly the nine frozen released-asset references.');
  if (contract.reuse.some(slug => !VIEW_META[slug]) || EXPECTED_REUSE.some(slug => !contract.reuse.includes(slug))) throw new Error('FIG-17 reuse contract does not match the frozen Phase-2 explorer asset set.');
  if (!String(contract.policy || '').includes('does not expose the full upstream research tables')) throw new Error('FIG-17 requires the frozen no-upstream-table policy.');

  const ui = frameFigure(mount, {
    id: 'FIG-17',
    title: 'Research Explorer',
    kicker: 'Interrogate already released figure-level evidence. Choose a view, then use only the filters and statistics that its frozen runtime actually supports.',
    caveat: 'Explorer boundary: released Phase-2 summaries only. No new scientific calculations, upstream source-table exposure, recommended dimensions or construction-ready output.'
  });
  mount.classList.add('p9-explorer');

  const explorerControls = htmlEl('div','p9-explorer-controls');
  const dynamicControls = htmlEl('div','p9-dynamic-controls');
  const meaning = htmlEl('div','p9-meaning-grid');
  const cache = new Map();
  const states = new Map();
  let slug = contract.reuse[0];
  let display = 'chart';
  let activeData = null;
  let requestToken = 0;

  const sourceControl = makeSelectControl({
    label: 'Evidence view',
    value: slug,
    options: contract.reuse.map(value => ({ value, label: `${VIEW_META[value].figure} — ${VIEW_META[value].label}` })),
    onChange: value => { slug=value; void loadAndRender(); }
  });
  const displayControl = makeSelectControl({
    label: 'Display mode',
    value: display,
    options: [{value:'chart',label:'Annotated summary'},{value:'table',label:'Released rows'}],
    onChange: value => { display=value; if (activeData) renderCurrent(); }
  });
  const download = htmlEl('button','p9-download','Download selected released JSON');
  download.type='button';
  download.addEventListener('click',() => {
    if (!activeData) return;
    downloadReleasedJson(VIEW_META[slug], activeData);
  });
  explorerControls.append(sourceControl.wrap, displayControl.wrap, download);
  ui.controls.append(explorerControls,dynamicControls);
  ui.body.append(meaning);

  function renderCurrent() {
    const state = states.get(slug) || initState(slug, activeData);
    states.set(slug,state);
    const model = buildModel(slug, activeData, state);
    if (display === 'table') renderTable(ui.canvas,model); else renderChart(ui.canvas,model);
    renderCards(ui.readout,model.cards);
    renderMeaning(meaning,model);
    const meta=VIEW_META[slug];
    ui.summary.textContent = `${meta.figure} · ${meta.population} Statistic shown: ${model.statistic}.`;
    ui.note.innerHTML = `<strong>Boundary.</strong> ${meta.boundary}`;
    buildContextControls(slug,activeData,state,dynamicControls,renderCurrent);
  }

  async function loadAndRender() {
    const token=++requestToken;
    const meta=VIEW_META[slug];
    activeData=null;
    ui.canvas.replaceChildren(htmlEl('div','p9-loading',`Loading ${meta.figure} released summary…`));
    dynamicControls.replaceChildren();
    try {
      const data = cache.has(slug) ? cache.get(slug) : await loadJson(`data/runtime/${meta.file}`);
      if (token !== requestToken) return;
      cache.set(slug,data);
      activeData=data;
      if (!states.has(slug)) states.set(slug,initState(slug,data));
      renderCurrent();
    } catch (error) {
      if (token !== requestToken) return;
      activeData=null;
      ui.canvas.replaceChildren();
      const box=htmlEl('div','p4-error');
      box.append(htmlEl('strong','','Explorer view could not be loaded.'),htmlEl('p','',error?.message || 'Required released runtime data are unavailable.'));
      ui.canvas.append(box);
      ui.summary.textContent='The explorer does not substitute another dataset when the selected released asset is unavailable.';
    }
  }

  await loadAndRender();
}

import { svgEl, frameFigure, makeSvg, observeOnce, makeRangeControl, makeSelectControl, fmt, scale, shortFamily } from './figure-core.js';

export function renderFig05(mount, data) {
  if (!data.relationship || !data.display_domain || !Array.isArray(data.points)) throw new Error('FIG-05 runtime contract is missing display points/domain.');
  const ui = frameFigure(mount, {
    id: 'FIG-05',
    title: 'q × Fr1 → forcing',
    kicker: 'The fitted surface is relative; absolute kW/m values come only from source-data points.',
    caveat: data.caveat || 'Fitted synthetic relationship over the eligible formal-jump research domain; not a final basin-design equation.'
  });
  const svg = makeSvg(ui.canvas, '0 0 760 470', 'Scatter of eligible source states over a relative fitted q by Froude-number response field.');
  const plot = { x: 84, y: 45, w: 600, h: 320 };
  const qRange = data.display_domain.q_m2s;
  const fRange = data.display_domain.Fr1;
  const a = data.relationship.q_exponent;
  const b = data.relationship.Fr1_exponent;
  const response = (q, fr) => Math.pow(q, a) * Math.pow(fr, b);
  const responseMax = response(qRange[1], fRange[1]);
  const responseMin = response(qRange[0], fRange[0]);
  let qSelected = (qRange[0] + qRange[1]) / 2;
  let frSelected = (fRange[0] + fRange[1]) / 2;
  let family = 'ALL';

  const gridLayer = svgEl('g');
  const pointsLayer = svgEl('g');
  const crossLayer = svgEl('g');
  svg.append(gridLayer, pointsLayer, crossLayer);
  svg.append(svgEl('text', { x: plot.x + plot.w / 2, y: 451, 'text-anchor': 'middle', class: 'p4-axis-label' }, 'Unit discharge q (m²/s)'));
  svg.append(svgEl('text', { x: 20, y: plot.y + plot.h / 2, transform: `rotate(-90 20 ${plot.y + plot.h / 2})`, 'text-anchor': 'middle', class: 'p4-axis-label' }, 'Froude number Fr1'));

  const cols = 18, rows = 14;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const q = qRange[0] + (col + 0.5) / cols * (qRange[1] - qRange[0]);
      const fr = fRange[1] - (row + 0.5) / rows * (fRange[1] - fRange[0]);
      const z = response(q, fr);
      const opacity = scale(z, responseMin, responseMax, 0.08, 0.82);
      gridLayer.append(svgEl('rect', {
        x: plot.x + col * plot.w / cols,
        y: plot.y + row * plot.h / rows,
        width: plot.w / cols + .5,
        height: plot.h / rows + .5,
        class: 'p4-surface-cell p4-surface-cell--forcing',
        opacity: opacity.toFixed(3)
      }));
    }
  }

  function drawPoints() {
    pointsLayer.replaceChildren();
    for (const point of data.points) {
      const pf = shortFamily(point.family_neighborhood);
      if (family !== 'ALL' && pf !== family) continue;
      const x = scale(point.unit_discharge_m2s, qRange[0], qRange[1], plot.x, plot.x + plot.w);
      const y = scale(point.Fr1, fRange[0], fRange[1], plot.y + plot.h, plot.y);
      const circle = svgEl('circle', { cx:x, cy:y, r:5.2, class:`p4-source-point p4-source-point--${pf.toLowerCase()}`, tabindex:'0', role:'img', 'aria-label':`${pf}: q ${fmt(point.unit_discharge_m2s,2)} m²/s, Fr1 ${fmt(point.Fr1,2)}, forcing ${fmt(point.forcing_kW_m,1)} kW/m` });
      circle.append(svgEl('title', {}, `${pf} · q ${fmt(point.unit_discharge_m2s,2)} m²/s · Fr1 ${fmt(point.Fr1,2)} · forcing ${fmt(point.forcing_kW_m,1)} kW/m`));
      pointsLayer.append(circle);
    }
  }

  function update() {
    crossLayer.replaceChildren();
    const x = scale(qSelected, qRange[0], qRange[1], plot.x, plot.x + plot.w);
    const y = scale(frSelected, fRange[0], fRange[1], plot.y + plot.h, plot.y);
    crossLayer.append(svgEl('line', { x1:x, y1:plot.y, x2:x, y2:plot.y+plot.h, class:'p4-crosshair' }));
    crossLayer.append(svgEl('line', { x1:plot.x, y1:y, x2:plot.x+plot.w, y2:y, class:'p4-crosshair' }));
    crossLayer.append(svgEl('circle', { cx:x, cy:y, r:8, class:'p4-selected-point p4-selected-point--forcing' }));
    const relative = 100 * response(qSelected, frSelected) / responseMax;
    ui.readout.innerHTML = `<div class="p4-stat"><strong>${fmt(relative,0)}%</strong><span>relative fitted intensity vs plotted-domain maximum</span></div><div class="p4-stat"><strong>+${fmt(data.relationship.pct_effect_10pct_q,1)}%</strong><span>forcing for +10% q</span></div><div class="p4-stat"><strong>+${fmt(data.relationship.pct_effect_10pct_Fr1,1)}%</strong><span>forcing for +10% Fr1</span></div>`;
    ui.summary.textContent = `The frozen fitted relationship is P′ ∝ q^${fmt(a,2)} Fr1^${fmt(b,2)} with R² ≈ ${fmt(data.relationship.r2,4)}. The background is a relative fitted-response surface; absolute forcing is shown only on the audited source points.`;
  }

  drawPoints();
  const qControl = makeRangeControl({ label:'Unit discharge q', min:qRange[0], max:qRange[1], value:qSelected, step:(qRange[1]-qRange[0])/100, unit:'m²/s', onInput:(v)=>{qSelected=v;update();} });
  const frControl = makeRangeControl({ label:'Froude number Fr1', min:fRange[0], max:fRange[1], value:frSelected, step:(fRange[1]-fRange[0])/100, onInput:(v)=>{frSelected=v;update();} });
  const familyControl = makeSelectControl({ label:'Display source family', value:'ALL', options:[{value:'ALL',label:'All sampled families'}, ...['F1','F2','F3','F4'].map(v=>({value:v,label:v}))], onChange:(v)=>{family=v;drawPoints();} });
  ui.controls.append(qControl.wrap, frControl.wrap, familyControl.wrap);
  update();
  observeOnce(mount, () => mount.classList.add('p4-entered'));
}

export function renderFig06(mount, data) {
  if (!data.ranges?.structure_height_m || !data.ranges?.top_width_m || !data.ranges?.downstream_slope_h_per_v) throw new Error('FIG-06 runtime contract is missing study ranges.');
  const ui = frameFigure(mount, {
    id: 'FIG-06',
    title: 'Height × slope → body area',
    kicker: 'The exact geometry identity links an analytical response field to the section itself.',
    caveat: data.caveat || 'Body area is a material proxy, not reinforcement quantity, foundation quantity or construction cost.'
  });
  const svg = makeSvg(ui.canvas, '0 0 820 480', 'Interactive body-area response field with linked trapezoidal weir section.');
  const plot = { x: 70, y: 48, w: 430, h: 310 };
  const section = { x: 560, y: 115, w: 210, h: 235 };
  const pRange = data.ranges.structure_height_m, tRange = data.ranges.top_width_m, sRange = data.ranges.downstream_slope_h_per_v;
  let P = (pRange[0] + pRange[1]) / 2;
  let T = (tRange[0] + tRange[1]) / 2;
  let S = (sRange[0] + sRange[1]) / 2;
  const area = (p, t, s) => p * t + 0.5 * s * p * p;
  const areaMin = area(pRange[0], tRange[0], sRange[0]);
  const areaMax = area(pRange[1], tRange[1], sRange[1]);
  const gridLayer = svgEl('g');
  const sectionLayer = svgEl('g');
  const crossLayer = svgEl('g');
  svg.append(gridLayer, crossLayer, sectionLayer);
  svg.append(svgEl('text', { x:plot.x+plot.w/2, y:448, 'text-anchor':'middle', class:'p4-axis-label' }, 'Downstream slope s (H/V)'));
  svg.append(svgEl('text', { x:18, y:plot.y+plot.h/2, transform:`rotate(-90 18 ${plot.y+plot.h/2})`, 'text-anchor':'middle', class:'p4-axis-label' }, 'Structure height P (m)'));

  function drawGrid() {
    gridLayer.replaceChildren();
    const cols=16, rows=14;
    for (let row=0; row<rows; row++) {
      for (let col=0; col<cols; col++) {
        const p = pRange[1] - (row+.5)/rows*(pRange[1]-pRange[0]);
        const s = sRange[0] + (col+.5)/cols*(sRange[1]-sRange[0]);
        const z = area(p,T,s);
        gridLayer.append(svgEl('rect', { x:plot.x+col*plot.w/cols, y:plot.y+row*plot.h/rows, width:plot.w/cols+.5, height:plot.h/rows+.5, class:'p4-surface-cell p4-surface-cell--material', opacity:scale(z,areaMin,areaMax,.09,.88).toFixed(3) }));
      }
    }
  }

  function drawSection() {
    sectionLayer.replaceChildren();
    const heightPx = scale(P,pRange[0],pRange[1],105,220);
    const topPx = scale(T,tRange[0],tRange[1],48,86);
    const batterPx = scale(S,sRange[0],sRange[1],40,120);
    const yBase = section.y + section.h;
    const yTop = yBase - heightPx;
    const xLeft = section.x + 18;
    const xTopRight = xLeft + topPx;
    const xBaseRight = xTopRight + batterPx;
    sectionLayer.append(svgEl('path', { d:`M${xLeft},${yBase} L${xLeft},${yTop} L${xTopRight},${yTop} L${xBaseRight},${yBase} Z`, class:'p4-section-shape' }));
    sectionLayer.append(svgEl('line', { x1:xLeft-16,y1:yTop,x2:xLeft-16,y2:yBase,class:'p4-dimension' }));
    sectionLayer.append(svgEl('text', { x:xLeft-24,y:(yTop+yBase)/2,transform:`rotate(-90 ${xLeft-24} ${(yTop+yBase)/2})`,'text-anchor':'middle',class:'p4-small-label' }, `P ${fmt(P,2)} m`));
    sectionLayer.append(svgEl('text', { x:xLeft+topPx/2,y:yTop-14,'text-anchor':'middle',class:'p4-small-label' }, `T ${fmt(T,2)} m`));
    sectionLayer.append(svgEl('text', { x:xTopRight+batterPx*.55,y:yTop+heightPx*.55,class:'p4-small-label' }, `s ${fmt(S,2)}`));
  }

  function update() {
    drawGrid();
    drawSection();
    crossLayer.replaceChildren();
    const x=scale(S,sRange[0],sRange[1],plot.x,plot.x+plot.w);
    const y=scale(P,pRange[0],pRange[1],plot.y+plot.h,plot.y);
    crossLayer.append(svgEl('line',{x1:x,y1:plot.y,x2:x,y2:plot.y+plot.h,class:'p4-crosshair'}));
    crossLayer.append(svgEl('line',{x1:plot.x,y1:y,x2:plot.x+plot.w,y2:y,class:'p4-crosshair'}));
    crossLayer.append(svgEl('circle',{cx:x,cy:y,r:8,class:'p4-selected-point p4-selected-point--material'}));
    const A=area(P,T,S);
    const normalized=A/(P*P);
    const sobol = data.sobol || [];
    const byVar = Object.fromEntries(sobol.map(d=>[d.variable,d.ST]));
    ui.readout.innerHTML = `<div class="p4-stat"><strong>${fmt(A,2)} m²/m</strong><span>body-area proxy</span></div><div class="p4-stat"><strong>${fmt(normalized,3)}</strong><span>A/P²</span></div><div class="p4-sensitivity"><span>Global total effects</span><div><b style="--bar:${((byVar.structure_height_m || 0)*100).toFixed(1)}%">Height ${fmt(byVar.structure_height_m || 0,3)}</b><b style="--bar:${((byVar.downstream_slope_h_per_v || 0)*100).toFixed(1)}%">Slope ${fmt(byVar.downstream_slope_h_per_v || 0,3)}</b><b style="--bar:${((byVar.top_width_m || 0)*100).toFixed(1)}%">Top width ${fmt(byVar.top_width_m || 0,3)}</b></div></div>`;
    ui.summary.textContent = `At P ${fmt(P,2)} m, T ${fmt(T,2)} m and slope ${fmt(S,2)} H/V, the exact identity gives A ${fmt(A,2)} m²/m. Height enters the batter term quadratically, so its material penalty grows nonlinearly.`;
  }

  const pControl=makeRangeControl({label:'Height P',min:pRange[0],max:pRange[1],value:P,step:(pRange[1]-pRange[0])/100,unit:'m',onInput:(v)=>{P=v;update();}});
  const sControl=makeRangeControl({label:'Downstream slope s',min:sRange[0],max:sRange[1],value:S,step:(sRange[1]-sRange[0])/100,unit:'H/V',onInput:(v)=>{S=v;update();}});
  const tControl=makeRangeControl({label:'Top width T',min:tRange[0],max:tRange[1],value:T,step:(tRange[1]-tRange[0])/100,unit:'m',onInput:(v)=>{T=v;update();}});
  ui.controls.append(pControl.wrap,sControl.wrap,tControl.wrap);
  update();
  observeOnce(mount,()=>mount.classList.add('p4-entered'));
}


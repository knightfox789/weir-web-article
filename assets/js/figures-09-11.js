import { svgEl, htmlEl, frameFigure, makeSvg, observeOnce, makeSelectControl, fmt, scale, shortFamily } from './figure-core.js';

const FAMILY_LABEL = {
  F1: 'F1 · transition',
  F2: 'F2 · compact / intense',
  F3: 'F3 · taller balanced',
  F4: 'F4 · broad-base / low-forcing'
};
const FAMILY_CLASS = f => `p5-family--${String(f).toLowerCase()}`;

export function renderFig09(mount, data) {
  if (!Array.isArray(data.points) || !Array.isArray(data.envelopes)) throw new Error('FIG-09 requires display points and pooled family envelopes.');
  const ui = frameFigure(mount, {
    id: 'FIG-09',
    title: 'Normalized family map',
    kicker: 'A source-seed point sample is shown against pooled four-seed percentile envelopes.',
    caveat: data.caveat || 'Research families are fuzzy behavioural envelopes; F1 is especially a transition family.'
  });
  const svg = makeSvg(ui.canvas, '0 0 760 500', 'Normalized B over P versus T over P family point sample with pooled percentile envelopes.');
  const plot = { x: 82, y: 52, w: 600, h: 350 };
  const xVals = data.points.map(d => d.B_over_P); const yVals = data.points.map(d => d.T_over_P);
  data.envelopes.forEach(d => { xVals.push(d.B_over_P_p10, d.B_over_P_p90); yVals.push(d.T_over_P_p10, d.T_over_P_p90); });
  const xExt = [Math.max(0, Math.min(...xVals) * .93), Math.max(...xVals) * 1.05];
  const yExt = [Math.max(0, Math.min(...yVals) * .9), Math.max(...yVals) * 1.06];
  let selected = 'ALL'; let showEnvelope = true;
  const envelopeLayer = svgEl('g'); const pointLayer = svgEl('g'); const medianLayer = svgEl('g');
  svg.append(envelopeLayer, pointLayer, medianLayer);
  svg.append(svgEl('line', { x1: plot.x, y1: plot.y + plot.h, x2: plot.x + plot.w, y2: plot.y + plot.h, class: 'p5-axis' }));
  svg.append(svgEl('line', { x1: plot.x, y1: plot.y, x2: plot.x, y2: plot.y + plot.h, class: 'p5-axis' }));
  svg.append(svgEl('text', { x: plot.x + plot.w/2, y: 463, 'text-anchor':'middle', class:'p4-axis-label' }, 'Normalized base width B/P'));
  svg.append(svgEl('text', { x: 20, y: plot.y + plot.h/2, transform:`rotate(-90 20 ${plot.y + plot.h/2})`, 'text-anchor':'middle', class:'p4-axis-label' }, 'Normalized top width T/P'));

  function draw() {
    envelopeLayer.replaceChildren(); pointLayer.replaceChildren(); medianLayer.replaceChildren();
    if (showEnvelope) {
      data.envelopes.forEach(d => {
        const f = shortFamily(d.family);
        if (selected !== 'ALL' && f !== selected) return;
        const x1 = scale(d.B_over_P_p10,xExt[0],xExt[1],plot.x,plot.x+plot.w), x2=scale(d.B_over_P_p90,xExt[0],xExt[1],plot.x,plot.x+plot.w);
        const y1 = scale(d.T_over_P_p90,yExt[0],yExt[1],plot.y+plot.h,plot.y), y2=scale(d.T_over_P_p10,yExt[0],yExt[1],plot.y+plot.h,plot.y);
        envelopeLayer.append(svgEl('rect',{x:x1,y:y1,width:Math.max(2,x2-x1),height:Math.max(2,y2-y1),rx:'14',class:`p5-family-envelope ${FAMILY_CLASS(f)}`}));
        const xm=scale(d.B_over_P_p50,xExt[0],xExt[1],plot.x,plot.x+plot.w), ym=scale(d.T_over_P_p50,yExt[0],yExt[1],plot.y+plot.h,plot.y);
        medianLayer.append(svgEl('line',{x1:xm-9,y1:ym,x2:xm+9,y2:ym,class:`p5-family-median ${FAMILY_CLASS(f)}`}));
        medianLayer.append(svgEl('line',{x1:xm,y1:ym-9,x2:xm,y2:ym+9,class:`p5-family-median ${FAMILY_CLASS(f)}`}));
      });
    }
    data.points.forEach((d,i)=>{
      const f=shortFamily(d.family_neighborhood); const muted=selected!=='ALL'&&f!==selected;
      const c=svgEl('circle',{cx:scale(d.B_over_P,xExt[0],xExt[1],plot.x,plot.x+plot.w),cy:scale(d.T_over_P,yExt[0],yExt[1],plot.y+plot.h,plot.y),r:'5',class:`p5-family-point ${FAMILY_CLASS(f)}${muted?' is-muted':''}`,tabindex:'0',role:'img','aria-label':`${f}: B/P ${fmt(d.B_over_P,3)}, T/P ${fmt(d.T_over_P,3)}`});
      c.style.setProperty('--point-delay',`${i*10}ms`); pointLayer.append(c);
    });
    const selectedEnv = selected==='ALL' ? null : data.envelopes.find(d=>shortFamily(d.family)===selected);
    ui.readout.innerHTML = selectedEnv
      ? `<div class="p4-stat"><strong>${fmt(selectedEnv.share_pct,1)}%</strong><span>${selected} pooled family share</span></div><div class="p4-stat"><strong>${fmt(selectedEnv.B_over_P_p50,2)}</strong><span>median B/P</span></div><div class="p4-stat"><strong>${fmt(selectedEnv.T_over_P_p50,2)}</strong><span>median T/P</span></div>`
      : `<div class="p4-stat"><strong>${data.eligible_population.toLocaleString()}</strong><span>pooled eligible cases behind envelopes</span></div><div class="p4-stat"><strong>${data.display_population}</strong><span>source-seed points displayed</span></div><div class="p4-stat"><strong>4</strong><span>research families / envelopes</span></div>`;
    ui.summary.textContent = selectedEnv
      ? `${FAMILY_LABEL[selected]}. The rectangle spans pooled p10–p90 B/P and T/P; the cross marks the pooled median. It is an occupancy envelope, not a classification boundary.`
      : 'The 60 dots are a deterministic source-seed display sample; the translucent rectangles summarize the pooled four-seed p10–p90 family envelopes. F1 should be read as a fuzzy transition family.';
  }
  const familyControl=makeSelectControl({label:'Highlight family',value:'ALL',options:[{value:'ALL',label:'All families'},...['F1','F2','F3','F4'].map(v=>({value:v,label:FAMILY_LABEL[v]}))],onChange:v=>{selected=v;draw();}});
  const envButton=htmlEl('button','p4-button','Hide pooled envelopes'); envButton.type='button'; envButton.setAttribute('aria-pressed','true');
  envButton.addEventListener('click',()=>{showEnvelope=!showEnvelope;envButton.setAttribute('aria-pressed',String(showEnvelope));envButton.textContent=showEnvelope?'Hide pooled envelopes':'Show pooled envelopes';draw();});
  const envWrap=htmlEl('div','p4-control');envWrap.append(htmlEl('span','p4-control__label','Envelope layer'),envButton);
  ui.controls.append(familyControl.wrap,envWrap); draw(); observeOnce(mount,()=>mount.classList.add('p4-entered','p5-entered'));
}

const TRADE_METRICS = [
  {key:'body_area_m2_per_m',label:'Body area',unit:'m²/m'},
  {key:'forcing_kW_m',label:'Forcing',unit:'kW/m'},
  {key:'tailwater_mismatch',label:'Tailwater mismatch',unit:''},
  {key:'rock_threshold_ratio',label:'Rock threshold ratio',unit:''},
  {key:'slide_partial_factor_response',label:'Sliding diagnostic',unit:''},
  {key:'flotation_ratio_diagnostic',label:'Flotation diagnostic',unit:''}
];

export function renderFig10(mount,data){
  if(!Array.isArray(data.families)||data.families.length!==4) throw new Error('FIG-10 requires four pooled family summaries.');
  const ui=frameFigure(mount,{id:'FIG-10',title:'Family trade-off dashboard',kicker:'Aligned p10–p90 ranges expose exchanges across responses without collapsing them into one score.',caveat:data.caveat||'Synthetic trade-offs, not economic or site-specific optima.'});
  const svg=makeSvg(ui.canvas,'0 0 900 620','Aligned family percentile ranges for material, hydraulic, foundation and stability diagnostics.');
  let selected='ALL';
  const left=190,right=820,rowH=88;
  const familyOffsets={F1:-12,F2:-4,F3:4,F4:12};
  function draw(){
    svg.replaceChildren();
    TRADE_METRICS.forEach((m,mi)=>{
      const y=62+mi*rowH; const vals=data.families.flatMap(d=>[d[`${m.key}_p10`],d[`${m.key}_p90`]]).filter(Number.isFinite); const lo=Math.min(...vals),hi=Math.max(...vals);
      svg.append(svgEl('text',{x:left-18,y:y+5,'text-anchor':'end',class:'p4-label'},m.label));
      svg.append(svgEl('line',{x1:left,y1:y,x2:right,y2:y,class:'p5-metric-baseline'}));
      data.families.forEach(d=>{
        const f=shortFamily(d.family); const muted=selected!=='ALL'&&selected!==f;
        const yy=y+familyOffsets[f]; const x10=scale(d[`${m.key}_p10`],lo,hi,left,right),x50=scale(d[`${m.key}_p50`],lo,hi,left,right),x90=scale(d[`${m.key}_p90`],lo,hi,left,right);
        const g=svgEl('g',{class:`p5-trade-row ${FAMILY_CLASS(f)}${muted?' is-muted':''}`});
        g.append(svgEl('line',{x1:x10,y1:yy,x2:x90,y2:yy,class:'p5-range'}));
        g.append(svgEl('circle',{cx:x50,cy:yy,r:'5.5',class:'p5-range-dot'}));
        g.append(svgEl('title',{},`${f} · ${m.label}: p10 ${fmt(d[`${m.key}_p10`],3)}, p50 ${fmt(d[`${m.key}_p50`],3)}, p90 ${fmt(d[`${m.key}_p90`],3)}${m.unit?` ${m.unit}`:''}`)); svg.append(g);
      });
      svg.append(svgEl('text',{x:left,y:y+36,class:'p4-tick'},fmt(lo,2))); svg.append(svgEl('text',{x:right,y:y+36,'text-anchor':'end',class:'p4-tick'},`${fmt(hi,2)}${m.unit?` ${m.unit}`:''}`));
    });
    const family=data.families.find(d=>shortFamily(d.family)===selected);
    ui.readout.innerHTML=family?`<div class="p4-stat"><strong>${selected}</strong><span>${FAMILY_LABEL[selected]}</span></div><div class="p4-stat"><strong>${family.n.toLocaleString()}</strong><span>pooled cases in family</span></div><div class="p4-stat"><strong>${fmt(family.forcing_kW_m_p50,1)} kW/m</strong><span>median forcing; one metric among several</span></div>`:`<div class="p4-stat"><strong>${data.families.reduce((s,d)=>s+d.n,0).toLocaleString()}</strong><span>pooled cases across families</span></div><div class="p4-stat"><strong>p10–p90</strong><span>range shown for each family/metric</span></div><div class="p4-stat"><strong>no winner</strong><span>metrics are not collapsed into one optimum</span></div>`;
    ui.summary.textContent=family?`${FAMILY_LABEL[selected]} is highlighted across all six response rows. A favourable position on one row can coincide with a less favourable position on another; this is the trade-off structure.`:'Each row has its own scale. Compare families within a row, then look across rows for trade-offs; do not read horizontal position across different metrics as a common utility score.';
  }
  const select=makeSelectControl({label:'Highlight family',value:'ALL',options:[{value:'ALL',label:'All families'},...['F1','F2','F3','F4'].map(v=>({value:v,label:FAMILY_LABEL[v]}))],onChange:v=>{selected=v;draw();}}); ui.controls.append(select.wrap); draw(); observeOnce(mount,()=>mount.classList.add('p4-entered','p5-entered'));
}

export function renderFig11(mount,data){
  if(!Array.isArray(data.shares)||!Array.isArray(data.seeds)) throw new Error('FIG-11 requires seed × family shares.');
  const ui=frameFigure(mount,{id:'FIG-11',title:'Family-share replication',kicker:'Independent seeds move the family shares only modestly; that stability is about occupancy, not exact Pareto membership.',caveat:data.caveat||'Stable occupancy does not imply fixed Pareto membership.'});
  const svg=makeSvg(ui.canvas,'0 0 820 500','Family shares across four independent synthetic seeds with mean and range annotations.');
  const plot={x:90,y:52,w:560,h:330}; let highlightedSeed='ALL';
  const sharesByFamily={}; ['F1','F2','F3','F4'].forEach(f=>sharesByFamily[f]=data.shares.filter(d=>shortFamily(d.family)===f).sort((a,b)=>a.seed-b.seed));
  const yMax=Math.max(...data.shares.map(d=>d.share_pct))*1.08;
  function draw(){
    svg.replaceChildren(); svg.append(svgEl('line',{x1:plot.x,y1:plot.y+plot.h,x2:plot.x+plot.w,y2:plot.y+plot.h,class:'p5-axis'})); svg.append(svgEl('line',{x1:plot.x,y1:plot.y,x2:plot.x,y2:plot.y+plot.h,class:'p5-axis'}));
    data.seeds.forEach((seed,i)=>{const x=scale(i,0,data.seeds.length-1,plot.x,plot.x+plot.w);svg.append(svgEl('text',{x,y:plot.y+plot.h+25,'text-anchor':'middle',class:'p4-tick'},String(seed).slice(-2)));if(highlightedSeed!=='ALL'&&String(seed)===String(highlightedSeed))svg.append(svgEl('line',{x1:x,y1:plot.y,x2:x,y2:plot.y+plot.h,class:'p5-seed-highlight'}));});
    [0,10,20,30,40,50].forEach(v=>{const y=scale(v,0,yMax,plot.y+plot.h,plot.y);svg.append(svgEl('text',{x:plot.x-12,y:y+4,'text-anchor':'end',class:'p4-tick'},`${v}%`));});
    ['F1','F2','F3','F4'].forEach((f,fi)=>{const rows=sharesByFamily[f];const points=rows.map((d,i)=>[scale(i,0,data.seeds.length-1,plot.x,plot.x+plot.w),scale(d.share_pct,0,yMax,plot.y+plot.h,plot.y)]);const path=points.map((p,i)=>`${i?'L':'M'}${p[0]},${p[1]}`).join(' ');const line=svgEl('path',{d:path,class:`p5-share-line ${FAMILY_CLASS(f)}`,pathLength:'1'});line.style.setProperty('--line-delay',`${fi*120}ms`);svg.append(line);rows.forEach((d,i)=>{const [x,y]=points[i];const muted=highlightedSeed!=='ALL'&&String(d.seed)!==String(highlightedSeed);const c=svgEl('circle',{cx:x,cy:y,r:'6',class:`p5-share-dot ${FAMILY_CLASS(f)}${muted?' is-muted':''}`,tabindex:'0',role:'img','aria-label':`${f}, seed ${d.seed}, share ${fmt(d.share_pct,2)} percent`});c.style.setProperty('--point-delay',`${(fi*4+i)*60}ms`);svg.append(c);});
      const values=rows.map(d=>d.share_pct);const mean=values.reduce((a,b)=>a+b,0)/values.length;const min=Math.min(...values),max=Math.max(...values);const yMean=scale(mean,0,yMax,plot.y+plot.h,plot.y);svg.append(svgEl('text',{x:675,y:yMean+4,class:`p5-share-annotation ${FAMILY_CLASS(f)}`},`${f} mean ${fmt(mean,1)}% · range ${fmt(max-min,1)} pp`));
    });
    const seedRows=highlightedSeed==='ALL'?null:data.shares.filter(d=>String(d.seed)===String(highlightedSeed)).sort((a,b)=>b.share_pct-a.share_pct);
    ui.readout.innerHTML=seedRows?seedRows.slice(0,3).map(d=>`<div class="p4-stat"><strong>${fmt(d.share_pct,1)}%</strong><span>${shortFamily(d.family)} · seed ${String(d.seed).slice(-2)}</span></div>`).join(''):`<div class="p4-stat"><strong>4</strong><span>independent 50K seeds</span></div><div class="p4-stat"><strong>10,317</strong><span>eligible family-assigned cases pooled</span></div><div class="p4-stat"><strong>modest</strong><span>seed-to-seed occupancy movement</span></div>`;
    ui.summary.textContent=highlightedSeed==='ALL'?'The connecting lines show each family’s share across four independent seeds. The right-side annotations summarize mean share and total range in percentage points.':'The selected seed is highlighted; the family lines remain visible so its shares can be read against the replication pattern.';
  }
  const seedSelect=makeSelectControl({label:'Highlight seed',value:'ALL',options:[{value:'ALL',label:'All seeds'},...data.seeds.map(v=>({value:String(v),label:`Seed ${v}`}))],onChange:v=>{highlightedSeed=v;draw();}});ui.controls.append(seedSelect.wrap);draw();observeOnce(mount,()=>mount.classList.add('p4-entered','p5-entered'));
}

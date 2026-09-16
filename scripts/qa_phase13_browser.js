#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { chromium, firefox, webkit } = require('playwright');

const BASE = process.env.PHASE13_URL || 'https://knightfox789.github.io/weir-web-article/';
const OUT = process.env.PHASE13_OUT || path.resolve('phase13-artifacts');
fs.mkdirSync(OUT, { recursive: true });

const scenarios = [
  { name: 'chromium-desktop', engine: 'chromium', viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference', mobile: false },
  { name: 'chromium-mobile-reduced', engine: 'chromium', viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', mobile: true },
  { name: 'firefox-desktop', engine: 'firefox', viewport: { width: 1366, height: 900 }, reducedMotion: 'no-preference', mobile: false },
  { name: 'webkit-mobile', engine: 'webkit', viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference', mobile: true }
];
const engines = { chromium, firefox, webkit };
const report = { phase: 13, generated_at: new Date().toISOString(), url: BASE, scenarios: [], summary: { checks: 0, passed: 0, failed: 0 } };

function addCheck(s, name, pass, detail = '') {
  const rec = { name, pass: Boolean(pass), detail: String(detail || '') };
  s.checks.push(rec); report.summary.checks++;
  if (rec.pass) report.summary.passed++; else report.summary.failed++;
}
async function safeCheck(s, name, fn) {
  try {
    const r = await fn();
    if (r && typeof r === 'object' && Object.prototype.hasOwnProperty.call(r, 'pass')) addCheck(s, name, r.pass, r.detail || '');
    else addCheck(s, name, Boolean(r), typeof r === 'string' ? r : '');
  } catch (e) { addCheck(s, name, false, e?.stack || e?.message || String(e)); }
}
async function waitFigure(page, id) {
  const sel = `#${id}`; const loc = page.locator(sel); await loc.scrollIntoViewIfNeeded();
  await page.waitForFunction(s => { const e = document.querySelector(s); return e && ['ready','error'].includes(e.dataset.renderState); }, sel, { timeout: 20000 });
  return loc.getAttribute('data-render-state');
}
async function explorer(page, s) {
  const fig = page.locator('#fig-17'); await fig.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('#fig-17')?.dataset.renderState === 'ready', null, { timeout: 20000 });
  const sels = fig.locator('.p9-explorer-controls select');
  addCheck(s, 'FIG-17 has evidence + display selectors', await sels.count() === 2, `count=${await sels.count()}`);
  const evidence = sels.nth(0), display = sels.nth(1);
  const opts = await evidence.locator('option').evaluateAll(o => o.map(x => ({ value:x.value, text:x.textContent })));
  addCheck(s, 'FIG-17 exposes exactly nine released evidence views', opts.length === 9, `count=${opts.length}`);
  for (const opt of opts) {
    await evidence.selectOption(opt.value);
    const figId = opt.text.split(' — ')[0];
    await page.waitForFunction(expected => document.querySelector('#fig-17 .p4-figure__summary')?.textContent.includes(expected), figId, { timeout: 15000 });
    addCheck(s, `FIG-17 loads ${figId}`, await fig.locator('.p4-error').count() === 0, opt.value);
  }
  await display.selectOption('table'); await page.waitForSelector('#fig-17 .p9-table', { timeout: 10000 });
  addCheck(s, 'FIG-17 released-row table mode renders', await fig.locator('.p9-table').count() === 1);
  await display.selectOption('chart'); await page.waitForSelector('#fig-17 svg', { timeout: 10000 });
  addCheck(s, 'FIG-17 annotated-summary chart mode restores', await fig.locator('svg').count() >= 1);
  const p = page.waitForEvent('download', { timeout: 10000 }); await fig.locator('.p9-download').click(); const d = await p;
  addCheck(s, 'FIG-17 download is released JSON', d.suggestedFilename().endsWith('.json'), d.suggestedFilename());
}

async function run(cfg) {
  const s = { name:cfg.name, engine:cfg.engine, viewport:cfg.viewport, reducedMotion:cfg.reducedMotion, checks:[], console_errors:[], page_errors:[], request_failures:[], data_responses:[] };
  report.scenarios.push(s);
  const browser = await engines[cfg.engine].launch({ headless:true });
  const context = await browser.newContext({ viewport:cfg.viewport, reducedMotion:cfg.reducedMotion, hasTouch:cfg.mobile, isMobile:cfg.mobile && cfg.engine !== 'firefox', acceptDownloads:true, colorScheme:'light' });
  const page = await context.newPage();
  page.on('console', m => { if (m.type() === 'error') s.console_errors.push(m.text()); });
  page.on('pageerror', e => s.page_errors.push(e.message));
  page.on('requestfailed', r => s.request_failures.push({ url:r.url(), error:r.failure()?.errorText || 'failed' }));
  page.on('response', r => { if (/\/data\/(runtime|metadata)\//.test(r.url())) s.data_responses.push({ url:r.url(), status:r.status() }); });
  try {
    let response;
    await safeCheck(s, 'deployed page returns HTTP 200', async () => { response = await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:45000}); return {pass:response?.status()===200,detail:`status=${response?.status()}`}; });
    await page.waitForTimeout(400);
    await safeCheck(s, 'document title is correct', async () => (await page.title()).includes('What Really Controls a Small Weir?'));
    await safeCheck(s, 'canonical URL points to current Pages site', async () => (await page.locator('link[rel="canonical"]').getAttribute('href')) === BASE);
    await safeCheck(s, 'Open Graph URL points to current Pages site', async () => (await page.locator('meta[property="og:url"]').getAttribute('content')) === BASE);
    await safeCheck(s, '17 figure mounts are present', async () => ({pass:await page.locator('[data-figure]').count()===17,detail:`count=${await page.locator('[data-figure]').count()}`}));
    await safeCheck(s, '17 article chapters are present', async () => ({pass:await page.locator('[data-chapter]').count()===17,detail:`count=${await page.locator('[data-chapter]').count()}`}));
    await safeCheck(s, 'chapter drawer opens', async () => { const b=page.locator('[data-menu-button]'); await b.click(); return (await b.getAttribute('aria-expanded'))==='true'; });
    await safeCheck(s, 'Escape closes drawer and restores trigger focus', async () => { const b=page.locator('[data-menu-button]'); await page.keyboard.press('Escape'); const ex=await b.getAttribute('aria-expanded'); const f=await page.evaluate(()=>document.activeElement===document.querySelector('[data-menu-button]')); return {pass:ex==='false'&&f,detail:`expanded=${ex}, focused=${f}`}; });
    if (cfg.mobile) {
      await safeCheck(s, 'mobile root has no unintended horizontal overflow', async () => page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2));
      await safeCheck(s, 'mobile chapter control meets 44px touch target', async () => { const b=await page.locator('[data-menu-button]').boundingBox(); return {pass:!!b&&b.height>=44&&b.width>=44,detail:b?`${Math.round(b.width)}x${Math.round(b.height)}`:'no box'}; });
    } else await safeCheck(s, 'desktop primary navigation is visible', async () => page.locator('.site-header__links').isVisible());
    if (cfg.reducedMotion==='reduce') await safeCheck(s, 'reduced-motion media query is active', async () => page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches));

    for (let i=1;i<=17;i++) {
      const id=`fig-${String(i).padStart(2,'0')}`;
      await safeCheck(s, `${id.toUpperCase()} renders without figure error`, async () => { const state=await waitFigure(page,id); const err=await page.locator(`#${id} .p4-error`).count(); const caveat=await page.locator(`#${id} .p4-figure__caveat`).count(); return {pass:state==='ready'&&err===0&&caveat===1,detail:`state=${state}, errors=${err}, caveat=${caveat}`}; });
    }
    await safeCheck(s, 'all mount data sources returned successful HTTP responses', async () => { const src=await page.locator('[data-figure]').evaluateAll(n=>n.map(x=>new URL(x.dataset.source,document.baseURI).href)); const ok=new Map(s.data_responses.map(r=>[r.url,r.status])); const miss=src.filter(x=>!ok.has(x)||ok.get(x)<200||ok.get(x)>=300); return {pass:miss.length===0,detail:miss.length?miss.join(', '):`${src.length}/17 sources successful`}; });
    await safeCheck(s, 'FIG-04 slider interaction updates readout', async () => { const f=page.locator('#fig-04'); await f.scrollIntoViewIfNeeded(); const i=f.locator('input[type="range"]').first(); const before=await f.locator('.p4-figure__readout').innerText(); await i.evaluate(el=>{el.value=String(Number(el.min)+(Number(el.max)-Number(el.min))*.8);el.dispatchEvent(new Event('input',{bubbles:true}));}); return before!==await f.locator('.p4-figure__readout').innerText(); });
    await safeCheck(s, 'FIG-12 scrubber interaction updates jump readout', async () => { const f=page.locator('#fig-12'); await f.scrollIntoViewIfNeeded(); const i=f.locator('input[type="range"]').first(); const before=await f.locator('.p4-figure__readout').innerText(); await i.evaluate(el=>{el.value=el.max;el.dispatchEvent(new Event('input',{bubbles:true}));}); return before!==await f.locator('.p4-figure__readout').innerText(); });
    await safeCheck(s, 'FIG-16 synthesis controls reach all-five state', async () => { const f=page.locator('#fig-16'); await f.scrollIntoViewIfNeeded(); const b=f.locator('button[data-stage="all"]'); await b.click(); return (await b.getAttribute('aria-pressed'))==='true' && (await f.locator('.p8-synthesis-card').innerText()).includes('All five dimensions connected'); });
    await safeCheck(s, 'FIG-17 explorer interactions and download pass', async () => { await explorer(page,s); return true; });
    await safeCheck(s, 'no uncaught page errors', async () => ({pass:s.page_errors.length===0,detail:s.page_errors.join(' | ')}));
    await safeCheck(s, 'no browser console errors', async () => ({pass:s.console_errors.length===0,detail:s.console_errors.join(' | ')}));
    await safeCheck(s, 'no failed same-origin article requests', async () => { const x=s.request_failures.filter(r=>r.url.startsWith(BASE)); return {pass:x.length===0,detail:x.map(r=>`${r.url}: ${r.error}`).join(' | ')}; });
    await safeCheck(s, 'final root has no unintended horizontal overflow', async () => page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2));
    await page.evaluate(()=>window.scrollTo(0,0)); await page.screenshot({path:path.join(OUT,`${cfg.name}-top.png`),fullPage:false});
    await page.locator('#fig-17').scrollIntoViewIfNeeded(); await page.screenshot({path:path.join(OUT,`${cfg.name}-explorer.png`),fullPage:false});
  } catch(e) { addCheck(s,'scenario execution completed',false,e?.stack||e?.message||String(e)); try{await page.screenshot({path:path.join(OUT,`${cfg.name}-failure.png`),fullPage:false});}catch{} }
  finally { await context.close(); await browser.close(); }
}

(async()=>{
  for(const s of scenarios) await run(s);
  report.completed_at=new Date().toISOString(); report.summary.pass=report.summary.failed===0;
  fs.writeFileSync(path.join(OUT,'PHASE_13_BROWSER_REPORT.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report.summary)); process.exit(report.summary.pass?0:1);
})().catch(e=>{ report.fatal_error=e?.stack||e?.message||String(e); report.summary.failed++; report.summary.pass=false; fs.writeFileSync(path.join(OUT,'PHASE_13_BROWSER_REPORT.json'),JSON.stringify(report,null,2)); console.error(e); process.exit(1); });

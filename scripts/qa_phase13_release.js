#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.PHASE13_URL || 'https://knightfox789.github.io/weir-web-article/';
const OUT = process.env.PHASE13_OUT || path.resolve('phase13-artifacts');
fs.mkdirSync(OUT, { recursive: true });
const result = { phase: 13, type: 'release-link-visual', url: BASE, checks: [], passed: 0, failed: 0 };
function check(name, pass, detail='') { const r={name,pass:Boolean(pass),detail:String(detail||'')}; result.checks.push(r); if(r.pass)result.passed++;else result.failed++; }

(async()=>{
  const browser = await chromium.launch({headless:true});
  const ctx = await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'light'});
  const page = await ctx.newPage();
  const response = await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:45000});
  check('release page HTTP 200', response?.status()===200, `status=${response?.status()}`);

  const internal = await page.locator('a[href^="#"]').evaluateAll(as => as.map(a=>a.getAttribute('href')));
  const missing = await page.evaluate(hrefs => hrefs.filter(h => h && h !== '#' && !document.querySelector(h)), internal);
  check('all internal hash links resolve to live targets', missing.length===0, missing.join(', '));

  const externals = await page.locator('a[href^="http"]').evaluateAll(as => as.map(a=>({href:a.href,text:(a.textContent||'').trim()})));
  const badExternal = externals.filter(x => { try { const u=new URL(x.href); return u.protocol!=='https:'; } catch { return true; } });
  check('all external article links use valid HTTPS URLs', badExternal.length===0, badExternal.map(x=>x.href).join(', '));
  const hosts = [...new Set(externals.map(x=>{try{return new URL(x.href).hostname}catch{return ''}}).filter(Boolean))];
  check('author LinkedIn link is present', hosts.some(h=>h==='www.linkedin.com'||h==='linkedin.com'), hosts.join(', '));
  check('author portfolio link is present', externals.some(x=>x.href.includes('knightfox789.github.io/kaushal-gadariya-portfolio')), externals.map(x=>x.href).join(', '));

  const sourcePaths = await page.locator('[data-figure]').evaluateAll(ns=>ns.map(n=>n.dataset.source));
  check('FIG-01 through FIG-17 expose 17 unique release data paths', sourcePaths.length===17 && new Set(sourcePaths).size===17, `${sourcePaths.length} paths`);

  await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';document.body.style.scrollBehavior='auto';window.scrollTo(0,0);});
  await page.waitForTimeout(150);
  check('deterministic top screenshot is at scrollY 0', (await page.evaluate(()=>window.scrollY))===0, `scrollY=${await page.evaluate(()=>window.scrollY)}`);
  await page.screenshot({path:path.join(OUT,'release-desktop-top.png'),fullPage:false});

  const fig12=page.locator('#fig-12'); await fig12.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('#fig-12')?.dataset.renderState==='ready',null,{timeout:20000});
  await page.waitForTimeout(100); await page.screenshot({path:path.join(OUT,'release-desktop-fig12.png'),fullPage:false});
  check('FIG-12 representative release view is ready', await fig12.getAttribute('data-render-state')==='ready');

  const fig17=page.locator('#fig-17'); await fig17.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('#fig-17')?.dataset.renderState==='ready',null,{timeout:20000});
  await page.waitForTimeout(100); await page.screenshot({path:path.join(OUT,'release-desktop-explorer.png'),fullPage:false});
  check('FIG-17 representative release view is ready', await fig17.getAttribute('data-render-state')==='ready');

  result.total=result.checks.length; result.pass=result.failed===0; result.completed_at=new Date().toISOString();
  fs.writeFileSync(path.join(OUT,'PHASE_13_RELEASE_CHECKS.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify({checks:result.total,passed:result.passed,failed:result.failed,pass:result.pass}));
  await ctx.close(); await browser.close(); process.exit(result.pass?0:1);
})().catch(async e=>{result.fatal_error=e?.stack||String(e);result.failed++;result.pass=false;fs.writeFileSync(path.join(OUT,'PHASE_13_RELEASE_CHECKS.json'),JSON.stringify(result,null,2));console.error(e);process.exit(1);});

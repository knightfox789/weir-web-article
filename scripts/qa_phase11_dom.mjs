import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

class StyleDecl { constructor(){this.map=new Map();} setProperty(k,v){this.map.set(k,String(v));} getPropertyValue(k){return this.map.get(k)||'';} }
class ClassList { constructor(node){this.node=node;} _set(){return new Set((this.node.className||'').split(/\s+/).filter(Boolean));} _write(s){this.node.className=[...s].join(' ');} add(...n){const s=this._set();n.forEach(x=>s.add(x));this._write(s);} remove(...n){const s=this._set();n.forEach(x=>s.delete(x));this._write(s);} contains(n){return this._set().has(n);} toggle(n,force){const s=this._set();const add=force===undefined?!s.has(n):!!force;add?s.add(n):s.delete(n);this._write(s);return add;} }
function camelData(s){return s.replace(/-([a-z])/g,(_,c)=>c.toUpperCase());}
class NodeEl {
  constructor(tag='div',ns='html'){this.tagName=String(tag).toUpperCase();this.namespaceURI=ns;this.children=[];this.parentNode=null;this.attributes={};this.dataset={};this.style=new StyleDecl();this.className='';this.classList=new ClassList(this);this.listeners={};this._text='';this._html='';this.value='';this.type='';this.selected=false;this.disabled=false;this.focused=false;}
  append(...nodes){for(const n of nodes){if(n==null)continue;if(typeof n==='string'){const t=new NodeEl('#text');t.textContent=n;this.children.push(t);t.parentNode=this;}else{this.children.push(n);n.parentNode=this;}}}
  appendChild(n){this.append(n);return n;} replaceChildren(...nodes){this.children=[];this._text='';this._html='';this.append(...nodes);} before(n){ if(!this.parentNode)return; const i=this.parentNode.children.indexOf(this); if(i>=0){this.parentNode.children.splice(i,0,n);n.parentNode=this.parentNode;} }
  set textContent(v){this._text=String(v??'');this._html='';this.children=[];} get textContent(){if(this._text)return this._text;if(this._html)return this._html.replace(/<[^>]+>/g,'');return this.children.map(c=>c.textContent).join('');}
  set innerHTML(v){this._html=String(v??'');this._text='';this.children=[];} get innerHTML(){return this._html||this.children.map(c=>c.textContent).join('');}
  setAttribute(k,v){this.attributes[k]=String(v);if(k==='class')this.className=String(v);if(k.startsWith('data-'))this.dataset[camelData(k.slice(5))]=String(v);} getAttribute(k){return this.attributes[k]??(k==='class'?this.className:null);} removeAttribute(k){delete this.attributes[k]; if(k.startsWith('data-')) delete this.dataset[camelData(k.slice(5))];}
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);} dispatchEvent(evt){const e=typeof evt==='string'?{type:evt}:evt;e.target=this;for(const fn of this.listeners[e.type]||[])fn.call(this,e);return true;} click(){this.dispatchEvent({type:'click'});} focus(){this.focused=true;}
  matches(sel){ if(sel.startsWith('.'))return this.classList.contains(sel.slice(1)); const attr=sel.match(/^([a-zA-Z0-9_-]+)?\[([^\]=]+)(?:=["']?([^\]"']+)["']?)?\]$/); if(attr){const[,tag,key,val]=attr;if(tag&&this.tagName!==tag.toUpperCase())return false;const got=this.getAttribute(key);return val===undefined?got!==null:got===val;} return this.tagName===sel.toUpperCase(); }
  querySelectorAll(sel){const out=[];const walk=n=>{for(const c of n.children){if(c.matches?.(sel))out.push(c);walk(c);}};walk(this);return out;} querySelector(sel){return this.querySelectorAll(sel)[0]||null;}
}
class DocumentFake { constructor(){this.head=new NodeEl('head');this.body=new NodeEl('body');} createElement(t){return new NodeEl(t);} createElementNS(ns,t){return new NodeEl(t,ns);} querySelectorAll(sel){return [...this.head.querySelectorAll(sel),...this.body.querySelectorAll(sel)];} querySelector(sel){return this.querySelectorAll(sel)[0]||null;} }
const document=new DocumentFake();
const window={matchMedia:()=>({matches:false})};
globalThis.document=document;globalThis.window=window;

const observers=[];
class FakeIntersectionObserver { constructor(cb,opts){this.cb=cb;this.opts=opts;this.targets=[];observers.push(this);} observe(t){this.targets.push(t);} unobserve(t){this.targets=this.targets.filter(x=>x!==t);} disconnect(){this.targets=[];} trigger(target,isIntersecting=true){this.cb([{target,isIntersecting,intersectionRatio:isIntersecting?1:0}]);} }
globalThis.IntersectionObserver=FakeIntersectionObserver;window.IntersectionObserver=FakeIntersectionObserver;

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let fetchCount=0; const fetched=[];
globalThis.fetch=async (source)=>{fetchCount++;fetched.push(String(source));const p=path.join(ROOT,String(source));return {ok:true,status:200,json:async()=>JSON.parse(fs.readFileSync(p,'utf8'))};};

function makeMount(fig,src){const m=new NodeEl('div');m.setAttribute('data-figure',fig);m.setAttribute('data-source',src);document.body.append(m);return m;}
const m3=makeMount('FIG-03','data/runtime/fig-03-experiment-scale.json');
const m4=makeMount('FIG-04','data/runtime/fig-04-head-response.json');
const checks=[];function ck(name,cond,detail=''){checks.push({name,pass:!!cond,detail});if(!cond)console.error('FAIL',name,detail);} const wait=()=>new Promise(r=>setTimeout(r,0));

const {initPhase4Figures}=await import('../assets/js/figures.js');
initPhase4Figures();
ck('Scheduler creates an IntersectionObserver',observers.length>=1,String(observers.length));
const scheduler=observers[0];
ck('Scheduler uses 600px prefetch root margin',scheduler.opts?.rootMargin==='600px 0px',scheduler.opts?.rootMargin);
ck('Both figure mounts are observed before load',scheduler.targets.includes(m3)&&scheduler.targets.includes(m4),String(scheduler.targets.length));
ck('No figure JSON fetched before viewport trigger',fetchCount===0,String(fetchCount));
ck('Unseen figures remain in placeholder state',!m4.classList.contains('is-live'));

scheduler.trigger(m3,true);
ck('Triggered figure is unobserved immediately',!scheduler.targets.includes(m3));
ck('Loading state is set synchronously',m3.dataset.renderState==='loading',m3.dataset.renderState);
ck('aria-busy is set while data loads',m3.getAttribute('aria-busy')==='true',m3.getAttribute('aria-busy'));
await wait(); await wait();
ck('Only triggered figure fetched after first trigger',fetchCount===1,String(fetchCount));
ck('Triggered figure fetched correct released asset',fetched[0]==='data/runtime/fig-03-experiment-scale.json',fetched[0]);
ck('Triggered figure reaches ready state',m3.dataset.renderState==='ready',m3.dataset.renderState);
ck('aria-busy is removed after render',m3.getAttribute('aria-busy')===null,String(m3.getAttribute('aria-busy')));
ck('Triggered figure becomes live',m3.classList.contains('is-live'));
ck('Second figure still not fetched',m4.dataset.renderState===undefined,String(m4.dataset.renderState));

scheduler.trigger(m4,true); await wait(); await wait();
ck('Second figure fetches only when triggered',fetchCount===2,String(fetchCount));
ck('Second figure reaches ready state',m4.dataset.renderState==='ready',m4.dataset.renderState);
ck('Second figure becomes live',m4.classList.contains('is-live'));

const linkHrefs=document.head.children.filter(n=>n.tagName==='LINK').map(n=>n.href||n.getAttribute('href'));
ck('Figure styles are injected once per phase group',document.head.children.filter(n=>n.tagName==='LINK').length===6,String(document.head.children.length));
ck('Base figure stylesheet is present',linkHrefs.includes('assets/css/figures.css'));
ck('Phase 9 stylesheet is present',linkHrefs.includes('assets/css/figures-phase9.css'));

const result={phase:11,kind:'dom_lazy_rendering',checks_total:checks.length,checks_passed:checks.filter(c=>c.pass).length,checks_failed:checks.filter(c=>!c.pass).length,checks};
fs.writeFileSync(path.join(ROOT,'docs/audits/PHASE_11_DOM_QA_RESULTS_v1.0.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({checks_total:result.checks_total,checks_passed:result.checks_passed,checks_failed:result.checks_failed}));
if(result.checks_failed)process.exit(1);

from __future__ import annotations
import json, re, subprocess, sys
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
checks=[]
def ck(name, cond, detail=''):
    checks.append({'name':name,'pass':bool(cond),'detail':str(detail)})
    if not cond: print('FAIL',name,detail)

html=(ROOT/'index.html').read_text(encoding='utf-8')
soup=BeautifulSoup(html,'lxml')
styles=(ROOT/'assets/css/styles.css').read_text()
figbase=(ROOT/'assets/css/figures.css').read_text()
fig5=(ROOT/'assets/css/figures-phase5.css').read_text()
fig6=(ROOT/'assets/css/figures-phase6.css').read_text()
fig7=(ROOT/'assets/css/figures-phase7.css').read_text()
fig8=(ROOT/'assets/css/figures-phase8.css').read_text()
fig9=(ROOT/'assets/css/figures-phase9.css').read_text()
phase11=(ROOT/'assets/css/phase11-qa.css').read_text()
app=(ROOT/'assets/js/app.js').read_text()
registry=(ROOT/'assets/js/figures.js').read_text()
core=(ROOT/'assets/js/figure-core.js').read_text()

# SEO / migration
new_url='https://knightfox789.github.io/weir-web-article/'
old_url='https://knightfox789.github.io/Weir-research-article/'
ck('HTML lang is English', soup.html and soup.html.get('lang')=='en')
ck('Viewport meta exists', soup.find('meta',attrs={'name':'viewport'}) is not None)
ck('Exactly one title', len(soup.find_all('title'))==1)
ck('Title is reader-facing and concise', 25 <= len(soup.title.get_text(strip=True)) <= 65, len(soup.title.get_text(strip=True)))
desc=soup.find('meta',attrs={'name':'description'})
ck('Meta description exists', desc is not None)
ck('Meta description has useful length', desc is not None and 110 <= len(desc.get('content','')) <= 180, len(desc.get('content','')) if desc else 0)
canonical=soup.find('link',rel='canonical')
ck('Canonical points to new repository Pages URL', canonical is not None and canonical.get('href')==new_url, canonical.get('href') if canonical else None)
ogurl=soup.find('meta',attrs={'property':'og:url'})
ck('Open Graph URL points to new repository Pages URL', ogurl is not None and ogurl.get('content')==new_url, ogurl.get('content') if ogurl else None)
ck('Old Pages URL absent from article HTML', old_url not in html)
ck('Phase 11 accessibility stylesheet is linked', soup.find('link',attrs={'href':'assets/css/phase11-qa.css'}) is not None)
for prop in ['og:type','og:title','og:description','og:url','og:site_name']:
    ck(f'{prop} metadata present', soup.find('meta',attrs={'property':prop}) is not None)
for name in ['twitter:card','twitter:title','twitter:description']:
    ck(f'{name} metadata present', soup.find('meta',attrs={'name':name}) is not None)
ck('Robots index/follow present', soup.find('meta',attrs={'name':'robots','content':'index,follow'}) is not None)

# Semantic structure / keyboard
ck('Exactly one H1', len(soup.find_all('h1'))==1, len(soup.find_all('h1')))
ck('Main landmark exists', soup.find('main',id='main-content') is not None)
skip=soup.find('a',class_='skip-link')
ck('Skip link targets main content', skip is not None and skip.get('href')=='#main-content')
ck('Primary nav has accessible label', soup.find('nav',attrs={'aria-label':'Primary'}) is not None)
menu=soup.find('button',attrs={'data-menu-button':True})
ck('Chapter menu button has aria-expanded', menu is not None and menu.has_attr('aria-expanded'))
ck('Chapter menu button aria-controls resolves', menu is not None and soup.find(id=menu.get('aria-controls')) is not None)
ck('Escape closes drawer and restores focus', "menuButton.focus()" in app and "event.key === 'Escape'" in app)
ck('Global focus-visible treatment exists', ':focus-visible' in styles)
ck('Skip link becomes visible on focus', '.skip-link:focus' in styles)

# Chapters / figures / data paths
for i in range(17):
    cid=f'chapter-{i:02d}'
    ck(f'{cid} exists once', len(soup.find_all(id=cid))==1, len(soup.find_all(id=cid)))
figs=soup.select('[data-figure]')
ck('Exactly 17 figure mounts', len(figs)==17, len(figs))
for i in range(1,18):
    fid=f'FIG-{i:02d}'
    matches=[f for f in figs if f.get('data-figure')==fid]
    ck(f'{fid} mount exists once', len(matches)==1, len(matches))
    if matches:
        src=matches[0].get('data-source','')
        ck(f'{fid} data-source is local', bool(src) and not re.match(r'^https?://',src), src)
        ck(f'{fid} data-source exists', (ROOT/src).is_file(), src)

# Dynamic accessibility contract
ck('Figure summaries are polite live regions', "summary.setAttribute('aria-live', 'polite')" in core)
ck('Figure SVGs expose role img and aria-label', "role: 'img'" in core and "'aria-label': label" in core)
ck('Range controls are label-wrapped', "const wrap = htmlEl('label', 'p4-control')" in core)
ck('Select controls are label-wrapped', core.count("const wrap = htmlEl('label', 'p4-control')") >= 2)
network=(ROOT/'assets/js/figures-01-02.js').read_text()
ck('Dependency-network nodes keyboard activate', "addEventListener('keydown'" in network and "event.key === 'Enter'" in network and "event.key === ' '" in network)
focusable_count=sum(p.read_text().count("tabindex:'0'")+p.read_text().count("tabindex: '0'") for p in (ROOT/'assets/js').glob('figures-*.js'))
ck('Analytical SVG states expose keyboard focus targets', focusable_count >= 10, focusable_count)

# Reduced motion
all_css='\n'.join([styles,figbase,fig5,fig6,fig7,fig8,fig9,phase11])
ck('Global reduced-motion media query exists', '@media (prefers-reduced-motion: reduce)' in styles)
ck('Figure reduced-motion handling exists', 'prefers-reduced-motion' in all_css)
ck('Runtime reduced-motion detection exists', 'prefers-reduced-motion: reduce' in core)
ck('No continuous autoplay timer in figure modules', 'setInterval(' not in '\n'.join(p.read_text() for p in (ROOT/'assets/js').glob('figures*.js')))

# Responsive/mobile rules
ck('Article collapses major grids below 980px', '@media (max-width: 980px)' in styles and '.hero__grid, .chapter--split, .methods-grid { grid-template-columns: 1fr; }' in styles)
ck('Article collapses content grids below 700px', '@media (max-width: 700px)' in styles and '.stat-row, .figure-grid, .figure-grid--two, .boundary-grid { grid-template-columns: 1fr; }' in styles)
ck('Figure controls collapse on mobile', '@media (max-width: 780px)' in figbase and '.p4-figure__controls { grid-template-columns: 1fr; }' in figbase)
ck('Foundation transition collapses on mobile', '@media (max-width: 820px)' in fig6 and '.foundation-transition__grid { grid-template-columns: 1fr; }' in fig6)
ck('Research Explorer controls collapse on mobile', '@media (max-width:760px)' in fig9 and 'grid-template-columns:1fr' in fig9)
ck('Wide Explorer chart gets intentional horizontal scroll', '.p9-explorer .p4-figure__canvas { overflow-x:auto; }' in fig9)
ck('Wide synthesis chart gets intentional horizontal scroll', '.p8-synthesis .p4-figure__canvas { overflow-x: auto; }' in fig8)

# Touch targets
ck('Menu button minimum target 44px', '.menu-button' in phase11 and 'min-height: 44px' in phase11)
ck('Core figure buttons minimum target 44px', '.p4-stepper__button' in phase11 and 'min-height: 44px' in phase11)
ck('Select controls minimum target 44px', '.p4-control__select' in phase11 and 'min-height: 44px' in phase11)
ck('Phase 8 stage buttons minimum target 44px', '.p8-stage-button' in phase11 and 'min-height: 44px' in phase11)
ck('Explorer download minimum target 44px', '.p9-download' in phase11 and 'min-height: 44px' in phase11)

# Contrast checks using declared key tokens
def lum(h):
    h=h.lstrip('#'); vals=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    def f(c): return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
    r,g,b=map(f,vals); return 0.2126*r+0.7152*g+0.0722*b
def cr(a,b):
    x,y=sorted([lum(a),lum(b)],reverse=True); return (x+.05)/(y+.05)
ck('Muted text token meets 4.5:1 on paper', cr('#62707A','#F7F6F1')>=4.5, f"{cr('#62707A','#F7F6F1'):.2f}")
ck('Coral text token meets 4.5:1 on paper', cr('#B74D31','#F7F6F1')>=4.5, f"{cr('#B74D31','#F7F6F1'):.2f}")
ck('Paper on navy exceeds AA', cr('#F7F6F1','#0B1F33')>=4.5, f"{cr('#F7F6F1','#0B1F33'):.2f}")
ck('Teal on paper exceeds AA', cr('#117B7B','#F7F6F1')>=4.5, f"{cr('#117B7B','#F7F6F1'):.2f}")
ck('Light-background coral text uses dedicated accessible token', '--coral-text: #B74D31' in phase11 and 'color: var(--coral-text)' in phase11 and 'fill: var(--coral-text)' in phase11)

# Performance / lazy rendering
ck('Figure registry uses IntersectionObserver for lazy rendering', 'function scheduleFigureRendering' in registry and "new IntersectionObserver" in registry)
ck('Lazy observer uses prefetch margin', "rootMargin: '600px 0px'" in registry)
ck('Figures expose aria-busy while loading', "setAttribute('aria-busy', 'true')" in registry and "removeAttribute('aria-busy')" in registry)
ck('Figure render state prevents duplicate work', "dataset.renderState === 'loading'" in registry and "dataset.renderState === 'ready'" in registry)
ck('Old eager Promise.all mount rendering removed', 'Promise.all(mounts.map' not in registry)
js_size=sum(p.stat().st_size for p in (ROOT/'assets/js').glob('*.js'))
css_size=sum(p.stat().st_size for p in (ROOT/'assets/css').glob('*.css'))
runtime_size=sum(p.stat().st_size for p in (ROOT/'data/runtime').glob('*.json'))
ck('Total JS remains under 180 KB', js_size < 180_000, js_size)
ck('Total CSS remains under 60 KB', css_size < 60_000, css_size)
ck('Total runtime JSON remains under 100 KB', runtime_size < 100_000, runtime_size)
ck('Largest runtime JSON remains under 20 KB', max(p.stat().st_size for p in (ROOT/'data/runtime').glob('*.json')) < 20_000)
ck('No external JS dependencies in HTML', all(not (tag.get('src','').startswith('http')) for tag in soup.find_all('script')))
ck('No external CSS dependencies in HTML', all(not (tag.get('href','').startswith('http')) for tag in soup.find_all('link',rel='stylesheet')))
ck('No PNG/JPG analytical assets', not any(p.suffix.lower() in {'.png','.jpg','.jpeg'} for p in ROOT.rglob('*') if p.is_file()))

# JSON + JS syntax
json_files=list((ROOT/'data').rglob('*.json')) + list((ROOT/'docs').rglob('*.json'))
json_ok=True
for p in json_files:
    try: json.loads(p.read_text())
    except Exception as e:
        json_ok=False; print('JSON FAIL',p,e)
ck('All JSON files parse', json_ok, len(json_files))
js_ok=True; bad=[]
for p in (ROOT/'assets/js').glob('*.js'):
    r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
    if r.returncode:
        js_ok=False; bad.append(f'{p.name}: {r.stderr.strip()}')
ck('All JavaScript files pass node --check', js_ok, '; '.join(bad))

# Package/repo safety
ck('Index has no duplicate IDs', len([x.get('id') for x in soup.find_all(id=True)])==len(set(x.get('id') for x in soup.find_all(id=True))))
ck('No malformed mojibake replacement character', '\ufffd' not in html)
ck('Non-calculator boundary remains present', 'not a design calculator or construction guide' in html)

result={'phase':11,'kind':'static_accessibility_performance_seo','checks_total':len(checks),'checks_passed':sum(c['pass'] for c in checks),'checks_failed':sum(not c['pass'] for c in checks),'sizes_bytes':{'js':js_size,'css':css_size,'runtime_json':runtime_size},'checks':checks}
out=ROOT/'docs/audits/PHASE_11_QA_RESULTS_v1.0.json'
out.write_text(json.dumps(result,indent=2))
print(json.dumps({k:result[k] for k in ['checks_total','checks_passed','checks_failed','sizes_bytes']}))
if result['checks_failed']: sys.exit(1)

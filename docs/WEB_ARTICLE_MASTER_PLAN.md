# Weir Research Interactive Web Article — Master Plan v0.1

## 1. Publication objective

Transform the completed Weir Research programme into a long-form interactive web story that lets a technically curious reader understand, explore and interrogate the research rather than simply read a static manuscript.

The article must answer the original research question:

> **Which variables govern small-weir behaviour, under what conditions, and by how much?**

The publication should leave the reader with five connected ideas:

1. a weir is a coupled hydraulic–geometric–stability–foundation system;
2. governing variables change by response and regime;
3. trade-offs matter more than a single optimum section;
4. normalized families are more transferable than absolute dimensions;
5. scour/foundation uncertainty must remain explicit rather than hidden inside one empirical rule.

This is a **research communication product**, not a design calculator and not construction guidance.

---

## 2. Intended audience

Primary audience:
- civil/water-resources engineers;
- watershed and NRM practitioners;
- researchers and postgraduate students;
- technically curious programme managers.

Secondary audience:
- informed non-engineers interested in how engineering decisions are investigated;
- donors, institutions and practitioners who need an accessible explanation of uncertainty and trade-offs.

Writing standard:
- reader language first;
- technical meaning preserved;
- evidence before adjectives;
- explain a technical term when needed rather than remove it;
- clearly distinguish exact law, synthetic finding, fitted relationship, model uncertainty and unresolved field evidence.

Voice:
- Kaushal voice: evidence-first, practical, technically grounded, low-hype;
- mostly editorial third-person/neutral narrative;
- selective first-person passages at research turning points where they improve authenticity.

---

## 3. Storyline architecture

The article will not use the conventional sequence `Abstract → Method → Results → Discussion` as its visible top-level structure. Methods and references remain available, but the main page follows the reader's discovery journey.

### Chapter 00 — Hero: **What really controls a small weir?**

**Purpose**  
Open with the deceptively simple object: a short overflow weir across a small stream.

**Reader experience**
- animated SVG weir section;
- water level rises slowly;
- labels for discharge, crest length, head, unit discharge, jump, uplift and foundation appear one by one;
- final line: **Change one variable and several other things move with it.**

**Key message**  
A small weir is not one hydraulic equation plus a concrete section.

---

### Chapter 01 — **The simple section that was not simple**

Reconstruct the initiating technical review.

Story beats:
- the original head arithmetic could appear reasonable;
- geometry was internally inconsistent;
- centroid/resisting moment had an error;
- uplift was omitted;
- HFL/depth assumptions were inconsistent;
- apron/cutoff/scour could not be verified from the sketch alone.

Interactive treatment:
- scroll-driven diagnostic cross-section;
- each inconsistency is highlighted sequentially;
- the section morphs from the original illustrative geometry to a logically consistent schematic.

Takeaway:
**A calculation can be numerically correct and still represent an incomplete system.**

---

### Chapter 02 — **Follow the dependencies**

Show the coupled dependency chain rather than a list of formulas.

Core chain:
`Q, L, C → H → q → y1 / Fr1 → y2 → energy loss / forcing → tailwater compatibility`

Parallel structural chain:
`P, T, downstream slope → base width / area → self-weight → stability response`

Foundation branch:
`hydraulic state + foundation class → scour / rock threshold / uncertainty`

Interactive treatment:
- animated dependency network;
- selecting one input highlights every downstream response it affects;
- derived variables such as `q = Q/L` are visibly marked as derived, not independent.

Takeaway:
**The first research task was to separate what can be varied from what is mathematically derived.**

---

### Chapter 03 — **Turn one design into an experiment**

Explain methodology in reader language.

Visual sequence:
1. one baseline design;
2. one-at-a-time sensitivity;
3. two-variable response surfaces;
4. 50,000 LHS scenarios;
5. three independent 50,000-scenario replications;
6. feasible-space filtering;
7. Pareto/robustness analysis;
8. normalized families;
9. separate Sobol/Jansen global sensitivity.

Key numerical context:
- 22 continuous synthetic variables in the large-scale lane;
- 200,000 total replicated LHS scenarios;
- 10,317 pooled eligible competent-rock cases;
- separate alluvial comparison lane;
- dedicated `N=8,192` scrambled Sobol base design for global sensitivity.

Animation:
- thousands of dots progressively populate the screen;
- sample-size counter increments;
- duplicate/invalid/out-of-domain states visually separate.

Takeaway:
**The goal was not to find one section. It was to map behaviour.**

---

### Chapter 04 — **Head is a balance, not a single driver**

Core result:
`H = [Q/(C L)]^(2/3)`

Interactive figure:
- `Q × L → H` surface / heat field;
- drag or hover along Q and L axes;
- equation displayed beside figure;
- exact elasticities `+2/3` for Q and `−2/3` for L/C;
- optional Spearman evidence panel from the replicated research.

Reader-language interpretation:
**More discharge raises head. More overflow length spreads the same flow and lowers it.**

Scientific label:
- exact analytical relationship;
- not a fitted trendline.

---

### Chapter 05 — **Forcing grows faster than intuition suggests**

Core empirical result over the eligible formal-jump domain:
`P′ ∝ q^1.6666 Fr1^1.8685`, `R² ≈ 0.999865`

Interactive figure:
- animated `q × Fr1 → forcing` surface;
- staged scroll states: low/low → high q → high Fr1 → high/high;
- live tooltip showing q, Fr1, forcing;
- regression equation + `R²` shown in figure annotation;
- reader may switch linear/log view.

Key interpretation:
- +10% q ≈ +17.2% forcing;
- +10% Fr1 ≈ +19.5% forcing, holding other variables fixed.

Takeaway:
**Unit discharge and jump intensity compound one another.**

---

### Chapter 06 — **Concrete has its own geometry penalty**

Exact body-area relation:
`A = P·T + 0.5·s·P²`

Interactive figure:
- `height × slope → body-area proxy` response surface;
- animated section changes shape as values move;
- exact equation shown;
- family-conditioned local elasticities shown as small multiples.

Key finding:
height becomes increasingly expensive in material terms toward taller/broader families.

Takeaway:
**Height is not just another dimension; it changes the material penalty nonlinearly.**

---

### Chapter 07 — **Stability behaves differently**

Purpose:
Show why stability should not be reduced to one universal elasticity.

Interactive figure:
- coefficient/rank view of primitive variables;
- switch between pooled and F1/F2/F3/F4 neighbourhoods;
- cohesion consistently favourable;
- height persistent adverse geometry direction;
- caveat badge explaining applicability conditioning.

Statistics:
- use standardized coefficient / Spearman information where supported;
- do **not** display a misleading universal regression equation.

Takeaway:
**Some responses admit clean power laws. Stability remains conditional and multivariable.**

---

### Chapter 08 — **There is no single optimum weir**

Pareto story:
- material proxy;
- hydraulic forcing;
- tailwater mismatch;
- rock threshold.

Interactive figure:
- animated Pareto cloud;
- dominated points fade;
- frontier points remain;
- reader can change x/y objective pair;
- hover shows scenario and objective values;
- optional lasso/selection for exploration.

Narrative:
101 nondominated points emerged in the original eligible competent-rock frontier, but exact frontier membership was sample-sensitive across replications.

Takeaway:
**The durable result is the trade-off structure, not a catalogue of “best” sections.**

---

### Chapter 09 — **Four recurring behaviours — but only three are clean cores**

Introduce the normalized research families.

Family interpretation:
- F1 — low-rise / tailwater-deficient transition band;
- F2 — compact / hydraulically intense low-rise;
- F3 — taller balanced / low-rock-threshold;
- F4 — broad-base / lower-forcing.

Important nuance:
F1 remains fuzzy and should not be presented as a hard engineering class.

Interactive treatment:
- `B/P × T/P` family map;
- select F2/F3/F4/transition;
- animated median cross-section;
- linked bars for forcing, material, tailwater mismatch and rock threshold;
- family share across four independent seeds shown as animated small multiples.

Takeaway:
**The families are behaviour envelopes, not standard sections.**

---

### Chapter 10 — **Forcing is not the same as basin demand**

Purpose:
Correct a common intuitive shortcut.

Core finding:
F2 carries much higher forcing mainly because q is higher, while normalized jump-development metrics across clean F2/F3/F4 cores are similar when Fr1 is similar.

Interactive treatment:
- linked dot plot:
  - forcing;
  - `y2/y1`;
  - `ΔE/y1`;
  - natural jump length / `y1`;
- animate between family views;
- hydraulic-jump SVG responds to selected Fr1.

Takeaway:
**Hydraulic forcing and normalized jump development are related but not interchangeable design axes.**

---

### Chapter 11 — **Scour is where model certainty breaks down**

Compare Bormann–Julien (BJ) and D’Agostino–Ferro (DAF) in the common synthetic comparison space.

Interactive figure:
- log–log BJ vs DAF scatter;
- 1:1 line;
- factor-of-two bands;
- filters for family/regime;
- median DAF/BJ ratio by family;
- uncertainty-envelope overlay;
- hover shows both estimates and ratio.

Core message:
- disagreement is structured, not random;
- the models should not simply be averaged;
- model-form uncertainty is part of the answer.

Preferred compact disagreement meta-model conditions:
`Vj + yt/H + d90/d50 + d50 + b/B + q + (yt/H × d50)`

Important label:
This is a **model-disagreement meta-model**, not a new physical scour law.

---

### Chapter 12 — **Which variables matter globally?**

Global Sobol/Jansen synthesis.

Interactive figure:
- animated total-order Sobol bars;
- response selector: head / forcing / jump loss / material / rock threshold;
- toggle `S1` vs `ST` where available;
- interactions represented by `ST − S1` overlay or secondary marker;
- independent scramble replication check available in tooltip or side panel.

Example message:
forcing is strongly interaction-driven; jump-loss behaviour is primarily a Fr1 axis; material response is mainly height + downstream slope.

Takeaway:
**“Most correlated” and “most globally influential” are not always the same statement.**

---

### Chapter 13 — **The five-dimensional result**

Final conceptual synthesis:

`normalized regime → response magnitude → dissipation-development demand → material/stability trade-off → foundation/scour uncertainty`

Interactive treatment:
- five-stage horizontal/vertical framework;
- scrolling activates one dimension at a time;
- linked mini-chart from previous chapters appears inside each stage;
- selecting a family shows how that family occupies each dimension.

Takeaway:
**No single family, index or empirical equation captures the whole design problem.**

---

### Chapter 14 — **Explore the findings**

Build a Research Explorer, explicitly **not a design calculator**.

Reader controls:
- choose response: head / forcing / material / jump / stability / rock / alluvial uncertainty;
- choose governing variable(s);
- filter family/regime;
- display scatter / binned surface / sensitivity / family envelope;
- show appropriate statistical summary.

Every view includes:
- units;
- source experiment;
- applicable domain;
- trend equation only when meaningful;
- R² / Spearman ρ / Sobol index / exact elasticity as appropriate;
- “What this means”;
- “What this does not mean”.

The explorer must never output a construction-ready section or recommended design dimension.

---

### Chapter 15 — **What the research does — and does not — establish**

Clear limitations:
- synthetic research, not site validation;
- no final construction recommendation;
- final IS 4997:2026 basin numerical provisions remain external evidence work;
- stronger direct-primary DAF verification remains desirable;
- final rock/foundation-depth methodology remains unresolved for field release;
- real-site data could become future validation evidence.

This should be short, plain and visible—not hidden in fine print.

---

### Chapter 16 — Methods, data, references and author

Expandable methods panels:
- synthetic variable architecture;
- LHS and replication;
- feasible-space filtering;
- Pareto/robustness;
- family derivation;
- BJ–DAF comparison;
- Sobol methodology;
- reproducibility.

Data links:
- downloadable figure-level CSVs;
- metadata JSON;
- research package / provenance statement where appropriate.

Author card:
- Kaushal Gadariya;
- Soil and Water Conservation Engineer;
- LinkedIn;
- portfolio;
- short practitioner bio.

---

## 4. Visual language and branding

Base design DNA from `GIS-Recharge-Web-Article-V2`.

### Core palette

```css
--navy:  #0B1F33;
--paper: #F7F6F1;
--ink:   #101820;
--teal:  #117B7B;
--aqua:  #52C7D9;
--coral: #E36B47;
--sand:  #EEE7D7;
--muted: #667580;
--line:  #D8DEE2;
```

Semantic use:
- navy: geometry / baseline / structural frame;
- teal/aqua: hydraulics and primary analytical relationships;
- coral: trade-off, high response or tension;
- sand/earth: foundation and scour;
- grey: uncertainty / out-of-domain / inactive information.

Do not rainbow-code analytical charts.

Typography:
- large editorial serif headlines;
- clean sans-serif body and chart labels;
- strong number hierarchy;
- direct chart annotations rather than legend dependence where possible.

No proprietary McKinsey assets, fonts or code. The aim is editorial clarity and progressive analytical storytelling, not visual imitation.

---

## 5. Motion design rules

**Every principal data figure must animate.** Motion must explain the analysis rather than decorate it.

Allowed motion patterns:
- axis/mark progressive reveal;
- points entering in sample order or by regime;
- line drawing;
- area/surface interpolation;
- filter transitions;
- family morphing;
- linked highlighting across charts;
- sticky scrollytelling state changes;
- number tweening for key statistics;
- uncertainty-band expansion/contraction;
- Pareto domination fade-out;
- hydraulic schematic morphing.

Rules:
1. no autoplay looping chart animation;
2. motion should resolve within roughly 400–1,200 ms per transition;
3. support `prefers-reduced-motion`;
4. scroll-driven figures must also work with keyboard/tap controls;
5. animation state must never alter underlying numeric values;
6. tooltips and annotations remain readable after transitions;
7. mobile layouts may reduce motion complexity but not analytical content.

---

## 6. Statistical display policy

The user requested trendlines, equations and R values. These will be shown **where scientifically valid**, with the correct statistic for each analytical type.

Use:
- fitted equation + `R²` for regression/power-law relationships;
- exact equation + elasticity for analytical laws;
- Spearman `ρ` for monotonic rank relationships;
- `S1` / `ST` for Sobol global sensitivity;
- percentile envelopes for fuzzy families;
- q10/q50/q90 for disagreement envelope;
- 1:1 and factor bands for model comparison.

Do **not** force an R² or trendline onto charts where it has no meaningful interpretation.

Each figure carries a compact “stat strip” containing, where relevant:
- n;
- equation;
- R² or ρ;
- domain;
- units;
- uncertainty / caveat.

---

## 7. Data architecture

Publication rule:

> **CSV/JSON is the source of truth for web figures; SVG/canvas is the rendered view.**

Planned structure:

```text
/data/
  /figures/
    fig-01-*.csv
    fig-02-*.csv
    ...
  /metadata/
    figures.json
    variables.json
    families.json
    references.json
```

Each figure CSV must contain only the fields required for that figure or explorer view, not an unnecessarily large raw dataset.

Each figure metadata entry records:
- figure ID;
- chapter;
- title;
- source research artifact;
- source experiment / seed set;
- variables and units;
- chart type;
- statistical method;
- expected equation/statistic;
- applicable domain;
- caveat;
- animation sequence;
- interaction controls;
- accessibility summary.

This makes the published chart auditable and keeps visual logic separate from analytical data.

---

## 8. Technology stack

Recommended baseline:

- static GitHub Pages;
- semantic HTML5;
- CSS custom properties and responsive grid;
- vanilla ES modules;
- D3.js for custom charts;
- Scrollama or native IntersectionObserver for scrollytelling;
- `d3-fetch` / native fetch for CSV/JSON;
- SVG for most analytical marks and schematics;
- Canvas only if a point-heavy chart needs performance;
- no server/backend required.

Open-source references:
- `d3/d3` — analytical SVG/data visualisation;
- `russellsamora/scrollama` — scrollytelling state control;
- `observablehq/plot` — optional concise statistical charts where it improves maintainability.

Dependency rule:
Use the fewest dependencies necessary. Custom D3 + native browser APIs remain preferred for flagship figures.

---

## 9. Proposed repository architecture

```text
/
├── index.html
├── README.md
├── LICENSE
├── CONTENT_PROVENANCE.md
├── docs/
│   ├── WEB_ARTICLE_MASTER_PLAN.md
│   └── FIGURE_DATA_AND_MOTION_SPEC.md
├── assets/
│   ├── css/
│   │   ├── tokens.css
│   │   ├── base.css
│   │   ├── article.css
│   │   └── charts.css
│   ├── js/
│   │   ├── app.js
│   │   ├── scrolly.js
│   │   ├── chart-utils.js
│   │   └── charts/
│   │       ├── head-surface.js
│   │       ├── forcing-surface.js
│   │       ├── material-surface.js
│   │       ├── pareto.js
│   │       ├── families.js
│   │       ├── jump.js
│   │       ├── scour.js
│   │       ├── sobol.js
│   │       └── explorer.js
│   └── svg/
│       ├── favicon.svg
│       └── social-preview.svg
├── data/
│   ├── figures/
│   └── metadata/
└── tests/
    ├── data-integrity.js
    ├── figure-contracts.js
    └── smoke-checklist.md
```

---

## 10. Accessibility and performance

Required:
- keyboard-accessible filters/tabs;
- SVG title/desc or equivalent accessible chart summary;
- visible focus styles;
- colour is never the sole encoding;
- reduced-motion support;
- responsive typography and chart reflow;
- mobile-friendly tooltips/tap targets;
- lazy rendering for lower-page charts;
- avoid loading the full 200K dataset into the browser when figure-level extracts will do;
- static textual takeaway remains understandable if JavaScript fails.

---

## 11. Provenance and scientific integrity

Every public analytical chart must be traceable to a frozen research artifact.

The website must retain the following distinctions:
- exact analytical relationship;
- synthetic empirical relationship;
- correlation/rank evidence;
- high-fidelity surrogate Sobol result;
- fuzzy research family;
- model-form comparison;
- unresolved field evidence.

No label such as “safe”, “optimum”, “recommended design” or “construction-ready” may be inferred from synthetic families.

All numeric values displayed on the page must either:
1. be loaded from the figure dataset/metadata; or
2. be calculated deterministically from those loaded values.

Hard-coded duplicate numbers should be minimized.

---

## 12. Build phases

### Phase 0 — Planning and data contracts
- lock storyline;
- lock figure inventory;
- map every web claim to frozen research evidence;
- define figure CSV schemas;
- define chart statistics and caveats.

### Phase 1 — Editorial shell
- header/progress/nav;
- hero;
- typography/palette;
- reading grid;
- author card;
- responsive base;
- social/SEO metadata.

### Phase 2 — Opening scrollytelling
- initiating weir diagnostic;
- dependency graph;
- experiment scale animation.

### Phase 3 — Core hydraulic/material figures
- head surface;
- forcing surface;
- material geometry surface;
- stability conditional figure.

### Phase 4 — Trade-space and families
- Pareto animation;
- normalized family map;
- family selector;
- replication share figure.

### Phase 5 — Basin and scour story
- hydraulic-jump animation;
- family vs basin-demand linked figure;
- BJ vs DAF comparison;
- disagreement envelope.

### Phase 6 — Global sensitivity
- Sobol selector;
- first-order vs total-order interaction display;
- replication diagnostics.

### Phase 7 — Research Explorer
- reusable chart controls;
- linked filtering;
- statistical annotation framework;
- CSV downloads.

### Phase 8 — Methods / references / provenance
- expandable methods;
- harmonized references;
- downloadable figure data;
- provenance page.

### Phase 9 — QA and publication polish
- numerical cross-check against frozen research outputs;
- motion QA;
- mobile QA;
- accessibility QA;
- reduced-motion QA;
- broken-link/data-file audit;
- GitHub Pages deployment check.

---

## 13. Definition of done

The article is ready when:

- the main narrative can be understood without reading the manuscript;
- every principal figure is live and animated;
- every analytical figure is backed by CSV/JSON;
- trendlines/equations/statistics match the frozen research evidence;
- family and uncertainty claims preserve their research caveats;
- the Research Explorer works without presenting itself as a design calculator;
- mobile and reduced-motion modes preserve meaning;
- all figure data are downloadable;
- the article ends with the five-dimensional research framework;
- author branding is consistent with Kaushal's existing web publication;
- no field-design claim exceeds the research evidence.

---

## 14. Canonical editorial statement

The web article should ultimately communicate one simple idea:

> **A small weir cannot be understood through one equation or one optimum cross-section. Its behaviour emerges from interacting hydraulic, geometric, stability and foundation conditions. The useful research outcome is therefore a map of governing variables, response magnitudes, trade-offs, regimes and uncertainty — not a universal design recipe.**

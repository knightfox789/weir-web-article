# Phase 1 — Story Architecture & Figure Inventory Freeze v1.0

**Status:** FROZEN  
**Phase:** 1 of 13  
**Purpose:** Lock the reader journey and principal visual evidence before data extraction or page coding begins.

## 1. Frozen editorial objective

The article must answer:

> **Which variables govern small-weir behaviour, under what conditions, and by how much?**

The page is a **story-driven interactive research article**. It is not:
- a static manuscript rendered as HTML;
- a design calculator;
- construction guidance;
- a catalogue of optimum weir sections;
- a software/product demonstration.

The reader should finish with the five-dimensional research interpretation:

`normalized regime → response magnitude → dissipation-development demand → material/stability trade-off → foundation/scour uncertainty`

## 2. Frozen reader journey

### 00 — What really controls a small weir?
Open with an animated weir and reveal the coupled problem one variable at a time.

### 01 — The simple section that was not simple
Use the initiating case to show why arithmetic alone was insufficient: geometry, centroid, uplift, HFL/depth and downstream protection were not all internally resolved.

### 02 — Follow the dependencies
Show independent inputs, design choices, derived variables, responses and constraints as a linked system.

### 03 — Turn one design into an experiment
Explain the research chronology in reader language: baseline → OAT → pairwise surfaces → large synthetic sampling → replication → feasible space → Pareto/robustness → normalized families → separate Sobol/Jansen global sensitivity.

### 04 — Head is a balance, not a single driver
Reveal `Q × L → H` and the exact analytical elasticities.

### 05 — Forcing grows faster than intuition suggests
Reveal the compounded `q × Fr1` forcing relationship and fitted power law.

### 06 — Concrete has its own geometry penalty
Show the exact body-area relation and why height carries a nonlinear material penalty.

### 07 — Stability behaves differently
Explain why stability remains conditional and multivariable rather than reducing it to one universal elasticity.

### 08 — There is no single optimum weir
Use Pareto filtering to make the trade-off structure visible and reject the idea of one universally best section.

### 09 — Four recurring behaviours, but only three clean cores
Introduce F1 as a fuzzy transition band and F2/F3/F4 as normalized research regimes/envelopes, not standard sections.

### 10 — Forcing is not the same as basin demand
Separate q-driven forcing from Fr1-driven normalized jump-development demand.

### 11 — Scour is where model certainty breaks down
Show BJ–DAF disagreement, family conditioning and the calibrated disagreement envelope without selecting a universal scour law.

### 12 — Which variables matter globally?
Use Sobol/Jansen evidence to distinguish first-order influence from total/interaction influence.

### 13 — The five-dimensional result
Assemble the normalized regime, response magnitude, basin demand, material/stability trade-off and foundation/scour uncertainty into one final framework.

### 14 — Explore the findings
Provide a Research Explorer for interrogating frozen findings. It must never emit a design recommendation or construction-ready geometry.

### 15 — What the research does — and does not — establish
State synthetic/field boundaries plainly and visibly.

### 16 — Methods, data, references and author
Provide expandable reproducibility details, figure-data downloads, references and Kaushal Gadariya branding.

## 3. Frozen principal figure inventory

The principal analytical/explanatory figure set is frozen at **17 figures**:

1. FIG-01 — Initiating Weir Diagnostic
2. FIG-02 — Dependency Network
3. FIG-03 — Experiment Scale & Filtering
4. FIG-04 — Q × L → Head Surface
5. FIG-05 — q × Fr1 → Forcing
6. FIG-06 — Height × Downstream Slope → Body Area
7. FIG-07 — Stability Conditional Drivers
8. FIG-08 — Pareto Trade Space
9. FIG-09 — Normalized Family Map
10. FIG-10 — Family Trade-off Dashboard
11. FIG-11 — Family Share Replication
12. FIG-12 — Hydraulic Jump / Basin Development Scaling
13. FIG-13 — BJ vs DAF Alluvial Scour Comparison
14. FIG-14 — Compact Disagreement Envelope
15. FIG-15 — Global Sobol Sensitivity
16. FIG-16 — Five-Dimension Research Framework
17. FIG-17 — Research Explorer

A decorative/illustrative hero schematic may exist outside this numbering. It is not an analytical figure.

## 4. Frozen figure rules

For analytical figures:
- structured CSV/JSON is the source of truth;
- figures render live in the browser;
- every principal figure has meaningful motion;
- no PNG/JPG analytical chart exports;
- statistics shown must match analytical type;
- no artificial R² where R² is not meaningful;
- animation may reveal/filter/morph data but must never alter numeric values;
- reduced-motion mode must preserve the complete analytical state;
- each figure carries a visible reader takeaway and caveat.

Statistical policy:
- exact law → equation + elasticity;
- fitted law → equation + R²;
- monotonic relation → Spearman ρ;
- global sensitivity → S1 / ST;
- family envelope → p10 / p50 / p90;
- model disagreement → ratio / 1:1 / factor bands / q10–q90 uncertainty.

## 5. Frozen visual identity

Design DNA remains consistent with `GIS-Recharge-Web-Article-V2`:

- paper `#F7F6F1`
- navy `#0B1F33`
- ink `#101820`
- teal `#117B7B`
- aqua `#52C7D9`
- coral `#E36B47`
- sand `#EEE7D7`
- muted `#667580`

Semantics remain stable:
- teal/aqua = hydraulics;
- navy = geometry/structure;
- coral = tension/high response/trade-off;
- sand/earth = foundation/scour;
- grey = uncertainty/out-of-domain/inactive.

No rainbow analytical palettes.

## 6. Frozen voice and reader-language policy

Use Kaushal voice:
- evidence first;
- technically grounded;
- practical;
- low hype;
- reader language rather than manuscript/developmental language;
- preserve uncertainty and qualifiers;
- explain technical terms rather than deleting them.

Visible narrative should follow discovery and meaning, not the conventional `Abstract → Methods → Results → Discussion` sequence.

## 7. Frozen architecture boundary

Preferred stack remains intentionally small:
- static GitHub Pages;
- semantic HTML5;
- CSS custom properties;
- vanilla ES modules;
- D3 for flagship analytical figures;
- native IntersectionObserver or Scrollama where scrollytelling genuinely benefits;
- SVG by default; Canvas only for demonstrated point-density performance needs.

Not allowed without an audited requirement:
- application frameworks;
- database/backend/server;
- authentication;
- CMS;
- generic dashboard framework;
- full 200K browser load;
- speculative abstraction layers.

## 8. Change-control threshold

The frozen storyline or figure set may change only when:
- frozen research evidence requires correction;
- a figure duplicates another without adding reader value;
- a browser/accessibility constraint makes the intended interaction infeasible;
- a stronger visual form communicates the **same** approved research message more clearly;
- the user explicitly changes publication scope.

Any such change must appear in the phase audit/change note before implementation.

## 9. Phase 1 outcome

Phase 1 intentionally produces **no webpage code and no new research analysis**.

Its output is a controlled communication specification that prevents later implementation choices from changing the research direction.

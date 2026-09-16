# Weir Research — Interactive Web Article

**Repository status:** Publication release candidate — Phases 1–12 PASS; Phase 13 deployed-site browser acceptance PASS on the controlled release candidate and pending final merge/main verification.

This repository publishes the completed small-weir parametric research as a **story-driven, interactive, GitHub Pages web article**.

**Live article:** https://knightfox789.github.io/weir-web-article/

The publication is not a static research paper copied into HTML and not a field-design calculator. Its central question is:

> **Which variables govern small-weir behaviour, under what conditions, and by how much?**

## Publication principles

- Reader-first storyline rather than conventional paper sequencing.
- Evidence-first writing in Kaushal Gadariya's professional voice.
- Live analytical figures rendered in the browser with animation, motion, hover, filtering and linked highlighting.
- **No PNG/JPG research charts used as analytical figures.**
- **No user-facing analytical CSV download layer.** Authoritative research CSVs remain build inputs and are not published as convenient public datasets.
- Public runtime assets contain only the equations, summaries, calibration tables and deterministic display reductions needed to render each visualization.
- Motion is purposeful: progressive reveal, state transitions, response-surface morphing, uncertainty expansion, Pareto fading, family transitions, Sobol reordering and scroll-driven explanation.
- Equations, regression statistics, sensitivity indices and uncertainty bands are shown only where scientifically appropriate.
- Every analytical figure has traceable analytical lineage and a figure-data contract.
- Research findings remain clearly separated from field-design recommendations.
- GitHub Pages-compatible, responsive, accessible and reproducible.

### Static-site data boundary
Because GitHub Pages runs entirely in the browser, values required for a live interactive chart can technically be inspected. That is acceptable for this publication. The full authoritative research tables remain build inputs, while the public site ships compact render-ready JSON rather than a reader-facing source-CSV product.

## Build control

The implementation follows the controlled phase sequence documented in `docs/CONTROLLED_BUILD_SEQUENCE_AND_AUDIT_PROTOCOL.md`. Every phase must pass storyline fidelity, scientific fidelity, figure/data fidelity and architecture-restraint audits before the next phase begins.

Current status:
- **Phases 1–3 — PASS:** story architecture, analytical lineage/data contracts and the semantic publication shell are established.
- **Phases 4–9 — PASS:** FIG-01 through FIG-17 are live, including the Research Explorer, with controlled figure/data audits.
- **Phase 10 — PASS:** complete reader-language editorial rewrite with scientific-preservation audit.
- **Phase 11 — PASS:** responsive/mobile, accessibility, reduced-motion, performance/lazy-rendering and SEO QA.
- **Phase 12 — PASS:** 374/374 scientific/provenance checks; all 21 authoritative sources and all 15 publication runtime assets verified/reproduced under the controlled build path.
- **Phase 13 — RELEASE CANDIDATE PASS:** deployed GitHub Pages exercised with Playwright 1.63.0 across Chromium desktop, Chromium mobile/reduced-motion, Firefox desktop and WebKit mobile; final `main` verification follows the merge.

## Provenance and reproducibility

- `data/metadata/original-figure-lineage.json` — 21 original analytical figures and their upstream methods.
- `data/metadata/figure-mapping.json` — 21 original figures consolidated into 17 web figures.
- `data/metadata/web-figure-contracts.json` — population/filter/method/output/headline/caveat/interactivity for each web figure.
- `data/metadata/source-sha-manifest.json` — SHA-256 identity of 21 authoritative build inputs.
- `data/metadata/runtime-asset-manifest.json` — hashes and sizes of the final public runtime assets.
- `scripts/build_phase2_data.py` — reproducible Phase 2 base runtime build and quantitative integrity checks.
- `scripts/build_phase4_runtime_support.py` — approved render-support augmentation for FIG-03/05/06; it does not refit research results.
- `docs/PHASE_02_ANALYTICAL_LINEAGE.md` and phase audit files under `docs/audits/` — human-readable audit trail.
- `.github/workflows/phase13-browser-acceptance.yml` — deployed-site release browser gate.

## Design DNA

The visual language builds on Kaushal Gadariya's existing `GIS-Recharge-Web-Article-V2` publication:

- editorial hero and long-form reading rhythm;
- paper + dark-navy base palette;
- teal/aqua analytical accents;
- coral for trade-offs / high response;
- restrained serif display typography with clean sans-serif body text;
- sticky progressive storytelling;
- dark author card with LinkedIn and portfolio links.

The Weir Research article extends this with animated data-driven visualization, linked interactions, a research explorer and figure-level provenance.

## Implemented technology

- semantic HTML5 + responsive modern CSS
- vanilla JavaScript ES modules
- browser-native SVG for analytical graphics
- native `IntersectionObserver` for chapter state and lazy figure rendering
- compact generated JSON runtime assets for visualization data
- keyboard/tap controls, reduced-motion support and accessible chart summaries
- GitHub Pages deployment
- no proprietary visual assets or static analytical figure images

## Research boundary

The article communicates results from the completed replicated synthetic research programme. It does **not** convert synthetic findings into construction-ready design guidance. Final site design still requires site-specific hydrology, geotechnical/foundation evidence, applicable standards and professional engineering review.

## Author

**Kaushal Gadariya**  
Soil and Water Conservation Engineer  
[LinkedIn](https://www.linkedin.com/in/kaushal-gadariya-670221b1/) · [Portfolio](https://knightfox789.github.io/kaushal-gadariya-portfolio/)

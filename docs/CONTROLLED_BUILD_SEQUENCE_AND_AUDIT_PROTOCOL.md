# Weir Research Interactive Article — Controlled Build Sequence & Audit Protocol v1.0

**Status:** Canonical execution control  
**Repository:** `knightfox789/Weir-research-article`  
**Purpose:** Prevent storyline drift, unnecessary analysis, and unnecessary architecture during the web-article build.

## 1. Control rule

The article will be built only against the approved storyline and frozen research evidence.

After **every phase**, a phase audit must be completed and committed before the next phase begins.

The audit has four mandatory gates:

1. **Storyline fidelity** — does the work still serve the reader journey and original research question?
2. **Scientific fidelity** — are claims, numbers, equations, statistics, caveats and uncertainty still traceable to frozen research outputs?
3. **Figure/data fidelity** — are analytical figures data-driven, animated, reproducible and backed by declared CSV/JSON contracts?
4. **Architecture restraint** — did we add only code, dependencies, abstractions and analysis required by the approved article plan?

A phase passes only when all four gates are `PASS` or when a documented exception is explicitly justified by a critical requirement.

## 2. Canonical execution phases

This 13-phase sequence is the **authoritative implementation numbering** for the project. It supersedes the preliminary build-phase numbering in Section 12 of `WEB_ARTICLE_MASTER_PLAN.md` while preserving that document's storyline, visual, scientific and technical requirements.

### Phase 1 — Freeze story architecture and figure inventory
- freeze chapter order and purpose;
- freeze visible reader takeaways;
- freeze principal figure list;
- freeze figure-to-chapter mapping;
- freeze non-negotiable article boundaries;
- identify only genuine unresolved decisions.

### Phase 2 — Create figure CSV/data contracts
- map each figure to frozen research artifacts;
- define exact CSV/JSON schemas;
- generate/prepare figure-level data extracts;
- define fit-sample vs display-sample rules;
- add metadata for equations/statistics/caveats.

### Phase 3 — Build editorial shell
- semantic HTML structure;
- header/navigation/progress;
- hero shell;
- article grid;
- palette/type system;
- author card;
- responsive base;
- SEO/social metadata.

### Phase 4 — Opening scrollytelling and Figures 1–6
- initiating diagnostic;
- dependency network;
- experiment-scale animation;
- head surface;
- forcing surface;
- material surface.

### Phase 5 — Pareto, families, replication and trade-off interactions
- stability conditional view where required for transition;
- Pareto animation;
- normalized family map;
- family trade-off view;
- family-share replication.

### Phase 6 — Hydraulic jump + rock/alluvial sections
- jump-development interactive;
- forcing vs basin-demand distinction;
- rock threshold explanatory layer;
- transition into alluvial uncertainty.

### Phase 7 — BJ–DAF and uncertainty-envelope interactives
- BJ vs DAF comparison;
- factor bands and family filters;
- compact disagreement envelope;
- uncertainty-width communication where useful.

### Phase 8 — Sobol explorer + five-dimensional framework
- S1/ST global sensitivity explorer;
- interaction contribution view;
- scramble replication evidence;
- five-dimensional research synthesis.

### Phase 9 — Research Explorer
- response selector;
- family/regime filters;
- statistically correct annotation engine;
- 'What this means / does not mean';
- downloadable figure data;
- explicit non-calculator boundary.

### Phase 10 — Rewrite/humanize complete article in reader language
- Kaushal voice;
- reader-first transitions;
- remove manuscript/developmental phrasing;
- preserve every fact and qualifier;
- maintain chronology and storyline.

### Phase 11 — Mobile, accessibility, performance and SEO QA
- responsive behaviour;
- keyboard/tap controls;
- reduced-motion support;
- accessible chart summaries;
- performance/lazy rendering;
- SEO/social metadata.

### Phase 12 — Scientific QA against frozen research outputs
- numeric cross-check;
- equations/statistics cross-check;
- sample/domain cross-check;
- caveat/claim-level audit;
- provenance and downloadable-data audit.

### Phase 13 — GitHub Pages deployment and browser acceptance
- deployment configuration;
- desktop/mobile browser checks;
- link/data-load checks;
- final visual/motion acceptance;
- release tag/manifest.

## 3. Mandatory phase audit template

Every phase audit must record:

```text
Phase:
Status: PASS | PASS WITH EXCEPTION | FAIL
Date:

A. Storyline fidelity
- Planned deliverables:
- Delivered:
- Unplanned additions:
- Result: PASS/FAIL

B. Scientific fidelity
- Research artifacts used:
- Claims/numbers changed?: yes/no
- New analysis introduced?: yes/no
- If yes, why required?:
- Result: PASS/FAIL

C. Figure/data fidelity
- Data-backed figures affected:
- CSV/JSON contracts respected?: yes/no/not applicable
- Animation requirement respected?: yes/no/not applicable
- Correct statistic/equation policy respected?: yes/no/not applicable
- Result: PASS/FAIL

D. Architecture restraint
- Dependencies added:
- Files/modules added:
- Could anything be simpler?:
- Any speculative architecture?: yes/no
- Result: PASS/FAIL

E. Direction check
- Still answers: 'Which variables govern small-weir behaviour, under what conditions, and by how much?' yes/no
- Still a research article, not a design calculator? yes/no
- Still avoids construction-ready claims? yes/no

F. Decision
- Phase accepted/rejected:
- Corrections required before next phase:
```

## 4. Stop conditions

Work pauses for user input only when a decision would materially change:
- research interpretation;
- scientific claim or accepted evidence;
- article audience;
- storyline architecture;
- visual identity/branding direction;
- open-source dependency with significant licensing/security consequence;
- design-calculator vs research-explorer boundary;
- publication/release scope.

Routine implementation, data extraction, chart coding, testing, responsive fixes, animation QA and documentation do **not** require user confirmation.

## 5. Anti-drift rules

Do not:
- add new synthetic experiments because a visualization would be easier with different data;
- invent new engineering acceptance criteria;
- turn the Research Explorer into a design calculator;
- add frameworks/libraries only because they are fashionable;
- build a backend/server unless a proven requirement cannot be met statically;
- duplicate the full 200K dataset in the browser;
- add charts that do not advance the approved reader story;
- hide uncertainty or field-design limitations;
- replace the approved 17 principal figure concepts without an audited reason.

## 6. Change control

Any material deviation from the frozen plan requires a short change note containing:
- requested/observed need;
- affected chapter/figure/phase;
- scientific impact;
- reader-story impact;
- architecture impact;
- decision and rationale.

Minor implementation substitutions that preserve the same figure purpose and evidence do not require user approval, but must be recorded in the phase audit.

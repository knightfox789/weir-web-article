# Phase 12 Audit — Scientific QA Against Frozen Research Outputs

**Status:** PASS  
**Date:** 2026-09-16  
**Canonical baseline:** `knightfox789/weir-web-article` main `c147c7b85a2a7228dec2fd45ac2ca1d8603ebc35`  
**Controlled QA:** **374/374 PASS**

## Scope

Phase 12 is a verification phase, not a research or redesign phase. It cross-checks the current reader-facing article, FIG-01–FIG-17 runtime assets and figure contracts against the frozen authoritative research outputs for:

1. numeric values;
2. equations and statistics;
3. populations, filters, seeds and display-vs-fit domains;
4. claim/caveat boundaries;
5. provenance and downloadable-data controls.

No model was refitted, no family definition was changed, and no new design recommendation was introduced.

## Authoritative evidence checked

The audit verifies the SHA-256 hash and byte size of all **21** authoritative Phase 2 source files recorded in `data/metadata/source-sha-manifest.json`, including the 50K whole-system sample, replicated family/stability tables, Pareto and family envelopes, hydraulic-jump scaling, BJ–DAF comparison, preferred disagreement-envelope v0.3 inputs, and Sobol/Jansen outputs.

Publication-level claim checks also use the frozen research synthesis documents:

- `Synthetic_Replicated_Response_Gradients_v0.1.md`;
- `Synthetic_Research_Conclusion_Matrix_v1.0.md`;
- `Integrated_Normalized_Research_Framework_v0.1.md`.

## Independent runtime reproduction

The current publication runtime was independently rebuilt from the frozen authoritative inputs in two controlled stages:

1. `scripts/build_phase2_data.py` — recreates the Phase 2 base runtime and source manifest;
2. `scripts/build_phase4_runtime_support.py` — adds only the approved FIG-03/05/06 render-support fields from the same frozen sources and refreshes the final runtime manifest.

**Result: all 15 current runtime JSON assets rebuild byte-for-byte.**

Phase 12 found a provenance/documentation defect rather than a scientific defect: during the repository migration, the Phase 4 support builder was omitted and `data/metadata/runtime-asset-manifest.json` still contained the pre-augmentation hashes for FIG-03, FIG-05 and FIG-06. The live runtime files themselves were correct and fully reproducible. Phase 12 restores the support builder, documents the two-stage rebuild and refreshes the manifest to the existing final publication bytes. **No runtime JSON changes.**

## Key scientific cross-checks

### Head
- Exact controlled relation: `H = [Q/(C L)]^(2/3)`.
- Elasticities: Q `+2/3`, L `-2/3`, C `-2/3`.
- The relation is verified numerically against the 50K whole-system source.

### Downstream forcing
- Pooled eligible population: **10,317**.
- Frozen relationship: `P' ∝ q^1.67 Fr1^1.87`.
- Source fit: `a≈1.667`, `b≈1.868`, `R²≈0.99987`; publication rounding `R²≈0.9999`.
- +10% q: about **17%** in the article (source calculation ≈17.2%).
- +10% Fr1: about **19.5%**.

### Material/body area
- Exact identity: `A = P T + 0.5 s P²`.
- Normalized identity: `A/P² = T/P + 0.5s`.
- Global sensitivity remains height-dominant (`ST≈0.829`) within declared ranges.

### Stability
- Pooled applicable cases: **8,914**.
- Pooled log-linear diagnostic `R²≈0.876`.
- Published coefficients remain approximately: cohesion `+0.629`, height `-0.256`, downstream slope `+0.167`, Q `-0.090`, tailwater ratio `+0.071`.
- Stability remains a conditional diagnostic, not a field factor-of-safety equation, and is excluded from unconditional Sobol ranking.

### Pareto and normalized families
- Source eligible population: **2,585**; nondominated: **101**; deterministic display subset: **50**.
- Pooled replicated family population: **10,317**.
- Family shares reproduce as approximately F1 **5.20%**, F2 **15.12%**, F3 **31.45%**, F4 **48.23%**.
- F1 remains a fuzzy transition; families remain research regimes, not design classes.
- No scalar Pareto winner is introduced.

### Hydraulic jump
- Population: **22,500**; formal research domain `4.5≤Fr1≤9`.
- Median Fr1≈**6.75** gives `y2/y1≈9.06`, `ΔE/y1≈14.45`, CWC≈**40.30**, USACE≈**54.0**.
- CWC/USACE remains about **0.70–0.78** across the domain.
- These reference lengths remain explicitly separate from final IS 4997:2026 stilling-basin geometry.

### Rock transition
- Competent-rock source population: **25,000**.
- `Pav/Pc ≥ 1` count reproduces as **11,775**.
- `Pc = 0.48 K^0.44` for `K≤0.1`; `Pc=K^0.75` for `K>0.1`.
- The threshold is not a site failure probability or a released scour/foundation-depth rule; final rock foundation depth/protection remains OPEN.

### BJ–DAF alluvial disagreement
- Alluvial source population: **25,000**; common comparison overlap: **14,369**.
- Median DAF/BJ≈**1.107**.
- Spearman ρ≈**0.422**.
- p10≈**0.351**, p90≈**5.846**.
- About **50.3%** of common cases fall within factor 2.
- BJ and DAF remain separate empirical model outputs; they are not averaged and neither is treated as field truth.

### Disagreement envelope v0.3
- Common population: **14,369**.
- Preferred compact structure remains six continuous groups plus one centered-log `yt/H × d50` interaction.
- q10–q90 coverage reproduces at ≈**80.07%**.
- Median-regime accuracy reproduces at ≈**87.80%**.
- High-confidence classified-state accuracy reproduces at ≈**98.20%**.
- The envelope remains a meta-model of BJ–DAF model disagreement, not a physical scour equation or confidence interval for true field scour.

### Sobol/Jansen global sensitivity
- Scrambled Sobol/Jansen base `N=8,192`.
- Head: Q `ST≈0.621`, L `ST≈0.401`.
- Forcing: Fr1 `ST≈0.512`, Q `ST≈0.421`.
- Jump energy loss: Fr1 `ST≈0.809`.
- Body area: height `ST≈0.829`.
- Rock diagnostic: log10(Pav) `ST≈0.675`, log10(K) `ST≈0.325`.
- Replication is stable; the rock response has only a negligible third-place variable swap between scrambles while its two dominant inputs remain unchanged.
- Stability is correctly excluded from unconditional Sobol because its applicable population is conditioned.

## Reader-facing and contract audit

- All Chapter 00–16 protected headline values checked.
- All **17** `data-figure` mounts occur exactly once.
- All **17** figure contracts retain explicit caveats.
- Non-calculator/non-construction boundary remains visible.
- Final alluvial scour law/site validation remains OPEN.
- Final IS 4997:2026 basin geometry remains OPEN.
- Final rock foundation depth/protection remains OPEN.
- Research families are not presented as design classes.
- Stability coefficients are not presented as field FOS.
- The disagreement meta-model is not presented as physical scour law.

## Provenance and public-data boundary

- All 21 authoritative-source hashes/byte sizes match the frozen source manifest.
- All 15 final runtime assets reproduce byte-for-byte.
- Final runtime manifest matches the post-augmentation publication assets.
- No CSV files are published in the web repository.
- Browser code contains no `.csv` references.
- The Research Explorer continues to expose only released compact JSON evidence, not the authoritative raw research tables.

## Controlled QA result

| Category | Pass | Fail |
|---|---:|---:|
| Provenance | 147 | 0 |
| Population/domain | 17 | 0 |
| Equations | 8 | 0 |
| Claims | 12 | 0 |
| Sensitivity | 31 | 0 |
| Stability | 16 | 0 |
| Boundaries | 20 | 0 |
| Pareto | 4 | 0 |
| Families | 14 | 0 |
| Hydraulic jump | 11 | 0 |
| Foundation | 2 | 0 |
| Alluvial | 19 | 0 |
| Disagreement envelope | 8 | 0 |
| Synthesis | 15 | 0 |
| Reader claims | 16 | 0 |
| Figure/data contracts | 34 | 0 |
| **Total** | **374** | **0** |

## Four controlled gates

1. **Storyline fidelity — PASS.** Phase 12 changes no story sequence or reader-facing interpretation.
2. **Scientific fidelity — PASS.** Frozen equations, values, populations, statistical relationships and OPEN/CONDITIONAL boundaries are supported by authoritative evidence.
3. **Figure/data fidelity — PASS.** All runtime assets are reproducible; figure mounts/contracts and data boundaries remain intact.
4. **Architecture restraint — PASS.** No research refit, runtime-data expansion, raw CSV publication, design calculator or Phase 13 work is introduced.

## Phase 12 decision

**PASS.** The current publication science is consistent with the frozen research evidence within its declared synthetic scope. The only correction is to repository provenance metadata/tooling so the already-correct live runtime can be reproduced and its final hashes audited from the repository itself.

Phase 13 retains final GitHub Pages desktop/mobile browser, link/data-load, visual/motion and release acceptance.

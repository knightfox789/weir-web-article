# Phase 2 Audit — Analytical Lineage & Runtime Data

**Audit date:** 2026-09-15  
**Audit result:** PASS  
**Automated scientific checks:** 24/24 PASS

## What was audited
The live `main` branch was checked against the frozen Phase 2 requirements after the earlier CSV-publication implementation was discarded. The audit covers analytical provenance, the 21-original-figure → 17-web-figure mapping, reproducible build logic, compact runtime assets, frozen headline statistics and repository hygiene.

## Corrective findings resolved
The earlier nominal Phase 2 PASS was not accepted because it referred to a public `data/figures/*.csv` layer that was no longer present and did not satisfy the revised runtime architecture. During this audit three runtime mismatches were also found and corrected: the forcing sensitivity payload, the body-area sensitivity payload, and the FIG-13 alluvial display sample. All three now match the reproducible build.

## Analytical provenance — PASS
- `original-figure-lineage.json` contains all 21 original research figures.
- `figure-mapping.json` maps all 21 original figures into the 17 frozen web figures; no original figure is unmapped.
- `web-figure-contracts.json` records upstream source(s), population/filter, analytical method, public output, headline finding, caveat and intended interactivity for all 17 web figures.
- No PNG/JPG analytical figure is digitized or treated as numerical evidence.

## Reproducibility — PASS
- `scripts/build_phase2_data.py` rebuilds the runtime layer from the authoritative private research CSVs.
- `source-sha-manifest.json` records SHA-256 hashes for 21 authoritative analytical inputs.
- `runtime-asset-manifest.json` records the browser-runtime asset hashes and sizes.
- Runtime values are compact JSON for live visualization; the full source CSVs are not copied into the public repository.

## Scientific integrity — PASS
The automated audit reproduces the frozen study counts and headline results, including:
- whole-system population 50,000;
- Pareto eligible population 2,585 and 101 nondominated cases;
- hydraulic-jump population 22,500;
- alluvial population 25,000 and common BJ–DAF overlap 14,369;
- alluvial Spearman ρ = 0.4223858885;
- median DAF/BJ = 1.1068216109;
- p10/p90 DAF/BJ = 0.3508025464 / 5.8458595647;
- factor-two agreement = 0.5030273505;
- key Sobol total effects for head, forcing, jump, body area and rock threshold;
- four-seed pooled stability R² and standardized driver coefficients.

The machine-readable results are in `data/metadata/phase-02-audit-results.json`.

## Scientific guardrails — PASS
- Exact head and body-area relations are kept analytical rather than reconstructed from raster plots.
- Stability remains an applicability-conditioned diagnostic; it is not presented as a universal factor-of-safety equation and has no unconditional Sobol ranking.
- Hydraulic-jump lengths remain reference scaling, not final IS 4997:2026 basin dimensions.
- The alluvial envelope remains a meta-model of BJ–DAF disagreement, not a physical scour equation or site validation.
- Pareto results do not declare a scalar winner.

## Runtime/publication architecture — PASS
FIG-01 and FIG-02 use existing metadata JSON. FIG-03 through FIG-17 have the required 15 compact runtime JSON assets under `data/runtime/`. The browser can use these for SVG/Canvas/D3-style live rendering, motion, hover, filters and uncertainty displays. The public runtime values are inspectable, which is acceptable; they are not presented as a downloadable source-dataset product.

## Decision
**PASS — Phase 2 is complete.** The scientific/data contract is now frozen for Phase 3 implementation.

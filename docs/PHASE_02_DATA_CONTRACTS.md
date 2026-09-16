# Phase 2 — Figure Data Contracts & Publication Runtime Assets

**Status:** COMPLETE — audited PASS on 2026-09-15.

## Objective
Complete auditable analytical lineage for the 21 original research figures and map them into the 17 frozen web-story figures without using PNG/JPG files as numerical sources.

## Public-data policy
The authoritative analytical CSV files in the research Library are reproducible build inputs. They are not copied into the public GitHub repository as a reader-facing CSV/download layer.

The public article will use live browser-rendered analytical charts and animations backed by compact JSON runtime assets. These assets contain equations, parameter ranges, frozen headline statistics, calibration summaries, and deterministic display reductions needed for motion, hover and filtering. They are public and inspectable on a static site; the goal is a clean live-visualization experience, not secrecy.

## Scientific rules
- PNG/JPG research figures are visual/caption references only and never numerical evidence.
- Frozen analytical source files and documented equations/methods remain authoritative.
- Headline statistics come from the full authoritative analytical population, never from display reductions.
- Display samples are deterministic and do not re-estimate frozen research claims.
- Exact relations use exact equations/elasticities; fitted relations retain frozen fit statistics; rank relationships use Spearman rho; global sensitivity uses dedicated scrambled Sobol/Jansen S1/ST; family envelopes use p10/p50/p90; alluvial disagreement retains full-overlap statistics and calibrated q10/q50/q90 uncertainty.

## Completed Phase 2 outputs
1. `data/metadata/original-figure-lineage.json` — 21-original-figure analytical lineage register.
2. `data/metadata/figure-mapping.json` — 21 original figures mapped into the 17 web-story figures.
3. `data/metadata/web-figure-contracts.json` — upstream sources, population/filter, method, output, headline statistics, caveat and interaction specification for all 17 figures.
4. `scripts/build_phase2_data.py` — reproducible runtime-data build plus frozen-result assertions.
5. `data/metadata/runtime-schemas.json` — runtime data contract/schema index.
6. `data/metadata/source-sha-manifest.json` — SHA-256 manifest of 21 authoritative analytical inputs.
7. `data/metadata/runtime-asset-manifest.json` — SHA-256/size manifest for 15 runtime assets used by FIG-03 through FIG-17; FIG-01/02 use existing metadata assets.
8. `data/metadata/phase-02-audit-results.json` — machine-readable 24-check scientific integrity audit.
9. `docs/PHASE_02_ANALYTICAL_LINEAGE.md` and `docs/audits/PHASE_02_AUDIT.md` — auditor documentation.

## Runtime publication approach
`data/runtime/` contains compact render-ready JSON. Equation-driven figures are generated from their equations and ranges rather than point-grid reconstructions. Point-heavy figures use deterministic display reductions while retaining authoritative full-population statistics and calibration summaries.

No original analytical PNG/JPG is digitized. No public `data/figures/*.csv` publication layer is used.

## Completion gate — PASS
- 21/21 original research figures have traceable analytical lineage.
- 17/17 web figures have complete analytical/interaction contracts.
- 15/15 required FIG-03–FIG-17 runtime assets exist; FIG-01 and FIG-02 use existing metadata JSON.
- Source and runtime SHA manifests are present.
- Frozen population counts, alluvial statistics, key Sobol totals and replicated stability diagnostics reproduce in the automated audit.
- No raster figure is used as data.
- The stale public CSV publication approach has been removed.

**Phase 2 is complete. Phase 3 should use these frozen contracts without changing the scientific findings.**

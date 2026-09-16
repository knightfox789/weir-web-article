# Phase 2 Analytical Lineage Register

**Status:** COMPLETE — audited 2026-09-15

No original analytical PNG/JPG is used as data. Every original figure is traced to upstream analytical outputs and then mapped to a live web figure.

| Original | Analytical subject | Web figure |
|---|---|---|
| Figure_01 | Replicated Family Geometry Map | FIG-09 |
| Figure_02 | q–Fr1 Forcing Response | FIG-05 |
| Figure_03 | Family Share Replication | FIG-11 |
| Figure_04 | Family Material–Forcing Tradeoff | FIG-10 |
| Figure_05 | Family Relative Performance Matrix | FIG-10 |
| Figure_06 | Replicated Stability Coefficients | FIG-07 |
| Figure_07 | Dimensionless Hydraulic Envelope | FIG-09 |
| Figure_08 | Dimensionless Geometry Loading Envelope | FIG-09 |
| Figure_09 | Alluvial BJ vs DAF Comparison | FIG-13 |
| Figure_10 | DAF Exponent and Range Influence | FIG-13 |
| Figure_11 | Normalized Basin Length vs Fr1 | FIG-12 |
| Figure_12 | Normalized Energy Loss vs Fr1 | FIG-12 |
| Figure_13 | Alluvial Model Disagreement by Family | FIG-14 |
| Figure_14 | Alluvial Compact Envelope Calibration | FIG-14 |
| Figure_15 | Alluvial Compact Envelope by Family | FIG-14 |
| Figure_16 | Alluvial Compact Envelope Exponents | FIG-14 |
| Figure_17 | Alluvial Disagreement Envelope Width Bands | FIG-14 |
| Figure_18 | F2 q Conditioning Calibration | FIG-14 |
| Figure_19 | Tailwater Grain Interaction Coverage Improvement | FIG-14 |
| Figure_20 | Family Calibration Six vs Seven Term | FIG-14 |
| Figure_21 | Global Sobol Total Effects | FIG-15 |

The full per-original upstream-source and analytical-method lineage is machine-readable in `data/metadata/original-figure-lineage.json`. The web-to-original consolidation is in `data/metadata/figure-mapping.json`.

## Runtime policy

- Authoritative research CSVs are reproducible build inputs, not reader download assets.
- Public runtime assets are compact JSON containing only equations, ranges, summary statistics, calibration tables, or deterministic display reductions needed to render live charts.
- Headline statistics are calculated from the full frozen populations, never from display reductions.
- Runtime values are public and inspectable on the static site; the goal is not secrecy, only a clean live-visualization experience.
- Raster analytical figures are never reverse-engineered or digitized.

## Reproducibility

`scripts/build_phase2_data.py` reads the authoritative source directory, records SHA-256 hashes, rebuilds the Phase 2 base runtime JSON, and asserts the frozen quantitative checks. `data/metadata/source-sha-manifest.json` identifies the exact analytical inputs without publishing the large source tables.

The current publication runtime is reproduced in two controlled stages: first run `scripts/build_phase2_data.py`, then run `scripts/build_phase4_runtime_support.py`. The second stage does **not** refit models or alter frozen scientific findings; it adds only render-support fields to FIG-03, FIG-05 and FIG-06 (replication context, deterministic display points, and control ranges) using the same frozen authoritative sources. It then refreshes `data/metadata/runtime-asset-manifest.json` so the manifest records the final post-augmentation publication assets.

Phase 12 scientific QA independently reran this two-stage path and verified all 15 current runtime JSON assets byte-for-byte against the publication files.

The complete per-web-figure contract is in `data/metadata/web-figure-contracts.json`, including upstream source, population/filter, method, output asset, headline finding, scientific caveat and intended interaction/motion behavior.

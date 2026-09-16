# Weir Research Web Article — Figure Data & Motion Specification v0.1

## 1. Non-negotiable publication rule

All analytical research figures must be rendered live in the browser from structured data.

**Not permitted for analytical figures:**
- PNG chart exports;
- JPG chart exports;
- screenshots of research figures;
- hard-coded SVG paths that cannot be traced to data.

**Permitted:**
- browser-generated SVG;
- browser-generated canvas where necessary for performance;
- hand-authored explanatory SVG schematics that are not pretending to be analytical data plots;
- SVG social-preview artwork.

Every principal analytical figure must animate.

---

## 2. Figure contract

Each figure receives:

```text
figure_id
chapter_id
title
reader_question
data_file
metadata_file
source_research_artifact
variables
units
chart_type
statistical_method
primary_statistic
trendline_or_model
animation_states
user_interactions
caveat
accessibility_summary
```

The chart code should fail visibly and informatively if a required field is missing.

---

## 3. Animation language

### A. Reveal
Used when introducing a new relationship.
- axes appear;
- marks fade/slide in;
- direct labels resolve last.

### B. Build
Used for scenario population and Pareto work.
- sample points accumulate;
- categories separate progressively;
- dominated points fade rather than disappear instantly.

### C. Morph
Used for family/geometry comparisons.
- section geometry interpolates;
- bars/dots transition to new family values;
- selected family colour remains stable.

### D. Trace
Used for equations, trendlines and analytical relationships.
- model line draws from left to right;
- equation appears after line is visible;
- R² / ρ / Sobol index appears after the visual relationship is established.

### E. Expand uncertainty
Used for scour-model disagreement.
- q50 line appears first;
- q10–q90 region expands around it;
- uncertain states become visually distinct.

### F. Linked highlight
Used in multi-panel chapters.
- hovering/selecting a state highlights the same state/family across linked charts.

---

## 4. Planned analytical figures

### FIG-01 — Initiating Weir Diagnostic

**Chapter:** 01  
**Type:** explanatory animated SVG, not a statistical plot  
**Data:** `data/metadata/initiating-case.json`

Content:
- Q ≈ 25 m³/s;
- L ≈ 20 m;
- stated crest/base/height/slope geometry from initiating case;
- diagnostic flags for geometry, centroid, uplift, HFL/depth and downstream protection.

Motion:
1. clean section appears;
2. hydraulic labels appear;
3. incompatible geometry dimensions highlight;
4. centroid marker shifts;
5. uplift arrow appears;
6. downstream apron/foundation fades into an unresolved zone.

No R²/trendline.

---

### FIG-02 — Dependency Network

**Chapter:** 02  
**Data:** `data/metadata/dependency-network.json`  
**Type:** animated directed graph

Nodes:
- independent inputs;
- design choices;
- derived variables;
- responses;
- constraints.

Interaction:
- click input → highlight downstream dependency path;
- click response → show upstream dependency set.

Motion:
- staged edge drawing following the research chain.

No regression statistic.

---

### FIG-03 — Experiment Scale & Filtering

**Chapter:** 03  
**Data:** `data/figures/fig-03-experiment-scale.csv`

Fields:
```text
stage,seed,scenario_count,eligible_count,classification
```

Type:
- animated dot field + counters.

Motion:
- 50K base seed fills first;
- three replications join;
- classifications separate;
- eligible cases remain highlighted;
- final pooled eligible count resolves.

Primary statistics:
- 200,000 total replicated LHS scenarios;
- 10,317 pooled eligible competent-rock cases.

---

### FIG-04 — Q × L → Head Surface

**Chapter:** 04  
**Data:** `data/figures/fig-04-q-l-head.csv`

Suggested fields:
```text
Q_m3_s,L_m,C,H_m,q_m2_s,seed,eligibility
```

Primary view:
- binned heat surface / contour or sampled point surface.

Secondary view:
- exact analytical cross-section.

Statistics:
`H = [Q/(C·L)]^(2/3)`

Exact elasticities:
- Q: +2/3
- L: −2/3
- C: −2/3

Optional evidence panel:
- replicated rank relationships.

Motion:
- Q increases first;
- L increases second;
- final two-dimensional surface resolves.

Interaction:
- hover/crosshair;
- Q and L focus controls;
- optional coefficient toggle.

No fitted R² required because the relationship is analytical.

---

### FIG-05 — q × Fr1 → Forcing

**Chapter:** 05  
**Data:** `data/figures/fig-05-q-fr1-forcing.csv`

Fields:
```text
q_m2_s,Fr1,forcing_kW_m,family,seed
```

Type:
- scatter + fitted response contours / surface.

Model annotation:
`P' ∝ q^1.66657 · Fr1^1.86849`

`R² ≈ 0.999865`

Motion states:
1. low q / low Fr1;
2. q increase;
3. Fr1 increase;
4. high/high compound response;
5. fitted surface draws;
6. equation + R² appear.

Interaction:
- hover values;
- linear/log scale toggle;
- family filter;
- equation panel remains fixed.

Direct callouts:
- +10% q → about +17.2% forcing;
- +10% Fr1 → about +19.5% forcing, holding other fixed.

---

### FIG-06 — Height × Downstream Slope → Body Area

**Chapter:** 06  
**Data:** `data/figures/fig-06-height-slope-area.csv`

Fields:
```text
P_m,T_m,downstream_slope,body_area_m2_per_m,family,seed
```

Exact equation:
`A = P·T + 0.5·s·P²`

Type:
- response surface + linked animated section.

Motion:
- raise P;
- steepen slope;
- morph cross-section;
- surface fills;
- family elasticities appear as small multiples.

Statistics:
- exact equation;
- family median local elasticities.

No fitted R² required.

---

### FIG-07 — Stability Conditional Drivers

**Chapter:** 07  
**Data:** `data/figures/fig-07-stability-drivers.csv`

Fields:
```text
family,seed,variable,spearman_rho,standardized_coef,rank,direction
```

Type:
- horizontal coefficient/rank plot.

Interaction:
- pooled/family selector;
- Spearman vs standardized coefficient toggle.

Motion:
- coefficients animate from zero;
- favourable/adverse directions separate;
- family transitions preserve axis scale.

Important caveat:
No universal unconditional stability elasticity or Sobol ranking will be implied.

Stat strip:
- n;
- family/regime;
- metric type;
- applicability caveat.

---

### FIG-08 — Pareto Trade Space

**Chapter:** 08  
**Data:** `data/figures/fig-08-pareto.csv`

Fields:
```text
scenario_id,body_area,forcing,tailwater_mismatch,rock_threshold_ratio,nondominated,retention,family
```

Type:
- interactive objective-pair scatter.

Default axes:
- body area vs forcing.

Controls:
- x objective;
- y objective;
- colour by third objective/family;
- robust-only toggle.

Motion:
1. eligible cloud enters;
2. domination comparisons animate;
3. dominated points fade;
4. frontier remains;
5. robustness information overlays.

No trendline: Pareto structure is the finding.

---

### FIG-09 — Normalized Family Map

**Chapter:** 09  
**Data:** `data/figures/fig-09-family-map.csv`

Fields:
```text
scenario_id,B_over_P,T_over_P,H_over_P,Fr1,tailwater_ratio,rock_ratio,family,seed
```

Default view:
`B/P` vs `T/P`

Interaction:
- family selection;
- seed filter;
- show/hide transition states;
- optional switch to `H/P` vs `B/P`.

Motion:
- pooled cloud enters neutral;
- families resolve by colour;
- select family → others fade;
- linked median section morphs.

Stat strip:
- family count/share;
- selected percentile envelope.

No fitted trendline.

---

### FIG-10 — Family Trade-off Dashboard

**Chapter:** 09  
**Data:** `data/figures/fig-10-family-tradeoffs.csv`

Fields:
```text
family,metric,p10,p50,p90,unit,desirability_direction
```

Metrics:
- body area;
- forcing;
- tailwater mismatch;
- rock threshold;
- local retention / stability diagnostic where appropriate.

Type:
- aligned dot-range charts.

Motion:
- family selector morphs p10/p50/p90 ranges;
- direct annotations highlight trade-offs.

No radar chart.

---

### FIG-11 — Family Share Replication

**Chapter:** 09  
**Data:** `data/figures/fig-11-family-share-seeds.csv`

Fields:
```text
seed,family,count,share_pct
```

Type:
- line / slope or grouped dot plot across four seeds.

Motion:
- seed points appear sequentially;
- connecting line draws;
- mean + range annotation resolves.

Statistics:
- mean share;
- SD / range in percentage points.

Purpose:
show family occupancy stability while exact Pareto membership remains sample-sensitive.

---

### FIG-12 — Hydraulic Jump / Basin Development Scaling

**Chapter:** 10  
**Data:** `data/figures/fig-12-jump-scaling.csv`

Fields:
```text
Fr1,y2_over_y1,energy_loss_over_y1,natural_jump_L_over_y1,family,q_m2_s,forcing_kW_m
```

Type:
- linked line plots + animated hydraulic-jump schematic.

Interaction:
- Fr1 slider;
- metric selector;
- family comparison.

Motion:
- jump toe enters;
- roller grows;
- y2 rises;
- development length extends;
- selected metric line traces simultaneously.

Statistical display:
- analytical/derived curve labels where supported;
- no unnecessary regression fit.

---

### FIG-13 — BJ vs DAF Alluvial Scour Comparison

**Chapter:** 11  
**Data:** `data/figures/fig-13-bj-daf-comparison.csv`

Fields:
```text
scenario_id,BJ_scour,DAF_scour,ratio_DAF_BJ,family,q,Vj,yt_over_H,d50,d90_over_d50,b_over_B
```

Type:
- log–log scatter.

Overlays:
- 1:1 line;
- factor-of-two boundaries;
- selected-family medians.

Motion:
1. points enter;
2. 1:1 line draws;
3. factor-two region expands;
4. outside-region points highlight;
5. family filter transitions.

Statistics:
- n = common comparison states;
- median DAF/BJ;
- rank correlation where published in research;
- within-factor-two share.

Do not average BJ and DAF.

---

### FIG-14 — Compact Disagreement Envelope

**Chapter:** 11  
**Data:** `data/figures/fig-14-disagreement-envelope.csv`

Fields:
```text
scenario_id,observed_ratio,pred_q10,pred_q50,pred_q90,family,q,Vj,yt_over_H,d50,d90_over_d50,b_over_B
```

Type:
- observed vs predicted calibration + conditional envelope view.

Motion:
- q50 appears;
- q10–q90 band expands;
- observations resolve;
- family states transition.

Stat strip:
- out-of-fold coverage;
- factor-two prediction share;
- direction accuracy;
- family coverage.

Label:
**model-disagreement meta-model — not a physical scour equation**.

---

### FIG-15 — Global Sobol Sensitivity

**Chapter:** 12  
**Data:** `data/figures/fig-15-sobol.csv`

Fields:
```text
response,variable,S1,ST,scramble_id,replicated_ST,rank
```

Type:
- animated horizontal bars / dumbbells.

Controls:
- response selector;
- S1/ST toggle;
- interaction view (`ST − S1`);
- replication check.

Motion:
- selected response bars grow from zero;
- ST overlay extends beyond S1;
- dominant interaction-heavy variables pulse once or receive annotation;
- change response → bars reorder smoothly.

No R² on index chart.

Companion stat panel:
- surrogate out-of-fold R²;
- Sobol base N;
- scramble replication difference.

---

### FIG-16 — Five-Dimension Research Framework

**Chapter:** 13  
**Data:** `data/metadata/five-dimension-framework.json`

Type:
- scrollytelling synthesis, not regression plot.

Stages:
1. normalized regime;
2. response magnitude;
3. dissipation-development demand;
4. material/stability trade-off;
5. foundation/scour uncertainty.

Motion:
- activate one dimension at a time;
- mini-views from prior figures appear;
- final state shows all five connected.

---

### FIG-17 — Research Explorer

**Chapter:** 14  
**Data:** multiple figure-level CSVs + normalized explorer extracts.

Controls:
- response;
- variable(s);
- family/regime;
- seed;
- chart mode.

Chart modes:
- scatter;
- binned response surface;
- percentile envelope;
- sensitivity ranking;
- model comparison.

Stat annotation engine chooses the scientifically correct summary:

```text
exact law       → equation + elasticity
fitted law      → equation + R²
rank relation   → Spearman ρ
Sobol           → S1 / ST
family envelope → p10 / p50 / p90
model compare   → ratio / agreement / uncertainty band
```

Every explorer view must show:
- `What this means`;
- `What this does not mean`.

No design recommendation output.

---

## 5. Suggested figure metadata schema

Example:

```json
{
  "id": "FIG-05",
  "chapter": "05",
  "title": "Unit discharge and Froude number compound downstream forcing",
  "data": "data/figures/fig-05-q-fr1-forcing.csv",
  "source_artifact": "Synthetic_Replicated_Response_Gradients_v0.1",
  "x": {"field": "q_m2_s", "unit": "m²/s"},
  "y": {"field": "Fr1", "unit": "-"},
  "response": {"field": "forcing_kW_m", "unit": "kW/m"},
  "model": {
    "type": "power-law",
    "equation": "P' ∝ q^1.66657 Fr1^1.86849",
    "r2": 0.999865
  },
  "caveat": "Replicated synthetic eligible formal-jump domain; not field validation.",
  "animation": ["axes", "points", "surface", "equation"],
  "interaction": ["hover", "family-filter", "log-toggle"]
}
```

---

## 6. Colour and legend policy

Use consistent semantic colours across all figures.

Recommended:
- hydraulics: teal/aqua;
- geometry/material: navy;
- adverse/high response: coral;
- foundation/scour: sand/earth accent;
- F2/F3/F4/transition: fixed family palette defined once in metadata;
- out-of-domain/uncertain: grey.

Legends:
- direct labels preferred when practical;
- legend order remains stable across figures;
- family colours never change between charts;
- uncertainty patterns use opacity/stroke in addition to colour.

---

## 7. Trendline/statistics policy

A reader should never have to guess whether a line is:
- an exact physical equation;
- a fitted empirical relation;
- a median trend;
- a smoothing curve;
- an uncertainty boundary.

Every line receives a visible line-type label and tooltip description.

Examples:
- **solid analytical** — exact equation;
- **solid fitted** — fitted model with equation + R²;
- **dashed reference** — 1:1 or factor boundary;
- **shaded interval** — q10–q90 or p10–p90;
- **thin connection** — seed/family sequence only, not regression.

---

## 8. Data reduction policy

The browser should not load the entire 200K raw research dataset by default.

Use:
- exact figure extracts;
- stratified/downsampled scatter extracts where the visual conclusion is unchanged;
- binned surfaces for dense response maps;
- full aggregated counts/percentiles for family statistics;
- enough point-level data for meaningful hover/filter interaction.

Any downsampling method must be documented in figure metadata.

If a chart's regression/equation was fitted on a larger frozen dataset than is displayed, metadata must state:

`display sample != fit sample`

and preserve the frozen model coefficients from the full research analysis.

---

## 9. Quality-control checks for every figure

Before publication:

- [ ] CSV loads successfully.
- [ ] Required fields exist.
- [ ] Units match research artifact.
- [ ] sample count matches expected scope.
- [ ] regression coefficients match frozen results.
- [ ] R² / ρ / Sobol values match frozen results.
- [ ] family labels use canonical F1/F2/F3/F4/Transition meaning.
- [ ] caveat appears in metadata and visible figure note.
- [ ] animation does not hide/reclassify data.
- [ ] hover values are correctly formatted.
- [ ] axes start/log-transform appropriately.
- [ ] mobile rendering preserves interpretation.
- [ ] reduced-motion mode renders a complete static state.
- [ ] textual takeaway is understandable without interacting.

---

## 10. Recommended first build order

1. FIG-01 initiating diagnostic;
2. FIG-02 dependency graph;
3. FIG-04 head surface;
4. FIG-05 forcing surface;
5. FIG-06 material surface;
6. FIG-08 Pareto;
7. FIG-09/10 family map + trade-offs;
8. FIG-12 jump scaling;
9. FIG-13/14 scour uncertainty;
10. FIG-15 Sobol;
11. FIG-16 five-dimension synthesis;
12. FIG-17 explorer.

This order follows the reader's conceptual journey and lets reusable chart utilities emerge naturally.

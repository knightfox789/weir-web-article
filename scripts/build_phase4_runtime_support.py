#!/usr/bin/env python3
"""Phase 4 render-support augmentation for FIG-03, FIG-05 and FIG-06.

This script does not re-fit or change frozen research findings. It adds only
render-support fields that are directly extracted from existing authoritative
Phase 2 sources: replication counts, a deterministic source-point display
sample, and parameter ranges for interactive controls.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path

import numpy as np
import pandas as pd

SOURCE_DIR = Path(os.environ.get("WEIR_SOURCE_DIR", "/mnt/data/phase2_sources"))
REPO_ROOT = Path(os.environ.get("WEIR_REPO_ROOT", Path(__file__).resolve().parents[1]))
RUNTIME = REPO_ROOT / "data" / "runtime"

WHOLE = SOURCE_DIR / "Synthetic_Whole_System_50K_v0.1.csv"
FAMILY = SOURCE_DIR / "Synthetic_Family_Neighborhood_Assignment_v0.1.csv"
SHARES = SOURCE_DIR / "Synthetic_Family_Replication_Shares_v0.1.csv"

for path in (WHOLE, FAMILY, SHARES):
    if not path.exists():
        raise SystemExit(f"Missing authoritative Phase 2 source: {path}")

whole = pd.read_csv(WHOLE)
fam = pd.read_csv(FAMILY)
shares = pd.read_csv(SHARES)

assert len(whole) == 50_000
assert len(fam) == 2_585
eligible_by_seed_series = shares.groupby("seed")["eligible_n"].first()
assert len(eligible_by_seed_series) == 4
assert int(eligible_by_seed_series.sum()) == 10_317


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def refresh_runtime_manifest() -> None:
    manifest_path = REPO_ROOT / "data" / "metadata" / "runtime-asset-manifest.json"
    if not manifest_path.exists():
        return
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    for asset in manifest.get("assets", []):
        path = REPO_ROOT / asset["path"]
        if not path.exists():
            raise SystemExit(f"Runtime asset listed in manifest is missing: {path}")
        asset["sha256"] = sha256(path)
        asset["bytes"] = path.stat().st_size
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def load_runtime(name: str) -> dict:
    return json.loads((RUNTIME / name).read_text(encoding="utf-8"))


def write_runtime(name: str, payload: dict) -> None:
    (RUNTIME / name).write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )


fig3 = load_runtime("fig-03-experiment-scale.json")
fig3["replication"] = {
    "method": "four independent 50,000-scenario Latin hypercube samples",
    "seed_count": 4,
    "scenarios_per_seed": 50_000,
    "total_lhs_scenarios": 200_000,
    "eligible_by_seed": {
        str(int(seed)): int(count) for seed, count in eligible_by_seed_series.items()
    },
    "pooled_eligible_family_cases": 10_317,
}
fig3["global_sensitivity"] = {
    "method": "scrambled Sobol/Jansen",
    "base_N": 8_192,
}
fig3["note"] = (
    "Counts are study-population context; visual dots are symbolic and do not "
    "represent real-world probability."
)
write_runtime("fig-03-experiment-scale.json", fig3)


fig5 = load_runtime("fig-05-forcing-response.json")
idx = np.linspace(0, len(fam) - 1, 60, dtype=int)
cols = [
    "scenario_id",
    "family_neighborhood",
    "unit_discharge_m2s",
    "Fr1",
    "forcing_kW_m",
]
points = fam.iloc[idx][cols].copy()
for col in ("unit_discharge_m2s", "Fr1", "forcing_kW_m"):
    points[col] = points[col].round(6)
fig5["display_scope"] = {
    "population": "deterministic 60-state display sample from one eligible source seed",
    "display_sample_n": 60,
    "fit_scope": "frozen pooled eligible four-seed formal-jump relationship",
    "display_sample_not_fit_sample": True,
}
fig5["display_domain"] = {
    "q_m2s": [round(float(fam.unit_discharge_m2s.min()), 6), round(float(fam.unit_discharge_m2s.max()), 6)],
    "Fr1": [round(float(fam.Fr1.min()), 6), round(float(fam.Fr1.max()), 6)],
}
fig5["points"] = points.to_dict("records")
fig5["surface_policy"] = (
    "Relative fitted-response surface uses the frozen exponents only; absolute "
    "kW/m values are shown only for source-data points."
)
fig5["caveat"] = (
    "Fitted synthetic relationship over the eligible formal-jump research domain; "
    "not a final basin-design equation."
)
write_runtime("fig-05-forcing-response.json", fig5)


fig6 = load_runtime("fig-06-body-area.json")
fig6["ranges"] = {
    "structure_height_m": [float(whole.structure_height_m.min()), float(whole.structure_height_m.max())],
    "top_width_m": [float(whole.top_width_m.min()), float(whole.top_width_m.max())],
    "downstream_slope_h_per_v": [
        float(whole.downstream_slope_h_per_v.min()),
        float(whole.downstream_slope_h_per_v.max()),
    ],
}
fig6["caveat"] = (
    "Body area is a material proxy, not reinforcement quantity, foundation quantity "
    "or construction cost."
)
write_runtime("fig-06-body-area.json", fig6)

refresh_runtime_manifest()

print(json.dumps({
    "fig03_total_lhs": fig3["replication"]["total_lhs_scenarios"],
    "fig03_pooled_eligible": fig3["replication"]["pooled_eligible_family_cases"],
    "fig05_display_points": len(fig5["points"]),
    "fig05_display_domain": fig5["display_domain"],
    "fig06_ranges": fig6["ranges"],
}, indent=2))

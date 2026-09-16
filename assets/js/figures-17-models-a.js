import { makeSelectControl, fmt } from './figure-core.js';

export const VIEW_META = {
  'fig-04-head-response': {
    figure: 'FIG-04', label: 'Head response', file: 'fig-04-head-response.json',
    population: 'Frozen Q/L/C ranges from the 50,000-state whole-system population.',
    boundary: 'Exact within the selected broad-crested formulation; applicability limits are separate.'
  },
  'fig-05-forcing-response': {
    figure: 'FIG-05', label: 'Downstream forcing', file: 'fig-05-forcing-response.json',
    population: 'Frozen pooled eligible formal-jump relationship; browser point display is a deterministic 60-state source sample.',
    boundary: 'Fitted synthetic relationship, not a final basin-design equation.'
  },
  'fig-06-body-area': {
    figure: 'FIG-06', label: 'Body-area material proxy', file: 'fig-06-body-area.json',
    population: 'Exact body-area identity over the frozen study parameter ranges.',
    boundary: 'Body area is a material proxy, not reinforcement, foundation quantity or construction cost.'
  },
  'fig-09-family-map': {
    figure: 'FIG-09', label: 'Normalized family map', file: 'fig-09-family-map.json',
    population: '10,317 pooled eligible family-assigned cases; display points are a deterministic 60-state source sample.',
    boundary: 'Research families are fuzzy behavioural envelopes; F1 is especially transitional and they are not design types.'
  },
  'fig-10-family-tradeoffs': {
    figure: 'FIG-10', label: 'Family trade-offs', file: 'fig-10-family-tradeoffs.json',
    population: '10,317 pooled eligible cases summarized by family.',
    boundary: 'Relative synthetic trade-offs, not economic or site-specific optima.'
  },
  'fig-12-hydraulic-jump': {
    figure: 'FIG-12', label: 'Hydraulic-jump development', file: 'fig-12-hydraulic-jump.json',
    population: '22,500 formal jump states over 4.5 ≤ Fr1 ≤ 9.',
    boundary: 'Reference jump scaling only; not final IS 4997:2026 basin dimensions.'
  },
  'fig-13-alluvial-model-comparison': {
    figure: 'FIG-13', label: 'BJ–DAF alluvial comparison', file: 'fig-13-alluvial-model-comparison.json',
    population: '25,000 alluvial states with 14,369 common positive comparison states.',
    boundary: 'Structured model disagreement is not site validation; neither equation is treated as truth and they are not averaged.'
  },
  'fig-14-disagreement-envelope': {
    figure: 'FIG-14', label: 'Disagreement envelope', file: 'fig-14-disagreement-envelope.json',
    population: '14,369 common-overlap states; browser predictions are a deterministic 30-state display sample.',
    boundary: 'Meta-model of BJ–DAF disagreement, not a physical scour equation or confidence interval for true field scour.'
  },
  'fig-15-global-sensitivity': {
    figure: 'FIG-15', label: 'Global Sobol sensitivity', file: 'fig-15-global-sensitivity.json',
    population: 'Dedicated scrambled Sobol/Jansen design with base N = 8,192 on validated response surrogates.',
    boundary: 'Indices are specific to the frozen synthetic ranges; stability is intentionally excluded from unconditional Sobol.'
  }
};

export const EXPECTED_REUSE = Object.keys(VIEW_META);

export const LABELS = {
  Q_m3s: 'Discharge Q', overflow_length_m: 'Overflow length L', C_bcw: 'Discharge coefficient C',
  Fr1_target: 'Froude number Fr1', structure_height_m: 'Structure height',
  downstream_slope_h_per_v: 'Downstream slope', top_width_m: 'Top width',
  log10_Pav_kW_m2: 'log10 available power Pav', log10_K: 'log10 erodibility index K', F_c: 'Foundation factor Fc'
};

export const FAMILY_METRICS_09 = {
  B_over_P: { label: 'B/P', unit: '—' },
  T_over_P: { label: 'T/P', unit: '—' },
  Fr1: { label: 'Froude number Fr1', unit: '—' },
  q_star: { label: 'Normalized unit discharge q*', unit: '—' },
  head_star: { label: 'Normalized head H*', unit: '—' },
  area_star: { label: 'Normalized body area A*', unit: '—' },
  force_star: { label: 'Normalized forcing', unit: '—' },
  rock_star: { label: 'Normalized rock threshold', unit: '—' }
};

export const FAMILY_METRICS_10 = {
  body_area_m2_per_m: { label: 'Body area', unit: 'm²/m' },
  forcing_kW_m: { label: 'Forcing', unit: 'kW/m' },
  tailwater_mismatch: { label: '|yt/y2 − 1|', unit: '—' },
  rock_threshold_ratio: { label: 'Rock threshold ratio', unit: '—' },
  slide_partial_factor_response: { label: 'Conditioned sliding diagnostic response', unit: '—' },
  flotation_ratio_diagnostic: { label: 'Flotation diagnostic ratio', unit: '—' }
};

export const JUMP_METRICS = {
  y2_y1: { label: 'Conjugate-depth ratio y2/y1', unit: '—' },
  dE_y1: { label: 'Normalized energy loss ΔE/y1', unit: '—' },
  Lcwc_y1: { label: 'CWC reference length / y1', unit: '—' },
  Lusace_y1: { label: 'USACE natural-length reference / y1', unit: '—' },
  Lcwc_Lusace: { label: 'CWC / USACE reference-length ratio', unit: '—' }
};

export const SOBOL_RESPONSES = {
  head_m: 'Head', forcing_kW_m: 'Downstream forcing', jump_energy_loss_m: 'Hydraulic-jump response',
  body_area_m2_per_m: 'Body area', weight_kN_m: 'Structural weight', log10_rock_threshold_ratio: 'Rock threshold ratio'
};

export function shortFamily(value = '') {
  const match = String(value).match(/F[1-4]/);
  return match ? match[0] : String(value);
}

export function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function formatValue(value, unit = '') {
  const n = safeNumber(value);
  if (n === null) return '—';
  const abs = Math.abs(n);
  const digits = abs >= 100 ? 1 : abs >= 10 ? 2 : 3;
  return `${fmt(n, digits)}${unit && unit !== '—' ? ` ${unit}` : ''}`;
}

export function metricOptions(map) {
  return Object.entries(map).map(([value, meta]) => ({ value, label: meta.label }));
}

export function initState(slug, data) {
  switch (slug) {
    case 'fig-04-head-response': return { variable: 'Q' };
    case 'fig-05-forcing-response': return { driver: 'q' };
    case 'fig-06-body-area': return { variable: data.sobol?.[0]?.variable || 'structure_height_m' };
    case 'fig-09-family-map': return { family: 'All', metric: 'B_over_P' };
    case 'fig-10-family-tradeoffs': return { family: 'All', metric: 'body_area_m2_per_m' };
    case 'fig-12-hydraulic-jump': return { metric: 'y2_y1' };
    case 'fig-13-alluvial-model-comparison': return { term: data.daf_exact_elasticities?.[0]?.DAF_dimensionless_term || 'b/z' };
    case 'fig-14-disagreement-envelope': return { family: 'All', metric: 'coverage' };
    case 'fig-15-global-sensitivity': return { response: 'head_m', mode: 'ST' };
    default: return {};
  }
}

function familyCodeFromRow(row) {
  return shortFamily(row.family || row.family_neighborhood || '');
}

function selectedFamilyRows(rows, family) {
  if (family === 'All') return rows;
  return rows.filter(row => familyCodeFromRow(row) === family);
}

export function fig04Model(data, state) {
  const variableMap = { Q: 'Q_m3s', L: 'overflow_length_m', C: 'C_bcw' };
  const key = variableMap[state.variable] || 'Q_m3s';
  const sobol = data.sobol.find(d => d.variable === key) || {};
  const range = data.ranges[key] || [];
  const elasticity = data.elasticities[state.variable];
  return {
    statistic: `Exact elasticity of ${state.variable}`,
    rows: [{ label: `Elasticity of ${state.variable}`, value: elasticity, unit: '—' }],
    cards: [
      ['Exact elasticity', formatValue(elasticity)],
      ['Total-order ST', formatValue(sobol.ST)],
      ['Frozen range', range.length === 2 ? `${formatValue(range[0])} – ${formatValue(range[1])}` : '—']
    ],
    meaning: `${state.variable} has an exact elasticity of ${formatValue(elasticity)} within H = [Q/(C L)]^(2/3).`,
    notMeaning: 'This does not make the explorer a head-sizing calculator and does not establish applicability outside the selected broad-crested formulation.'
  };
}

export function fig05Model(data, state) {
  const q = state.driver === 'q';
  const exponent = q ? data.relationship.q_exponent : data.relationship.Fr1_exponent;
  const effect = q ? data.relationship.pct_effect_10pct_q : data.relationship.pct_effect_10pct_Fr1;
  const name = q ? 'unit discharge q' : 'Froude number Fr1';
  const range = q ? data.ranges.q_m2s : data.ranges.Fr1;
  return {
    statistic: `Frozen fitted exponent for ${name}`,
    rows: [{ label: name, value: exponent, unit: '—' }],
    cards: [
      ['Fitted exponent', formatValue(exponent)],
      ['+10% finite change', `≈ +${fmt(effect,1)}%`],
      ['Fit R²', formatValue(data.relationship.r2, '')],
      ['Frozen range', `${formatValue(range[0])} – ${formatValue(range[1])}`]
    ],
    meaning: `In the frozen pooled eligible formal-jump relationship, forcing scales approximately with ${name} to exponent ${formatValue(exponent)}.`,
    notMeaning: 'The exponent is a fitted synthetic response relationship, not an absolute forcing calibration or a final basin-design equation.'
  };
}

export function fig06Model(data, state) {
  const row = data.sobol.find(d => d.variable === state.variable) || data.sobol[0];
  const range = data.ranges[row.variable] || [];
  return {
    statistic: `Global body-area sensitivity for ${LABELS[row.variable] || row.variable}`,
    rows: [{ label: LABELS[row.variable] || row.variable, value: row.ST, unit: '—' }],
    cards: [
      ['Total-order ST', formatValue(row.ST)],
      ['First-order S1', formatValue(row.S1)],
      ['Frozen range', range.length === 2 ? `${formatValue(range[0])} – ${formatValue(range[1])}` : '—'],
      ['Exact identity', data.equation]
    ],
    meaning: `${LABELS[row.variable] || row.variable} contributes ST ${formatValue(row.ST)} to body-area variance over the frozen ranges.`,
    notMeaning: 'Body area remains a material proxy; it does not specify reinforcement, foundation quantities, construction cost or recommended geometry.'
  };
}

export function fig09Model(data, state) {
  const metric = FAMILY_METRICS_09[state.metric] || FAMILY_METRICS_09.B_over_P;
  const rows = selectedFamilyRows(data.envelopes, state.family).map(d => ({
    label: d.family,
    value: d[`${state.metric}_p50`],
    lo: d[`${state.metric}_p10`],
    hi: d[`${state.metric}_p90`],
    unit: metric.unit
  }));
  return {
    statistic: `${metric.label} family p10–p50–p90`,
    rows,
    cards: [
      ['Eligible population', fmt(data.eligible_population,0)],
      ['Display points', fmt(data.display_population,0)],
      ['Selected family', state.family === 'All' ? 'All four' : state.family],
      ['Statistic', 'p10 / p50 / p90']
    ],
    meaning: `${metric.label} is shown as the released pooled family envelope${state.family === 'All' ? ' across all four families' : ` for ${state.family}`}.`,
    notMeaning: 'Family envelopes are fuzzy research regimes, not fixed design classes; F1 is especially a transition family.'
  };
}

export function fig10Model(data, state) {
  const metric = FAMILY_METRICS_10[state.metric] || FAMILY_METRICS_10.body_area_m2_per_m;
  const rows = selectedFamilyRows(data.families, state.family).map(d => ({
    label: shortFamily(d.family),
    value: d[`${state.metric}_p50`],
    lo: d[`${state.metric}_p10`],
    hi: d[`${state.metric}_p90`],
    unit: metric.unit
  }));
  return {
    statistic: `${metric.label} family p10–p50–p90`,
    rows,
    cards: [
      ['Selected family', state.family === 'All' ? 'All four' : state.family],
      ['Statistic', 'p10 / p50 / p90'],
      ['Comparison type', 'Synthetic family trade-off'],
      ['Winner', 'None']
    ],
    meaning: `${metric.label} is compared using the released family percentile summaries within the synthetic study space.`,
    notMeaning: 'The comparison does not identify an economic optimum, site-specific optimum, best family or recommended weir section.'
  };
}


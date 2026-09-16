import { makeSelectControl, fmt } from './figure-core.js';
import {
  LABELS, FAMILY_METRICS_09, FAMILY_METRICS_10, JUMP_METRICS, SOBOL_RESPONSES,
  shortFamily, formatValue, metricOptions, fig04Model, fig05Model, fig06Model, fig09Model, fig10Model
} from './figures-17-models-a.js';

function fig12Model(data, state) {
  const metric = JUMP_METRICS[state.metric] || JUMP_METRICS.y2_y1;
  const q10 = data.quantiles[0]?.[state.metric];
  const q50 = data.quantiles[1]?.[state.metric];
  const q90 = data.quantiles[2]?.[state.metric];
  return {
    statistic: `${metric.label} population p10–p50–p90`,
    rows: [{ label: metric.label, value: q50, lo: q10, hi: q90, unit: metric.unit }],
    cards: [
      ['Formal-jump population', fmt(data.population,0)],
      ['Fr1 domain', `${fmt(data.domain.Fr1[0],1)} – ${fmt(data.domain.Fr1[1],1)}`],
      ['Median', formatValue(q50, metric.unit)],
      ['Statistic', 'p10 / p50 / p90']
    ],
    meaning: `${metric.label} is summarized over the released 22,500-state formal-jump research population.`,
    notMeaning: 'The reference lengths are not final stilling-basin dimensions and do not resolve IS 4997:2026 design requirements.'
  };
}

function fig13Model(data, state) {
  const term = data.daf_exact_elasticities.find(d => d.DAF_dimensionless_term === state.term) || data.daf_exact_elasticities[0];
  return {
    statistic: `Exact DAF term exponent for ${term.DAF_dimensionless_term}`,
    rows: [{ label: term.DAF_dimensionless_term, value: term.exponent, unit: '—' }],
    cards: [
      ['Common overlap', fmt(data.common_overlap_n,0)],
      ['Median DAF/BJ', formatValue(data.median_ratio)],
      ['Spearman ρ', formatValue(data.spearman)],
      ['Within factor 2', `${fmt(data.within_factor_2_pct,1)}%`],
      ['p10–p90 ratio', `${formatValue(data.p10_ratio)} – ${formatValue(data.p90_ratio)}`],
      ['+10% selected term', `${term.effect_of_10pct_increase_pct >= 0 ? '+' : ''}${fmt(term.effect_of_10pct_increase_pct,1)}% DAF`]
    ],
    meaning: `The selected DAF term has exact exponent ${formatValue(term.exponent)} inside the DAF equation, while the full comparison shows structured BJ–DAF disagreement.`,
    notMeaning: 'Neither BJ nor DAF is treated as field truth, the two estimates are not averaged, and the factor bands are not engineering acceptance limits.'
  };
}

function fig14Model(data, state) {
  const overall = data.interaction_model_comparison.find(d => d.model === 'P7_ytXd50') || data.interaction_model_comparison[data.interaction_model_comparison.length - 1];
  const family = state.family === 'All' ? null : data.family_diagnostics.find(d => d.family === state.family);
  let value, label;
  if (state.metric === 'coverage') {
    value = family ? family.coverage80 : overall.coverage80;
    label = 'q10–q90 coverage';
  } else {
    value = family ? family.regime_accuracy : overall.regime;
    label = 'Regime accuracy';
  }
  return {
    statistic: `${label}${state.family === 'All' ? ' — preferred v0.3 overall' : ` — ${state.family}`}`,
    rows: [{ label: state.family === 'All' ? 'Preferred v0.3 overall' : state.family, value, unit: '—' }],
    cards: [
      ['Common overlap', fmt(data.population,0)],
      ['Selected context', state.family === 'All' ? 'Preferred v0.3 overall' : state.family],
      [label, `${fmt(value * 100,1)}%`],
      ['v0.3 terms', fmt(data.model_v0_3_terms.length,0)]
    ],
    meaning: `${label} describes the released BJ–DAF disagreement meta-model${state.family === 'All' ? '' : ` within ${state.family}`}.`,
    notMeaning: 'Coverage or regime accuracy does not validate true field scour; the disagreement envelope is not a physical scour equation.'
  };
}

function fig15Model(data, state) {
  const field = state.mode;
  const rows = data.indices.filter(d => d.response === state.response).sort((a,b) => Number(b[field]) - Number(a[field])).map(d => ({
    label: LABELS[d.variable] || d.variable,
    value: d[field],
    lo: state.mode === 'ST' ? d.ST_lo95 : state.mode === 'S1' ? d.S1_lo95 : null,
    hi: state.mode === 'ST' ? d.ST_hi95 : state.mode === 'S1' ? d.S1_hi95 : null,
    unit: '—'
  }));
  const rep = data.replication_check.find(d => d.response === state.response);
  const oof = data.indices.find(d => d.response === state.response)?.surrogate_oof_r2;
  return {
    statistic: `${SOBOL_RESPONSES[state.response] || state.response} · ${state.mode === 'interaction_gap_ST_minus_S1' ? 'ST − S1 interaction contribution' : state.mode}`,
    rows,
    cards: [
      ['Sobol base N', fmt(data.design.base_N,0)],
      ['Response', SOBOL_RESPONSES[state.response] || state.response],
      ['Surrogate OOF R²', formatValue(oof)],
      ['Max |ΔST| replicate', rep ? formatValue(rep.max_abs_ST_diff_for_ST_ge_0_01) : '—']
    ],
    meaning: `${state.mode === 'S1' ? 'S1 shows first-order influence.' : state.mode === 'ST' ? 'ST shows total influence including interactions.' : 'ST − S1 shows the released interaction contribution.'} Rankings apply to the frozen synthetic ranges.`,
    notMeaning: 'The ranking is not universal, and stability/sliding is intentionally excluded from unconditional Sobol interpretation.'
  };
}

export function buildModel(slug, data, state) {
  switch (slug) {
    case 'fig-04-head-response': return fig04Model(data, state);
    case 'fig-05-forcing-response': return fig05Model(data, state);
    case 'fig-06-body-area': return fig06Model(data, state);
    case 'fig-09-family-map': return fig09Model(data, state);
    case 'fig-10-family-tradeoffs': return fig10Model(data, state);
    case 'fig-12-hydraulic-jump': return fig12Model(data, state);
    case 'fig-13-alluvial-model-comparison': return fig13Model(data, state);
    case 'fig-14-disagreement-envelope': return fig14Model(data, state);
    case 'fig-15-global-sensitivity': return fig15Model(data, state);
    default: throw new Error(`Unsupported explorer view: ${slug}`);
  }
}

function addSelect(container, label, options, value, onChange) {
  const control = makeSelectControl({ label, options, value, onChange });
  container.append(control.wrap);
  return control;
}

function familyOptions(includeF1 = true) {
  const values = includeF1 ? ['F1','F2','F3','F4'] : ['F2','F3','F4','Transition'];
  return [{ value: 'All', label: 'All released contexts' }, ...values.map(v => ({ value: v, label: v }))];
}

export function buildContextControls(slug, data, state, container, refresh) {
  container.replaceChildren();
  if (slug === 'fig-04-head-response') {
    addSelect(container, 'Variable', [{value:'Q',label:'Discharge Q'},{value:'L',label:'Overflow length L'},{value:'C',label:'Coefficient C'}], state.variable, v => { state.variable=v; refresh(); });
  } else if (slug === 'fig-05-forcing-response') {
    addSelect(container, 'Driver', [{value:'q',label:'Unit discharge q'},{value:'Fr1',label:'Froude number Fr1'}], state.driver, v => { state.driver=v; refresh(); });
  } else if (slug === 'fig-06-body-area') {
    addSelect(container, 'Variable', data.sobol.map(d => ({ value:d.variable, label:LABELS[d.variable] || d.variable })), state.variable, v => { state.variable=v; refresh(); });
  } else if (slug === 'fig-09-family-map') {
    addSelect(container, 'Family/regime', familyOptions(true), state.family, v => { state.family=v; refresh(); });
    addSelect(container, 'Metric', metricOptions(FAMILY_METRICS_09), state.metric, v => { state.metric=v; refresh(); });
  } else if (slug === 'fig-10-family-tradeoffs') {
    addSelect(container, 'Family/regime', familyOptions(true), state.family, v => { state.family=v; refresh(); });
    addSelect(container, 'Metric', metricOptions(FAMILY_METRICS_10), state.metric, v => { state.metric=v; refresh(); });
  } else if (slug === 'fig-12-hydraulic-jump') {
    addSelect(container, 'Metric', metricOptions(JUMP_METRICS), state.metric, v => { state.metric=v; refresh(); });
  } else if (slug === 'fig-13-alluvial-model-comparison') {
    addSelect(container, 'DAF term', data.daf_exact_elasticities.map(d => ({value:d.DAF_dimensionless_term,label:d.DAF_dimensionless_term})), state.term, v => { state.term=v; refresh(); });
  } else if (slug === 'fig-14-disagreement-envelope') {
    addSelect(container, 'Family/regime', familyOptions(false), state.family, v => { state.family=v; refresh(); });
    addSelect(container, 'Diagnostic', [{value:'coverage',label:'q10–q90 coverage'},{value:'regime',label:'Regime accuracy'}], state.metric, v => { state.metric=v; refresh(); });
  } else if (slug === 'fig-15-global-sensitivity') {
    addSelect(container, 'Response', Object.entries(SOBOL_RESPONSES).map(([value,label]) => ({value,label})), state.response, v => { state.response=v; refresh(); });
    addSelect(container, 'Sensitivity statistic', [{value:'ST',label:'ST total order'},{value:'S1',label:'S1 first order'},{value:'interaction_gap_ST_minus_S1',label:'ST − S1 interaction'}], state.mode, v => { state.mode=v; refresh(); });
  }
}


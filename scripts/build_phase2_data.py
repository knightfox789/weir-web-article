#!/usr/bin/env python3
"""Build Phase-2 chart-ready runtime assets for the Weir Research web article.

Inputs are authoritative research CSVs supplied privately in SOURCE_DIR.
Outputs are compact JSON runtime assets and provenance manifests; no source CSV is copied.
PNG/JPG figures are never read.
"""
from __future__ import annotations
import hashlib, json, os
from pathlib import Path
import numpy as np
import pandas as pd

SOURCE_DIR = Path(os.environ.get('WEIR_SOURCE_DIR','/mnt/data/phase2_sources'))
OUT = Path(os.environ.get('WEIR_OUT_DIR','/mnt/data/phase2_build'))
(OUT/'runtime').mkdir(parents=True, exist_ok=True)
(OUT/'metadata').mkdir(parents=True, exist_ok=True)

SOURCES = [
'Synthetic_Whole_System_50K_v0.1.csv','Synthetic_Family_Neighborhood_Assignment_v0.1.csv',
'Synthetic_Family_Replication_Sensitivity_v0.1.csv','Synthetic_TradeSpace_Archetypes_v0.1.csv',
'Synthetic_Dimensionless_Family_Envelopes_v0.1.csv','Synthetic_Replicated_Family_Tradeoff_Matrix_v0.1.csv',
'Synthetic_Family_Replication_Shares_v0.1.csv','Hydraulic_Jump_Normalized_Scaling_22p5K_v0.1.csv',
'Hydraulic_Jump_Normalized_Scaling_Quantiles_v0.1.csv','Alluvial_Scour_Comparison_25K_v0.1.csv',
'Alluvial_Disagreement_Compact_Envelope_Predictions_v0.3.csv','Alluvial_Disagreement_Compact_Envelope_Family_Diagnostics_v0.3.csv',
'Alluvial_Disagreement_Compact_Envelope_Coefficients_v0.2.csv','Alluvial_Disagreement_F2_q_Quartile_Calibration_v0.1.csv',
'Alluvial_Disagreement_Interaction_Control_v0.1.csv','Alluvial_Disagreement_ytH_d50_Interaction_Calibration_v0.1.csv',
'DAF_Alluvial_Exact_Elasticities_v0.1.csv','Whole_System_Surrogate_Sobol_Indices_v0.1.csv',
'Global_Sensitivity_Sobol_Replication_Check_v0.1.csv','Synthetic_Replicated_Stability_Multivariable_v0.1.csv',
'Synthetic_Replicated_Regime_Sensitivity_v0.2.csv']

def sha256(p:Path):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda:f.read(1024*1024), b''): h.update(b)
    return h.hexdigest()

def write(name,obj):
    p=OUT/'runtime'/name
    p.write_text(json.dumps(obj,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    return {'path':f'data/runtime/{name}','sha256':sha256(p),'bytes':p.stat().st_size}

def recs(df, cols, n=None):
    z=df[cols].copy()
    if n and len(z)>n:
        idx=np.linspace(0,len(z)-1,n,dtype=int)
        z=z.iloc[idx]
    for c in z.select_dtypes(include='number'):
        z[c]=z[c].round(6)
    return z.to_dict('records')

missing=[s for s in SOURCES if not (SOURCE_DIR/s).exists()]
if missing: raise SystemExit('Missing sources: '+', '.join(missing))
manifest=[]
for s in SOURCES:
    p=SOURCE_DIR/s
    manifest.append({'file':s,'sha256':sha256(p),'bytes':p.stat().st_size})
(OUT/'metadata'/'source-sha-manifest.json').write_text(json.dumps({'algorithm':'sha256','sources':manifest},indent=2),encoding='utf-8')

whole=pd.read_csv(SOURCE_DIR/'Synthetic_Whole_System_50K_v0.1.csv')
fam=pd.read_csv(SOURCE_DIR/'Synthetic_Family_Neighborhood_Assignment_v0.1.csv')
pareto=pd.read_csv(SOURCE_DIR/'Synthetic_TradeSpace_Archetypes_v0.1.csv')
env=pd.read_csv(SOURCE_DIR/'Synthetic_Dimensionless_Family_Envelopes_v0.1.csv')
trade=pd.read_csv(SOURCE_DIR/'Synthetic_Replicated_Family_Tradeoff_Matrix_v0.1.csv')
shares=pd.read_csv(SOURCE_DIR/'Synthetic_Family_Replication_Shares_v0.1.csv')
jump=pd.read_csv(SOURCE_DIR/'Hydraulic_Jump_Normalized_Scaling_22p5K_v0.1.csv').sort_values('Fr1')
jq=pd.read_csv(SOURCE_DIR/'Hydraulic_Jump_Normalized_Scaling_Quantiles_v0.1.csv')
alluv=pd.read_csv(SOURCE_DIR/'Alluvial_Scour_Comparison_25K_v0.1.csv')
pred=pd.read_csv(SOURCE_DIR/'Alluvial_Disagreement_Compact_Envelope_Predictions_v0.3.csv')
fdiag=pd.read_csv(SOURCE_DIR/'Alluvial_Disagreement_Compact_Envelope_Family_Diagnostics_v0.3.csv')
coef=pd.read_csv(SOURCE_DIR/'Alluvial_Disagreement_Compact_Envelope_Coefficients_v0.2.csv')
daf_el=pd.read_csv(SOURCE_DIR/'DAF_Alluvial_Exact_Elasticities_v0.1.csv')
f2q=pd.read_csv(SOURCE_DIR/'Alluvial_Disagreement_F2_q_Quartile_Calibration_v0.1.csv')
interact=pd.read_csv(SOURCE_DIR/'Alluvial_Disagreement_Interaction_Control_v0.1.csv')
ytd50=pd.read_csv(SOURCE_DIR/'Alluvial_Disagreement_ytH_d50_Interaction_Calibration_v0.1.csv')
stab=pd.read_csv(SOURCE_DIR/'Synthetic_Replicated_Stability_Multivariable_v0.1.csv')
sob=pd.read_csv(SOURCE_DIR/'Whole_System_Surrogate_Sobol_Indices_v0.1.csv')
rep=pd.read_csv(SOURCE_DIR/'Global_Sensitivity_Sobol_Replication_Check_v0.1.csv')

assets=[]
assets.append(write('fig-03-experiment-scale.json',{'source_population':50000,'counts':{'whole_system':len(whole),'competent_rock_family_pool':len(fam),'pareto_eligible':2585,'pareto_nondominated':len(pareto),'hydraulic_jump':len(jump),'alluvial':len(alluv),'alluvial_common_overlap':int(alluv['comparison_overlap'].sum())},'note':'Counts are study-population context; samples shown in later charts are display reductions.'}))
assets.append(write('fig-04-head-response.json',{'equation':'H=(Q/(C L))^(2/3)','elasticities':{'Q':2/3,'L':-2/3,'C':-2/3},'ranges':{'Q_m3s':[float(whole.Q_m3s.min()),float(whole.Q_m3s.max())],'overflow_length_m':[float(whole.overflow_length_m.min()),float(whole.overflow_length_m.max())],'C_bcw':[float(whole.C_bcw.min()),float(whole.C_bcw.max())]},'sobol':recs(sob[sob.response.eq('head_m')].sort_values('ST',ascending=False).head(5),['variable','S1','ST','S1_lo95','S1_hi95','ST_lo95','ST_hi95'])}))
assets.append(write('fig-05-forcing-response.json',{'relationship':{'form':"P' proportional to q^1.67 Fr1^1.87",'q_exponent':1.67,'Fr1_exponent':1.87,'r2':0.9999,'pct_effect_10pct_q':17.0,'pct_effect_10pct_Fr1':19.5},'ranges':{'q_m2s':[float(whole.unit_discharge_m2s.min()),float(whole.unit_discharge_m2s.max())],'Fr1':[float(whole.Fr1.dropna().min()),float(whole.Fr1.dropna().max())]},'sobol':recs(sob[sob.response.eq('forcing_kW_m')].sort_values('ST',ascending=False).head(3),['variable','S1','ST','interaction_gap_ST_minus_S1'])}))
assets.append(write('fig-06-body-area.json',{'equation':'A=P*T+0.5*s*P^2','normalized':'A/P^2=T/P+0.5*s','exact_identity':True,'sobol':recs(sob[sob.response.eq('body_area_m2_per_m')].sort_values('ST',ascending=False).head(3),['variable','S1','ST'])}))

pooled=stab[stab.family.eq('ALL')]
vars_=['cohesion_kPa','structure_height_m','downstream_slope_h_per_v','Q_m3s','tailwater_ratio']
vals=[]
for v in vars_:
    xs=[]
    for _,r in pooled.iterrows():
        for i in range(1,7):
            if r[f'top{i}_var']==v: xs.append(float(r[f'top{i}_coef']))
    vals.append({'variable':v,'standardized_coef_mean':round(float(np.mean(xs)),6),'standardized_coef_min':round(float(np.min(xs)),6),'standardized_coef_max':round(float(np.max(xs)),6)})
assets.append(write('fig-07-stability-drivers.json',{'replicated_seeds':pooled.seed.astype(int).tolist(),'pooled_r2_mean':round(float(pooled.r2_log_linear.mean()),6),'coefficients':vals,'caveat':'Diagnostic applicability-conditioned relationship; not a field factor-of-safety equation.'}))
assets.append(write('fig-08-pareto-trade-space.json',{'eligible_population':2585,'nondominated_n':len(pareto),'objectives':['body_area_m2_per_m','forcing_kW_m','tailwater_mismatch_abs','rock_threshold_ratio'],'display_population':50,'points':recs(pareto,['scenario_id','body_area_m2_per_m','forcing_kW_m','tailwater_mismatch_abs','rock_threshold_ratio','retention_fraction'],50),'caveat':'No scalar winner; exact nondominated membership is sample-sensitive.'}))
assets.append(write('fig-09-family-map.json',{'eligible_population':10317,'display_population':min(60,len(fam)),'points':recs(fam.sort_values('scenario_id'),['scenario_id','family_neighborhood','B_over_P','T_over_P'],60),'envelopes':recs(env,list(env.columns)),'family_shares_pct':{r['family']:round(float(r['share_pct']),3) for _,r in env.iterrows()}}))
assets.append(write('fig-10-family-tradeoffs.json',{'families':recs(trade,list(trade.columns)),'caveat':'Relative family comparisons within the synthetic study space; not design recommendations.'}))
assets.append(write('fig-11-family-replication.json',{'shares':recs(shares,list(shares.columns)),'seeds':sorted([int(x) for x in shares.seed.unique()]),'caveat':'Family occupancy is stable across seeds; exact Pareto membership is more sample-sensitive.'}))
assets.append(write('fig-12-hydraulic-jump.json',{'population':len(jump),'curve':recs(jump,['Fr1','y2_y1','dE_y1','Lcwc_y1','Lusace_y1','Lcwc_Lusace'],60),'quantiles':recs(jq,list(jq.columns)),'domain':{'Fr1':[4.5,9.0]},'caveat':'Reference scaling only; not final IS 4997:2026 basin dimensions.'}))
overlap=alluv[alluv.comparison_overlap.astype(bool)].copy(); overlap['ratio']=overlap.daf_scour_m/overlap.bj_scour_m
rho=float(overlap[['bj_scour_m','daf_scour_m']].corr(method='spearman').iloc[0,1])
ratio=overlap.ratio.replace([np.inf,-np.inf],np.nan).dropna()
assets.append(write('fig-13-alluvial-model-comparison.json',{'population':len(alluv),'common_overlap_n':len(overlap),'spearman':round(rho,6),'median_ratio':round(float(ratio.median()),6),'p10_ratio':round(float(ratio.quantile(.1)),6),'p90_ratio':round(float(ratio.quantile(.9)),6),'within_factor_2_pct':round(float(((ratio>=.5)&(ratio<=2)).mean()*100),3),'within_factor_5_pct':round(float(((ratio>=.2)&(ratio<=5)).mean()*100),3),'points':recs(overlap.sort_values('scenario_id'),['scenario_id','bj_scour_m','daf_scour_m','unit_discharge_m2s','yt_H','d50_m_syn'],30),'daf_exact_elasticities':recs(daf_el,list(daf_el.columns)),'caveat':'Model disagreement is structured; neither equation is treated as truth.'}))
assets.append(write('fig-14-disagreement-envelope.json',{'population':len(pred),'predictions':recs(pred.sort_values('scenario_id'),['scenario_id','family','ratio','unit_discharge_m2s','yt_H','d50_m_syn','pred_q10_ratio','pred_q50_ratio','pred_q90_ratio'],30),'family_diagnostics':recs(fdiag,list(fdiag.columns)),'coefficients_v0_2':recs(coef,list(coef.columns)),'f2_q_quartile_calibration':recs(f2q,list(f2q.columns)),'interaction_model_comparison':recs(interact,list(interact.columns)),'ytH_d50_calibration':recs(ytd50,list(ytd50.columns)),'model_v0_3_terms':['jet_velocity_m_s','yt_H','d90/d50','d50','b/B','unit_discharge_m2s','centered_log(yt/H)*centered_log(d50)'],'caveat':'Meta-model of BJ–DAF disagreement, not a physical scour equation.'}))
keepresp=['head_m','forcing_kW_m','jump_energy_loss_m','body_area_m2_per_m','weight_kN_m','log10_rock_threshold_ratio']
s15=[]
for resp in keepresp:
    z=sob[sob.response.eq(resp)].sort_values('ST',ascending=False).head(3)
    s15 += recs(z,['response','variable','S1','S1_lo95','S1_hi95','ST','ST_lo95','ST_hi95','interaction_gap_ST_minus_S1','surrogate_oof_r2'])
assets.append(write('fig-15-global-sensitivity.json',{'indices':s15,'replication_check':recs(rep,list(rep.columns)),'design':{'method':'scrambled Sobol/Jansen','base_N':8192},'caveat':'No unconditional sliding/stability Sobol: applicability-conditioned subset violates the standard assumptions.'}))
assets.append(write('fig-16-five-dimensions.json',{'dimensions':['normalized response regime','response magnitude','dissipation-development demand','material/stability trade-off','foundation/scour uncertainty']}))
assets.append(write('fig-17-research-explorer.json',{'reuse':['fig-04-head-response','fig-05-forcing-response','fig-06-body-area','fig-09-family-map','fig-10-family-tradeoffs','fig-12-hydraulic-jump','fig-13-alluvial-model-comparison','fig-14-disagreement-envelope','fig-15-global-sensitivity'],'policy':'Explorer reuses Phase-2 runtime summaries and does not expose the full upstream research tables.'}))

schema={'runtime_policy':'Compact JSON for browser rendering. No source CSV is copied; original raster figures are not read.','figures':{a['path'].split('/')[-1].replace('.json',''):{'path':a['path'],'format':'json'} for a in assets}}
(OUT/'metadata'/'runtime-schemas.json').write_text(json.dumps(schema,indent=2),encoding='utf-8')
(OUT/'metadata'/'runtime-asset-manifest.json').write_text(json.dumps({'assets':assets},indent=2),encoding='utf-8')
print(json.dumps({'assets':len(assets),'source_files':len(SOURCES),'out':str(OUT)},indent=2))

checks=[]
def check(name, observed, expected, tol=0.0):
    ok=abs(observed-expected)<=tol
    checks.append({'check':name,'observed':observed,'expected':expected,'tolerance':tol,'pass':bool(ok)})
    if not ok: raise AssertionError(f'{name}: {observed} != {expected} ± {tol}')
check('whole_system_n',len(whole),50000)
check('family_source_seed_n',len(fam),2585)
check('pareto_nondominated_n',len(pareto),101)
check('hydraulic_jump_n',len(jump),22500)
check('alluvial_n',len(alluv),25000)
check('alluvial_common_overlap_n',len(overlap),14369)
check('alluvial_spearman',rho,0.4223858884764722,1e-9)
check('alluvial_median_ratio',float(ratio.median()),1.106821610872801,1e-9)
check('alluvial_p10_ratio',float(ratio.quantile(.1)),0.3508025464147881,1e-9)
check('alluvial_p90_ratio',float(ratio.quantile(.9)),5.8458595646755676,1e-9)
check('alluvial_factor2_fraction',float(((ratio>=.5)&(ratio<=2)).mean()),0.503027350546315,1e-12)
sidx=sob.set_index(['response','variable'])
for name,key,expected,tol in [
 ('sobol_head_Q_ST',('head_m','Q_m3s'),0.621373,1e-6),
 ('sobol_head_L_ST',('head_m','overflow_length_m'),0.401308,1e-6),
 ('sobol_forcing_Fr1_ST',('forcing_kW_m','Fr1_target'),0.512270,1e-6),
 ('sobol_jump_Fr1_ST',('jump_energy_loss_m','Fr1_target'),0.809220,1e-6),
 ('sobol_area_height_ST',('body_area_m2_per_m','structure_height_m'),0.829,0.002),
 ('sobol_rock_Pav_ST',('log10_rock_threshold_ratio','log10_Pav_kW_m2'),0.675,0.002)]:
    check(name,float(sidx.loc[key,'ST']),expected,tol)
check('stability_pooled_r2_mean',float(pooled.r2_log_linear.mean()),0.876,0.002)
for v,e in [('cohesion_kPa',0.629),('structure_height_m',-0.256),('downstream_slope_h_per_v',0.167),('Q_m3s',-0.090),('tailwater_ratio',0.069)]:
    obs=next(x['standardized_coef_mean'] for x in vals if x['variable']==v)
    check('stability_'+v,obs,e,0.003)
check('runtime_asset_count',len(assets),15)
audit={'status':'PASS','checks':checks,'policy':{'source_csv_copied':False,'raster_used_as_data':False,'runtime_format':'json'},'notes':['FIG-01 and FIG-02 use existing metadata JSON; FIG-03 through FIG-17 have compact runtime JSON.','Full authoritative CSVs remain build inputs and are not copied into the public runtime layer.']}
(OUT/'metadata'/'phase-02-audit-results.json').write_text(json.dumps(audit,indent=2),encoding='utf-8')
print(f'Phase-2 audit PASS: {len(checks)} checks')

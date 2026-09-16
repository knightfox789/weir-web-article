import { REDUCED_MOTION, svgEl, htmlEl, clamp, fmt, frameFigure, makeSvg, observeOnce } from './figure-core.js';

export function renderFig01(mount, data) {
  const required = ['Q_m3s', 'overflow_length_m', 'structure_height_m', 'stated_top_width_m', 'stated_base_width_m', 'diagnostic_flags'];
  for (const field of required) if (!(field in data)) throw new Error(`FIG-01 missing required field: ${field}`);

  const ui = frameFigure(mount, {
    id: 'FIG-01',
    title: 'Initiating weir diagnostic',
    kicker: 'The arithmetic can look plausible while the represented system is still incomplete.',
    caveat: data.caveat || 'Illustrative initiating case only; not a final design.'
  });
  const svg = makeSvg(ui.canvas, '0 0 760 430', 'Animated diagnostic of the initiating weir section and five unresolved checks.');

  const defs = svgEl('defs');
  const marker = svgEl('marker', { id: 'p4-arrow', viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' });
  marker.append(svgEl('path', { d: 'M 0 0 L 10 5 L 0 10 z', class: 'p4-svg-arrow' }));
  defs.append(marker);
  svg.append(defs);

  svg.append(svgEl('path', { d: 'M35 342 H725', class: 'p4-ground' }));
  svg.append(svgEl('path', { d: 'M300 342 L328 178 L432 178 L548 342 Z', class: 'p4-structure', 'data-part': 'section' }));
  svg.append(svgEl('path', { d: 'M35 148 H328 V178 H432 C490 182 530 216 570 265 C610 315 660 326 725 326', class: 'p4-waterline', 'data-stage': '1' }));
  svg.append(svgEl('text', { x: '72', y: '128', class: 'p4-label', 'data-stage': '1' }, `Q = ${fmt(data.Q_m3s, 0)} m³/s`));
  svg.append(svgEl('text', { x: '350', y: '160', class: 'p4-label', 'data-stage': '1' }, `L ≈ ${fmt(data.overflow_length_m, 0)} m`));
  svg.append(svgEl('line', { x1: '328', y1: '148', x2: '328', y2: '178', class: 'p4-dimension', 'data-stage': '1' }));
  svg.append(svgEl('text', { x: '338', y: '143', class: 'p4-small-label', 'data-stage': '1' }, 'head / HFL check'));

  const dimGroup = svgEl('g', { 'data-stage': '2' });
  dimGroup.append(svgEl('line', { x1: '300', y1: '365', x2: '548', y2: '365', class: 'p4-dimension' }));
  dimGroup.append(svgEl('text', { x: '355', y: '394', class: 'p4-label p4-label--warning' }, `stated base = ${fmt(data.stated_base_width_m)} m`));
  dimGroup.append(svgEl('line', { x1: '328', y1: '158', x2: '432', y2: '158', class: 'p4-dimension' }));
  dimGroup.append(svgEl('text', { x: '342', y: '134', class: 'p4-label p4-label--warning' }, `crest = ${fmt(data.stated_top_width_m)} m`));
  dimGroup.append(svgEl('text', { x: '480', y: '235', class: 'p4-label p4-label--warning' }, data.stated_downstream_slope));
  svg.append(dimGroup);

  const stabilityGroup = svgEl('g', { 'data-stage': '3' });
  stabilityGroup.append(svgEl('circle', { cx: '392', cy: '282', r: '8', class: 'p4-centroid' }));
  stabilityGroup.append(svgEl('line', { x1: '392', y1: '312', x2: '392', y2: '244', class: 'p4-force-arrow', 'marker-end': 'url(#p4-arrow)' }));
  stabilityGroup.append(svgEl('text', { x: '408', y: '278', class: 'p4-small-label' }, 'centroid / resisting moment'));
  stabilityGroup.append(svgEl('line', { x1: '420', y1: '344', x2: '420', y2: '290', class: 'p4-force-arrow p4-force-arrow--uplift', 'marker-end': 'url(#p4-arrow)' }));
  stabilityGroup.append(svgEl('text', { x: '438', y: '321', class: 'p4-small-label p4-label--warning' }, 'uplift omitted'));
  svg.append(stabilityGroup);

  const unresolved = svgEl('g', { 'data-stage': '4' });
  unresolved.append(svgEl('rect', { x: '540', y: '300', width: '185', height: '72', rx: '12', class: 'p4-unresolved' }));
  unresolved.append(svgEl('text', { x: '558', y: '328', class: 'p4-label p4-label--warning' }, 'downstream protection'));
  unresolved.append(svgEl('text', { x: '558', y: '350', class: 'p4-small-label' }, 'apron · cutoff · jump · scour'));
  svg.append(unresolved);

  const stageDetails = [
    'Start with the stated section before judging it.',
    'Hydraulics appear first: discharge, overflow length and water levels must be internally consistent.',
    data.diagnostic_flags.find((d) => d.id === 'geometry')?.detail || 'The stated dimensions do not resolve to one consistent section.',
    'Centroid, resisting moment, uplift and hydraulic-depth assumptions require checks beyond the headline discharge calculation.',
    data.diagnostic_flags.find((d) => d.id === 'protection')?.detail || 'Downstream protection and foundation response remain unresolved.'
  ];
  const stageLabels = ['Section', 'Hydraulics', 'Geometry', 'Stability checks', 'Unresolved zone'];
  const buttons = htmlEl('div', 'p4-stepper');
  let stage = REDUCED_MOTION ? 4 : 0;

  function setStage(next) {
    stage = clamp(next, 0, 4);
    svg.querySelectorAll('[data-stage]').forEach((node) => {
      const visible = Number(node.getAttribute('data-stage')) <= stage;
      node.classList.toggle('is-visible', visible);
    });
    [...buttons.querySelectorAll('button')].forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === stage));
    });
    ui.summary.textContent = stageDetails[stage];
  }

  stageLabels.forEach((label, index) => {
    const button = htmlEl('button', 'p4-stepper__button', label);
    button.type = 'button';
    button.addEventListener('click', () => setStage(index));
    buttons.append(button);
  });
  ui.controls.append(buttons);
  ui.readout.innerHTML = `<div class="p4-stat"><strong>${fmt(data.structure_height_m, 1)} m</strong><span>stated height</span></div><div class="p4-stat"><strong>${data.foundation_description}</strong><span>stated foundation</span></div>`;
  setStage(stage);

  observeOnce(mount, () => {
    mount.classList.add('p4-entered');
    if (REDUCED_MOTION) return setStage(4);
    [1, 2, 3, 4].forEach((next, i) => window.setTimeout(() => setStage(next), 550 + i * 700));
  });
}

export function renderFig02(mount, data) {
  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) throw new Error('FIG-02 requires nodes and edges arrays.');
  const ui = frameFigure(mount, {
    id: 'FIG-02',
    title: 'Dependency network',
    kicker: 'Select a variable to see what sits upstream or downstream of it.',
    caveat: 'Conceptual dependency map; not an estimated causal DAG.'
  });
  const svg = makeSvg(ui.canvas, '0 0 880 570', 'Directed dependency network connecting hydraulic, geometry, stability and foundation variables.');

  const positions = {
    Q:[80,70], L:[80,130], C:[80,190], P:[80,300], T:[80,360], s:[80,420], foundation:[80,510],
    H:[310,70], q:[310,140], y1:[310,210], Fr1:[450,210], y2:[590,210], B:[310,330], area:[450,350], weight:[590,350],
    dE:[760,145], forcing:[760,230], tailwater:[760,305], stability:[760,390], rock:[760,475], alluvial:[590,515]
  };
  const nodeById = new Map(data.nodes.map((node) => [node.id, node]));
  const edgeNodes = [];
  const edgeLayer = svgEl('g', { class: 'p4-network__edges' });
  const nodeLayer = svgEl('g', { class: 'p4-network__nodes' });
  svg.append(edgeLayer, nodeLayer);

  function curve(a, b) {
    const [x1, y1] = positions[a];
    const [x2, y2] = positions[b];
    const mx = (x1 + x2) / 2;
    return `M${x1 + 58},${y1} C${mx},${y1} ${mx},${y2} ${x2 - 58},${y2}`;
  }

  data.edges.forEach((edge, index) => {
    if (!positions[edge.source] || !positions[edge.target]) return;
    const path = svgEl('path', { d: curve(edge.source, edge.target), class: 'p4-network__edge', 'data-source': edge.source, 'data-target': edge.target, pathLength: '1' });
    path.style.setProperty('--edge-delay', `${index * 24}ms`);
    edgeLayer.append(path);
    edgeNodes.push({ edge, path });
  });

  const typeLabel = { input:'input', design:'design choice', derived:'derived', response:'response', categorical:'foundation class', uncertainty:'uncertainty' };
  const nodeElements = new Map();
  data.nodes.forEach((node) => {
    const pos = positions[node.id];
    if (!pos) return;
    const [x, y] = pos;
    const g = svgEl('g', { class: `p4-network__node p4-network__node--${node.type}`, transform: `translate(${x},${y})`, tabindex: '0', role: 'button', 'aria-label': `${node.label}, ${typeLabel[node.type] || node.type}` });
    g.append(svgEl('rect', { x: '-58', y: '-23', width: '116', height: '46', rx: '12' }));
    g.append(svgEl('text', { x: '0', y: '-2', 'text-anchor': 'middle', class: 'p4-network__label' }, node.label));
    g.append(svgEl('text', { x: '0', y: '14', 'text-anchor': 'middle', class: 'p4-network__type' }, typeLabel[node.type] || node.type));
    nodeLayer.append(g);
    nodeElements.set(node.id, g);
  });

  const downstream = new Map();
  const upstream = new Map();
  data.nodes.forEach((n) => { downstream.set(n.id, []); upstream.set(n.id, []); });
  data.edges.forEach((e) => { downstream.get(e.source)?.push(e.target); upstream.get(e.target)?.push(e.source); });

  function traverse(start, map) {
    const seen = new Set([start]);
    const queue = [start];
    while (queue.length) {
      const current = queue.shift();
      for (const next of map.get(current) || []) {
        if (!seen.has(next)) { seen.add(next); queue.push(next); }
      }
    }
    return seen;
  }

  function selectNode(id) {
    const node = nodeById.get(id);
    if (!node) return;
    const mode = ['input','design','categorical'].includes(node.type) ? 'downstream' : ['response','uncertainty'].includes(node.type) ? 'upstream' : 'both';
    const down = mode === 'upstream' ? new Set([id]) : traverse(id, downstream);
    const up = mode === 'downstream' ? new Set([id]) : traverse(id, upstream);
    const active = new Set([...down, ...up]);
    nodeElements.forEach((element, nodeId) => element.classList.toggle('is-active', active.has(nodeId)));
    nodeElements.forEach((element, nodeId) => element.classList.toggle('is-selected', nodeId === id));
    edgeNodes.forEach(({ edge, path }) => {
      const inDown = down.has(edge.source) && down.has(edge.target);
      const inUp = up.has(edge.source) && up.has(edge.target);
      path.classList.toggle('is-active', inDown || inUp);
      path.classList.toggle('is-muted', !(inDown || inUp));
    });
    ui.summary.textContent = mode === 'downstream'
      ? `${node.label}: highlighted paths show quantities and responses downstream of this input.`
      : mode === 'upstream'
        ? `${node.label}: highlighted paths show the upstream quantities that feed this response.`
        : `${node.label}: highlighted paths show both its upstream dependencies and downstream consequences.`;
  }

  nodeElements.forEach((element, id) => {
    element.addEventListener('click', () => selectNode(id));
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectNode(id); }
    });
  });
  const clear = htmlEl('button', 'p4-button', 'Show full network');
  clear.type = 'button';
  clear.addEventListener('click', () => {
    nodeElements.forEach((el) => el.classList.remove('is-active', 'is-selected'));
    edgeNodes.forEach(({ path }) => path.classList.remove('is-active', 'is-muted'));
    ui.summary.textContent = data.derived_rule;
  });
  ui.controls.append(clear);
  ui.readout.innerHTML = '<div class="p4-legend"><span><i class="p4-key p4-key--input"></i> independent input</span><span><i class="p4-key p4-key--derived"></i> derived</span><span><i class="p4-key p4-key--response"></i> response</span></div>';
  ui.summary.textContent = data.derived_rule;
  observeOnce(mount, () => mount.classList.add('p4-entered'));
}


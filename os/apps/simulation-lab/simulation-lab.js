const STORAGE_KEYS = {
  purchases: 'und_agent_market_purchases',
  flow: 'sw_simulation_lab_flow_v1'
};
const LOCAL_BRIDGE = 'http://127.0.0.1:8765';

const seedAgents = [
  { id: 'seed-study', name: 'Study Buddy Pro', category: 'education', icon: '📚' },
  { id: 'seed-paper', name: 'Paper Synth', category: 'research', icon: '🧠' },
  { id: 'seed-ops', name: 'Ops Automator', category: 'operations', icon: '🏢' },
  { id: 'seed-prompt', name: 'Prompt Artist', category: 'creative', icon: '🎨' },
  { id: 'seed-debug', name: 'Python Debugger', category: 'productivity', icon: '🐍' }
];

const canvas = document.getElementById('canvas');
const linksLayer = document.getElementById('linksLayer');
const ownedAgentsList = document.getElementById('ownedAgentsList');
const inspector = document.getElementById('inspector');
const scenarioInput = document.getElementById('scenarioInput');
const dataInput = document.getElementById('dataInput');
const runStatus = document.getElementById('runStatus');
const simOutput = document.getElementById('simOutput');
const simLog = document.getElementById('simLog');
const projectNameInput = document.getElementById('projectName');
const useOllamaInput = document.getElementById('useOllama');
const modelInput = document.getElementById('modelInput');

let nodes = [];
let edges = [];
let selectedNodeId = null;
let pendingOutPort = null;

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const getOwnedAgents = () => {
  const purchased = readJson(STORAGE_KEYS.purchases, []);
  if (!Array.isArray(purchased) || purchased.length === 0) {
    return seedAgents;
  }
  return purchased.map((p) => ({
    id: p.id || `agent-${Date.now()}`,
    name: p.name || 'Custom Agent',
    category: p.category || 'general',
    icon: p.icon || '🤖'
  }));
};

const renderOwnedAgents = () => {
  const agents = getOwnedAgents();
  ownedAgentsList.innerHTML = '';
  agents.forEach((agent) => {
    const div = document.createElement('div');
    div.className = 'owned-item';
    div.textContent = `${agent.icon} ${agent.name} (${agent.category})`;
    ownedAgentsList.appendChild(div);
  });
};

const makeNode = (type, x = 80, y = 80) => {
  const id = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const owned = getOwnedAgents();
  const firstAgent = owned[0] || { id: 'seed-debug', name: 'Python Debugger' };
  const base = {
    id,
    type,
    x,
    y,
    title: type[0].toUpperCase() + type.slice(1),
    config: {}
  };

  if (type === 'source') {
    base.title = 'Scenario Source';
    base.config.prompt = 'Initial problem statement';
  }
  if (type === 'agent') {
    base.title = 'Agent Node';
    base.config.agentId = firstAgent.id;
    base.config.mode = 'analyze';
  }
  if (type === 'logic') {
    base.title = 'Logic Node';
    base.config.operation = 'summarize';
  }
  if (type === 'output') {
    base.title = 'Output Node';
  }

  nodes.push(base);
  selectedNodeId = id;
  renderAll();
};

const removeNode = (id) => {
  nodes = nodes.filter((n) => n.id !== id);
  edges = edges.filter((e) => e.from !== id && e.to !== id);
  if (selectedNodeId === id) selectedNodeId = null;
  renderAll();
};

const getNodeById = (id) => nodes.find((n) => n.id === id);

const connectNodes = (fromId, toId) => {
  if (fromId === toId) return;
  if (edges.some((e) => e.from === fromId && e.to === toId)) return;
  edges.push({ id: `edge-${Date.now()}-${Math.random()}`, from: fromId, to: toId });
  renderLinks();
};

const disconnectEdgeAt = (x, y) => {
  const margin = 6;
  edges = edges.filter((edge) => {
    const a = getNodeById(edge.from);
    const b = getNodeById(edge.to);
    if (!a || !b) return false;
    const x1 = a.x + 210;
    const y1 = a.y + 44;
    const x2 = b.x;
    const y2 = b.y + 44;
    const minX = Math.min(x1, x2) - margin;
    const maxX = Math.max(x1, x2) + margin;
    const minY = Math.min(y1, y2) - margin;
    const maxY = Math.max(y1, y2) + margin;
    const nearBox = x >= minX && x <= maxX && y >= minY && y <= maxY;
    return !nearBox;
  });
  renderLinks();
};

const renderNode = (node) => {
  const el = document.createElement('article');
  el.className = `node ${selectedNodeId === node.id ? 'selected' : ''}`;
  el.style.left = `${node.x}px`;
  el.style.top = `${node.y}px`;
  el.dataset.id = node.id;

  const preview = () => {
    if (node.type === 'source') return node.config.prompt || 'No source text';
    if (node.type === 'agent') {
      const owned = getOwnedAgents();
      const agent = owned.find((a) => a.id === node.config.agentId);
      return `${agent ? agent.name : 'Unknown agent'} | mode: ${node.config.mode || 'analyze'}`;
    }
    if (node.type === 'logic') return `Operation: ${node.config.operation || 'summarize'}`;
    return 'Collect final result';
  };

  el.innerHTML = `
    <div class="node-head node-type-${node.type}">
      <strong>${node.title}</strong>
      <button class="node-remove" type="button" title="Remove">✕</button>
    </div>
    <div class="node-body">${preview()}</div>
    <span class="port in" title="Input"></span>
    <span class="port out" title="Output"></span>
  `;

  const head = el.querySelector('.node-head');
  const btnRemove = el.querySelector('.node-remove');
  const inPort = el.querySelector('.port.in');
  const outPort = el.querySelector('.port.out');

  el.addEventListener('click', (event) => {
    if (event.target === inPort || event.target === outPort || event.target === btnRemove) return;
    selectedNodeId = node.id;
    renderInspector();
    renderNodes();
  });

  btnRemove.addEventListener('click', () => removeNode(node.id));

  outPort.addEventListener('click', (event) => {
    event.stopPropagation();
    pendingOutPort = node.id;
    document.querySelectorAll('.port.out').forEach((p) => p.classList.remove('active'));
    outPort.classList.add('active');
  });

  inPort.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!pendingOutPort) return;
    connectNodes(pendingOutPort, node.id);
    pendingOutPort = null;
    document.querySelectorAll('.port.out').forEach((p) => p.classList.remove('active'));
  });

  // Dragging
  let dragging = false;
  let sx = 0;
  let sy = 0;
  let ox = 0;
  let oy = 0;

  head.addEventListener('pointerdown', (event) => {
    dragging = true;
    sx = event.clientX;
    sy = event.clientY;
    ox = node.x;
    oy = node.y;
    head.setPointerCapture(event.pointerId);
  });

  head.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const dx = event.clientX - sx;
    const dy = event.clientY - sy;
    node.x = Math.max(10, Math.min(canvas.clientWidth - 220, ox + dx));
    node.y = Math.max(10, Math.min(canvas.clientHeight - 120, oy + dy));
    el.style.left = `${node.x}px`;
    el.style.top = `${node.y}px`;
    renderLinks();
  });

  head.addEventListener('pointerup', (event) => {
    dragging = false;
    if (head.hasPointerCapture(event.pointerId)) {
      head.releasePointerCapture(event.pointerId);
    }
  });

  return el;
};

const renderNodes = () => {
  canvas.querySelectorAll('.node').forEach((n) => n.remove());
  nodes.forEach((n) => canvas.appendChild(renderNode(n)));
};

const renderLinks = () => {
  linksLayer.innerHTML = '';
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  linksLayer.setAttribute('viewBox', `0 0 ${w} ${h}`);

  edges.forEach((edge) => {
    const fromNode = getNodeById(edge.from);
    const toNode = getNodeById(edge.to);
    if (!fromNode || !toNode) return;

    const x1 = fromNode.x + 210;
    const y1 = fromNode.y + 44;
    const x2 = toNode.x;
    const y2 = toNode.y + 44;
    const c1x = x1 + 56;
    const c2x = x2 - 56;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'link-line');
    path.setAttribute('d', `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`);
    linksLayer.appendChild(path);
  });
};

const renderInspector = () => {
  const node = getNodeById(selectedNodeId);
  if (!node) {
    inspector.innerHTML = '<p>Select a node to edit config</p>';
    return;
  }

  let html = `
    <label>Title</label>
    <input id="insTitle" type="text" value="${node.title}" />
  `;

  if (node.type === 'source') {
    html += `
      <label>Source Text</label>
      <textarea id="insPrompt" rows="5">${node.config.prompt || ''}</textarea>
    `;
  }

  if (node.type === 'agent') {
    const owned = getOwnedAgents();
    html += '<label>Agent</label><select id="insAgent">';
    owned.forEach((a) => {
      const selected = a.id === node.config.agentId ? 'selected' : '';
      html += `<option value="${a.id}" ${selected}>${a.icon} ${a.name}</option>`;
    });
    html += '</select>';
    html += `
      <label>Mode</label>
      <select id="insMode">
        <option value="analyze" ${node.config.mode === 'analyze' ? 'selected' : ''}>Analyze</option>
        <option value="brainstorm" ${node.config.mode === 'brainstorm' ? 'selected' : ''}>Brainstorm</option>
        <option value="critic" ${node.config.mode === 'critic' ? 'selected' : ''}>Critic</option>
        <option value="planner" ${node.config.mode === 'planner' ? 'selected' : ''}>Planner</option>
      </select>
    `;
  }

  if (node.type === 'logic') {
    html += `
      <label>Operation</label>
      <select id="insOp">
        <option value="summarize" ${node.config.operation === 'summarize' ? 'selected' : ''}>Summarize</option>
        <option value="expand" ${node.config.operation === 'expand' ? 'selected' : ''}>Expand</option>
        <option value="prioritize" ${node.config.operation === 'prioritize' ? 'selected' : ''}>Prioritize</option>
        <option value="risk-check" ${node.config.operation === 'risk-check' ? 'selected' : ''}>Risk Check</option>
      </select>
    `;
  }

  inspector.innerHTML = html;

  const insTitle = document.getElementById('insTitle');
  const insPrompt = document.getElementById('insPrompt');
  const insAgent = document.getElementById('insAgent');
  const insMode = document.getElementById('insMode');
  const insOp = document.getElementById('insOp');

  insTitle?.addEventListener('input', () => {
    node.title = insTitle.value;
    renderNodes();
  });

  insPrompt?.addEventListener('input', () => {
    node.config.prompt = insPrompt.value;
    renderNodes();
  });

  insAgent?.addEventListener('change', () => {
    node.config.agentId = insAgent.value;
    renderNodes();
  });

  insMode?.addEventListener('change', () => {
    node.config.mode = insMode.value;
    renderNodes();
  });

  insOp?.addEventListener('change', () => {
    node.config.operation = insOp.value;
    renderNodes();
  });
};

const renderAll = () => {
  renderNodes();
  renderLinks();
  renderInspector();
};

const topologicalOrder = () => {
  const incoming = new Map(nodes.map((n) => [n.id, 0]));
  edges.forEach((e) => incoming.set(e.to, (incoming.get(e.to) || 0) + 1));
  const queue = nodes.filter((n) => (incoming.get(n.id) || 0) === 0).map((n) => n.id);
  const result = [];

  while (queue.length) {
    const id = queue.shift();
    result.push(id);
    edges.filter((e) => e.from === id).forEach((e) => {
      const v = (incoming.get(e.to) || 0) - 1;
      incoming.set(e.to, v);
      if (v === 0) queue.push(e.to);
    });
  }

  if (result.length !== nodes.length) {
    return null;
  }
  return result;
};

const incomingValues = (nodeId, map) => {
  return edges
    .filter((e) => e.to === nodeId)
    .map((e) => map.get(e.from))
    .filter(Boolean);
};

const runAgentTransform = (agentName, mode, input) => {
  const lead = `${agentName} [${mode}]`;
  if (mode === 'brainstorm') {
    return `${lead}\n- Idea 1: ${input.slice(0, 80)}\n- Idea 2: Alternative execution path\n- Idea 3: Risk-adjusted pilot`;
  }
  if (mode === 'critic') {
    return `${lead}\nConcerns:\n1) Resource limits\n2) Integration complexity\n3) User adoption\n\nInput:\n${input}`;
  }
  if (mode === 'planner') {
    return `${lead}\nPlan:\n1) Define objective\n2) Build pilot\n3) Simulate outcomes\n4) Review metrics\n\nContext:\n${input}`;
  }
  return `${lead}\nAnalysis summary:\n${input}`;
};

const runLogicTransform = (op, input) => {
  if (op === 'summarize') {
    return `Summary:\n${input.slice(0, 280)}${input.length > 280 ? '...' : ''}`;
  }
  if (op === 'expand') {
    return `${input}\n\nExpanded considerations:\n- Stakeholders\n- Constraints\n- Timeline\n- Success metrics`;
  }
  if (op === 'prioritize') {
    return `Priority order:\n1) Impact\n2) Speed\n3) Cost\n4) Reliability\n\nInput:\n${input}`;
  }
  if (op === 'risk-check') {
    return `Risk check:\n- Technical risk: Medium\n- Operational risk: Medium\n- Budget risk: Low\n\nInput:\n${input}`;
  }
  return input;
};

const parseDataInput = () => {
  const raw = (dataInput?.value || '').trim();
  if (!raw) {
    return { ok: true, value: null };
  }
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, value: null };
  }
};

const askOllamaAgent = async (model, agentName, mode, scenario, dataset, input) => {
  const prompt = [
    `You are agent: ${agentName}`,
    `Execution mode: ${mode}`,
    'You are inside a simulation graph node. Produce useful output for the next node in plain text.',
    '',
    'Scenario:',
    scenario || '(none)',
    '',
    'Dataset JSON:',
    dataset ? JSON.stringify(dataset, null, 2) : '(none)',
    '',
    'Incoming upstream data:',
    input || '(none)',
    '',
    'Return a concise but useful result with actions, assumptions, and risks if applicable.'
  ].join('\n');

  const response = await fetch(`${LOCAL_BRIDGE}/ollama/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'qwen2.5-coder:3b',
      prompt
    })
  });

  if (!response.ok) {
    throw new Error('Local bridge request failed');
  }
  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.error || 'Local model request failed');
  }
  return (data.response || '').trim();
};

const runSimulation = async () => {
  if (nodes.length === 0) {
    runStatus.textContent = 'Add nodes first.';
    return;
  }

  const parsed = parseDataInput();
  if (!parsed.ok) {
    runStatus.textContent = 'Data JSON is invalid. Fix JSON and run again.';
    return;
  }

  const order = topologicalOrder();
  if (!order) {
    runStatus.textContent = 'Cycle detected. Remove circular links.';
    return;
  }

  simLog.innerHTML = '';
  const outputs = new Map();
  const scenario = (scenarioInput.value || '').trim();
  const dataset = parsed.value;
  const useOllama = !!useOllamaInput?.checked;
  const modelName = (modelInput?.value || 'qwen2.5-coder:3b').trim();
  runStatus.textContent = 'Running simulation...';

  const addLog = (text) => {
    const row = document.createElement('div');
    row.className = 'log-row';
    row.textContent = text;
    simLog.appendChild(row);
  };

  const owned = getOwnedAgents();

  for (const id of order) {
    const node = getNodeById(id);
    if (!node) continue;

    const inputs = incomingValues(id, outputs);
    const mergedInput = (inputs.length ? inputs.join('\n\n') : scenario).trim();

    let out = '';
    if (node.type === 'source') {
      const sourceText = (node.config.prompt || '').trim() || mergedInput || 'No source provided';
      out = dataset
        ? `${sourceText}\n\nData attached:\n${JSON.stringify(dataset, null, 2)}`
        : sourceText;
    } else if (node.type === 'agent') {
      const agent = owned.find((a) => a.id === node.config.agentId) || owned[0] || { name: 'Agent' };
      if (useOllama) {
        try {
          out = await askOllamaAgent(modelName, agent.name, node.config.mode || 'analyze', scenario, dataset, mergedInput || 'No input');
        } catch {
          out = runAgentTransform(agent.name, node.config.mode || 'analyze', mergedInput || 'No input');
          out += '\n\n[Fallback mode: local transformer used because Ollama call failed]';
        }
      } else {
        out = runAgentTransform(agent.name, node.config.mode || 'analyze', mergedInput || 'No input');
      }
    } else if (node.type === 'logic') {
      out = runLogicTransform(node.config.operation || 'summarize', mergedInput || 'No input');
    } else if (node.type === 'output') {
      out = mergedInput || 'No incoming data';
    }

    outputs.set(id, out);
    addLog(`${node.title}: generated ${out.length} chars`);
  }

  const outputNodes = nodes.filter((n) => n.type === 'output');
  const finalText = outputNodes.length
    ? outputNodes.map((n) => `# ${n.title}\n${outputs.get(n.id) || ''}`).join('\n\n')
    : order.map((id) => `# ${(getNodeById(id) || {}).title || id}\n${outputs.get(id) || ''}`).join('\n\n');

  simOutput.textContent = finalText;
  runStatus.textContent = `Simulation complete (${nodes.length} nodes, ${edges.length} links).`;
};

const saveFlow = () => {
  const data = {
    name: projectNameInput.value || 'My Simulation',
    scenario: scenarioInput.value || '',
    dataInput: dataInput.value || '',
    useOllama: !!useOllamaInput?.checked,
    model: (modelInput?.value || 'qwen2.5-coder:3b').trim(),
    nodes,
    edges
  };
  localStorage.setItem(STORAGE_KEYS.flow, JSON.stringify(data));
  runStatus.textContent = 'Project saved.';
};

const loadFlow = () => {
  const data = readJson(STORAGE_KEYS.flow, null);
  if (!data) {
    runStatus.textContent = 'No saved project found.';
    return;
  }
  nodes = Array.isArray(data.nodes) ? data.nodes : [];
  edges = Array.isArray(data.edges) ? data.edges : [];
  projectNameInput.value = data.name || 'My Simulation';
  scenarioInput.value = data.scenario || '';
  if (dataInput) dataInput.value = data.dataInput || '';
  if (useOllamaInput) useOllamaInput.checked = data.useOllama !== false;
  if (modelInput) modelInput.value = data.model || 'qwen2.5-coder:3b';
  selectedNodeId = nodes[0] ? nodes[0].id : null;
  renderAll();
  runStatus.textContent = 'Project loaded.';
};

const clearFlow = () => {
  nodes = [];
  edges = [];
  selectedNodeId = null;
  simLog.innerHTML = '';
  simOutput.textContent = 'Run to see output...';
  renderAll();
  runStatus.textContent = 'Cleared.';
};

const autoLayout = () => {
  const cols = 3;
  nodes.forEach((node, idx) => {
    const c = idx % cols;
    const r = Math.floor(idx / cols);
    node.x = 40 + c * 250;
    node.y = 56 + r * 140;
  });
  renderAll();
};

canvas.addEventListener('dblclick', (event) => {
  if (event.target === canvas || event.target === linksLayer) {
    makeNode('agent', event.offsetX, event.offsetY);
  }
});

canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  disconnectEdgeAt(event.offsetX, event.offsetY);
});

document.querySelectorAll('.add-node').forEach((btn) => {
  btn.addEventListener('click', () => makeNode(btn.dataset.type, 80 + nodes.length * 18, 70 + nodes.length * 12));
});

document.getElementById('runSimBtn').addEventListener('click', () => {
  runSimulation();
});
document.getElementById('saveFlowBtn').addEventListener('click', saveFlow);
document.getElementById('loadFlowBtn').addEventListener('click', loadFlow);
document.getElementById('clearFlowBtn').addEventListener('click', clearFlow);
document.getElementById('autoLayoutBtn').addEventListener('click', autoLayout);

window.addEventListener('resize', renderLinks);

renderOwnedAgents();
makeNode('source', 46, 84);
makeNode('agent', 330, 84);
makeNode('output', 620, 84);
connectNodes(nodes[0].id, nodes[1].id);
connectNodes(nodes[1].id, nodes[2].id);
selectedNodeId = nodes[1].id;
renderAll();

const LOCAL_BRIDGE = 'http://127.0.0.1:8765';
const LOCAL_MODEL = 'qwen2.5-coder:3b';
const CHAT_KEY = 'smart_world_lab_equipment_chat_v1';

const equipmentSearch = document.querySelector('#equipmentSearch');
const categoryChips = document.querySelector('#categoryChips');
const equipmentList = document.querySelector('#equipmentList');
const inventoryCount = document.querySelector('#inventoryCount');
const zoneCount = document.querySelector('#zoneCount');
const activeCount = document.querySelector('#activeCount');
const listMeta = document.querySelector('#listMeta');
const zoneStrip = document.querySelector('#zoneStrip');
const selectedName = document.querySelector('#selectedName');
const selectedCategory = document.querySelector('#selectedCategory');
const selectedDesc = document.querySelector('#selectedDesc');
const selectedSpecs = document.querySelector('#selectedSpecs');
const selectedCapabilities = document.querySelector('#selectedCapabilities');
const selectedStatus = document.querySelector('#selectedStatus');
const bridgeStatus = document.querySelector('#bridgeStatus');
const chatFeed = document.querySelector('#chatFeed');
const chatForm = document.querySelector('#chatForm');
const chatInput = document.querySelector('#chatInput');
const clearChatBtn = document.querySelector('#clearChatBtn');
const promptButtons = document.querySelectorAll('.prompt-btn');
const hotspotButtons = document.querySelectorAll('.map-hotspot');

const equipmentCatalog = [
  {
    id: 'monitoring-wall',
    name: 'Real-Time Monitoring Wall',
    category: 'display',
    zone: 'Control Center',
    status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1555749849-ab10049a8a5a?w=300&h=200&fit=crop',
    description: 'Large-format dashboard wall showing city twin analytics, infrastructure KPIs, energy curves, and monitoring feeds.',
    rolePrompt: 'You are the Real-Time Monitoring Wall in Smart World Lab. Speak like a mission-critical analytics system that monitors the digital twin and operational dashboards.',
    capabilities: ['City twin dashboards', 'KPI visualization', 'Live incident feeds', 'Energy and traffic analytics'],
    specs: { Connectivity: 'IoT + analytics backbone', Purpose: 'Situational awareness', Operator: 'Control team' }
  },
  {
    id: 'control-stations',
    name: 'Monitor Wall and Control Stations',
    category: 'workstation',
    zone: 'Control Center',
    status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=300&h=200&fit=crop',
    description: 'Operator desks with multi-screen stations for simulation orchestration, system monitoring, and command workflows.',
    rolePrompt: 'You are a cluster of control stations in Smart World Lab. Respond like an operator-grade command interface for simulations, telemetry, and experiment management.',
    capabilities: ['Multi-monitor operations', 'Scenario control', 'Telemetry review', 'Operator coordination'],
    specs: { Seats: '6 stations', Mode: 'Command + analysis', Focus: 'Simulation control' }
  },
  {
    id: 'smart-city-model',
    name: 'Smart City Physical Model',
    category: 'model',
    zone: 'Central Floor',
    status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1516637090635-c85ab3ec2b65?w=300&h=200&fit=crop',
    description: 'Physical smart city model used as the centerpiece for urban digital twin demonstrations and CPS experimentation.',
    rolePrompt: 'You are the Smart City Physical Model in Smart World Lab. Explain how the physical city model links to sensors, AI, drones, robotics, energy, and city simulation.',
    capabilities: ['Digital twin anchor', 'Urban systems demonstration', 'Energy + mobility scenarios', 'Cross-domain integration'],
    specs: { Scale: 'Tabletop city', Focus: 'Twin demonstration', Integration: 'AI, IoT, CPS, UAV' }
  },
  {
    id: 'uav-sim-bay',
    name: 'UAV and Robotics Simulation Wall',
    category: 'uav',
    zone: 'UAV Bay',
    status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?w=300&h=200&fit=crop',
    description: 'Simulation display for drone missions, robotic paths, and aerial analytics over the smart city environment.',
    rolePrompt: 'You are the UAV and Robotics Simulation Wall. Answer like a drone mission planning and robotics simulation system.',
    capabilities: ['Drone mission simulation', 'Robotics route planning', 'Aerial data playback', 'Mission rehearsal'],
    specs: { Display: 'Large simulation screen', Coverage: 'Air + ground robots', Output: 'Mission scenarios' }
  },
  {
    id: 'drone-fleet',
    name: 'Drone Fleet Rack',
    category: 'uav',
    zone: 'UAV Bay',
    status: 'Ready',
    imageUrl: 'https://images.unsplash.com/photo-1573566350731-2c1101ecc165?w=300&h=200&fit=crop',
    description: 'Collection of quadcopters and UAV platforms used for flight tests, aerial sensing, and smart city observation.',
    rolePrompt: 'You are the drone fleet in Smart World Lab. Respond like a mission-ready aerial sensing system that cares about battery, payload, navigation, and safety.',
    capabilities: ['Aerial sensing', 'Inspection flights', 'Data capture', 'Autonomous missions'],
    specs: { Platforms: 'Multi-UAV', Payload: 'Camera + sensors', Safety: 'Flight zone managed' }
  },
  {
    id: 'maker-table',
    name: '3D Print and Maker Table',
    category: 'maker',
    zone: 'Maker Zone',
    status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1609041788887-482a45ffa588?w=300&h=200&fit=crop',
    description: 'Fabrication table with 3D printers, prototyping tools, and electronics for rapid hardware iteration.',
    rolePrompt: 'You are the 3D Print and Maker Table. Speak like a prototyping lab that turns ideas into physical devices and test rigs.',
    capabilities: ['Rapid prototyping', '3D printing', 'Fixture fabrication', 'Hardware iteration'],
    specs: { Tools: 'Printers + prototyping gear', Use: 'Hardware builds', Cycle: 'Fast iteration' }
  },
  {
    id: 'robotics-cart',
    name: 'Robotics and Hardware Test Cart',
    category: 'robotics',
    zone: 'Robotics Zone',
    status: 'Ready',
    imageUrl: 'https://images.unsplash.com/photo-1518152006812-edab29387d0a?w=300&h=200&fit=crop',
    description: 'Mobile robotics platform for autonomy testing, edge compute experiments, and CPS demonstrations.',
    rolePrompt: 'You are a robotics test cart in Smart World Lab. Answer like a mobile autonomy platform with sensors, control loops, and mission logic.',
    capabilities: ['Autonomy testing', 'Edge robotics', 'Ground mobility', 'CPS demonstrations'],
    specs: { Mobility: 'Ground robot', Compute: 'Edge AI onboard', Role: 'Robotics testbed' }
  },
  {
    id: 'projector-array',
    name: 'Projectors and Big Screen',
    category: 'display',
    zone: 'Presentation Zone',
    status: 'Ready',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178f50c1fe5e?w=300&h=200&fit=crop',
    description: 'Large projection surface used for smart city ecosystem presentations, teaching, and high-level demos.',
    rolePrompt: 'You are the Projectors and Big Screen setup. Respond like a presentation system for immersive lab demos and teaching.',
    capabilities: ['Large presentations', 'Immersive lab demos', 'Teaching support', 'City ecosystem visualizations'],
    specs: { Audience: 'Classroom + visitors', Format: 'Projection wall', Role: 'Presentation system' }
  },
  {
    id: 'iot-sensor-kit',
    name: 'IoT and Sensor Bench',
    category: 'iot',
    zone: 'Maker Zone',
    status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300&h=200&fit=crop',
    description: 'Bench area for IoT modules, embedded boards, telemetry sensors, and connected CPS experiments.',
    rolePrompt: 'You are the IoT and Sensor Bench. Explain sensing, telemetry, embedded integration, and how you feed the digital twin.',
    capabilities: ['Embedded sensing', 'Telemetry streaming', 'Prototype integration', 'Sensor calibration'],
    specs: { Boards: 'Mixed embedded kits', Data: 'Sensor telemetry', Link: 'Feeds twin models' }
  },
  {
    id: 'ai-analytics-rack',
    name: 'AI and Data Analytics Console',
    category: 'ai',
    zone: 'Control Center',
    status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
    description: 'Analytics stack for AI inference, model evaluation, and data-driven decision support across the lab.',
    rolePrompt: 'You are the AI and Data Analytics Console. Answer like an analytics brain that processes lab data and supports decision-making.',
    capabilities: ['Model inference', 'Analytics pipelines', 'Forecasting', 'Decision support'],
    specs: { Function: 'AI analytics', Workload: 'Inference + analysis', Users: 'Researchers + operators' }
  },
  {
    id: 'cyber-physical-display',
    name: 'Cyber-Physical Systems Display',
    category: 'cps',
    zone: 'Presentation Zone',
    status: 'Ready',
    imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300&h=200&fit=crop',
    description: 'Demonstration board showing cyber-physical systems, integrated control, and connected lab capabilities.',
    rolePrompt: 'You are the Cyber-Physical Systems Display. Explain CPS integration across infrastructure, robotics, sensors, and control loops.',
    capabilities: ['CPS education', 'System integration overview', 'Cross-domain mapping', 'Research communication'],
    specs: { Topic: 'Cyber-physical systems', Role: 'Explanatory display', Scope: 'Cross-lab integration' }
  },
  {
    id: 'workstation-cluster',
    name: 'Research Workstation Cluster',
    category: 'workstation',
    zone: 'Workstations',
    status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop',
    description: 'Rows of desktop stations for software development, simulation review, drone analysis, and digital twin workflows.',
    rolePrompt: 'You are the Research Workstation Cluster. Respond like a compute workspace serving simulation, coding, and analytics tasks.',
    capabilities: ['Software development', 'Simulation review', 'Data analysis', 'Mission planning'],
    specs: { Seats: 'Multi-seat lab', Role: 'General compute', Users: 'Students + researchers' }
  }
];

const categoryOrder = ['all', 'display', 'workstation', 'model', 'uav', 'maker', 'robotics', 'iot', 'ai', 'cps'];
let activeCategory = 'all';
let selectedEquipmentId = 'monitoring-wall';
let chatStore = readJson(CHAT_KEY, {});

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getSelectedEquipment() {
  return equipmentCatalog.find((item) => item.id === selectedEquipmentId) || equipmentCatalog[0];
}

function getFilteredEquipment() {
  const term = (equipmentSearch?.value || '').trim().toLowerCase();
  return equipmentCatalog.filter((item) => {
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    const haystack = `${item.name} ${item.zone} ${item.description} ${item.capabilities.join(' ')}`.toLowerCase();
    return matchCategory && (!term || haystack.includes(term));
  });
}

function titleCase(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function renderCategoryChips() {
  categoryChips.innerHTML = '';
  categoryOrder.forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = category === 'all' ? 'All' : titleCase(category);
    if (category === activeCategory) button.classList.add('active');
    button.addEventListener('click', () => {
      activeCategory = category;
      renderCategoryChips();
      renderEquipmentList();
    });
    categoryChips.appendChild(button);
  });
}

function renderStats() {
  inventoryCount.textContent = String(equipmentCatalog.length);
  zoneCount.textContent = String(new Set(equipmentCatalog.map((item) => item.zone)).size);
  activeCount.textContent = String(equipmentCatalog.filter((item) => item.status === 'Active').length);
}

function renderEquipmentList() {
  const filtered = getFilteredEquipment();
  listMeta.textContent = `${filtered.length} items`;
  equipmentList.innerHTML = '';
  filtered.forEach((item) => {
    const card = document.createElement('article');
    card.className = `equipment-card${item.id === selectedEquipmentId ? ' active' : ''}`;
    card.dataset.equipmentId = item.id;
    if (item.imageUrl) {
      card.style.backgroundImage = `linear-gradient(135deg, rgba(16, 29, 48, 0.85), rgba(10, 18, 31, 0.85)), url('${item.imageUrl}')`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
    }
    card.innerHTML = `
      <h4>${item.name}</h4>
      <p>${item.description}</p>
      <div class="equipment-tags">
        <span>${item.zone}</span>
        <span>${titleCase(item.category)}</span>
        <span>${item.status}</span>
      </div>
    `;
    card.addEventListener('click', () => {
      selectedEquipmentId = item.id;
      renderAll();
    });
    equipmentList.appendChild(card);
  });
}

function renderZones() {
  const zones = [...new Set(equipmentCatalog.map((item) => item.zone))];
  zoneStrip.innerHTML = '';
  zones.forEach((zone) => {
    const pill = document.createElement('span');
    pill.className = 'zone-pill';
    pill.textContent = zone;
    zoneStrip.appendChild(pill);
  });
}

function renderSelectedEquipment() {
  const item = getSelectedEquipment();
  selectedName.textContent = item.name;
  selectedCategory.textContent = `${item.zone} | ${titleCase(item.category)}`;
  selectedDesc.textContent = item.description;
  selectedStatus.textContent = item.status;
  selectedSpecs.innerHTML = '';
  Object.entries(item.specs).forEach(([key, value]) => {
    const card = document.createElement('div');
    card.className = 'spec-card';
    card.innerHTML = `<strong>${key}</strong><span>${value}</span>`;
    selectedSpecs.appendChild(card);
  });
  selectedCapabilities.innerHTML = '';
  item.capabilities.forEach((capability) => {
    const chip = document.createElement('span');
    chip.textContent = capability;
    selectedCapabilities.appendChild(chip);
  });
  hotspotButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.equipment === item.id);
  });
}

function getChatHistory(itemId) {
  if (!chatStore[itemId]) {
    chatStore[itemId] = [];
  }
  return chatStore[itemId];
}

function persistChats() {
  saveJson(CHAT_KEY, chatStore);
}

function appendChat(role, text) {
  const node = document.createElement('div');
  node.className = `chat-msg ${role}`;
  node.textContent = text;
  chatFeed.appendChild(node);
  chatFeed.scrollTop = chatFeed.scrollHeight;
  return node;
}

function renderChat() {
  const item = getSelectedEquipment();
  const history = getChatHistory(item.id);
  chatFeed.innerHTML = '';
  if (!history.length) {
    appendChat('assistant', `I am ${item.name}. Ask me what I do in the Smart World Lab, what data I work with, or how I connect to the smart city model.`);
    return;
  }
  history.forEach((entry) => appendChat(entry.role, entry.content));
}

function fallbackReply(question, item) {
  const q = question.toLowerCase();
  if (q.includes('what do you do') || q.includes('introduce')) {
    return `I am ${item.name} in the ${item.zone}. My main role is ${item.description.toLowerCase()}`;
  }
  if (q.includes('data')) {
    return `${item.name} works with ${item.capabilities.join(', ').toLowerCase()}. I either generate operational data, visualize it, or help operators act on it.`;
  }
  if (q.includes('maintenance') || q.includes('safety')) {
    return `${item.name} needs routine checks based on its role in the lab. For this system, focus on readiness, safe operation, clean power and network links, and proper calibration before demonstrations.`;
  }
  if (q.includes('smart city model') || q.includes('model')) {
    return `${item.name} supports the Smart City Model by contributing ${item.capabilities[0].toLowerCase()} and helping demonstrate how sensing, analytics, control, and robotics connect in one lab environment.`;
  }
  return `I am ${item.name}. In this lab I support ${item.capabilities.join(', ').toLowerCase()}. Ask about my role, data, safety, or how I connect to the smart city model.`;
}

async function refreshBridgeStatus() {
  try {
    const response = await fetch(`${LOCAL_BRIDGE}/health`);
    if (!response.ok) throw new Error('offline');
    bridgeStatus.textContent = `Ready | ${LOCAL_MODEL}`;
  } catch {
    bridgeStatus.textContent = 'Offline fallback';
  }
}

async function askEquipment(question, item, onChunk) {
  const history = getChatHistory(item.id);
  const prompt = [
    `SYSTEM: ${item.rolePrompt}`,
    'SYSTEM: You are part of Smart World Lab, inspired by a lab with a monitoring wall, smart city physical model, drone simulation, maker table, robotics hardware, workstations, and AI analytics zones.',
    `SYSTEM: Equipment profile: Name=${item.name}; Zone=${item.zone}; Category=${item.category}; Status=${item.status}; Description=${item.description}; Capabilities=${item.capabilities.join(', ')}.`,
    ...history.slice(-8).map((entry) => `${entry.role.toUpperCase()}: ${entry.content}`),
    `USER: ${question}`
  ].join('\n\n');

  const response = await fetch(`${LOCAL_BRIDGE}/ollama/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: LOCAL_MODEL, prompt })
  });

  if (!response.ok) {
    throw new Error('Bridge request failed');
  }

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.error || 'Model request failed');
  }

  const full = (data.response || '').trim();
  for (const piece of full.match(/.{1,80}/g) || []) {
    if (onChunk) {
      onChunk(piece);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
  return full;
}

async function handleQuestion(rawQuestion) {
  const question = rawQuestion.trim();
  if (!question) return;
  const item = getSelectedEquipment();
  const history = getChatHistory(item.id);
  history.push({ role: 'user', content: question });
  persistChats();
  renderChat();

  const thinking = appendChat('assistant thinking', 'Thinking...');
  try {
    const answer = await askEquipment(question, item, (chunk) => {
      if (thinking.textContent === 'Thinking...') {
        thinking.textContent = chunk;
      } else {
        thinking.textContent += chunk;
      }
      chatFeed.scrollTop = chatFeed.scrollHeight;
    });
    thinking.className = 'chat-msg assistant';
    thinking.textContent = answer;
    history.push({ role: 'assistant', content: answer });
  } catch {
    const answer = fallbackReply(question, item);
    thinking.className = 'chat-msg assistant';
    thinking.textContent = answer;
    history.push({ role: 'assistant', content: answer });
  }
  persistChats();
}

function renderAll() {
  renderStats();
  renderCategoryChips();
  renderEquipmentList();
  renderZones();
  renderSelectedEquipment();
  renderChat();
}

equipmentSearch?.addEventListener('input', () => {
  renderEquipmentList();
});

hotspotButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedEquipmentId = button.dataset.equipment || selectedEquipmentId;
    renderAll();
  });
});

promptButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const prompt = button.dataset.prompt || '';
    if (chatInput) {
      chatInput.value = prompt;
    }
    await handleQuestion(prompt);
  });
});

chatForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const value = chatInput?.value || '';
  if (chatInput) {
    chatInput.value = '';
  }
  await handleQuestion(value);
});

clearChatBtn?.addEventListener('click', () => {
  chatStore[selectedEquipmentId] = [];
  persistChats();
  renderChat();
});

refreshBridgeStatus();
setInterval(refreshBridgeStatus, 15000);
renderAll();

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

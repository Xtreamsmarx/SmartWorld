const profilesNode = document.querySelector('#profiles');
const activeAvatar = document.querySelector('#activeAvatar');
const activeName = document.querySelector('#activeName');
const activeRole = document.querySelector('#activeRole');
const profileSummary = document.querySelector('#profileSummary');
const chatLog = document.querySelector('#chatLog');
const chatForm = document.querySelector('#chatForm');
const chatInput = document.querySelector('#chatInput');
const bridgeStatus = document.querySelector('#bridgeStatus');

const LOCAL_BRIDGE = 'http://127.0.0.1:8765';
const LOCAL_MODEL = 'qwen2.5-coder:3b';

// Replace these entries with CV-driven details when you send full team CVs.
const TEAM_PROFILES = [
  {
    id: 'smartworld-lead',
    name: 'SmartWorld Lead',
    role: 'Founder and Digital Twin Architect',
    avatar: 'https://i.pravatar.cc/320?img=12',
    bio: 'Leads Smart World strategy, digital twin design, and practical AI product direction.',
    skills: ['Digital Twin Modeling', 'Product Strategy', 'AI Workflow Design'],
    style: 'Direct, strategic, practical, and focused on execution.'
  },
  {
    id: 'xtream-engineer',
    name: 'Xtream Engineer',
    role: 'Full-Stack and Simulation Engineer',
    avatar: 'https://i.pravatar.cc/320?img=32',
    bio: 'Builds simulation systems, web platform experiences, and local AI integrations for Smart World.',
    skills: ['JavaScript Systems', '3D Interaction', 'Infrastructure Integration'],
    style: 'Technical, implementation-first, and detail-oriented.'
  }
];

let activeProfile = null;
const historyByProfile = new Map();

const appendMessage = (role, text) => {
  if (!chatLog) return;
  const p = document.createElement('p');
  p.className = `msg ${role}`;
  p.textContent = text;
  chatLog.appendChild(p);
  chatLog.scrollTop = chatLog.scrollHeight;
};

const renderSummary = (profile) => {
  if (!profileSummary) return;
  profileSummary.innerHTML = `
    <p>${profile.bio}</p>
    <ul>
      <li><strong>Role:</strong> ${profile.role}</li>
      <li><strong>Core Skills:</strong> ${profile.skills.join(', ')}</li>
      <li><strong>Conversation Style:</strong> ${profile.style}</li>
    </ul>
  `;
};

const renderProfiles = () => {
  if (!profilesNode) return;
  profilesNode.innerHTML = '';

  TEAM_PROFILES.forEach((profile) => {
    const card = document.createElement('article');
    card.className = 'profile-card';
    card.dataset.id = profile.id;
    card.innerHTML = `
      <img src="${profile.avatar}" alt="${profile.name} avatar" loading="lazy" />
      <div>
        <h3>${profile.name}</h3>
        <p>${profile.role}</p>
      </div>
    `;
    card.addEventListener('click', () => setActiveProfile(profile.id));
    profilesNode.appendChild(card);
  });
};

const setActiveProfile = (profileId) => {
  const profile = TEAM_PROFILES.find((item) => item.id === profileId);
  if (!profile) return;
  activeProfile = profile;

  document.querySelectorAll('.profile-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.id === profileId);
  });

  if (activeAvatar) {
    activeAvatar.src = profile.avatar;
  }
  if (activeName) {
    activeName.textContent = profile.name;
  }
  if (activeRole) {
    activeRole.textContent = profile.role;
  }

  renderSummary(profile);

  if (chatLog) {
    chatLog.innerHTML = '';
    const saved = historyByProfile.get(profile.id) || [
      { role: 'bot', text: `You are now talking with ${profile.name}. Ask about projects, skills, or decisions.` }
    ];
    saved.forEach((entry) => appendMessage(entry.role, entry.text));
  }
};

const saveToHistory = (profileId, role, text) => {
  const list = historyByProfile.get(profileId) || [];
  list.push({ role, text });
  historyByProfile.set(profileId, list.slice(-16));
};

const updateBridgeStatus = async () => {
  if (!bridgeStatus) return;
  try {
    const response = await fetch(`${LOCAL_BRIDGE}/health`);
    bridgeStatus.textContent = response.ok ? 'Bridge: online' : 'Bridge: issue';
  } catch {
    bridgeStatus.textContent = 'Bridge: offline (fallback mode)';
  }
};

const buildPrompt = (profile, userMessage) => {
  const history = historyByProfile.get(profile.id) || [];
  const trimmed = history.slice(-6).map((entry) => `${entry.role === 'user' ? 'User' : profile.name}: ${entry.text}`).join('\n');

  return [
    `You are ${profile.name}, ${profile.role}.`,
    `Profile bio: ${profile.bio}`,
    `Skills: ${profile.skills.join(', ')}`,
    `Tone: ${profile.style}`,
    'Answer as this person with practical, concise advice.',
    trimmed ? `Recent chat:\n${trimmed}` : '',
    `User: ${userMessage}`,
    `${profile.name}:`
  ].filter(Boolean).join('\n\n');
};

const askProfileModel = async (profile, userMessage) => {
  const body = {
    model: LOCAL_MODEL,
    prompt: buildPrompt(profile, userMessage),
    stream: false,
    options: { temperature: 0.55 }
  };

  const response = await fetch(`${LOCAL_BRIDGE}/ollama/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error('Bridge request failed');
  }

  const payload = await response.json();
  return (payload.response || '').trim();
};

const fallbackReply = (profile, userMessage) => {
  const text = userMessage.toLowerCase();
  if (text.includes('skill') || text.includes('expert')) {
    return `${profile.name}: My strongest areas are ${profile.skills.join(', ')}. I can help map these into project execution plans.`;
  }
  if (text.includes('project') || text.includes('build')) {
    return `${profile.name}: For Smart World, I recommend a phased build: scope, prototype, validate with real data, then automate operations.`;
  }
  return `${profile.name}: I can help with strategy, implementation, and smart decision insights. Ask me about a specific project or challenge.`;
};

chatForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!activeProfile || !chatInput) {
    return;
  }

  const message = chatInput.value.trim();
  if (!message) return;
  chatInput.value = '';

  appendMessage('user', message);
  saveToHistory(activeProfile.id, 'user', message);

  appendMessage('bot', 'Thinking...');
  const thinkingNode = chatLog ? chatLog.lastElementChild : null;

  try {
    const reply = await askProfileModel(activeProfile, message);
    if (thinkingNode) {
      thinkingNode.textContent = reply || fallbackReply(activeProfile, message);
    }
    saveToHistory(activeProfile.id, 'bot', reply || fallbackReply(activeProfile, message));
  } catch {
    const reply = fallbackReply(activeProfile, message);
    if (thinkingNode) {
      thinkingNode.textContent = reply;
    }
    saveToHistory(activeProfile.id, 'bot', reply);
  }
});

renderProfiles();
setActiveProfile(TEAM_PROFILES[0].id);
updateBridgeStatus();

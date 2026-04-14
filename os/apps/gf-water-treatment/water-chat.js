const LOCAL_BRIDGE = 'http://127.0.0.1:8765';
const LOCAL_MODEL = 'qwen2.5-coder:3b';
const HISTORY_KEY = 'gf_water_chat_history';
const VOICE_KEY = 'gf_water_chat_voice_output';

const chatShell = document.querySelector('#chatShell');
const chatForm = document.querySelector('#waterChatForm');
const chatInput = document.querySelector('#waterChatInput');
const chatStatus = document.querySelector('#chatStatus');
const chatMeta = document.querySelector('#chatMeta');
const promptButtons = document.querySelectorAll('.water-prompt');
const clearChatBtn = document.querySelector('#clearChatBtn');
const voiceInputBtn = document.querySelector('#voiceInputBtn');
const voiceOutputBtn = document.querySelector('#voiceOutputBtn');

const history = [];
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let listening = false;
let voiceOutputEnabled = localStorage.getItem(VOICE_KEY) === '1';

const plantContext = [
  'You are the Grand Forks Water Treatment Plant digital twin speaking as an intelligent plant copilot.',
  'Be specific, operational, and concise.',
  'Answer using the plant context below instead of generic advice unless the user asks a broader question.',
  'Current known state: overall plant health about 92/100, flow about 18.7 MGD, turbidity elevated around 2.1 NTU, pH about 7.24, Filter 2 has the highest active risk, Clarifier 1 has sludge drift, UV/disinfection is stable, and Pump P-101 vibration is trending up.',
  'Recommended actions often include filter backwash scheduling, alum/coagulant adjustment, clarifier sludge control, and balancing flow across filter trains.',
  'If asked what to do next, prioritize safety, compliance, turbidity reduction, and stable output water quality.',
  'If unsure, say what is known, what is uncertain, and the best next operator check.'
].join(' ');

function updateStatus(text) {
  if (chatStatus) chatStatus.textContent = text;
}

function updateMeta() {
  if (!chatMeta) return;
  chatMeta.textContent = `Plant mode: operational advisory | Messages: ${history.length}`;
}

function persistHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-20)));
}

function setVoiceOutputState() {
  if (!voiceOutputBtn) return;
  voiceOutputBtn.textContent = voiceOutputEnabled ? 'Voice Output On' : 'Voice Output Off';
  voiceOutputBtn.classList.toggle('active', voiceOutputEnabled);
}

function speakText(text) {
  if (!voiceOutputEnabled || !('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 0.95;
  window.speechSynthesis.speak(utterance);
}

function appendMessage(role, text, extraClass = '') {
  if (!chatShell) return null;
  const node = document.createElement('div');
  node.className = `chat-msg ${role}${extraClass ? ` ${extraClass}` : ''}`;
  node.textContent = text;
  chatShell.appendChild(node);
  chatShell.scrollTop = chatShell.scrollHeight;
  return node;
}

function renderHistory() {
  if (!chatShell) return;
  chatShell.innerHTML = '';
  if (!history.length) {
    appendMessage('assistant', 'I am the Grand Forks Water Treatment Plant digital assistant. Ask me about process health, alarms, optimization, or what the plant is doing right now.');
    return;
  }
  history.forEach((entry) => appendMessage(entry.role, entry.content));
}

function applyChunk(node, chunk) {
  if (!node || !chunk) return;
  if (node.textContent === 'Thinking...') node.textContent = chunk;
  else node.textContent += chunk;
  if (chatShell) chatShell.scrollTop = chatShell.scrollHeight;
}

function fallbackReply(question) {
  const q = question.toLowerCase();
  if (q.includes('risk') || q.includes('alarm')) {
    return 'The main operational risk is Filter 2 turbidity. Secondary concern is Clarifier 1 sludge drift. Immediate action is to schedule a backwash, verify clarifier solids removal, and confirm turbidity trends at the filter effluent.';
  }
  if (q.includes('what') && q.includes('do')) {
    return 'Next operator actions: 1. Check Filter 2 effluent turbidity and headloss. 2. Prepare or begin backwash. 3. Increase alum dose modestly and verify downstream effect. 4. Inspect Clarifier 1 sludge blanket and adjust wasting if needed.';
  }
  if (q.includes('process') || q.includes('move through')) {
    return 'Water enters through intake and screening, then moves through coagulation and flocculation, clarification, filtration, disinfection, clearwell storage, and finally distribution pumps into the city network.';
  }
  return 'Bridge is unavailable, but based on current plant conditions the system is stable overall with a localized turbidity issue around Filter 2. Ask about risk, process flow, or recommended actions for a more specific answer.';
}

function buildLivePlantContext() {
  const liveSignals = Array.from(document.querySelectorAll('[data-live]')).map((node) => {
    const label = node.closest('li, .metric')?.querySelector('strong')?.textContent || 'Signal';
    return `${label}: ${node.textContent}`;
  });
  return liveSignals.join('; ');
}

async function refreshBridgeStatus() {
  try {
    const response = await fetch(`${LOCAL_BRIDGE}/health`);
    if (!response.ok) throw new Error('offline');
    updateStatus(`Bridge ready | ${LOCAL_MODEL}`);
  } catch {
    updateStatus('Bridge offline | using local fallback knowledge');
  }
}

async function askPlantModel(question, onChunk) {
  const messages = [
    { role: 'system', content: `${plantContext} Live UI signals: ${buildLivePlantContext()}` },
    ...history.slice(-8),
    { role: 'user', content: question }
  ];
  const prompt = messages.map((entry) => `${entry.role.toUpperCase()}: ${entry.content}`).join('\n\n');

  const response = await fetch(`${LOCAL_BRIDGE}/ollama/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: LOCAL_MODEL,
      prompt
    })
  });

  if (!response.ok) {
    throw new Error('Bridge request failed');
  }

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.error || 'Model request failed');
  }

  const full = (data.response || '').trim();
  const parts = full.match(/.{1,90}/g) || [];
  for (const part of parts) {
    if (onChunk) {
      onChunk(part);
      await new Promise((resolve) => setTimeout(resolve, 8));
    }
  }
  return full;
}

async function handleSubmit(question) {
  const text = question.trim();
  if (!text) return;

  appendMessage('user', text);
  history.push({ role: 'user', content: text });
  persistHistory();
  updateMeta();

  const thinking = appendMessage('assistant', 'Thinking...', 'thinking');

  try {
    updateStatus(`Querying ${LOCAL_MODEL}...`);
    const answer = await askPlantModel(text, (chunk) => applyChunk(thinking, chunk));
    if (thinking) thinking.classList.remove('thinking');
    if (thinking && thinking.textContent === 'Thinking...') thinking.textContent = answer;
    history.push({ role: 'assistant', content: answer });
    persistHistory();
    speakText(answer);
    updateStatus(`Bridge ready | ${LOCAL_MODEL}`);
  } catch {
    const fallback = fallbackReply(text);
    if (thinking) {
      thinking.classList.remove('thinking');
      thinking.textContent = fallback;
    }
    history.push({ role: 'assistant', content: fallback });
    persistHistory();
    speakText(fallback);
    updateStatus('Bridge offline | using local fallback knowledge');
  }

  updateMeta();
}

chatForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const question = chatInput?.value || '';
  if (chatInput) chatInput.value = '';
  await handleSubmit(question);
});

clearChatBtn?.addEventListener('click', () => {
  history.length = 0;
  persistHistory();
  renderHistory();
  updateMeta();
  updateStatus(`Bridge ready | ${LOCAL_MODEL}`);
});

voiceOutputBtn?.addEventListener('click', () => {
  voiceOutputEnabled = !voiceOutputEnabled;
  localStorage.setItem(VOICE_KEY, voiceOutputEnabled ? '1' : '0');
  setVoiceOutputState();
});

if (SpeechRecognition && voiceInputBtn) {
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.addEventListener('start', () => {
    listening = true;
    voiceInputBtn.classList.add('active');
    voiceInputBtn.textContent = 'Listening...';
  });
  recognition.addEventListener('end', () => {
    listening = false;
    voiceInputBtn.classList.remove('active');
    voiceInputBtn.textContent = 'Voice Input';
  });
  recognition.addEventListener('result', async (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript || '';
    if (chatInput) chatInput.value = transcript;
    await handleSubmit(transcript);
  });
  voiceInputBtn.addEventListener('click', () => {
    if (listening) {
      recognition.stop();
      return;
    }
    recognition.start();
  });
} else if (voiceInputBtn) {
  voiceInputBtn.disabled = true;
  voiceInputBtn.textContent = 'Voice Unavailable';
}

promptButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const prompt = button.dataset.prompt || '';
    if (chatInput) chatInput.value = prompt;
    await handleSubmit(prompt);
  });
});

try {
  const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  if (Array.isArray(saved)) {
    history.push(...saved.filter((entry) => entry && entry.role && entry.content));
  }
} catch {
  // ignore malformed stored history
}

refreshBridgeStatus();
setInterval(refreshBridgeStatus, 15000);
setVoiceOutputState();
renderHistory();
updateMeta();

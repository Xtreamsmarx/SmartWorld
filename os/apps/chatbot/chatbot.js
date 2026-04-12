const chatShell = document.querySelector('#chatShell');
const chatForm = document.querySelector('#chatForm');
const chatInput = document.querySelector('#chatInput');
const chatMeta = document.querySelector('#chatMeta');
const chips = document.querySelectorAll('.chip');
const presetButtons = document.querySelectorAll('.preset-btn');
const providerSelect = document.querySelector('#providerSelect');
const modelInput = document.querySelector('#modelInput');
const apiKeyInput = document.querySelector('#apiKeyInput');
const systemPrompt = document.querySelector('#systemPrompt');
const saveConfigBtn = document.querySelector('#saveConfigBtn');
const testConfigBtn = document.querySelector('#testConfigBtn');
const configNote = document.querySelector('#configNote');
const llmStatus = document.querySelector('#llmStatus');
const connectWorkspaceBtn = document.querySelector('#connectWorkspaceBtn');
const uploadFilesBtn = document.querySelector('#uploadFilesBtn');
const uploadFilesInput = document.querySelector('#uploadFilesInput');
const downloadDraftBtn = document.querySelector('#downloadDraftBtn');
const workspaceStatus = document.querySelector('#workspaceStatus');
const fileSelect = document.querySelector('#fileSelect');
const modeSelect = document.querySelector('#modeSelect');
const fileDraft = document.querySelector('#fileDraft');
const applyDraftBtn = document.querySelector('#applyDraftBtn');

const CONFIG_KEY = 'und_chatbot_llm_config';
const history = [];
let workspaceHandle = null;
let fileMap = new Map();
let uploadedFileMap = new Map();
let activeFileText = '';

const defaultConfig = {
  provider: 'ollama',
  model: 'llama3.2:3b',
  apiKey: '',
  prompt: 'You are an UND coding assistant. Prioritize working code, clear debugging steps, and Python-first help.'
};

let messageCount = 1;
let activeTopic = 'General';

const PRESETS = {
  python: {
    model: 'llama3.2:3b',
    prompt: 'You are a Python tutor. Always provide runnable code, short explanation, and one test example.'
  },
  debug: {
    model: 'qwen2.5-coder:3b',
    prompt: 'You are a debugger. Find root cause quickly, explain the failing line, and return a corrected version.'
  },
  architect: {
    model: 'llama3.2:3b',
    prompt: 'You are a software architect. Propose clean modular structure, tradeoffs, and implementation steps.'
  },
  review: {
    model: 'qwen2.5-coder:3b',
    prompt: 'You are a strict code reviewer. Prioritize bugs, risks, and missing tests first, then improvements.'
  }
};

const loadConfig = () => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) {
      return { ...defaultConfig };
    }
    return { ...defaultConfig, ...JSON.parse(raw) };
  } catch {
    return { ...defaultConfig };
  }
};

const saveConfig = (config) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

const fillConfigForm = (config) => {
  if (providerSelect) providerSelect.value = config.provider;
  if (modelInput) modelInput.value = config.model;
  if (apiKeyInput) apiKeyInput.value = config.apiKey;
  if (systemPrompt) systemPrompt.value = config.prompt;
};

const readConfigForm = () => ({
  provider: providerSelect ? providerSelect.value : defaultConfig.provider,
  model: modelInput ? modelInput.value.trim() : defaultConfig.model,
  apiKey: apiKeyInput ? apiKeyInput.value.trim() : '',
  prompt: systemPrompt ? systemPrompt.value.trim() : defaultConfig.prompt
});

const updateMeta = () => {
  if (!chatMeta) {
    return;
  }
  chatMeta.textContent = `Messages: ${messageCount} | Topic: ${activeTopic}`;
};

const appendMsg = (role, text) => {
  if (!chatShell) return;
  const p = document.createElement('p');
  p.className = `msg ${role}`;
  p.textContent = text;
  chatShell.appendChild(p);
  chatShell.scrollTop = chatShell.scrollHeight;
  messageCount += 1;
  updateMeta();
};

const appendThinking = () => {
  if (!chatShell) return null;
  const p = document.createElement('p');
  p.className = 'msg thinking';
  p.textContent = 'Thinking...';
  chatShell.appendChild(p);
  chatShell.scrollTop = chatShell.scrollHeight;
  return p;
};

const applyStreamChunk = (node, chunk) => {
  if (!node || !chunk) return;
  if (node.textContent === 'Thinking...') {
    node.textContent = chunk;
  } else {
    node.textContent += chunk;
  }
  if (chatShell) {
    chatShell.scrollTop = chatShell.scrollHeight;
  }
};

const detectTopic = (q) => {
  const lower = q.toLowerCase();
  if (lower.includes('python') || lower.includes('flask') || lower.includes('code')) return 'Coding';
  if (lower.includes('error') || lower.includes('bug') || lower.includes('traceback')) return 'Debugging';
  if (lower.includes('path') || lower.includes('course') || lower.includes('learn')) return 'Learning';
  if (lower.includes('twin') || lower.includes('world') || lower.includes('3d')) return 'Twin';
  return 'General';
};

const fallbackReply = (q) => {
  const lower = q.toLowerCase();
  if (lower.includes('python')) {
    return 'Python quick start:\n1) Create a file main.py\n2) Add: print("Hello UND")\n3) Run from terminal with python main.py\nShare your error and I can debug line by line.';
  }
  if (lower.includes('error') || lower.includes('traceback')) {
    return 'Paste the full traceback and your code block. I can identify the exact failing line and provide a corrected version.';
  }
  if (lower.includes('path') || lower.includes('course')) {
    return 'Open Learning Paths from Quick Tools in the OS widget or from the Browser app bookmarks.';
  }
  return 'AI provider is not ready yet. Save settings and try again. I can still help with Python scripts, debugging, and UND navigation.';
};

const supportsWorkspace = () => typeof window.showDirectoryPicker === 'function';

const updateWorkspaceStatus = (text) => {
  if (workspaceStatus) workspaceStatus.textContent = text;
};

const updateLlmStatus = (text) => {
  if (llmStatus) llmStatus.textContent = `LLM status: ${text}`;
};

const listFilesFromHandle = async (dirHandle, prefix = '') => {
  const files = [];
  for await (const [name, handle] of dirHandle.entries()) {
    const path = prefix ? `${prefix}/${name}` : name;
    if (handle.kind === 'file') {
      files.push({ path, handle });
    }
    if (handle.kind === 'directory' && !name.startsWith('.')) {
      const nested = await listFilesFromHandle(handle, path);
      files.push(...nested);
    }
  }
  return files;
};

const fillFileSelect = async () => {
  if (!workspaceHandle || !fileSelect) return;
  const files = await listFilesFromHandle(workspaceHandle);
  fileMap = new Map(files.map((f) => [f.path, f.handle]));
  fileSelect.innerHTML = '';

  for (const file of files.slice(0, 400)) {
    const option = document.createElement('option');
    option.value = file.path;
    option.textContent = file.path;
    fileSelect.appendChild(option);
  }

  if (!fileSelect.value && fileSelect.options.length > 0) {
    fileSelect.value = fileSelect.options[0].value;
  }
};

const readSelectedFile = async () => {
  if (!fileSelect || !fileSelect.value) {
    activeFileText = '';
    return '';
  }

  if (uploadedFileMap.has(fileSelect.value)) {
    activeFileText = uploadedFileMap.get(fileSelect.value) || '';
    return activeFileText;
  }

  const handle = fileMap.get(fileSelect.value);
  if (!handle) {
    activeFileText = '';
    return '';
  }
  const file = await handle.getFile();
  activeFileText = await file.text();
  return activeFileText;
};

const writeSelectedFile = async (text) => {
  if (!fileSelect || !fileSelect.value) {
    throw new Error('No file selected.');
  }

  if (uploadedFileMap.has(fileSelect.value)) {
    uploadedFileMap.set(fileSelect.value, text);
    activeFileText = text;
    return;
  }

  const handle = fileMap.get(fileSelect.value);
  if (!handle) {
    throw new Error('Selected file handle not available.');
  }
  const writable = await handle.createWritable();
  await writable.write(text);
  await writable.close();
  activeFileText = text;
};

const askOllama = async (config, messages, onChunk) => {
  const prompt = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model || 'llama3.2:3b',
      prompt,
      stream: true
    })
  });
  if (!response.ok) {
    throw new Error('Ollama request failed. Make sure Ollama is running and model is installed.');
  }

  if (!response.body) {
    throw new Error('Ollama stream not available.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const json = JSON.parse(line);
        const piece = json.response || '';
        if (piece) {
          full += piece;
          if (onChunk) onChunk(piece);
        }
      } catch {
        // ignore partial JSON lines
      }
    }
  }
  return full.trim();
};

const askOllamaNonStream = async (config, messages) => {
  const prompt = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model || 'llama3.2:3b',
      prompt,
      stream: false
    })
  });
  if (!response.ok) {
    throw new Error('Ollama request failed. Make sure Ollama is running and model is installed.');
  }
  const data = await response.json();
  return (data.response || '').trim();
};

const askOpenRouter = async (config, messages, onChunk) => {
  if (!config.apiKey) {
    throw new Error('OpenRouter API key is missing. Add it in settings.');
  }
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`
  };
  // Some environments reject invalid Referer values (e.g., file://), so only send on http(s).
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'UND OS Chatbot';
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model || 'mistralai/mistral-7b-instruct:free',
      messages,
      temperature: 0.35,
      stream: true
    })
  });
  if (!response.ok) {
    throw new Error('OpenRouter request failed. Verify key/model and try again.');
  }

  if (!response.body) {
    throw new Error('OpenRouter stream not available.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';

    for (const event of events) {
      const line = event.split('\n').find((l) => l.startsWith('data: '));
      if (!line) continue;
      const dataStr = line.slice(6).trim();
      if (dataStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(dataStr);
        const piece = parsed.choices?.[0]?.delta?.content || '';
        if (piece) {
          full += piece;
          if (onChunk) onChunk(piece);
        }
      } catch {
        // ignore malformed chunks
      }
    }
  }

  return full.trim();
};

const askOpenRouterNonStream = async (config, messages) => {
  if (!config.apiKey) {
    throw new Error('OpenRouter API key is missing. Add it in settings.');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`
  };
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'UND OS Chatbot';
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model || 'mistralai/mistral-7b-instruct:free',
      messages,
      temperature: 0.35,
      stream: false
    })
  });
  if (!response.ok) {
    throw new Error('OpenRouter request failed. Verify key/model and try again.');
  }
  const data = await response.json();
  return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
    ? data.choices[0].message.content
    : '').trim();
};

const askModel = async (config, userText, onChunk) => {
  let contextBlock = '';
  const mode = modeSelect ? modeSelect.value : 'chat';

  if ((mode === 'read' || mode === 'readwrite') && fileSelect && fileSelect.value) {
    const text = await readSelectedFile();
    const shortened = text.length > 12000 ? `${text.slice(0, 12000)}\n\n...[truncated]` : text;
    contextBlock = `Selected file: ${fileSelect.value}\n\n${shortened}`;
  }

  const messages = [
    { role: 'system', content: config.prompt || defaultConfig.prompt },
    ...(contextBlock ? [{ role: 'system', content: `Workspace context:\n${contextBlock}` }] : []),
    ...history.slice(-10),
    { role: 'user', content: userText }
  ];

  try {
    if (config.provider === 'openrouter') {
      return await askOpenRouter(config, messages, onChunk);
    }
    return await askOllama(config, messages, onChunk);
  } catch (error) {
    // Fallback to non-stream request for environments that block streaming.
    if (config.provider === 'openrouter') {
      return askOpenRouterNonStream(config, messages);
    }
    return askOllamaNonStream(config, messages);
  }
};

const testModelConnection = async (config) => {
  const ping = 'Reply with exactly: UND_LLM_OK';
  const messages = [
    { role: 'system', content: config.prompt || defaultConfig.prompt },
    { role: 'user', content: ping }
  ];

  if (config.provider === 'openrouter') {
    return askOpenRouterNonStream(config, messages);
  }
  return askOllamaNonStream(config, messages);
};

const startConfig = loadConfig();
fillConfigForm(startConfig);

if (saveConfigBtn) {
  saveConfigBtn.addEventListener('click', () => {
    const config = readConfigForm();
    if (!config.model) {
      if (configNote) configNote.textContent = 'Please enter a model name.';
      return;
    }
    saveConfig(config);
    if (configNote) configNote.textContent = `Saved. Provider: ${config.provider}, Model: ${config.model}`;
  });
}

if (testConfigBtn) {
  testConfigBtn.addEventListener('click', async () => {
    const config = readConfigForm();
    updateLlmStatus('Testing...');
    try {
      const result = await testModelConnection(config);
      if (result && result.toUpperCase().includes('UND_LLM_OK')) {
        updateLlmStatus(`Connected (${config.provider} / ${config.model})`);
      } else {
        updateLlmStatus(`Connected with unexpected response (${config.provider})`);
      }
    } catch (error) {
      const msg = String(error && error.message ? error.message : error);
      if (msg.toLowerCase().includes('failed to fetch')) {
        updateLlmStatus('Connection blocked. For local files, use Ollama or run via http server.');
      } else {
        updateLlmStatus(`Failed: ${msg}`);
      }
    }
  });
}

if (presetButtons.length > 0) {
  for (const btn of presetButtons) {
    btn.addEventListener('click', () => {
      for (const b of presetButtons) b.classList.remove('active');
      btn.classList.add('active');
      const preset = PRESETS[btn.getAttribute('data-preset')];
      if (!preset) return;
      if (modelInput) modelInput.value = preset.model;
      if (systemPrompt) systemPrompt.value = preset.prompt;
      if (configNote) configNote.textContent = `Preset loaded: ${btn.textContent}`;
    });
  }
}

if (connectWorkspaceBtn) {
  connectWorkspaceBtn.addEventListener('click', async () => {
    if (!supportsWorkspace()) {
      updateWorkspaceStatus('Folder access unavailable here. Use Upload Files as fallback.');
      if (uploadFilesInput) {
        uploadFilesInput.click();
      }
      return;
    }
    try {
      workspaceHandle = await window.showDirectoryPicker();
      await fillFileSelect();
      updateWorkspaceStatus(`Connected. ${fileSelect ? fileSelect.options.length : 0} files available.`);
      await readSelectedFile();
    } catch {
      updateWorkspaceStatus('Folder connection cancelled.');
    }
  });
}

if (uploadFilesBtn && uploadFilesInput) {
  uploadFilesBtn.addEventListener('click', () => {
    uploadFilesInput.click();
  });

  uploadFilesInput.addEventListener('change', async () => {
    const files = Array.from(uploadFilesInput.files || []);
    if (!fileSelect) {
      return;
    }
    uploadedFileMap = new Map();
    fileMap = new Map();
    fileSelect.innerHTML = '';

    for (const file of files) {
      const text = await file.text();
      uploadedFileMap.set(file.name, text);
      const option = document.createElement('option');
      option.value = file.name;
      option.textContent = file.name;
      fileSelect.appendChild(option);
    }

    if (files.length > 0) {
      fileSelect.value = files[0].name;
      activeFileText = uploadedFileMap.get(files[0].name) || '';
      if (fileDraft && !fileDraft.value.trim()) {
        fileDraft.value = activeFileText;
      }
      updateWorkspaceStatus(`Uploaded ${files.length} file(s). You can chat with file context now.`);
    } else {
      updateWorkspaceStatus('No files uploaded.');
    }
  });
}

if (fileSelect) {
  fileSelect.addEventListener('change', async () => {
    try {
      const text = await readSelectedFile();
      if (fileDraft && !fileDraft.value.trim()) {
        fileDraft.value = text;
      }
      updateWorkspaceStatus(`Loaded ${fileSelect.value}`);
    } catch {
      updateWorkspaceStatus('Unable to read selected file.');
    }
  });
}

if (applyDraftBtn) {
  applyDraftBtn.addEventListener('click', async () => {
    if (!fileDraft) return;
    try {
      await writeSelectedFile(fileDraft.value);
      updateWorkspaceStatus(`Saved draft to ${fileSelect ? fileSelect.value : 'selected file'}`);
    } catch (error) {
      updateWorkspaceStatus(`Save failed: ${error.message}`);
    }
  });
}

if (downloadDraftBtn) {
  downloadDraftBtn.addEventListener('click', () => {
    if (!fileDraft || !fileDraft.value.trim()) {
      updateWorkspaceStatus('Draft is empty. Ask for an edit first.');
      return;
    }
    const suggested = fileSelect && fileSelect.value ? fileSelect.value : 'draft.txt';
    const blob = new Blob([fileDraft.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = suggested;
    link.click();
    URL.revokeObjectURL(url);
    updateWorkspaceStatus(`Downloaded draft as ${suggested}`);
  });
}

if (chatForm && chatInput) {
  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const q = chatInput.value.trim();
    if (!q) return;

    appendMsg('user', q);
    chatInput.value = '';
    activeTopic = detectTopic(q);
    history.push({ role: 'user', content: q });

    const thinkingNode = appendThinking();
    const mode = modeSelect ? modeSelect.value : 'chat';

    try {
      const config = readConfigForm();
      let answer = await askModel(config, q, (chunk) => applyStreamChunk(thinkingNode, chunk));
      if (mode === 'readwrite' && fileDraft && fileSelect && fileSelect.value) {
        const blockStart = answer.indexOf('```');
        if (blockStart >= 0) {
          const nextFence = answer.indexOf('```', blockStart + 3);
          if (nextFence > blockStart) {
            const codeBlock = answer.slice(blockStart + 3, nextFence);
            const normalized = codeBlock.replace(/^\w+\n/, '');
            fileDraft.value = normalized.trim();
          }
        }
      }
      const output = answer || fallbackReply(q);
      if (thinkingNode) {
        if (thinkingNode.textContent === 'Thinking...') {
          thinkingNode.remove();
          appendMsg('bot', output);
        } else {
          thinkingNode.className = 'msg bot';
        }
      }
      history.push({ role: 'assistant', content: output });
    } catch (error) {
      if (thinkingNode) thinkingNode.remove();
      const fallback = `${fallbackReply(q)}\n\nModel error: ${error.message}`;
      appendMsg('bot', fallback);
      history.push({ role: 'assistant', content: fallback });
    }
  });
}

for (const chip of chips) {
  chip.addEventListener('click', () => {
    const text = chip.getAttribute('data-msg');
    if (!text || !chatInput || !chatForm) {
      return;
    }
    chatInput.value = text;
    chatForm.requestSubmit();
  });
}

updateMeta();
updateLlmStatus('Not tested');

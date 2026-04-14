const LOCAL_BRIDGE = 'http://127.0.0.1:8765';
const LOCAL_MODEL = 'qwen2.5-coder:3b';
const STORAGE_KEY = 'smartworld.codeStudio.workspace.v1';

const editor = document.querySelector('#editor');
const lineNumbers = document.querySelector('#lineNumbers');
const output = document.querySelector('#output');
const previewFrame = document.querySelector('#previewFrame');
const languageSelect = document.querySelector('#languageSelect');
const runBtn = document.querySelector('#runBtn');
const sampleBtn = document.querySelector('#sampleBtn');
const newFileBtn = document.querySelector('#newFileBtn');
const bridgeCheckBtn = document.querySelector('#bridgeCheckBtn');
const bridgeCopyBtn = document.querySelector('#bridgeCopyBtn');
const fileList = document.querySelector('#fileList');
const activeFileName = document.querySelector('#activeFileName');
const statusText = document.querySelector('#statusText');

const tabOutput = document.querySelector('#tabOutput');
const tabPreview = document.querySelector('#tabPreview');
const outputPane = document.querySelector('#outputPane');
const previewPane = document.querySelector('#previewPane');

const chatFeed = document.querySelector('#chatFeed');
const chatForm = document.querySelector('#chatForm');
const chatInput = document.querySelector('#chatInput');
const chatState = document.querySelector('#chatState');

let pyodide = null;
let loadingPyodide = null;

const BRIDGE_START_CMD = "$env:PATH = [System.Environment]::GetEnvironmentVariable('PATH','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('PATH','User'); cd 'C:/Users/irajh/Downloads/VSXtream/UNDv2'; if (Test-Path 'C:/Users/irajh/.local/bin/python3.14.exe') { & 'C:/Users/irajh/.local/bin/python3.14.exe' os/apps/terminal/terminal_bridge.py } elseif (Get-Command py -ErrorAction SilentlyContinue) { py -3 os/apps/terminal/terminal_bridge.py } elseif (Get-Command python -ErrorAction SilentlyContinue) { python os/apps/terminal/terminal_bridge.py } else { Write-Error 'Python not found. Install Python and disable Microsoft Store alias.' }";

const defaultWorkspace = {
  files: [
    {
      id: crypto.randomUUID(),
      name: 'main.js',
      language: 'javascript',
      content: "const nums = [10, 22, 7, 4];\nconsole.log('Sum:', nums.reduce((a, b) => a + b, 0));\nconsole.log('UND Code Studio ready.');\n"
    }
  ],
  activeFileId: null
};

let workspace = loadWorkspace();
if (!workspace.activeFileId && workspace.files[0]) {
  workspace.activeFileId = workspace.files[0].id;
}

function loadWorkspace() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultWorkspace);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.files) || !parsed.files.length) {
      return structuredClone(defaultWorkspace);
    }
    return parsed;
  } catch {
    return structuredClone(defaultWorkspace);
  }
}

function saveWorkspace() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  } catch {
    // ignore storage failures
  }
}

function getActiveFile() {
  return workspace.files.find((f) => f.id === workspace.activeFileId) || workspace.files[0] || null;
}

function setStatus(text) {
  if (statusText) statusText.textContent = text;
}

function updateLineNumbers() {
  if (!editor || !lineNumbers) return;
  const lines = Math.max(1, editor.value.split('\n').length);
  lineNumbers.textContent = Array.from({ length: lines }, (_, i) => String(i + 1)).join('\n');
}

function syncScroll() {
  if (!editor || !lineNumbers) return;
  lineNumbers.scrollTop = editor.scrollTop;
}

function renderFileList() {
  if (!fileList) return;
  fileList.innerHTML = '';

  for (const file of workspace.files) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `file-btn ${file.id === workspace.activeFileId ? 'active' : ''}`;
    btn.textContent = file.name;
    btn.addEventListener('click', () => {
      workspace.activeFileId = file.id;
      renderWorkspace();
    });
    fileList.appendChild(btn);
  }
}

function renderWorkspace() {
  const active = getActiveFile();
  renderFileList();

  if (!active || !editor) return;
  editor.value = active.content || '';
  if (activeFileName) activeFileName.textContent = active.name;
  if (languageSelect) languageSelect.value = active.language || 'javascript';
  updateLineNumbers();
  syncScroll();
  setStatus('Ready');
}

function updateActiveFileContent() {
  const active = getActiveFile();
  if (!active || !editor) return;
  active.content = editor.value;
  saveWorkspace();
}

function appendOutput(text) {
  if (!output) return;
  output.textContent += `${text}\n`;
  output.scrollTop = output.scrollHeight;
}

function clearOutput() {
  if (output) output.textContent = '';
}

function switchPane(name) {
  const preview = name === 'preview';
  tabOutput?.classList.toggle('active', !preview);
  tabPreview?.classList.toggle('active', preview);
  outputPane?.classList.toggle('active', !preview);
  previewPane?.classList.toggle('active', preview);
}

function createFileNameForLanguage(language) {
  const map = {
    javascript: 'file.js',
    python: 'script.py',
    powershell: 'script.ps1',
    html: 'index.html',
    css: 'styles.css',
    json: 'data.json'
  };
  const base = map[language] || 'new.txt';
  let name = base;
  let i = 2;
  const names = new Set(workspace.files.map((f) => f.name));
  while (names.has(name)) {
    const parts = base.split('.');
    const ext = parts.length > 1 ? `.${parts.pop()}` : '';
    const stem = parts.join('.');
    name = `${stem}-${i}${ext}`;
    i += 1;
  }
  return name;
}

function sampleForLanguage(language) {
  if (language === 'python') {
    return "import math\n\nvalues = [3, 8, 13]\nprint('Mean:', sum(values) / len(values))\nprint('sqrt(49)=', math.sqrt(49))\n";
  }
  if (language === 'powershell') {
    return "$nums = 10,22,7,4\n$sum = ($nums | Measure-Object -Sum).Sum\nWrite-Output \"Sum: $sum\"\nWrite-Output \"UND Code Studio PowerShell ready\"\n";
  }
  if (language === 'html') {
    return "<!doctype html>\n<html>\n  <head><title>Preview</title></head>\n  <body style=\"font-family:sans-serif;background:#f3f8ff\">\n    <h1>Hello UND</h1>\n    <p>This HTML is running in preview pane.</p>\n  </body>\n</html>\n";
  }
  if (language === 'css') {
    return "body {\n  font-family: sans-serif;\n  background: linear-gradient(120deg, #eef7ff, #d4ecff);\n}\n.card {\n  max-width: 420px;\n  margin: 2rem auto;\n  padding: 1rem;\n  border-radius: 12px;\n  background: white;\n  box-shadow: 0 8px 22px rgba(0, 60, 120, 0.14);\n}\n";
  }
  if (language === 'json') {
    return '{\n  "university": "UND",\n  "center": "AIT Transfer",\n  "status": "active"\n}\n';
  }
  return "const msg = 'Hello from UND Code Studio';\nconsole.log(msg);\n";
}

async function loadPyodideRuntime() {
  if (pyodide) return pyodide;
  if (loadingPyodide) return loadingPyodide;

  loadingPyodide = (async () => {
    appendOutput('Loading Python runtime...');
    if (!document.querySelector('#pyodideScript')) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.id = 'pyodideScript';
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Pyodide.'));
        document.head.appendChild(script);
      });
    }
    pyodide = await globalThis.loadPyodide();
    appendOutput('Python runtime ready.');
    return pyodide;
  })();

  return loadingPyodide;
}

function encodeBase64Utf8(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

async function executeBridgeCommand(command) {
  const response = await fetch(`${LOCAL_BRIDGE}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      command,
      cwd: '.'
    })
  });

  if (!response.ok) {
    throw new Error('Bridge execute request failed.');
  }

  const result = await response.json();
  return {
    ok: Boolean(result.ok),
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
    code: Number.isFinite(result.code) ? result.code : 1
  };
}

async function runExactPython(code) {
  const b64 = encodeBase64Utf8(code);
  const command = [
    `$tmp = Join-Path $env:TEMP ('und_cs_' + [guid]::NewGuid().ToString() + '.py')`,
    `[IO.File]::WriteAllText($tmp, [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${b64}')))`,
    `$ran = $false`,
    `$exitCode = 1`,
    `$errors = @()`,
    `$candidates = @(`,
    `  @{ name='py'; kind='py'; value='py' },`,
    `  @{ name='python3'; kind='cmd'; value='python3' },`,
    `  @{ name='python'; kind='cmd'; value='python' },`,
    `  @{ name='local-3.14'; kind='path'; value='C:/Users/irajh/.local/bin/python3.14.exe' },`,
    `  @{ name='local-3.13'; kind='path'; value='C:/Users/irajh/.local/bin/python3.13.exe' },`,
    `  @{ name='local-3.12'; kind='path'; value='C:/Users/irajh/.local/bin/python3.12.exe' }`,
    `)`,
    `foreach ($cand in $candidates) {`,
    `  try {`,
    `    if ($cand.kind -eq 'path' -and !(Test-Path $cand.value)) { continue }`,
    `    if ($cand.kind -eq 'cmd' -and !(Get-Command $cand.value -ErrorAction SilentlyContinue)) { continue }`,
    `    if ($cand.kind -eq 'py' -and !(Get-Command py -ErrorAction SilentlyContinue)) { continue }`,
    ``,
    `    if ($cand.kind -eq 'py') {`,
    `      & py -3 $tmp`,
    `    } elseif ($cand.kind -eq 'path') {`,
    `      & $cand.value $tmp`,
    `    } else {`,
    `      & $cand.value $tmp`,
    `    }`,
    ``,
    `    $exitCode = $LASTEXITCODE`,
    `    if ($exitCode -eq 0) { $ran = $true; break }`,
    `    $errors += ($cand.name + ': exit ' + $exitCode)`,
    `  } catch {`,
    `    $errors += ($cand.name + ': ' + $_.Exception.Message)`,
    `  }`,
    `}`,
    `if (-not $ran -and $exitCode -ne 0) {`,
    `  Write-Error ('Python runtime not found or failed. Attempts => ' + ($errors -join ' | '))`,
    `}`,
    `Remove-Item $tmp -ErrorAction SilentlyContinue`,
    `exit $exitCode`
  ].join('; ');

  return executeBridgeCommand(command);
}

async function runExactJavaScript(code) {
  const b64 = encodeBase64Utf8(code);
  const command = [
    `$tmp = Join-Path $env:TEMP ('und_cs_' + [guid]::NewGuid().ToString() + '.js')`,
    `[IO.File]::WriteAllText($tmp, [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${b64}')))`,
    `if (Get-Command node -ErrorAction SilentlyContinue) { node $tmp } else { Write-Error 'Node.js runtime not found'; exit 1 }`,
    `$exitCode = $LASTEXITCODE`,
    `Remove-Item $tmp -ErrorAction SilentlyContinue`,
    `exit $exitCode`
  ].join('; ');

  return executeBridgeCommand(command);
}

async function runExactPowerShell(code) {
  const b64 = encodeBase64Utf8(code);
  const command = [
    `$tmp = Join-Path $env:TEMP ('und_cs_' + [guid]::NewGuid().ToString() + '.ps1')`,
    `[IO.File]::WriteAllText($tmp, [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${b64}')))`,
    `powershell -NoProfile -ExecutionPolicy Bypass -File $tmp`,
    `$exitCode = $LASTEXITCODE`,
    `Remove-Item $tmp -ErrorAction SilentlyContinue`,
    `exit $exitCode`
  ].join('; ');

  return executeBridgeCommand(command);
}

function writeBridgeResult(result) {
  const text = [result.stdout, result.stderr].filter(Boolean).join('\n');
  appendOutput(text || 'Execution completed with no output.');
  if (result.ok) {
    setStatus('Exact run completed');
  } else {
    setStatus(`Exact run failed (code ${result.code})`);
  }
}

async function runJavaScript(code) {
  clearOutput();
  appendOutput('Running JavaScript...');

  const logs = [];
  const fakeConsole = {
    log: (...args) => logs.push(args.map((a) => String(a)).join(' ')),
    error: (...args) => logs.push(`ERROR ${args.map((a) => String(a)).join(' ')}`),
    warn: (...args) => logs.push(`WARN ${args.map((a) => String(a)).join(' ')}`)
  };

  try {
    const fn = new Function('console', code);
    fn(fakeConsole);
    appendOutput(logs.join('\n') || 'Execution completed with no console output.');
    setStatus('Run completed');
  } catch (error) {
    appendOutput(`Runtime error: ${error.message}`);
    setStatus('Run failed');
  }
}

async function runPython(code) {
  clearOutput();
  appendOutput('Running Python...');

  try {
    const runtime = await loadPyodideRuntime();
    runtime.runPython('import sys, io\n_buf = io.StringIO()\nsys.stdout = _buf\nsys.stderr = _buf');
    runtime.runPython(code);
    const printed = runtime.runPython('_buf.getvalue()');
    runtime.runPython('sys.stdout = sys.__stdout__\nsys.stderr = sys.__stderr__');
    appendOutput((printed || '').trim() || 'Execution completed with no output.');
    setStatus('Run completed');
  } catch (error) {
    appendOutput(`Python error: ${error.message}`);
    setStatus('Run failed');
  }
}

function runHtml(code) {
  switchPane('preview');
  if (previewFrame) {
    previewFrame.srcdoc = code;
  }
  clearOutput();
  appendOutput('HTML rendered in Preview pane.');
  setStatus('Preview rendered');
}

function runCss(code) {
  switchPane('preview');
  const demo = `<!doctype html><html><head><style>${code}</style></head><body><div class="card"><h2>CSS Preview</h2><p>Style this block in editor.</p></div></body></html>`;
  if (previewFrame) {
    previewFrame.srcdoc = demo;
  }
  clearOutput();
  appendOutput('CSS rendered in Preview pane.');
  setStatus('Preview rendered');
}

function runJson(code) {
  clearOutput();
  try {
    const parsed = JSON.parse(code);
    appendOutput(JSON.stringify(parsed, null, 2));
    setStatus('JSON valid');
  } catch (error) {
    appendOutput(`JSON error: ${error.message}`);
    setStatus('Run failed');
  }
}

async function runActiveCode() {
  const active = getActiveFile();
  if (!active || !editor) return;

  updateActiveFileContent();
  const code = editor.value;
  const language = active.language || 'javascript';

  if (language === 'javascript') {
    clearOutput();
    appendOutput('Running JavaScript with Node (exact runtime)...');
    try {
      const result = await runExactJavaScript(code);
      writeBridgeResult(result);
    } catch (error) {
      appendOutput(`Exact runtime unavailable: ${error.message}`);
      appendOutput('To start bridge, use:');
      appendOutput(BRIDGE_START_CMD);
      appendOutput('Falling back to browser JavaScript runtime.');
      await runJavaScript(code);
    }
    return;
  }
  if (language === 'python') {
    clearOutput();
    appendOutput('Running Python with system interpreter (exact runtime)...');
    try {
      const result = await runExactPython(code);
      writeBridgeResult(result);
    } catch (error) {
      appendOutput(`Exact runtime unavailable: ${error.message}`);
      appendOutput('To start bridge, use:');
      appendOutput(BRIDGE_START_CMD);
      appendOutput('Falling back to browser Python runtime (Pyodide).');
      await runPython(code);
    }
    return;
  }
  if (language === 'powershell') {
    clearOutput();
    appendOutput('Running PowerShell with system runtime (exact runtime)...');
    try {
      const result = await runExactPowerShell(code);
      writeBridgeResult(result);
    } catch (error) {
      appendOutput(`Exact runtime unavailable: ${error.message}`);
      appendOutput('To start bridge, use:');
      appendOutput(BRIDGE_START_CMD);
      setStatus('Run failed');
    }
    return;
  }
  if (language === 'html') {
    runHtml(code);
    return;
  }
  if (language === 'css') {
    runCss(code);
    return;
  }
  if (language === 'json') {
    runJson(code);
    return;
  }

  clearOutput();
  appendOutput('Unsupported language.');
}

function addMessage(role, text) {
  if (!chatFeed) return null;
  const msg = document.createElement('article');
  msg.className = `msg ${role}`;
  msg.textContent = text;
  chatFeed.appendChild(msg);
  chatFeed.scrollTop = chatFeed.scrollHeight;
  return msg;
}

async function askLocalBridge(prompt) {
  const response = await fetch(`${LOCAL_BRIDGE}/ollama/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: LOCAL_MODEL,
      prompt
    })
  });

  if (!response.ok) {
    throw new Error('Bridge request failed. Start terminal bridge first.');
  }

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.error || 'Model response failed.');
  }

  return String(data.response || '').trim();
}

async function refreshChatBridgeState() {
  if (!chatState) return;
  try {
    const response = await fetch(`${LOCAL_BRIDGE}/health`);
    chatState.textContent = response.ok ? `Model: ${LOCAL_MODEL}` : 'Bridge issue';
  } catch {
    chatState.textContent = 'Bridge offline';
  }
}

async function copyBridgeCommand() {
  try {
    await navigator.clipboard.writeText(BRIDGE_START_CMD);
    clearOutput();
    appendOutput('Bridge start command copied to clipboard.');
    setStatus('Bridge command copied');
  } catch {
    clearOutput();
    appendOutput('Copy failed. Run this command manually:');
    appendOutput(BRIDGE_START_CMD);
    setStatus('Copy failed');
  }
}

async function onChatSubmit(event) {
  event.preventDefault();
  const text = (chatInput?.value || '').trim();
  if (!text) return;

  addMessage('user', text);
  if (chatInput) chatInput.value = '';

  const active = getActiveFile();
  const codeContext = editor?.value || '';
  const prompt = [
    'You are a coding assistant inside UND Code Studio.',
    `Language: ${active?.language || 'javascript'}`,
    `File: ${active?.name || 'unknown'}`,
    'Code:',
    codeContext.slice(0, 5000),
    'User question:',
    text
  ].join('\n\n');

  const pending = addMessage('ai', 'Thinking...');
  if (chatState) chatState.textContent = 'Calling local model';

  try {
    const answer = await askLocalBridge(prompt);
    if (pending) {
      pending.textContent = answer || 'No response.';
    }
    if (chatState) chatState.textContent = `Model: ${LOCAL_MODEL}`;
  } catch (error) {
    if (pending) {
      pending.textContent = `Error: ${error.message}\n\nStart bridge with:\n${BRIDGE_START_CMD}`;
    }
    if (chatState) chatState.textContent = 'Bridge offline';
  }
}

editor?.addEventListener('input', () => {
  updateLineNumbers();
  updateActiveFileContent();
});

editor?.addEventListener('scroll', syncScroll);

runBtn?.addEventListener('click', () => {
  runActiveCode();
});

bridgeCheckBtn?.addEventListener('click', async () => {
  await refreshChatBridgeState();
  clearOutput();
  if (chatState && chatState.textContent && chatState.textContent.toLowerCase().includes('model:')) {
    appendOutput(`Bridge online: ${chatState.textContent}`);
    setStatus('Bridge online');
  } else {
    appendOutput('Bridge appears offline. Start it with:');
    appendOutput(BRIDGE_START_CMD);
    setStatus('Bridge offline');
  }
});

bridgeCopyBtn?.addEventListener('click', () => {
  copyBridgeCommand();
});

sampleBtn?.addEventListener('click', () => {
  const active = getActiveFile();
  if (!active || !editor) return;
  editor.value = sampleForLanguage(active.language || 'javascript');
  updateLineNumbers();
  updateActiveFileContent();
  setStatus('Sample loaded');
});

newFileBtn?.addEventListener('click', () => {
  const lang = languageSelect?.value || 'javascript';
  const file = {
    id: crypto.randomUUID(),
    name: createFileNameForLanguage(lang),
    language: lang,
    content: sampleForLanguage(lang)
  };
  workspace.files.push(file);
  workspace.activeFileId = file.id;
  saveWorkspace();
  renderWorkspace();
  setStatus('New file created');
});

languageSelect?.addEventListener('change', () => {
  const active = getActiveFile();
  if (!active) return;
  active.language = languageSelect.value;
  const ext = active.name.includes('.') ? active.name.split('.').pop() : '';
  const expected = {
    javascript: 'js',
    python: 'py',
    powershell: 'ps1',
    html: 'html',
    css: 'css',
    json: 'json'
  }[active.language] || ext;

  if (ext !== expected) {
    active.name = `${active.name.replace(/\.[^/.]+$/, '')}.${expected}`;
  }

  if (activeFileName) activeFileName.textContent = active.name;
  saveWorkspace();
  renderFileList();
  setStatus(`Language set to ${active.language}`);
});

tabOutput?.addEventListener('click', () => switchPane('output'));
tabPreview?.addEventListener('click', () => switchPane('preview'));

chatForm?.addEventListener('submit', onChatSubmit);

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault();
    runActiveCode();
  }
});

switchPane('output');
renderWorkspace();
addMessage('ai', 'Code Studio AI is ready. Ask me to debug, optimize, or explain code.');
void refreshChatBridgeState();
setInterval(refreshChatBridgeState, 15000);

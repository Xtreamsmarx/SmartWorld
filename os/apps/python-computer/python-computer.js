const scriptEditor = document.querySelector('#scriptEditor');
const runBtn = document.querySelector('#runBtn');
const clearEditorBtn = document.querySelector('#clearEditorBtn');
const loadSampleBtn = document.querySelector('#loadSampleBtn');
const outputArea = document.querySelector('#outputArea');
const clearOutputBtn = document.querySelector('#clearOutputBtn');
const varBody = document.querySelector('#varBody');
const sysInfo = document.querySelector('#sysInfo');

// ── Pyodide – real browser-side Python runtime ──────────────────────────────
// Pyodide runs CPython compiled to WebAssembly, so code executes properly
// inside the browser without a server. The CDN load happens once on first run.

let pyodideReady = false;
let pyodideInstance = null;

const loadPyodide = async () => {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  appendOutput('Loading Python runtime (Pyodide)…');

  // Inject Pyodide loader script once.
  if (!document.querySelector('#pyodideScript')) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = 'pyodideScript';
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Pyodide from CDN.'));
      document.head.appendChild(script);
    });
  }

  // loadPyodide is injected by the Pyodide script above.
  pyodideInstance = await globalThis.loadPyodide();
  pyodideReady = true;
  appendOutput('Python runtime ready. Click Run any time.\n');
  return pyodideInstance;
};

// ── Output helpers ───────────────────────────────────────────────────────────
const appendOutput = (text) => {
  if (!outputArea) {
    return;
  }
  outputArea.textContent += text + '\n';
  outputArea.scrollTop = outputArea.scrollHeight;
};

// ── Variable inspector ───────────────────────────────────────────────────────
const updateVarTable = (ns) => {
  if (!varBody) {
    return;
  }

  varBody.innerHTML = '';

  const skip = new Set(['__name__', '__doc__', '__package__', '__loader__',
    '__spec__', '__builtins__', '__annotations__']);

  for (const [key, val] of Object.entries(ns)) {
    if (skip.has(key) || key.startsWith('_')) {
      continue;
    }

    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    const tdVal = document.createElement('td');
    tdName.textContent = key;

    let display = String(val);
    if (display.length > 60) {
      display = display.slice(0, 60) + '…';
    }

    tdVal.textContent = display;
    tr.appendChild(tdName);
    tr.appendChild(tdVal);
    varBody.appendChild(tr);
  }
};

// ── Run script ───────────────────────────────────────────────────────────────
const runScript = async () => {
  if (!scriptEditor || !outputArea) {
    return;
  }

  const code = scriptEditor.value;
  if (!code.trim()) {
    appendOutput('(empty script)');
    return;
  }

  appendOutput('─── Run ─────────────────────');

  let py;
  try {
    py = await loadPyodide();
  } catch (error) {
    appendOutput(`Could not load Python runtime: ${error.message}`);
    appendOutput('Tip: use terminal command  python os\\apps\\python-computer\\python_computer.py  for offline use.');
    return;
  }

  // Capture stdout/stderr into a Python StringIO buffer.
  py.runPython(`
import sys, io
_buf = io.StringIO()
sys.stdout = _buf
sys.stderr = _buf
`);

  try {
    py.runPython(code);
  } catch (error) {
    appendOutput(`Error: ${error.message}`);
  }

  const printed = py.runPython('_buf.getvalue()');
  if (printed && printed.trim()) {
    appendOutput(printed);
  }

  py.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');

  // Grab namespace for the inspector.
  try {
    const ns = py.runPython('dict(locals())').toJs({ dict_converter: Object.fromEntries });
    updateVarTable(ns);
  } catch (_) {
    // inspector update is best-effort
  }
};

// ── System info ──────────────────────────────────────────────────────────────
const populateSysInfo = () => {
  if (!sysInfo) {
    return;
  }

  const items = [
    `Runtime: Pyodide (CPython / WASM)`,
    `Platform: ${navigator.platform}`,
    `Language: ${navigator.language}`,
    `Viewport: ${window.innerWidth} × ${window.innerHeight}`,
    `Script file: os/apps/python-computer/python_computer.py`,
  ];

  sysInfo.innerHTML = '';
  for (const text of items) {
    const li = document.createElement('li');
    li.textContent = text;
    sysInfo.appendChild(li);
  }
};

// ── Sample script ────────────────────────────────────────────────────────────
const SAMPLE = `# Python Computer — UND OS
import math

radius = 7
area = math.pi * radius ** 2
print(f"Circle area for radius {radius}: {area:.4f}")

data = [10, 42, 7, 95, 33]
print(f"Max: {max(data)}, Min: {min(data)}, Sum: {sum(data)}")

for i in range(1, 6):
    print(f"  {i} ** 2 = {i**2}")
`;

// ── Event wiring ─────────────────────────────────────────────────────────────
if (runBtn) {
  runBtn.addEventListener('click', () => {
    runScript();
  });
}

if (clearEditorBtn && scriptEditor) {
  clearEditorBtn.addEventListener('click', () => {
    scriptEditor.value = '';
  });
}

if (loadSampleBtn && scriptEditor) {
  loadSampleBtn.addEventListener('click', () => {
    scriptEditor.value = SAMPLE;
  });
}

if (clearOutputBtn && outputArea) {
  clearOutputBtn.addEventListener('click', () => {
    outputArea.textContent = '';
  });
}

// Keyboard shortcut: Ctrl+Enter runs the script from anywhere on the page.
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault();
    runScript();
  }
});

populateSysInfo();

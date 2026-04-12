const terminalOutput = document.querySelector('#terminalOutput');
const cmdForm = document.querySelector('#cmdForm');
const cmdInput = document.querySelector('#cmdInput');
const chips = document.querySelectorAll('.chip');
const termStats = document.querySelector('#termStats');
const bridgeStatus = document.querySelector('#bridgeStatus');
const cwdLabel = document.querySelector('#cwdLabel');
const startBridgeBtn = document.querySelector('#startBridgeBtn');
const promptLabel = document.querySelector('#promptLabel');

const BRIDGE_URL = 'http://127.0.0.1:8765';
const DEFAULT_CWD = 'C:/Users/irajh/Downloads/VSXtream/UNDv2';

const state = {
  runs: 0,
  lastCommand: 'none',
  cwd: DEFAULT_CWD,
  bridgeOnline: false,
};

const appendLine = (text, kind) => {
  if (!terminalOutput) {
    return;
  }
  const line = document.createElement('p');
  line.className = `line ${kind}`;
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
};

const updatePrompt = () => {
  const tail = state.cwd.replace(/\\/g, '/').split('/').filter(Boolean).slice(-2).join('/');
  if (promptLabel) {
    promptLabel.textContent = `sw@${tail || '~'}$`;
  }
  if (cwdLabel) {
    cwdLabel.textContent = `cwd: ${state.cwd}`;
  }
};

const updateStats = () => {
  if (!termStats) {
    return;
  }
  termStats.textContent = `Commands executed: ${state.runs} | Last command: ${state.lastCommand} | Bridge: ${state.bridgeOnline ? 'online' : 'offline'}`;
};

const setBridgeState = (online, message) => {
  state.bridgeOnline = online;
  if (bridgeStatus) {
    bridgeStatus.textContent = `Bridge: ${message}`;
  }
  updateStats();
};

const checkBridge = async () => {
  try {
    const response = await fetch(`${BRIDGE_URL}/health`);
    if (!response.ok) {
      throw new Error('offline');
    }
    const data = await response.json();
    state.cwd = data.workspace || state.cwd;
    updatePrompt();
    setBridgeState(true, 'online');
    return true;
  } catch {
    setBridgeState(false, 'offline');
    return false;
  }
};

const runRemoteCommand = async (raw) => {
  const command = raw.trim();
  if (!command) {
    return;
  }

  if (command.toLowerCase() === 'clear') {
    if (terminalOutput) {
      terminalOutput.innerHTML = '';
    }
    return;
  }

  appendLine(`${promptLabel ? promptLabel.textContent : 'sw@os$'} ${raw}`, 'cmd');
  state.runs += 1;
  state.lastCommand = command;
  updateStats();

  const online = await checkBridge();
  if (!online) {
    appendLine('Bridge is offline. Click Start Bridge, then run the command again.', 'warn');
    return;
  }

  try {
    const response = await fetch(`${BRIDGE_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, cwd: state.cwd })
    });
    const result = await response.json();
    if (result.cwd) {
      state.cwd = result.cwd;
      updatePrompt();
    }
    if (result.stdout) {
      appendLine(result.stdout.trimEnd(), 'out');
    }
    if (result.stderr) {
      appendLine(result.stderr.trimEnd(), 'warn');
    }
    if (!result.stdout && !result.stderr) {
      appendLine(`Exit code ${result.code}`, result.ok ? 'out' : 'warn');
    }
  } catch (error) {
    appendLine(`Bridge error: ${error.message}`, 'warn');
    setBridgeState(false, 'offline');
  }
  updateStats();
};

if (cmdForm && cmdInput) {
  cmdForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = cmdInput.value;
    cmdInput.value = '';
    runRemoteCommand(value);
  });
}

for (const chip of chips) {
  chip.addEventListener('click', () => {
    runRemoteCommand(chip.getAttribute('data-cmd') || '');
  });
}

if (startBridgeBtn) {
  startBridgeBtn.addEventListener('click', () => {
    appendLine('Start the bridge from the workspace terminal with:', 'out');
    appendLine('C:/Users/irajh/.local/bin/python3.14.exe os/apps/terminal/terminal_bridge.py', 'cmd');
  });
}

appendLine('Smart World Terminal ready.', 'out');
appendLine('This terminal runs real PowerShell commands through a local bridge service.', 'out');
appendLine('If bridge is offline, start it with: C:/Users/irajh/.local/bin/python3.14.exe os/apps/terminal/terminal_bridge.py', 'out');
updatePrompt();
updateStats();
checkBridge();

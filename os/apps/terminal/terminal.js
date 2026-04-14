const terminalOutput = document.querySelector('#terminalOutput');
const cmdForm = document.querySelector('#cmdForm');
const cmdInput = document.querySelector('#cmdInput');
const chips = document.querySelectorAll('.chip');
const termStats = document.querySelector('#termStats');
const bridgeStatus = document.querySelector('#bridgeStatus');
const cwdLabel = document.querySelector('#cwdLabel');
const startBridgeBtn = document.querySelector('#startBridgeBtn');
const copyBridgeCmdBtn = document.querySelector('#copyBridgeCmdBtn');
const promptLabel = document.querySelector('#promptLabel');
const cmdHistory = document.querySelector('#cmdHistory');

const BRIDGE_URL = 'http://127.0.0.1:8765';
const DEFAULT_CWD = 'C:/Users/irajh/Downloads/VSXtream/UNDv2';
const BRIDGE_START_CMD = "$env:PATH = [System.Environment]::GetEnvironmentVariable('PATH','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('PATH','User'); cd 'C:/Users/irajh/Downloads/VSXtream/UNDv2'; if (Test-Path 'C:/Users/irajh/.local/bin/python3.14.exe') { & 'C:/Users/irajh/.local/bin/python3.14.exe' os/apps/terminal/terminal_bridge.py } elseif (Get-Command py -ErrorAction SilentlyContinue) { py -3 os/apps/terminal/terminal_bridge.py } elseif (Get-Command python -ErrorAction SilentlyContinue) { python os/apps/terminal/terminal_bridge.py } else { Write-Error 'Python not found. Install Python and disable Microsoft Store alias.' }";

const state = {
  runs: 0,
  lastCommand: 'none',
  cwd: DEFAULT_CWD,
  bridgeOnline: false,
  history: [],
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

const renderHistory = () => {
  if (!cmdHistory) return;
  cmdHistory.innerHTML = '';
  for (const command of state.history) {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'cmd-pill';
    pill.textContent = command;
    pill.addEventListener('click', () => {
      runRemoteCommand(command);
    });
    cmdHistory.appendChild(pill);
  }
};

const rememberCommand = (command) => {
  const trimmed = command.trim();
  if (!trimmed || trimmed.toLowerCase() === 'clear') return;
  const existingIdx = state.history.findIndex((entry) => entry.toLowerCase() === trimmed.toLowerCase());
  if (existingIdx >= 0) {
    state.history.splice(existingIdx, 1);
  }
  state.history.unshift(trimmed);
  if (state.history.length > 10) {
    state.history.pop();
  }
  renderHistory();
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
  rememberCommand(command);
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
  startBridgeBtn.addEventListener('click', async () => {
    const online = await checkBridge();
    if (online) {
      appendLine('Bridge is already online.', 'out');
      return;
    }
    appendLine('Run this robust bridge start command in PowerShell:', 'out');
    appendLine(BRIDGE_START_CMD, 'cmd');
    appendLine('Tip: keep that terminal open while using chatbots and exact run.', 'out');
  });
}

if (copyBridgeCmdBtn) {
  copyBridgeCmdBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(BRIDGE_START_CMD);
      appendLine('Bridge start command copied to clipboard.', 'out');
    } catch {
      appendLine(`Copy failed. Use this command manually: ${BRIDGE_START_CMD}`, 'warn');
    }
  });
}

appendLine('Smart World Terminal ready.', 'out');
appendLine('This terminal runs real PowerShell commands through a local bridge service.', 'out');
appendLine(`If bridge is offline, start it with: ${BRIDGE_START_CMD}`, 'out');
renderHistory();
updatePrompt();
updateStats();
checkBridge();

const terminalOutput = document.querySelector('#terminalOutput');
const cmdForm = document.querySelector('#cmdForm');
const cmdInput = document.querySelector('#cmdInput');
const chips = document.querySelectorAll('.chip');
const termStats = document.querySelector('#termStats');

const state = {
	runs: 0,
	lastCommand: 'none'
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

const updateStats = () => {
	if (!termStats) {
		return;
	}
	termStats.textContent = `Commands executed: ${state.runs} | Last command: ${state.lastCommand}`;
};

const runCommand = (raw) => {
	const command = raw.trim().toLowerCase();
	if (!command) {
		return;
	}

	appendLine(`und@os:~$ ${raw}`, 'cmd');
	state.runs += 1;
	state.lastCommand = command;

	if (command === 'help') {
		appendLine('Commands: help, ls, pwd, status, open learning, open twin, clear', 'out');
	} else if (command === 'ls') {
		appendLine('apps(browser chatbot explorer python-calculator settings terminal)  desktop  home  learning-paths  digital-twin-lab  und.html', 'out');
	} else if (command === 'pwd') {
		appendLine('/undv2/os/apps/terminal', 'out');
	} else if (command === 'status') {
		appendLine('UND OS status: stable | widgets: online | app-window: active', 'out');
	} else if (command === 'open learning') {
		appendLine('Route hint: ../../learning-paths/learning-paths.html', 'out');
	} else if (command === 'open twin') {
		appendLine('Route hint: ../../digital-twin-lab/digital-twin-lab.html', 'out');
	} else if (command === 'clear') {
		if (terminalOutput) {
			terminalOutput.innerHTML = '';
		}
	} else {
		appendLine(`Unknown command: ${raw}`, 'warn');
	}

	updateStats();
};

if (cmdForm && cmdInput) {
	cmdForm.addEventListener('submit', (event) => {
		event.preventDefault();
		const value = cmdInput.value;
		cmdInput.value = '';
		runCommand(value);
	});
}

for (const chip of chips) {
	chip.addEventListener('click', () => {
		runCommand(chip.getAttribute('data-cmd') || '');
	});
}

appendLine('UND Terminal ready. Type help to see commands.', 'out');
updateStats();

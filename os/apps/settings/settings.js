const accentColor = document.querySelector('#accentColor');
const glowStrength = document.querySelector('#glowStrength');
const motionToggle = document.querySelector('#motionToggle');
const autoOpen = document.querySelector('#autoOpen');
const taskCompact = document.querySelector('#taskCompact');
const clockMode = document.querySelector('#clockMode');
const summaryText = document.querySelector('#summaryText');
const saveBtn = document.querySelector('#saveBtn');
const saveState = document.querySelector('#saveState');

const settingsKey = 'und-settings';

const getState = () => ({
	accent: accentColor ? accentColor.value : '#00d6c7',
	glow: glowStrength ? glowStrength.value : '65',
	motion: motionToggle ? motionToggle.checked : true,
	autoOpen: autoOpen ? autoOpen.checked : false,
	compact: taskCompact ? taskCompact.checked : false,
	clock: clockMode ? clockMode.value : '12h'
});

const writeSummary = () => {
	if (!summaryText) {
		return;
	}
	const state = getState();
	summaryText.textContent = `Accent ${state.accent}, glow ${state.glow}%, motion ${state.motion ? 'on' : 'off'}, auto-open ${state.autoOpen ? 'on' : 'off'}, taskbar compact ${state.compact ? 'on' : 'off'}, clock ${state.clock}.`;
};

const hydrate = () => {
	const raw = localStorage.getItem(settingsKey);
	if (!raw) {
		writeSummary();
		return;
	}

	try {
		const parsed = JSON.parse(raw);
		if (accentColor && parsed.accent) accentColor.value = parsed.accent;
		if (glowStrength && parsed.glow) glowStrength.value = parsed.glow;
		if (motionToggle) motionToggle.checked = Boolean(parsed.motion);
		if (autoOpen) autoOpen.checked = Boolean(parsed.autoOpen);
		if (taskCompact) taskCompact.checked = Boolean(parsed.compact);
		if (clockMode && parsed.clock) clockMode.value = parsed.clock;
	} catch (error) {
		console.warn('Could not load saved settings.', error);
	}

	writeSummary();
};

for (const el of [accentColor, glowStrength, motionToggle, autoOpen, taskCompact, clockMode]) {
	if (!el) {
		continue;
	}
	el.addEventListener('input', writeSummary);
	el.addEventListener('change', writeSummary);
}

if (saveBtn) {
	saveBtn.addEventListener('click', () => {
		localStorage.setItem(settingsKey, JSON.stringify(getState()));
		if (saveState) {
			saveState.textContent = `Saved at ${new Date().toLocaleTimeString()}`;
		}
	});
}

hydrate();

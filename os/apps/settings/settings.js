const accentColor = document.querySelector('#accentColor');
const glowStrength = document.querySelector('#glowStrength');
const motionToggle = document.querySelector('#motionToggle');
const autoOpen = document.querySelector('#autoOpen');
const taskCompact = document.querySelector('#taskCompact');
const clockMode = document.querySelector('#clockMode');
const summaryText = document.querySelector('#summaryText');
const saveBtn = document.querySelector('#saveBtn');
const saveState = document.querySelector('#saveState');
const bgUpload = document.querySelector('#bgUpload');
const bgPreview = document.querySelector('#bgPreview');
const bgRemoveBtn = document.querySelector('#bgRemoveBtn');

const SETTINGS_KEY = 'und-settings';
const DESKTOP_BG_KEY = 'und-desktop-bg';

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
	const raw = localStorage.getItem(SETTINGS_KEY);
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
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(getState()));
		if (saveState) {
			saveState.textContent = `Saved at ${new Date().toLocaleTimeString()}`;
		}
	});
}

hydrate();

const updateBgPreview = (dataUrl) => {
	if (!bgPreview) return;
	if (dataUrl) {
		bgPreview.style.backgroundImage = `url(${dataUrl})`;
		bgPreview.style.display = 'block';
	} else {
		bgPreview.style.backgroundImage = '';
		bgPreview.style.display = 'none';
	}
};

if (bgUpload) {
	bgUpload.addEventListener('change', () => {
		const file = bgUpload.files && bgUpload.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.addEventListener('load', (ev) => {
			const dataUrl = ev.target.result;
			localStorage.setItem(DESKTOP_BG_KEY, dataUrl);
			updateBgPreview(dataUrl);
			if (saveState) saveState.textContent = 'Background saved!';
		});
		reader.readAsDataURL(file);
	});
}

if (bgRemoveBtn) {
	bgRemoveBtn.addEventListener('click', () => {
		localStorage.removeItem(DESKTOP_BG_KEY);
		updateBgPreview(null);
		if (bgUpload) bgUpload.value = '';
		if (saveState) saveState.textContent = 'Background reset to video.';
	});
}

updateBgPreview(localStorage.getItem(DESKTOP_BG_KEY));

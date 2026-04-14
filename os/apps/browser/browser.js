const browserForm = document.querySelector('#browserForm');
const addressInput = document.querySelector('#addressInput');
const browserFrame = document.querySelector('#browserFrame');
const historyList = document.querySelector('#historyList');
const bookmarks = document.querySelectorAll('.bookmark');
const openExternalBtn = document.querySelector('#openExternalBtn');
const btnBack = document.querySelector('#btnBack');
const btnForward = document.querySelector('#btnForward');
const btnReload = document.querySelector('#btnReload');
const searchForm = document.querySelector('#searchForm');
const searchInput = document.querySelector('#searchInput');
const searchResults = document.querySelector('#searchResults');
const frameHint = document.querySelector('#frameHint');
const bridgeStatus = document.querySelector('#bridgeStatus');
const clearHistoryBtn = document.querySelector('#clearHistoryBtn');
const siteChatForm = document.querySelector('#siteChatForm');
const siteChatInput = document.querySelector('#siteChatInput');
const siteChatLog = document.querySelector('#siteChatLog');

const BRIDGE_URL = 'http://127.0.0.1:8765';
const CHAT_MODEL = 'qwen2.5-coder:3b';
const HISTORY_KEY = 'smartworld.browser.history.v1';
const SEARCH_KEY = 'smartworld.browser.searches.v1';

const history = [];
const recentSearches = [];
let currentUrl = '../../home/home.html';

const saveJson = (key, value) => {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// ignore storage failures
	}
};

const loadJson = (key, fallback) => {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
};

const setBridgeBadge = async () => {
	if (!bridgeStatus) return;
	try {
		const response = await fetch(`${BRIDGE_URL}/health`);
		bridgeStatus.textContent = response.ok ? 'Bridge: online' : 'Bridge: issue';
	} catch {
		bridgeStatus.textContent = 'Bridge: offline';
	}
};

const appendChat = (role, text) => {
	if (!siteChatLog) return;
	const p = document.createElement('p');
	p.className = `chat-msg ${role}`;
	p.textContent = text;
	siteChatLog.appendChild(p);
	siteChatLog.scrollTop = siteChatLog.scrollHeight;
};

const normalizeAddress = (value) => {
	const raw = value.trim();
	if (!raw) return '';
	if (/^(https?:|file:|\.\.?\/|\/)/i.test(raw)) {
		return raw;
	}
	if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw)) {
		return `https://${raw}`;
	}
	return raw;
};

const toSearchUrl = (query) => `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`;

const renderSearchResults = (results, query) => {
	if (!searchResults) return;
	searchResults.innerHTML = '';

	if (!results || !results.length) {
		const li = document.createElement('li');
		li.className = 'search-empty';
		if (query) {
			li.textContent = `No results for "${query}". Try another query.`;
		} else if (recentSearches.length) {
			li.textContent = `Recent searches: ${recentSearches.join(', ')}`;
		} else {
			li.textContent = 'No search yet.';
		}
		searchResults.appendChild(li);
		return;
	}

	for (const item of results) {
		const li = document.createElement('li');
		const link = document.createElement('a');
		link.href = '#';
		link.textContent = item.title || item.url;
		link.addEventListener('click', (event) => {
			event.preventDefault();
			openPath(item.url);
		});

		const urlText = document.createElement('div');
		urlText.className = 'search-url';
		urlText.textContent = item.url;

		li.appendChild(link);
		li.appendChild(urlText);
		searchResults.appendChild(li);
	}
};

const smartSearch = async (query) => {
	const res = await fetch(`${BRIDGE_URL}/web/search`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query, limit: 8 })
	});

	if (!res.ok) {
		throw new Error('Search service not available');
	}

	const payload = await res.json();
	if (!payload.ok) {
		throw new Error(payload.error || 'Search failed');
	}

	renderSearchResults(payload.results || [], query);
	return payload.results || [];
};

const addHistory = (path) => {
	history.unshift({ path, time: new Date().toLocaleTimeString() });
	if (history.length > 8) {
		history.pop();
	}

	if (!historyList) {
		return;
	}

	historyList.innerHTML = '';
	for (const item of history) {
		const li = document.createElement('li');
		li.textContent = `${item.path} (${item.time})`;
		historyList.appendChild(li);
	}

	saveJson(HISTORY_KEY, history);
};

const addRecentSearch = (query) => {
	const normalized = query.trim();
	if (!normalized) return;
	const idx = recentSearches.findIndex((entry) => entry.toLowerCase() === normalized.toLowerCase());
	if (idx >= 0) {
		recentSearches.splice(idx, 1);
	}
	recentSearches.unshift(normalized);
	if (recentSearches.length > 8) {
		recentSearches.pop();
	}
	saveJson(SEARCH_KEY, recentSearches);
};

const openPath = (path) => {
	if (!browserFrame) {
		return;
	}
	const normalized = normalizeAddress(path);
	if (!normalized) {
		return;
	}
	browserFrame.src = normalized;
	currentUrl = normalized;
	addHistory(normalized);
	if (addressInput) {
		addressInput.value = normalized;
	}
	if (frameHint) {
		frameHint.textContent = 'Use Real Browse for full websites. Embedded preview works only for sites that allow iframes.';
	}
};

if (browserForm && addressInput) {
	browserForm.addEventListener('submit', (event) => {
		event.preventDefault();
		const path = addressInput.value.trim();
		if (!path) {
			return;
		}
		openPath(path);
	});
}

for (const bookmark of bookmarks) {
	bookmark.addEventListener('click', () => {
		const path = bookmark.getAttribute('data-path');
		if (path) {
			openPath(path);
		}
	});
}

if (openExternalBtn) {
	openExternalBtn.addEventListener('click', () => {
		if (!currentUrl) return;
		window.open(currentUrl, '_blank', 'noopener,noreferrer');
	});
}

if (btnBack) {
	btnBack.addEventListener('click', () => {
		if (!browserFrame?.contentWindow) return;
		browserFrame.contentWindow.history.back();
	});
}

if (btnForward) {
	btnForward.addEventListener('click', () => {
		if (!browserFrame?.contentWindow) return;
		browserFrame.contentWindow.history.forward();
	});
}

if (btnReload) {
	btnReload.addEventListener('click', () => {
		if (!browserFrame) return;
		browserFrame.src = currentUrl;
	});
}

if (searchForm && searchInput) {
	searchForm.addEventListener('submit', async (event) => {
		event.preventDefault();
		const query = searchInput.value.trim();
		if (!query) return;
		addRecentSearch(query);

		if (frameHint) {
			frameHint.textContent = `Searching for "${query}"...`;
		}

		try {
			const results = await smartSearch(query);
			if (results.length > 0) {
				openPath(results[0].url);
				if (frameHint) {
					frameHint.textContent = `Smart Search found ${results.length} results. Showing top result in preview.`;
				}
			} else {
				const fallback = toSearchUrl(query);
				openPath(fallback);
				if (frameHint) {
					frameHint.textContent = 'No direct results from bridge; opened Google results page.';
				}
			}
		} catch (error) {
			renderSearchResults([], query);
			const fallback = toSearchUrl(query);
			openPath(fallback);
			if (frameHint) {
				frameHint.textContent = `Smart Search unavailable. Opened Google results page. ${error instanceof Error ? error.message : ''}`;
			}
		}

		searchInput.select();
	});
}

if (siteChatForm && siteChatInput) {
	siteChatForm.addEventListener('submit', async (event) => {
		event.preventDefault();
		const question = siteChatInput.value.trim();
		if (!question || !currentUrl) return;
		siteChatInput.value = '';

		appendChat('user', question);
		appendChat('bot', 'Analyzing website...');
		const thinkingNode = siteChatLog ? siteChatLog.lastElementChild : null;

		try {
			const pageRes = await fetch(`${BRIDGE_URL}/web/fetch`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: currentUrl })
			});

			if (!pageRes.ok) {
				throw new Error('Failed to fetch website content');
			}
			const pagePayload = await pageRes.json();
			if (!pagePayload.ok) {
				throw new Error(pagePayload.error || 'Website fetch failed');
			}

			const contextText = (pagePayload.text || '').slice(0, 12000);
			const prompt = [
				'You are a helpful website assistant.',
				`Website URL: ${currentUrl}`,
				`Website title: ${pagePayload.title || 'Unknown'}`,
				'Use the extracted website content below to answer the question. If content is incomplete, clearly say so.',
				`Question: ${question}`,
				`Content:\n${contextText}`
			].join('\n\n');

			const llmRes = await fetch(`${BRIDGE_URL}/ollama/generate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ model: CHAT_MODEL, prompt, stream: false })
			});
			if (!llmRes.ok) {
				throw new Error('Model request failed');
			}
			const llmPayload = await llmRes.json();
			if (!llmPayload.ok) {
				throw new Error(llmPayload.error || 'Model request failed');
			}
			const answer = (llmPayload.response || '').trim() || 'No response from model.';
			if (thinkingNode) thinkingNode.textContent = answer;
		} catch (error) {
			if (thinkingNode) {
				thinkingNode.textContent = `Could not analyze this website. ${error instanceof Error ? error.message : 'Try another URL.'}`;
			}
		}
	});
}

if (clearHistoryBtn) {
	clearHistoryBtn.addEventListener('click', () => {
		history.length = 0;
		if (historyList) {
			historyList.innerHTML = '';
		}
		saveJson(HISTORY_KEY, history);
	});
}

const storedHistory = loadJson(HISTORY_KEY, []);
if (Array.isArray(storedHistory)) {
	for (const item of storedHistory.slice().reverse()) {
		if (item && item.path) {
			addHistory(item.path);
		}
	}
}

const storedSearches = loadJson(SEARCH_KEY, []);
if (Array.isArray(storedSearches)) {
	for (const term of storedSearches.slice(0, 8)) {
		recentSearches.push(String(term));
	}
}

renderSearchResults([], '');
setBridgeBadge();
setInterval(setBridgeBadge, 15000);

openPath('../../home/home.html');

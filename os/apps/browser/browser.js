const browserForm = document.querySelector('#browserForm');
const addressInput = document.querySelector('#addressInput');
const browserFrame = document.querySelector('#browserFrame');
const historyList = document.querySelector('#historyList');
const bookmarks = document.querySelectorAll('.bookmark');

const history = [];

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
};

const openPath = (path) => {
	if (!browserFrame) {
		return;
	}
	browserFrame.src = path;
	addHistory(path);
	if (addressInput) {
		addressInput.value = path;
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

openPath('../../home/home.html');

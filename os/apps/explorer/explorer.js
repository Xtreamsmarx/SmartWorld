const folderList = document.querySelector('#folderList');
const fileRows = document.querySelector('#fileRows');
const fileSearch = document.querySelector('#fileSearch');
const sortBtn = document.querySelector('#sortBtn');
const refreshBtn = document.querySelector('#refreshBtn');
const itemCount = document.querySelector('#itemCount');
const largestFile = document.querySelector('#largestFile');
const activeFolder = document.querySelector('#activeFolder');
const actionLog = document.querySelector('#actionLog');

const files = [
	{ name: 'home.html', type: 'HTML', updated: 'Today 10:40', size: 34, folder: 'Home' },
	{ name: 'home.css', type: 'CSS', updated: 'Today 10:31', size: 27, folder: 'Home' },
	{ name: 'home.js', type: 'JavaScript', updated: 'Today 10:28', size: 49, folder: 'Home' },
	{ name: 'learning-paths.html', type: 'HTML', updated: 'Today 09:53', size: 20, folder: 'Learning Paths' },
	{ name: 'digital-twin-lab.js', type: 'JavaScript', updated: 'Today 09:50', size: 66, folder: 'Twin Lab' },
	{ name: 'os.html', type: 'HTML', updated: 'Today 11:02', size: 26, folder: 'OS Core' },
	{ name: 'os.css', type: 'CSS', updated: 'Today 11:04', size: 45, folder: 'OS Core' },
	{ name: 'os.js', type: 'JavaScript', updated: 'Today 11:07', size: 58, folder: 'OS Core' },
	{ name: 'chatbot.js', type: 'JavaScript', updated: 'Today 11:12', size: 23, folder: 'Apps' }
];

const folders = ['All', ...new Set(files.map((f) => f.folder))];
let selectedFolder = 'All';
let sortMode = 'name';

const log = (message) => {
	if (!actionLog) {
		return;
	}
	const now = new Date().toLocaleTimeString();
	actionLog.textContent = `[${now}] ${message}\n${actionLog.textContent}`.trim();
};

const renderFolders = () => {
	if (!folderList) {
		return;
	}
	folderList.innerHTML = '';
	for (const folder of folders) {
		const li = document.createElement('li');
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.textContent = folder;
		btn.classList.toggle('active', folder === selectedFolder);
		btn.addEventListener('click', () => {
			selectedFolder = folder;
			renderFolders();
			renderFiles();
			log(`Folder changed to ${folder}.`);
		});
		li.appendChild(btn);
		folderList.appendChild(li);
	}
};

const getVisibleFiles = () => {
	const query = (fileSearch && fileSearch.value.trim().toLowerCase()) || '';
	let visible = files.filter((file) => selectedFolder === 'All' || file.folder === selectedFolder);

	if (query) {
		visible = visible.filter((file) => `${file.name} ${file.type} ${file.folder}`.toLowerCase().includes(query));
	}

	visible.sort((a, b) => {
		if (sortMode === 'size') {
			return b.size - a.size;
		}
		return a.name.localeCompare(b.name);
	});

	return visible;
};

const renderFiles = () => {
	if (!fileRows) {
		return;
	}

	const visible = getVisibleFiles();
	fileRows.innerHTML = '';

	for (const file of visible) {
		const tr = document.createElement('tr');
		tr.innerHTML = `<td>${file.name}</td><td>${file.type}</td><td>${file.updated}</td><td>${file.size} KB</td>`;
		fileRows.appendChild(tr);
	}

	if (itemCount) {
		itemCount.textContent = String(visible.length);
	}

	if (largestFile) {
		const top = visible[0];
		largestFile.textContent = top ? `${top.name} (${top.size} KB)` : '-';
	}

	if (activeFolder) {
		activeFolder.textContent = selectedFolder;
	}
};

if (fileSearch) {
	fileSearch.addEventListener('input', () => {
		renderFiles();
	});
}

if (sortBtn) {
	sortBtn.addEventListener('click', () => {
		sortMode = sortMode === 'name' ? 'size' : 'name';
		sortBtn.textContent = sortMode === 'name' ? 'Sort: Name' : 'Sort: Size';
		renderFiles();
		log(`Sort mode switched to ${sortMode}.`);
	});
}

if (refreshBtn) {
	refreshBtn.addEventListener('click', () => {
		renderFiles();
		log('Explorer refreshed.');
	});
}

renderFolders();
renderFiles();
log('Explorer ready.');

const STORE_KEY = 'sw_notes_v1';
let notes = [];
let activeId = null;
let saveTimer = null;

const load = () => {
  try { notes = JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch { notes = []; }
};
const save = () => {
  localStorage.setItem(STORE_KEY, JSON.stringify(notes));
};
const findNote = id => notes.find(n => n.id === id);
const nowISO = () => new Date().toISOString();
const fmtDate = iso => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const noteListEl  = document.getElementById('noteList');
const searchEl    = document.getElementById('search');
const emptyState  = document.getElementById('emptyState');
const editorPane  = document.getElementById('editorPane');
const titleInput  = document.getElementById('titleInput');
const bodyInput   = document.getElementById('bodyInput');
const saveStatus  = document.getElementById('saveStatus');
const btnNew      = document.getElementById('btnNew');
const btnNewLg    = document.getElementById('btnNewLg');
const btnDelete   = document.getElementById('btnDelete');

const renderList = (filter = '') => {
  noteListEl.innerHTML = '';
  const filtered = notes
    .filter(n => !filter || n.title.toLowerCase().includes(filter) || n.body.toLowerCase().includes(filter))
    .sort((a, b) => b.updated.localeCompare(a.updated));

  filtered.forEach(n => {
    const li = document.createElement('li');
    li.className = 'note-item' + (n.id === activeId ? ' active' : '');
    li.dataset.id = n.id;
    li.innerHTML = `
      <div class="note-item-title">${n.title || 'Untitled'}</div>
      <div class="note-item-preview">${n.body.slice(0, 60) || '...'}</div>
      <div class="note-item-date">${fmtDate(n.updated)}</div>
    `;
    li.addEventListener('click', () => openNote(n.id));
    noteListEl.appendChild(li);
  });
};

const openNote = (id) => {
  activeId = id;
  const n = findNote(id);
  if (!n) return;
  emptyState.classList.add('hidden');
  editorPane.classList.remove('hidden');
  titleInput.value = n.title;
  bodyInput.value = n.body;
  saveStatus.textContent = '';
  renderList(searchEl.value.toLowerCase());
};

const newNote = () => {
  const n = { id: Date.now().toString(), title: '', body: '', created: nowISO(), updated: nowISO() };
  notes.unshift(n);
  save();
  openNote(n.id);
};

const autoSave = () => {
  clearTimeout(saveTimer);
  saveStatus.textContent = 'Saving…';
  saveTimer = setTimeout(() => {
    const n = findNote(activeId);
    if (!n) return;
    n.title   = titleInput.value;
    n.body    = bodyInput.value;
    n.updated = nowISO();
    save();
    saveStatus.textContent = 'Saved ✓';
    renderList(searchEl.value.toLowerCase());
    setTimeout(() => { saveStatus.textContent = ''; }, 1500);
  }, 600);
};

const deleteNote = () => {
  if (!activeId) return;
  if (!confirm('Delete this note?')) return;
  notes = notes.filter(n => n.id !== activeId);
  save();
  activeId = null;
  editorPane.classList.add('hidden');
  emptyState.classList.remove('hidden');
  renderList(searchEl.value.toLowerCase());
};

btnNew.addEventListener('click', newNote);
btnNewLg.addEventListener('click', newNote);
btnDelete.addEventListener('click', deleteNote);
titleInput.addEventListener('input', autoSave);
bodyInput.addEventListener('input', autoSave);
searchEl.addEventListener('input', () => renderList(searchEl.value.toLowerCase()));

// keyboard: Ctrl+N = new note
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'n') { e.preventDefault(); newNote(); }
});

load();
renderList();
if (notes.length > 0) openNote(notes[0].id);

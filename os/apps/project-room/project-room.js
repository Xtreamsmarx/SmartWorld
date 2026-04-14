const STORE_KEY = 'sw_project_room_store_v1';
const PROFILE_KEY = 'sw_project_room_profile_v1';
const CHANNEL_KEY = 'sw_project_room_channel_v1';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const uid = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const isoNow = () => new Date().toISOString();
const formatStamp = (iso) => new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const palette = ['#47f0d1', '#73c7ff', '#ffb347', '#ff7bb0', '#82f0a8', '#c29bff'];

const els = {
  projectSearch: $('#projectSearch'),
  newProjectBtn: $('#newProjectBtn'),
  emptyNewProjectBtn: $('#emptyNewProjectBtn'),
  displayName: $('#displayName'),
  syncBadge: $('#syncBadge'),
  projectCount: $('#projectCount'),
  projectList: $('#projectList'),
  projectHeading: $('#projectHeading'),
  emptyState: $('#emptyState'),
  workspace: $('#workspace'),
  saveState: $('#saveState'),
  projectTitle: $('#projectTitle'),
  problemInput: $('#problemInput'),
  objectiveInput: $('#objectiveInput'),
  memberCount: $('#memberCount'),
  memberForm: $('#memberForm'),
  memberInput: $('#memberInput'),
  memberList: $('#memberList'),
  briefOutput: $('#briefOutput'),
  refreshBriefBtn: $('#refreshBriefBtn'),
  copyBriefBtn: $('#copyBriefBtn'),
  exportBtn: $('#exportBtn'),
  messageCount: $('#messageCount'),
  messageList: $('#messageList'),
  messageForm: $('#messageForm'),
  messageInput: $('#messageInput'),
  taskForm: $('#taskForm'),
  taskTitleInput: $('#taskTitleInput'),
  taskOwnerSelect: $('#taskOwnerSelect'),
  taskPrioritySelect: $('#taskPrioritySelect'),
  laneTodo: $('#laneTodo'),
  laneDoing: $('#laneDoing'),
  laneReview: $('#laneReview'),
  laneDone: $('#laneDone'),
  countTodo: $('#countTodo'),
  countDoing: $('#countDoing'),
  countReview: $('#countReview'),
  countDone: $('#countDone'),
  taskBoard: $('#taskBoard'),
  decisionForm: $('#decisionForm'),
  decisionInput: $('#decisionInput'),
  decisionCount: $('#decisionCount'),
  decisionList: $('#decisionList')
};

let saveStatusTimer = null;
let projectEditTimer = null;
let lastSyncAt = Date.now();
let dragTaskId = null;

const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_KEY) : null;

function createSeedProject() {
  const createdAt = isoNow();
  return {
    id: uid('project'),
    title: 'Campus Navigation Upgrade',
    problem: 'Students and visitors struggle to find the right building, event room, and services quickly across campus tools.',
    objective: 'Ship a clearer navigation flow with shared ownership, faster issue triage, and visible next steps for the team.',
    members: [
      { id: uid('member'), name: 'Ava', color: '#47f0d1' },
      { id: uid('member'), name: 'Noah', color: '#73c7ff' },
      { id: uid('member'), name: 'Mia', color: '#ffb347' }
    ],
    messages: [
      { id: uid('msg'), authorId: 'seed', authorName: 'Ava', color: '#47f0d1', text: 'Let us narrow the issue to wayfinding, event discovery, and accessibility.', createdAt },
      { id: uid('msg'), authorId: 'seed2', authorName: 'Noah', color: '#73c7ff', text: 'I will map the current journey and log the biggest confusion points by noon.', createdAt }
    ],
    tasks: [
      { id: uid('task'), title: 'Document current user journey', status: 'doing', owner: 'Noah', priority: 'High', createdAt },
      { id: uid('task'), title: 'List top 5 navigation pain points', status: 'todo', owner: 'Ava', priority: 'High', createdAt },
      { id: uid('task'), title: 'Draft improved building search labels', status: 'review', owner: 'Mia', priority: 'Medium', createdAt },
      { id: uid('task'), title: 'Confirm final pilot scope', status: 'done', owner: 'Ava', priority: 'Low', createdAt }
    ],
    decisions: [
      { id: uid('decision'), text: 'Pilot the new flow on the most-used student pages before rolling it out wider.', authorName: 'Ava', createdAt }
    ],
    createdAt,
    updatedAt: createdAt
  };
}

function defaultState() {
  const project = createSeedProject();
  return {
    activeProjectId: project.id,
    projects: [project],
    updatedAt: isoNow()
  };
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY));
    if (!parsed || !Array.isArray(parsed.projects)) {
      return defaultState();
    }
    return parsed;
  } catch {
    return defaultState();
  }
}

function loadProfile() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROFILE_KEY));
    if (parsed && typeof parsed.name === 'string' && typeof parsed.id === 'string') {
      return parsed;
    }
  } catch {
    // ignore invalid profile data
  }

  return {
    id: uid('user'),
    name: 'You',
    color: palette[Math.floor(Math.random() * palette.length)]
  };
}

let state = loadState();
let profile = loadProfile();

function persistProfile() {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function getActiveProject() {
  return state.projects.find((project) => project.id === state.activeProjectId) || state.projects[0] || null;
}

function touchProject(project) {
  project.updatedAt = isoNow();
  state.updatedAt = project.updatedAt;
}

function persistState(reason, options = {}) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
  lastSyncAt = Date.now();
  renderSyncBadge(`Saved${reason ? ` · ${reason}` : ''}`);
  if (channel) {
    channel.postMessage({ type: 'sync', reason, at: lastSyncAt });
  }
  if (options.render !== false) {
    render();
  } else {
    renderSaveState('Saved just now');
  }
}

function renderSaveState(label) {
  els.saveState.textContent = label;
  clearTimeout(saveStatusTimer);
  saveStatusTimer = setTimeout(() => {
    els.saveState.textContent = 'Saved';
  }, 1600);
}

function renderSyncBadge(label) {
  els.syncBadge.textContent = label || `Live ${new Date(lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function renderProjectList() {
  const filter = (els.projectSearch.value || '').trim().toLowerCase();
  const projects = [...state.projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const filtered = projects.filter((project) => {
    if (!filter) return true;
    const haystack = [
      project.title,
      project.problem,
      project.objective,
      project.members.map((member) => member.name).join(' '),
      project.tasks.map((task) => task.title).join(' '),
      project.messages.slice(-8).map((message) => message.text).join(' ')
    ].join(' ').toLowerCase();
    return haystack.includes(filter);
  });

  els.projectCount.textContent = String(filtered.length);
  els.projectList.innerHTML = filtered.length ? filtered.map((project) => {
    const taskOpen = project.tasks.filter((task) => task.status !== 'done').length;
    return `
      <button class="pm-project-item${project.id === state.activeProjectId ? ' active' : ''}" type="button" data-project-id="${project.id}">
        <h3>${escapeHtml(project.title || 'Untitled Project')}</h3>
        <p>${escapeHtml((project.problem || 'No problem statement yet.').slice(0, 110))}</p>
        <small>${project.members.length} members · ${taskOpen} open tasks · updated ${formatStamp(project.updatedAt)}</small>
      </button>
    `;
  }).join('') : '<div class="pm-empty-list">No projects match this search.</div>';

  $$('#projectList [data-project-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeProjectId = button.getAttribute('data-project-id');
      render();
    });
  });
}

function renderMembers(project) {
  els.memberCount.textContent = String(project.members.length);
  els.memberList.innerHTML = project.members.length ? project.members.map((member) => `
    <div class="pm-member-chip">
      <span class="pm-member-dot" style="color:${member.color};background:${member.color};"></span>
      <span>${escapeHtml(member.name)}</span>
      <button class="pm-chip-remove" type="button" data-remove-member="${member.id}" aria-label="Remove ${escapeHtml(member.name)}">×</button>
    </div>
  `).join('') : '<div class="pm-empty-list">Add teammates to create a shared problem-solving room.</div>';

  els.taskOwnerSelect.innerHTML = project.members.map((member) => `
    <option value="${escapeHtml(member.name)}">${escapeHtml(member.name)}</option>
  `).join('');
}

function renderMessages(project) {
  els.messageCount.textContent = String(project.messages.length);
  els.messageList.innerHTML = project.messages.length ? project.messages.map((message) => {
    const initials = escapeHtml((message.authorName || '?').trim().slice(0, 2).toUpperCase());
    return `
      <article class="pm-message">
        <div class="pm-message-avatar" style="background:${message.color || '#73c7ff'};">${initials}</div>
        <div class="pm-message-bubble">
          <strong>${escapeHtml(message.authorName || 'Unknown')}</strong>
          <p>${escapeHtml(message.text)}</p>
          <small>${formatStamp(message.createdAt)}</small>
        </div>
      </article>
    `;
  }).join('') : '<div class="pm-empty-list">No messages yet. Start the discussion and break the problem down together.</div>';
  els.messageList.scrollTop = els.messageList.scrollHeight;
}

function laneMarkup(tasks) {
  if (!tasks.length) {
    return '<div class="pm-empty-list">Drop a task here.</div>';
  }

  return tasks.map((task) => `
    <article class="pm-task-card" draggable="true" data-task-id="${task.id}">
      <header>
        <strong>${escapeHtml(task.title)}</strong>
        <button class="pm-task-remove" type="button" data-remove-task="${task.id}" aria-label="Remove task">×</button>
      </header>
      <p>${escapeHtml(task.title)}</p>
      <div class="pm-task-meta">
        <span>${escapeHtml(task.owner || 'Unassigned')}</span>
        <span class="pm-task-priority priority-${escapeHtml(task.priority || 'Medium')}">${escapeHtml(task.priority || 'Medium')}</span>
      </div>
    </article>
  `).join('');
}

function renderTasks(project) {
  const byStatus = {
    todo: project.tasks.filter((task) => task.status === 'todo'),
    doing: project.tasks.filter((task) => task.status === 'doing'),
    review: project.tasks.filter((task) => task.status === 'review'),
    done: project.tasks.filter((task) => task.status === 'done')
  };

  els.countTodo.textContent = String(byStatus.todo.length);
  els.countDoing.textContent = String(byStatus.doing.length);
  els.countReview.textContent = String(byStatus.review.length);
  els.countDone.textContent = String(byStatus.done.length);

  els.laneTodo.innerHTML = laneMarkup(byStatus.todo);
  els.laneDoing.innerHTML = laneMarkup(byStatus.doing);
  els.laneReview.innerHTML = laneMarkup(byStatus.review);
  els.laneDone.innerHTML = laneMarkup(byStatus.done);

  $$('.pm-task-card').forEach((card) => {
    card.addEventListener('dragstart', () => {
      dragTaskId = card.getAttribute('data-task-id');
    });
    card.addEventListener('dragend', () => {
      dragTaskId = null;
      $$('.pm-lane-drop').forEach((lane) => lane.classList.remove('pm-lane-over'));
    });
  });
}

function renderDecisions(project) {
  els.decisionCount.textContent = String(project.decisions.length);
  els.decisionList.innerHTML = project.decisions.length ? [...project.decisions].reverse().map((decision) => `
    <article class="pm-decision-item">
      <header>
        <strong>${escapeHtml(decision.authorName || 'Team')}</strong>
        <button class="pm-decision-remove" type="button" data-remove-decision="${decision.id}" aria-label="Remove decision">×</button>
      </header>
      <p>${escapeHtml(decision.text)}</p>
      <footer>
        <small>${formatStamp(decision.createdAt)}</small>
      </footer>
    </article>
  `).join('') : '<div class="pm-empty-list">Capture decisions so the team keeps momentum.</div>';
}

function buildBrief(project) {
  const openTasks = project.tasks.filter((task) => task.status !== 'done');
  const highPriority = openTasks.filter((task) => task.priority === 'High');
  const latestDecision = project.decisions[project.decisions.length - 1];
  const latestMessages = project.messages.slice(-3).map((message) => `- ${message.authorName}: ${message.text}`).join('\n') || '- No recent chat activity';

  const nextActions = [];
  if (!project.problem.trim()) nextActions.push('Clarify the problem statement in one sentence.');
  if (!project.objective.trim()) nextActions.push('Define a measurable objective for the team.');
  if (!project.members.length) nextActions.push('Add at least one teammate and assign ownership.');
  if (!openTasks.length) nextActions.push('Create the first actionable task and assign an owner.');
  if (highPriority.length) nextActions.push(`Move ${highPriority.length} high-priority task(s) toward review or done.`);
  if (!project.decisions.length) nextActions.push('Record one decision to reduce repeated discussion.');
  if (!nextActions.length) nextActions.push('Keep clearing review tasks and log final rollout risks.');

  return [
    `Project: ${project.title || 'Untitled Project'}`,
    `Problem: ${project.problem || 'Not defined yet.'}`,
    `Objective: ${project.objective || 'Not defined yet.'}`,
    '',
    `Team members: ${project.members.map((member) => member.name).join(', ') || 'None'}`,
    `Open tasks: ${openTasks.length}`,
    `Latest decision: ${latestDecision ? latestDecision.text : 'No decisions captured yet.'}`,
    '',
    'Recent discussion:',
    latestMessages,
    '',
    'Recommended next moves:',
    ...nextActions.map((item, index) => `${index + 1}. ${item}`)
  ].join('\n');
}

function render(project = getActiveProject()) {
  renderProjectList();
  els.displayName.value = profile.name;

  if (!project) {
    els.emptyState.classList.remove('hidden');
    els.workspace.classList.add('hidden');
    els.projectHeading.textContent = 'Select a project';
    return;
  }

  els.emptyState.classList.add('hidden');
  els.workspace.classList.remove('hidden');
  els.projectHeading.textContent = project.title || 'Untitled Project';
  els.projectTitle.value = project.title || '';
  els.problemInput.value = project.problem || '';
  els.objectiveInput.value = project.objective || '';
  els.briefOutput.textContent = buildBrief(project);

  renderMembers(project);
  renderMessages(project);
  renderTasks(project);
  renderDecisions(project);
  renderSaveState('Saved');
}

function createProject() {
  const createdAt = isoNow();
  const project = {
    id: uid('project'),
    title: `New Project ${state.projects.length + 1}`,
    problem: '',
    objective: '',
    members: [{ id: uid('member'), name: profile.name, color: profile.color }],
    messages: [],
    tasks: [],
    decisions: [],
    createdAt,
    updatedAt: createdAt
  };
  state.projects.unshift(project);
  state.activeProjectId = project.id;
  persistState('project created');
}

function scheduleProjectFieldSave() {
  clearTimeout(projectEditTimer);
  const project = getActiveProject();
  if (!project) return;

  project.title = els.projectTitle.value.trim();
  project.problem = els.problemInput.value.trim();
  project.objective = els.objectiveInput.value.trim();
  touchProject(project);
  els.projectHeading.textContent = project.title || 'Untitled Project';
  els.briefOutput.textContent = buildBrief(project);
  renderProjectList();
  renderSaveState('Saving...');
  projectEditTimer = setTimeout(() => {
    persistState('project updated', { render: false });
  }, 260);
}

function addMember(name) {
  const project = getActiveProject();
  if (!project || !name) return;
  if (project.members.some((member) => member.name.toLowerCase() === name.toLowerCase())) return;
  project.members.push({ id: uid('member'), name, color: palette[project.members.length % palette.length] });
  touchProject(project);
  persistState('member added');
}

function removeMember(memberId) {
  const project = getActiveProject();
  if (!project) return;
  project.members = project.members.filter((member) => member.id !== memberId);
  project.tasks = project.tasks.map((task) => task.owner && !project.members.some((member) => member.name === task.owner)
    ? { ...task, owner: profile.name }
    : task);
  touchProject(project);
  persistState('member removed');
}

function addMessage(text) {
  const project = getActiveProject();
  if (!project || !text.trim()) return;
  project.messages.push({
    id: uid('msg'),
    authorId: profile.id,
    authorName: profile.name,
    color: profile.color,
    text: text.trim(),
    createdAt: isoNow()
  });
  touchProject(project);
  persistState('message sent');
}

function addTask(title, owner, priority) {
  const project = getActiveProject();
  if (!project || !title.trim()) return;
  project.tasks.push({
    id: uid('task'),
    title: title.trim(),
    owner: owner || profile.name,
    priority: priority || 'Medium',
    status: 'todo',
    createdAt: isoNow()
  });
  touchProject(project);
  persistState('task added');
}

function moveTask(taskId, status) {
  const project = getActiveProject();
  if (!project) return;
  const task = project.tasks.find((item) => item.id === taskId);
  if (!task || task.status === status) return;
  task.status = status;
  touchProject(project);
  persistState('task moved');
}

function removeTask(taskId) {
  const project = getActiveProject();
  if (!project) return;
  project.tasks = project.tasks.filter((task) => task.id !== taskId);
  touchProject(project);
  persistState('task removed');
}

function addDecision(text) {
  const project = getActiveProject();
  if (!project || !text.trim()) return;
  project.decisions.push({
    id: uid('decision'),
    text: text.trim(),
    authorName: profile.name,
    createdAt: isoNow()
  });
  touchProject(project);
  persistState('decision added');
}

function removeDecision(decisionId) {
  const project = getActiveProject();
  if (!project) return;
  project.decisions = project.decisions.filter((decision) => decision.id !== decisionId);
  touchProject(project);
  persistState('decision removed');
}

function exportProject() {
  const project = getActiveProject();
  if (!project) return;
  const payload = JSON.stringify(project, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(project.title || 'project-room').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function syncFromStorage() {
  const next = loadState();
  const currentActiveId = state.activeProjectId;
  state = next;
  if (state.projects.some((project) => project.id === currentActiveId)) {
    state.activeProjectId = currentActiveId;
  } else if (!state.projects.some((project) => project.id === state.activeProjectId)) {
    state.activeProjectId = state.projects[0] ? state.projects[0].id : null;
  }
  lastSyncAt = Date.now();
  renderSyncBadge('Live sync');
  render();
}

els.newProjectBtn.addEventListener('click', createProject);
els.emptyNewProjectBtn.addEventListener('click', createProject);
els.projectSearch.addEventListener('input', renderProjectList);

els.displayName.addEventListener('input', () => {
  profile.name = (els.displayName.value || 'You').trim() || 'You';
  persistProfile();
  renderSyncBadge('Profile updated');
  const project = getActiveProject();
  if (project) {
    els.briefOutput.textContent = buildBrief(project);
  }
});

els.projectTitle.addEventListener('input', scheduleProjectFieldSave);
els.problemInput.addEventListener('input', scheduleProjectFieldSave);
els.objectiveInput.addEventListener('input', scheduleProjectFieldSave);

els.memberForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = (els.memberInput.value || '').trim();
  addMember(value);
  els.memberInput.value = '';
});

els.memberList.addEventListener('click', (event) => {
  const target = event.target.closest('[data-remove-member]');
  if (!target) return;
  removeMember(target.getAttribute('data-remove-member'));
});

els.messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addMessage(els.messageInput.value || '');
  els.messageInput.value = '';
});

els.taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(els.taskTitleInput.value || '', els.taskOwnerSelect.value, els.taskPrioritySelect.value);
  els.taskTitleInput.value = '';
  els.taskTitleInput.focus();
});

els.taskBoard.addEventListener('click', (event) => {
  const target = event.target.closest('[data-remove-task]');
  if (!target) return;
  removeTask(target.getAttribute('data-remove-task'));
});

$$('.pm-lane-drop').forEach((lane) => {
  lane.addEventListener('dragover', (event) => {
    event.preventDefault();
    lane.classList.add('pm-lane-over');
  });
  lane.addEventListener('dragleave', () => lane.classList.remove('pm-lane-over'));
  lane.addEventListener('drop', (event) => {
    event.preventDefault();
    lane.classList.remove('pm-lane-over');
    const status = lane.parentElement.getAttribute('data-status');
    if (dragTaskId && status) moveTask(dragTaskId, status);
  });
});

els.decisionForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addDecision(els.decisionInput.value || '');
  els.decisionInput.value = '';
});

els.decisionList.addEventListener('click', (event) => {
  const target = event.target.closest('[data-remove-decision]');
  if (!target) return;
  removeDecision(target.getAttribute('data-remove-decision'));
});

els.refreshBriefBtn.addEventListener('click', () => {
  const project = getActiveProject();
  if (!project) return;
  els.briefOutput.textContent = buildBrief(project);
  renderSyncBadge('Brief refreshed');
});

els.copyBriefBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(els.briefOutput.textContent || '');
    renderSyncBadge('Brief copied');
  } catch {
    renderSyncBadge('Copy unavailable');
  }
});

els.exportBtn.addEventListener('click', exportProject);

window.addEventListener('storage', (event) => {
  if (event.key === STORE_KEY) {
    syncFromStorage();
  }
});

if (channel) {
  channel.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'sync') {
      syncFromStorage();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key.toLowerCase() === 'n') {
    event.preventDefault();
    createProject();
  }
});

persistProfile();
renderSyncBadge('Live local');
render();
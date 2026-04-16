/* Human–AI Learning Gateway – app logic */

const TRACKS = [
  {
    id: 'prompt-eng',
    icon: '💬',
    title: 'Prompt Engineering',
    desc: 'Design effective prompts, evaluate AI outputs, and build repeatable workflows for research and coursework.',
    level: 'beginner',
    tags: ['LLMs', 'Evaluation', 'Workflow'],
    modules: 4,
    link: '../../../learning-paths/learning-paths.html'
  },
  {
    id: 'ai-literacy',
    icon: '📖',
    title: 'AI Literacy & Ethics',
    desc: 'Understand how AI models work, their limitations, bias considerations, and responsible deployment in academic settings.',
    level: 'beginner',
    tags: ['Ethics', 'Bias', 'Foundations'],
    modules: 3,
    link: '#'
  },
  {
    id: 'data-ai',
    icon: '📊',
    title: 'Data Science with AI',
    desc: 'Use AI-assisted tools for data cleaning, visualization, and statistical analysis in research pipelines.',
    level: 'intermediate',
    tags: ['Python', 'Analytics', 'Visualization'],
    modules: 5,
    link: '../python-computer/python-computer.html'
  },
  {
    id: 'digital-twins',
    icon: '🏗️',
    title: 'Digital Twin Development',
    desc: 'Build and interact with campus and city digital twins. Learn 3D modeling, sensor integration, and real-time dashboards.',
    level: 'intermediate',
    tags: ['Three.js', 'IoT', 'Simulation'],
    modules: 4,
    link: '../../../digital-twin-lab/digital-twin-lab.html'
  },
  {
    id: 'autonomous-sys',
    icon: '🤖',
    title: 'Autonomous AI Systems',
    desc: 'Design AI agents that observe, reason, and act. Covers multi-agent orchestration, knowledge graphs, and self-evolving architectures.',
    level: 'advanced',
    tags: ['Agents', 'HPC', 'Knowledge Discovery'],
    modules: 5,
    link: '../agent-market/agent-market.html'
  },
  {
    id: 'human-ai-collab',
    icon: '🤝',
    title: 'Human–AI Collaboration',
    desc: 'Pair human mentors with AI assistants for project execution. Learn co-piloting patterns, review loops, and trust calibration.',
    level: 'advanced',
    tags: ['Co-Pilot', 'Mentoring', 'Trust'],
    modules: 3,
    link: '../chatbot/chatbot.html'
  }
];

const MILESTONES = [
  { text: 'Complete AI Literacy module 1', status: 'done' },
  { text: 'Submit first prompt portfolio', status: 'done' },
  { text: 'Build a data pipeline with AI assist', status: 'active' },
  { text: 'Deploy a campus digital twin scene', status: 'locked' },
  { text: 'Design a multi-agent workflow', status: 'locked' },
  { text: 'Earn Human–AI Certificate', status: 'locked' }
];

const ACTIVITY = [
  { text: 'Prompt Engineering — Module 2 started', time: '2 hours ago' },
  { text: 'AI Literacy quiz scored 92%', time: 'Yesterday' },
  { text: 'Data Science track enrolled', time: '3 days ago' },
  { text: 'Digital Twin lab accessed', time: '1 week ago' }
];

const PROGRESS_KEY = 'hai-gateway-progress';

/* ── Render tracks ───────────────────────────────────────── */
function renderTracks() {
  const grid = document.getElementById('tracksGrid');
  if (!grid) return;
  grid.innerHTML = '';

  TRACKS.forEach(track => {
    const card = document.createElement('article');
    card.className = 'track-card';
    card.innerHTML = `
      <span class="track-icon">${track.icon}</span>
      <span class="level ${track.level}">${track.level}</span>
      <h3>${track.title}</h3>
      <p>${track.desc}</p>
      <div class="tags">${track.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <span style="color:var(--muted);font-size:.72rem">${track.modules} modules</span>
      <a class="start-btn" href="${track.link}">Open Track</a>
    `;
    grid.appendChild(card);
  });
}

/* ── Render milestones ───────────────────────────────────── */
function renderMilestones() {
  const list = document.getElementById('milestoneList');
  if (!list) return;
  list.innerHTML = '';

  MILESTONES.forEach(m => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="dot ${m.status}"></span> ${m.text}`;
    list.appendChild(li);
  });
}

/* ── Render activity ─────────────────────────────────────── */
function renderActivity() {
  const list = document.getElementById('activityList');
  if (!list) return;
  list.innerHTML = '';

  ACTIVITY.forEach(a => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="dot active"></span> <span style="flex:1">${a.text}</span> <span style="color:var(--muted);font-size:.7rem;white-space:nowrap">${a.time}</span>`;
    list.appendChild(li);
  });
}

/* ── Progress ring ───────────────────────────────────────── */
function updateProgress() {
  const ring = document.getElementById('progressRing');
  if (!ring) return;
  const done = MILESTONES.filter(m => m.status === 'done').length;
  const pct = Math.round((done / MILESTONES.length) * 100);
  ring.textContent = pct + '%';
}

/* ── Init ────────────────────────────────────────────────── */
renderTracks();
renderMilestones();
renderActivity();
updateProgress();

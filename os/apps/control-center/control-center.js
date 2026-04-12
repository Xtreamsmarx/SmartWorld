// ══════════════════════════════════════════════════════════════════════════════
// UND Control Center — full panel data + interactions
// Philosophy: Teach and learn ANYTHING — students, teachers, AI, facilities
// ══════════════════════════════════════════════════════════════════════════════

// ── Panel data ────────────────────────────────────────────────────────────────

const COURSES = {
  all: [
    { icon: '🤖', title: 'AI Foundations', tag: 'ai',       desc: 'Core AI concepts, terminology, machine learning basics, and real-world tools.' },
    { icon: '✍',  title: 'Prompt Engineering', tag: 'ai',   desc: 'Master prompt patterns for GPT, Claude, Gemini, and domain-specific AI.' },
    { icon: '🧮', title: 'Mathematics for AI', tag: 'student', desc: 'Linear algebra, statistics, and calculus through AI-powered exercises.' },
    { icon: '🌍', title: 'World History Interactive', tag: 'student', desc: 'Explore history through simulated events, debates, and digital artifacts.' },
    { icon: '🔬', title: 'Science Lab Simulations', tag: 'student', desc: 'Run virtual chemistry, biology, and physics experiments safely.' },
    { icon: '📖', title: 'Language & Literacy AI', tag: 'student', desc: 'Improve writing, reading, and communication with AI coaching.' },
    { icon: '🏫', title: 'Lesson Design Mastery', tag: 'teacher', desc: 'Build engaging lesson plans with AI assistance and interactive templates.' },
    { icon: '📊', title: 'Assessment & Feedback AI', tag: 'teacher', desc: 'Create adaptive quizzes, rubrics, and auto-graded assignments.' },
    { icon: '🤝', title: 'Co-Teaching Strategies', tag: 'teacher', desc: 'Learn how to teach alongside AI agents in a unified classroom flow.' },
    { icon: '🏢', title: 'AI for Organizations', tag: 'facility', desc: 'Deploy AI tools across teams for training, onboarding, and productivity.' },
    { icon: '📋', title: 'Facility Management AI', tag: 'facility', desc: 'Smart scheduling, resource planning, and analytics for institutions.' },
    { icon: '🔐', title: 'AI Ethics & Safety', tag: 'facility', desc: 'Responsible AI governance, bias mitigation, and policy frameworks.' },
    { icon: '🛠', title: 'Build Your First AI App', tag: 'ai',  desc: 'Go from idea to working prototype using no-code and low-code AI tools.' },
    { icon: '📡', title: 'Data Pipelines & APIs', tag: 'ai',   desc: 'Connect data sources, build pipelines, and expose results via APIs.' },
    { icon: '🌐', title: '3D World Design', tag: 'ai',          desc: 'Create and navigate immersive 3D spaces with Three.js and UND tools.' },
    { icon: '🎤', title: 'Public Speaking with AI', tag: 'student', desc: 'Practice speeches, debates, and presentations with AI feedback.' },
    { icon: '💼', title: 'Career Path Simulator', tag: 'student', desc: 'Simulate job roles, interviews, and career decisions in real scenarios.' },
    { icon: '🏥', title: 'Healthcare Training AI', tag: 'facility', desc: 'Upskill clinical and administrative staff with AI-powered modules.' },
  ],
};
COURSES.student  = COURSES.all.filter((c) => c.tag === 'student');
COURSES.teacher  = COURSES.all.filter((c) => c.tag === 'teacher');
COURSES.ai       = COURSES.all.filter((c) => c.tag === 'ai');
COURSES.facility = COURSES.all.filter((c) => c.tag === 'facility');

const AGENTS = [
  { icon: '📚', name: 'Study Buddy',        role: 'Tutor',           domain: 'Any Subject',      desc: 'Answers questions, explains concepts, and quizzes you at your pace.' },
  { icon: '🧑‍🏫', name: 'Lesson Planner',  role: 'Teacher',         domain: 'K-12 / Higher Ed', desc: 'Drafts lesson plans, learning objectives, and classroom activities.' },
  { icon: '🔬', name: 'Lab Assistant',       role: 'Researcher',      domain: 'Science / Data',   desc: 'Guides experiments, interprets results, and suggests next steps.' },
  { icon: '✍',  name: 'Writing Coach',       role: 'Coach',           domain: 'Writing / Comms',  desc: 'Reviews essays, gives structured feedback, and suggests improvements.' },
  { icon: '💼', name: 'Career Advisor',       role: 'Coach',           domain: 'Career / HR',      desc: 'Simulates interviews, reviews CVs, and maps career progression.' },
  { icon: '🧮', name: 'Math Tutor',           role: 'Tutor',           domain: 'Mathematics',      desc: 'Step-by-step problem solving from arithmetic to calculus.' },
  { icon: '🌍', name: 'World Explorer',       role: 'Researcher',      domain: 'History / Culture', desc: 'AI guide for history, geography, and cross-cultural learning.' },
  { icon: '🏥', name: 'Healthcare Trainer',   role: 'Trainer',         domain: 'Healthcare',        desc: 'Trains clinical staff on procedures, compliance, and patient care.' },
  { icon: '🔐', name: 'Ethics Auditor',        role: 'Evaluator',      domain: 'AI / Policy',       desc: 'Reviews content and decisions for bias, fairness, and compliance.' },
  { icon: '📊', name: 'Data Analyst',          role: 'Researcher',     domain: 'Data Science',      desc: 'Cleans, analyzes, and visualizes datasets with natural language.' },
  { icon: '🎤', name: 'Speech Coach',          role: 'Coach',          domain: 'Public Speaking',   desc: 'Listens to presentations and gives pacing, tone, and clarity feedback.' },
  { icon: '🏢', name: 'Org Onboarding Bot',    role: 'Assistant',      domain: 'HR / Facilities',   desc: 'Guides new staff through onboarding, policies, and tool setup.' },
  { icon: '🤖', name: 'Prompt Optimizer',      role: 'Assistant',      domain: 'AI / Engineering',  desc: 'Refines your prompts for maximum accuracy and output quality.' },
  { icon: '🌐', name: '3D World Guide',         role: 'Assistant',     domain: '3D / UX',           desc: 'Narrates and explains items inside the UND 3D learning environment.' },
  { icon: '📝', name: 'Assessment Generator',  role: 'Content Creator', domain: 'Education',        desc: 'Produces quizzes, rubrics, and adaptive tests for any topic.' },
  { icon: '🧠', name: 'Research Synthesizer',  role: 'Researcher',     domain: 'Academia / R&D',    desc: 'Summarizes papers, finds gaps, and suggests research directions.' },
];

const AGENT_MARKET = [
  { icon: '📚', title: 'Study Buddy Pro', tag: '180 credits', desc: 'Best-selling tutoring agent with quizzes, note summaries, and adaptive revision flows.' },
  { icon: '🧠', title: 'Paper Synth', tag: '320 credits', desc: 'Research marketplace favorite for literature reviews, method comparison, and synthesis.' },
  { icon: '🐍', title: 'Python Debugger', tag: 'Free', desc: 'Popular free agent for stack traces, bug isolation, and quick code repair guidance.' },
];

const ROLES = [
  { icon: '🧑‍🎓', title: 'Student Path',       desc: 'Structured learning journey from beginner to advanced. Track progress, earn badges, build a portfolio.' },
  { icon: '🧑‍🏫', title: 'Teacher Path',       desc: 'Design curricula, manage classrooms, deploy AI tools, and improve student outcomes.' },
  { icon: '🤖', title: 'AI Developer',           desc: 'Build agents, design prompts, train models, and deploy AI-powered applications.' },
  { icon: '🏢', title: 'Facility Manager',       desc: 'Manage institutional AI rollout, compliance, resource scheduling, and staff training.' },
  { icon: '💼', title: 'Career Specialist',      desc: 'Simulate roles a, build interview skills, and connect with real opportunities.' },
  { icon: '🔬', title: 'Researcher',             desc: 'Run AI-assisted research workflows — literature review, analysis, and publication support.' },
  { icon: '🎨', title: 'Creative Practitioner',  desc: 'Use AI for art, writing, music, game design, and multimedia storytelling.' },
  { icon: '📊', title: 'Data Analyst',           desc: 'Transform raw data into insights using AI visualization and statistical tools.' },
];

const SIMS = [
  { icon: '🧪', title: 'Chemistry Lab',         desc: 'Conduct virtual titrations, reactions, and safety drills without physical risk.' },
  { icon: '⚡', title: 'Physics Sandbox',        desc: 'Simulate forces, circuits, optics, and quantum phenomena interactively.' },
  { icon: '🌎', title: 'Historical Event Replay', desc: 'Step into key historical moments and make decisions as a participant.' },
  { icon: '🏥', title: 'Medical Scenario Trainer', desc: 'Practice triage, diagnosis, and patient communication in simulated cases.' },
  { icon: '💼', title: 'Business Simulation',    desc: 'Run a virtual company — budgeting, hiring, strategy, and market challenges.' },
  { icon: '🌍', title: 'Climate & Environment',  desc: 'Model climate scenarios and test policy interventions at global scale.' },
  { icon: '🤖', title: 'AI Ethics Courtroom',    desc: 'Debate AI decisions in a simulated legal and ethics tribunal.' },
  { icon: '📡', title: 'Space Mission Simulator', desc: 'Plan and execute AI-assisted space exploration missions.' },
];

const AILAB = [
  { icon: '🔗', title: 'Prompt Chain Builder',   desc: 'Design multi-step prompt pipelines that process and transform data end-to-end.' },
  { icon: '📊', title: 'Embedding Explorer',      desc: 'Visualize semantic relationships between concepts and documents.' },
  { icon: '🧬', title: 'Fine-Tune Studio',         desc: 'Adapt base models on your own subject-matter datasets.' },
  { icon: '🔍', title: 'RAG Workbench',            desc: 'Retrieval-augmented generation — ground AI answers in your documents.' },
  { icon: '🤖', title: 'Agent Test Environment',   desc: 'Deploy, debug, and benchmark AI agents in a safe sandbox.' },
  { icon: '📡', title: 'API Gateway',              desc: 'Connect external data sources and services to your AI pipelines.' },
];

const MENTOR = [
  { icon: '🧑‍🏫', title: 'AI Foundational Mentor',  desc: 'Guided 1-on-1 sessions walking you from zero AI knowledge to project-ready.' },
  { icon: '💼', title: 'Career Mentor',              desc: 'Interview prep, CV review, and career mapping with an AI advisor.' },
  { icon: '🔬', title: 'Research Mentor',            desc: 'Weekly feedback loops for academic and industry research projects.' },
  { icon: '✍',  title: 'Writing Mentor',             desc: 'Ongoing coaching on essays, reports, scripts, and technical writing.' },
  { icon: '🤝', title: 'Human Expert Network',       desc: 'Request a real-person mentor from the UND community in any domain.' },
];

const COTEACH = [
  { icon: '🏫', title: 'Live Classroom Mode',       desc: 'AI and teacher share the floor — AI handles Q&A and explanations while teacher leads discussion.' },
  { icon: '📋', title: 'Shared Lesson Planning',    desc: 'Collaboratively design lessons with an AI co-designer that adapts to your style.' },
  { icon: '📊', title: 'Real-Time Analytics',        desc: 'AI tracks student engagement and surfaces insights to the teacher mid-lesson.' },
  { icon: '🔁', title: 'Adaptive Feedback Loop',    desc: 'Students receive instant AI feedback while teachers monitor and intervene as needed.' },
];

const STUDENT_ITEMS = [
  { icon: '📓', title: 'My Notes',             desc: 'AI-organized notes from all your sessions, searchable and linkable.' },
  { icon: '🏆', title: 'Achievements',          desc: 'Badges, milestones, and certifications earned across all courses.' },
  { icon: '📁', title: 'My Projects',           desc: 'Portfolio of work — papers, simulations, code, and creative projects.' },
  { icon: '📅', title: 'Study Planner',          desc: 'AI-generated study schedule based on your goals and learning pace.' },
  { icon: '🤖', title: 'My Agents',              desc: 'Personal AI agents you have built or customized for your needs.' },
  { icon: '📊', title: 'Progress Dashboard',    desc: 'Visual overview of skills acquired, time spent, and next recommended steps.' },
];

const TEACHER_ITEMS = [
  { icon: '📝', title: 'Lesson Builder',         desc: 'Drag-and-drop lesson design with AI suggestions and auto-pacing.' },
  { icon: '📊', title: 'Class Analytics',         desc: 'Per-student engagement, comprehension, and progress metrics.' },
  { icon: '🤖', title: 'Deploy a Class Agent',   desc: 'Assign an AI agent to your class for 24/7 Q&A and support.' },
  { icon: '📋', title: 'Assignment Generator',   desc: 'Auto-generate quizzes, projects, and rubrics tailored to your curriculum.' },
  { icon: '🔔', title: 'Early Alert System',      desc: 'AI flags students who may be struggling before it becomes a problem.' },
  { icon: '🌐', title: 'Multi-Language Support', desc: 'Translate lessons and provide AI support in students\' native languages.' },
];

const GALLERY_ITEMS = [
  { icon: '🌐', title: 'Digital Twin World',     desc: 'A student-built 3D learning globe with clickable AI-powered nodes.' },
  { icon: '🎨', title: 'AI Art Series',           desc: 'Generative art created in the UND creative studio by community members.' },
  { icon: '📊', title: 'Climate Dashboard',       desc: 'Live data visualization built with the UND Data & AI course.' },
  { icon: '🤖', title: 'Agent Showcase',          desc: 'Top-rated custom AI agents shared by teachers and students.' },
  { icon: '🏫', title: 'Classroom Simulation',   desc: 'A full lesson plan and co-teaching session recorded and shared.' },
  { icon: '🔬', title: 'Lab Report Collection',  desc: 'Student publications from the Science Lab Simulation course.' },
];

const BLOG_ITEMS = [
  { icon: '🚀', title: 'UND Platform v2.0 Launch', desc: 'Full changelog: 3D World, Control Center, Python Computer, and new AI Agents.' },
  { icon: '🧠', title: 'Teaching with AI in 2026',  desc: 'How co-teaching is reshaping classrooms and learner outcomes worldwide.' },
  { icon: '🔬', title: 'Research Spotlight: Digital Twins', desc: 'How UND\'s twin lab is being used in medical and environmental research.' },
  { icon: '📊', title: 'AI Literacy for Every Learner', desc: 'Why AI education matters for students, teachers, facilities, and beyond.' },
  { icon: '🌐', title: 'Community Roundup: April 2026', desc: 'Top projects, featured agents, and stories from the UND community.' },
];

const WORLD3D_ITEMS = [
  { icon: '🌍', title: 'Learning Globe',       desc: 'Interactive 3D sphere with clickable learning nodes across every subject.' },
  { icon: '🤖', title: 'AI Twin Environment',  desc: 'Simulated world where AI agents operate and interact visually.' },
  { icon: '🏙', title: 'Virtual Campus',        desc: 'Explore buildings, labs, classrooms, and community spaces in 3D.' },
  { icon: '📡', title: 'Data Universe',         desc: 'Visualize datasets as spatial environments you can fly through.' },
  { icon: '🔬', title: 'Science Worlds',         desc: 'Immersive 3D science simulations — from the atom to the cosmos.' },
];

// ── Generic grid renderer ─────────────────────────────────────────────────────
const renderGrid = (containerId, items, extra) => {
  const el = document.querySelector(`#${containerId}`);
  if (!el) return;
  el.innerHTML = '';
  for (const item of items) {
    const a = document.createElement('article');
    a.className = 'card';
    a.innerHTML = `
      <div class="card-icon">${item.icon}</div>
      <div class="card-body">
        <h3>${item.title || item.name}</h3>
        ${item.role   ? `<span class="tag">${item.role} · ${item.domain}</span>` : ''}
        ${item.tag    ? `<span class="tag">${item.tag}</span>` : ''}
        <p>${item.desc}</p>
        ${extra ? extra(item) : ''}
      </div>`;
    el.appendChild(a);
  }
};

// ── Navigation ────────────────────────────────────────────────────────────────
const navItems   = document.querySelectorAll('.nav-item');
const panelViews = document.querySelectorAll('.panel-view');
const cmdChips   = document.querySelectorAll('.cmd-chip');
const rpItems    = document.querySelectorAll('.rp-item');

const switchPanel = (panelId) => {
  for (const item of navItems) {
    item.classList.toggle('active', item.getAttribute('data-panel') === panelId);
  }
  for (const view of panelViews) {
    view.classList.toggle('active', view.id === `view-${panelId}`);
  }
};

for (const item of navItems)  item.addEventListener('click', () => switchPanel(item.getAttribute('data-panel')));
for (const chip of cmdChips)  chip.addEventListener('click', () => switchPanel(chip.getAttribute('data-panel')));
for (const btn  of rpItems)   btn.addEventListener ('click', () => switchPanel(btn.getAttribute('data-panel')));

// card clicks
document.addEventListener('click', (event) => {
  const card = event.target.closest('.card[data-panel]');
  if (card) switchPanel(card.getAttribute('data-panel'));
});

// ── Initial render ────────────────────────────────────────────────────────────
renderGrid('coursesGrid', COURSES.all);
renderGrid('agentsGrid',  AGENTS);
renderGrid('marketSpotlightGrid', AGENT_MARKET);
renderGrid('rolesGrid',   ROLES);
renderGrid('simGrid',     SIMS);
renderGrid('ailabGrid',   AILAB);
renderGrid('mentorGrid',  MENTOR);
renderGrid('coteachGrid', COTEACH);
renderGrid('studentGrid', STUDENT_ITEMS);
renderGrid('teacherGrid', TEACHER_ITEMS);
renderGrid('galleryGrid', GALLERY_ITEMS);
renderGrid('blogGrid',    BLOG_ITEMS);
renderGrid('world3dGrid', WORLD3D_ITEMS);

// ── Courses tab filter ────────────────────────────────────────────────────────
const coursesTabs = document.querySelector('#coursesTabs');
if (coursesTabs) {
  coursesTabs.addEventListener('click', (event) => {
    const tab = event.target.closest('.tab');
    if (!tab) return;
    for (const t of coursesTabs.querySelectorAll('.tab')) t.classList.remove('active');
    tab.classList.add('active');
    renderGrid('coursesGrid', COURSES[tab.getAttribute('data-tab')] || COURSES.all);
  });
}

// ── Agent Builder ─────────────────────────────────────────────────────────────
const createAgentBtn = document.querySelector('#createAgentBtn');
const agentResult    = document.querySelector('#agentResult');
const openAgentMarketBtn = document.querySelector('#openAgentMarketBtn');

if (openAgentMarketBtn) {
  openAgentMarketBtn.addEventListener('click', () => {
    window.location.assign('../agent-market/agent-market.html');
  });
}

if (createAgentBtn && agentResult) {
  createAgentBtn.addEventListener('click', () => {
    const name   = (document.querySelector('#agentName')?.value   || '').trim();
    const role   = (document.querySelector('#agentRole')?.value   || 'Assistant');
    const domain = (document.querySelector('#agentDomain')?.value || '').trim();
    const prompt = (document.querySelector('#agentPrompt')?.value || '').trim();

    if (!name || !domain) {
      agentResult.innerHTML = '<p class="result-warn">⚠ Please enter a name and domain.</p>';
      return;
    }

    agentResult.innerHTML = `
      <div class="agent-card-result">
        <div class="agent-card-icon">🤖</div>
        <div>
          <strong>${name}</strong>
          <span class="tag">${role} · ${domain}</span>
          <p>${prompt || `Hi! I am ${name}, your ${role.toLowerCase()} for ${domain}. Ask me anything.`}</p>
          <span class="result-ok">✔ Agent created and ready to deploy.</span>
        </div>
      </div>`;
  });
}

// ── Command search ────────────────────────────────────────────────────────────
const commandInput = document.querySelector('#commandInput');

const keyMap = [
  { keys: ['course','class','learn','study'],              panel: 'courses' },
  { keys: ['role','career','job','profile'],               panel: 'roles' },
  { keys: ['sim','simulation','hands'],                    panel: 'simulations' },
  { keys: ['agent','model','prompt','build agent'],        panel: 'agents' },
  { keys: ['lab','experiment','pipeline','embedding'],     panel: 'ailab' },
  { keys: ['mentor','support','guide','session'],          panel: 'mentor' },
  { keys: ['teach','coteach','collaborate','classroom'],   panel: 'coteach' },
  { keys: ['student','personal','notes','badge'],          panel: 'studentlab' },
  { keys: ['teacher','lesson','plan','assign'],            panel: 'teacherlab' },
  { keys: ['gallery','art','project','share'],             panel: 'gallery' },
  { keys: ['blog','news','update','post'],                 panel: 'blog' },
  { keys: ['3d','world','sphere','twin','globe'],          panel: 'world3d' },
  { keys: ['research','source','data','visual','analys'],  panel: 'roles' },
];

if (commandInput) {
  commandInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const query = commandInput.value.trim().toLowerCase();
    if (!query) return;
    const match = keyMap.find((entry) => entry.keys.some((k) => query.includes(k)));
    if (match) { switchPanel(match.panel); commandInput.value = ''; }
  });

  commandInput.addEventListener('input', () => {
    const query = commandInput.value.trim().toLowerCase();
    for (const chip of cmdChips) {
      chip.classList.toggle('highlight', query.length > 1 && chip.textContent.toLowerCase().includes(query));
    }
  });
}

// ── Clock ─────────────────────────────────────────────────────────────────────
const liveClock = document.querySelector('#liveClock');
const tick = () => {
  if (!liveClock) return;
  liveClock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
tick();
setInterval(tick, 1000);


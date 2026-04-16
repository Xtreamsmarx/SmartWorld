const profilesNode = document.querySelector('#profiles');
const activeAvatar = document.querySelector('#activeAvatar');
const activeName = document.querySelector('#activeName');
const activeRole = document.querySelector('#activeRole');
const profileSummary = document.querySelector('#profileSummary');
const chatLog = document.querySelector('#chatLog');
const chatForm = document.querySelector('#chatForm');
const chatInput = document.querySelector('#chatInput');
const bridgeStatus = document.querySelector('#bridgeStatus');
const agentListNode = document.querySelector('#agentList');
const profileSearch = document.querySelector('#profileSearch');

const LOCAL_BRIDGE = 'http://127.0.0.1:8765';
const LOCAL_MODEL = 'qwen2.5-coder:3b';

// Replace these entries with CV-driven details when you send full team CVs.
const TEAM_PROFILES = [
    {
      id: 'iraj-mamaghani',
      name: 'Iraj H.P. Mamaghani',
      role: 'Advisor, Professor of Civil Engineering',
      avatar: './cv/img/Iraj.jpeg',
      summary: 'Dr. Iraj H.P. Mamaghani is a Professor of Civil Engineering at UND with Doctor of Engineering and Master of Engineering degrees from Nagoya University, Japan. He specializes in structural engineering, steel structures, and composite systems with decades of academic and industry experience across Japan and Canada. He is a licensed Professional Engineer (P.Eng.) and an active member of ASCE, dedicated to mentoring graduate students and advancing research in earthquake-resistant design and high-performance structural systems.',
      traits: ['D.Eng., M.Eng., P.Eng., M.ASCE', 'Istanbul Tech + Nagoya University', 'Steel & Composite Structures', 'Earthquake-Resistant Design', 'Industry Experience: Japan & Canada', 'Graduate Student Mentor'],
      bio: `D. Eng., M. Eng., P. Eng., M. ASCE\nProfessor, Civil Engineering\nStructural Mechanics/ Structural Engineering\n\nContact Info:\nEmail: iraj.mamaghani@UND.edu\nAlt Email: iraj.mamaghani@engr.und.edu\nOffice: 701.777.3563\nAlt Phone: 701.777.3563\nDept: 701.777.3876\nFax: 701.777.3728\nOffice Address: Upson II Room 260E, 243 Centennial Drive Stop 8115, Grand Forks, ND 58202-8115\n\nBiography: Dr. Iraj Mamaghani earned his Bachelor of Science in Civil Engineering from Istanbul Technical University and continued graduate studies at Nagoya University, Japan, where he obtained both his Master of Science and Doctor of Engineering degrees in Structural Engineering. His academic and research interests include steel structures, steel–concrete composite systems, and masonry structures, with a focus on advanced numerical and experimental methods in structural engineering. He has contributed to numerous research projects and published extensively in peer-reviewed journals and conferences. Dr. Mamaghani is dedicated to mentoring graduate students and promoting high-quality research and publication outcomes.\n\nHe has taught a wide variety of undergraduate and graduate courses, including Mechanics of Materials, Structural Analysis, Steel Design, Structural Stability, Theory of Elasticity, Theory of Plasticity, Earthquake-Resistant Design, Advanced Steel Design, and Advanced Numerical Analysis.\n\nDr. Mamaghani's research covers a wide range of structural engineering topics, including thin-walled cold-formed steel systems, performance-based earthquake engineering, constitutive modeling for cyclic plasticity, development of fiber-reinforced high-performance self-consolidating concrete, high-energy-absorbing rock fence systems, and seismic design of liquid-filled steel storage tanks. He has extensive industry experience in Japan and Canada, managing large-scale structural projects and consulting in structural engineering.\n\nHe remains committed to advancing structural engineering through innovative research, impactful teaching, and mentoring future engineers.`,
      skills: [
        'Structural Engineering',
        'Steel Structures',
        'Composite Systems',
        'Masonry Structures',
        'Numerical Methods',
        'Experimental Methods',
        'Mentoring',
        'Research Guidance',
        'Teaching',
        'Industry Collaboration'
      ],
      style: 'Supportive, insightful, and experienced.',
      cvUrl: './cv/cv-iraj-mamaghani.html'
    },
    {
      id: 'moh-rasouli',
      name: 'Moh Rasouli',
      role: 'Director / Professor, SEECS',
      avatar: './cv/img/rasouli.jpg',
      summary: 'Dr. Moh Rasouli is the Director and Professor of the School of Electrical Engineering and Computer Science at UND. He holds a Ph.D. in Electrical Engineering from the University of Calgary and is a Licensed Professional Engineer (P.E.). With over 7 years of industry experience in power systems and control—including roles at Jacobs Engineering—he brings both academic leadership and real-world engineering expertise to smart grid research, power system modeling, and nonlinear system identification.',
      traits: ['Ph.D. Electrical Engineering – U of Calgary', 'Licensed P.E.', 'Director of SEECS at UND', '7+ Years Industry Experience', 'Smart Grids & Power Systems', 'Former Dept. Chair at Penn State Erie'],
      bio: `Contact Info:\nEmail: mohammad.rasouli@UND.edu\nOffice: 701.777.5063\nOffice Address: Upson II Room 366B, 243 Centennial Drive Stop 7165, Grand Forks, ND 58202-7165\n\nBiography: Dr. Rasouli is the Director and Professor of the School of Electrical Engineering and Computer Science at UND. He previously served at The Pennsylvania State University Erie from 2013 to 2024, holding positions as Assistant, Associate, and Full Professor, as well as Department Chair of Electrical and Computer Engineering. With over 7 years of industry experience in power systems and control, Dr. Rasouli has worked as an Electrical Engineer at Jacobs Engineering, as well as a Project Manager and Research Scientist.\n\nCourses: Electric Circuits I & II, Control Systems I & II, Electric Machines (Energy Conversion), Power Systems I & II, Power System Operation and Control, Power Electronics.\n\nResearch/Areas of Interest: Power system modeling, operation and control; Smart grids; Nonlinear system identification.\n\nCredentials: P.E., Licensed Professional Engineer.\n\nEducation: Ph.D. in Electrical Engineering – University of Calgary, Canada.`,
      skills: [
        'Power Systems',
        'Control Systems',
        'Smart Grids',
        'Nonlinear System Identification',
        'Academic Leadership',
        'Teaching',
        'Industry Collaboration',
        'Project Management'
      ],
      style: 'Visionary, organized, and dedicated.',
      cvUrl: './cv/cv-moh-rasouli.html'
    },
    {
      id: 'meisam-moradi',
      name: 'Meisam Shayegh Moradi',
      role: 'Graduate AI Research Assistant, Vice President of UND AI Club',
      avatar: './cv/img/Meisam.jpg',
      summary: 'Meisam Shayegh Moradi is a Ph.D. candidate in Electrical Engineering at UND and a Graduate Research Assistant at the Artificial Intelligence Research Center. His work spans intelligent complex systems, digital twins, high-performance computing, and autonomous knowledge discovery. He is currently building a distributed AI ecosystem for the Arctic science gateway platform, integrating geospatial intelligence and multimodal big data. His research is supported by NSF, ERDC, and CRREL, covering AI-based weather modeling, robotics, and autonomous systems.',
      traits: ['IEEE Graduate Student Member', 'Ph.D. Candidate – UND', 'AI Research Center', 'Digital Twins & HPC', 'NSF / ERDC / CRREL Funded', 'VP of UND AI Club'],
      bio: `Meisam Shayegh Moradi (Graduate Student Member, IEEE) received the B.Sc. degree in electrical engineering with specialization in telecommunication systems in 2020. He is currently working toward the Ph.D. degree in electrical engineering at the University of North Dakota, Grand Forks, ND, USA.\n\nHe is a Graduate Research Assistant with the Artificial Intelligence Research Center. His research interests include intelligent complex systems, emergent general computational intelligence, intelligent embedded sociocyber–physical systems (hardware, software, and biological systems), large world models including language models, digital twins, autonomous knowledge discovery, high performance computing, advanced signal processing, neuroengineering, autonomous and smart networked systems, with an emphasis on high-performance, scalable, adaptive, and self-evolving AI systems for scientific discovery.\n\nHe is currently developing a generalized high performance distributed AI modeling ecosystem for the Arctic knowledge base science gateway platform, where geospatial intelligence, multimodal big data, and predictive data analytics enable knowledge-based reasoning, decision support tools, and autonomous scientific discovery across heterogeneous information streams.\n\nHis research interests include several projects supported by National Science Foundation, Engineer Research and Development Center, Cold Regions Research and Engineering Laboratory, and National Elite Foundation, spanning artificial intelligence-based high performance weather modeling, robotics, biomedical signal analysis, autonomous aircraft system based semantic perception, AI-based project management, autonomous knowledge discovery for smart networked systems, and several additional multidisciplinary research projects.\n\nDr. Moradi was the recipient of several academic awards and honors for academic excellence.`,
      skills: [
        'Artificial Intelligence',
        'Complex Systems',
        'Computational Intelligence',
        'Embedded Systems',
        'Digital Twins',
        'Knowledge Discovery',
        'High Performance Computing',
        'Signal Processing',
        'Neuroengineering',
        'Autonomous Systems',
        'Distributed AI',
        'Big Data Analytics',
        'Scientific Discovery'
      ],
      style: 'Innovative, research-driven, and multidisciplinary.',
      cvUrl: './cv/cv-meisam-moradi.html'
    }
];

const AI_AGENTS = [
  {
    id: 'campus-ops-agent',
    name: 'Campus Ops Agent',
    scope: 'Conference Rooms and Classrooms',
    status: 'Monitoring room occupancy and schedule drift.'
  },
  {
    id: 'vision-guard-agent',
    name: 'Vision Guard Agent',
    scope: 'Cameras and Safety Coverage',
    status: 'Tracking camera uptime and blind-spot risk.'
  },
  {
    id: 'speech-intel-agent',
    name: 'Speech Intel Agent',
    scope: 'Lecture and Speech Activity',
    status: 'Estimating attendance and session engagement.'
  },
  {
    id: 'facility-risk-agent',
    name: 'Facility Risk Agent',
    scope: 'Environmental and Incident Signals',
    status: 'Prioritizing alerts for rapid response.'
  }
];

let activeProfile = null;
const historyByProfile = new Map();
let searchQuery = '';

const appendMessage = (role, text) => {
  if (!chatLog) return;
  const p = document.createElement('p');
  p.className = `msg ${role}`;
  p.textContent = text;
  chatLog.appendChild(p);
  chatLog.scrollTop = chatLog.scrollHeight;
};

const renderSummary = (profile) => {
  if (!profileSummary) return;
  const traitsHtml = (profile.traits || []).map(t => `<span class="trait-tag">${t}</span>`).join('');
  profileSummary.innerHTML = `
    <div class="summary-card">
      <img class="summary-avatar" src="${profile.avatar}" alt="${profile.name}" />
      <div class="summary-body">
        <p class="summary-text">${profile.summary || profile.bio}</p>
        <div class="trait-list">${traitsHtml}</div>
        <ul class="summary-meta">
          <li><strong>Core Skills:</strong> ${profile.skills.slice(0, 5).join(', ')}</li>
          <li><strong>Style:</strong> ${profile.style}</li>
        </ul>
        <a class="cv-link" href="${profile.cvUrl}">Open Full CV &rarr;</a>
      </div>
    </div>
  `;
};

const renderProfiles = () => {
  if (!profilesNode) return;
  profilesNode.innerHTML = '';

  const filtered = TEAM_PROFILES.filter((profile) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      profile.name.toLowerCase().includes(q)
      || profile.role.toLowerCase().includes(q)
      || profile.skills.join(' ').toLowerCase().includes(q)
    );
  });

  if (!filtered.length) {
    const empty = document.createElement('article');
    empty.className = 'profile-card';
    empty.innerHTML = '<div><h3>No matching profile</h3><p>Try another name or skill.</p></div>';
    profilesNode.appendChild(empty);
    return;
  }

  filtered.forEach((profile) => {
    const card = document.createElement('article');
    card.className = 'profile-card';
    card.dataset.id = profile.id;
    card.innerHTML = `
      <img src="${profile.avatar}" alt="${profile.name} avatar" loading="lazy" />
      <div>
        <h3>${profile.name}${profile.lead ? ' <span class="lead-tag">LEAD</span>' : ''}</h3>
        <p>${profile.role}</p>
      </div>
    `;
    card.addEventListener('click', () => setActiveProfile(profile.id));
    profilesNode.appendChild(card);
  });
};

const renderAgents = () => {
  if (!agentListNode) return;
  agentListNode.innerHTML = '';
  AI_AGENTS.forEach((agent) => {
    const card = document.createElement('article');
    card.className = 'agent-card';
    card.innerHTML = `
      <h4>${agent.name}</h4>
      <span class="agent-meta">${agent.scope}</span>
      <p>${agent.status}</p>
    `;

    card.addEventListener('click', () => {
      if (chatInput) {
        chatInput.value = `Give me ${agent.name} recommendations for campus operations.`;
        chatInput.focus();
      }
    });

    agentListNode.appendChild(card);
  });
};

const setActiveProfile = (profileId) => {
  const profile = TEAM_PROFILES.find((item) => item.id === profileId);
  if (!profile) return;
  activeProfile = profile;

  document.querySelectorAll('.profile-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.id === profileId);
  });

  if (activeAvatar) {
    activeAvatar.src = profile.avatar;
  }
  if (activeName) {
    activeName.textContent = profile.name;
  }
  if (activeRole) {
    activeRole.textContent = profile.lead ? `${profile.role} | Lead` : profile.role;
  }

  renderSummary(profile);

  if (chatLog) {
    chatLog.innerHTML = '';
    const saved = historyByProfile.get(profile.id) || [
      { role: 'bot', text: `You are now talking with ${profile.name}. Ask about projects, skills, or decisions.` }
    ];
    saved.forEach((entry) => appendMessage(entry.role, entry.text));
  }
};

const saveToHistory = (profileId, role, text) => {
  const list = historyByProfile.get(profileId) || [];
  list.push({ role, text });
  historyByProfile.set(profileId, list.slice(-16));
};

const updateBridgeStatus = async () => {
  if (!bridgeStatus) return;
  try {
    const response = await fetch(`${LOCAL_BRIDGE}/health`);
    bridgeStatus.textContent = response.ok ? 'Bridge: online' : 'Bridge: issue';
  } catch {
    bridgeStatus.textContent = 'Bridge: offline (fallback mode)';
  }
};

const buildPrompt = (profile, userMessage) => {
  const history = historyByProfile.get(profile.id) || [];
  const trimmed = history.slice(-6).map((entry) => `${entry.role === 'user' ? 'User' : profile.name}: ${entry.text}`).join('\n');

  return [
    `You are ${profile.name}, ${profile.role}.`,
    `Profile bio: ${profile.bio}`,
    `Skills: ${profile.skills.join(', ')}`,
    `Tone: ${profile.style}`,
    'Answer as this person with practical, concise advice.',
    trimmed ? `Recent chat:\n${trimmed}` : '',
    `User: ${userMessage}`,
    `${profile.name}:`
  ].filter(Boolean).join('\n\n');
};

const askProfileModel = async (profile, userMessage) => {
  const body = {
    model: LOCAL_MODEL,
    prompt: buildPrompt(profile, userMessage),
    stream: false,
    options: { temperature: 0.55 }
  };

  const response = await fetch(`${LOCAL_BRIDGE}/ollama/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error('Bridge request failed');
  }

  const payload = await response.json();
  return (payload.response || '').trim();
};

const fallbackReply = (profile, userMessage) => {
  const text = userMessage.toLowerCase();
  if (text.includes('skill') || text.includes('expert')) {
    return `${profile.name}: My strongest areas are ${profile.skills.join(', ')}. I can help map these into project execution plans.`;
  }
  if (text.includes('project') || text.includes('build')) {
    return `${profile.name}: For Smart World, I recommend a phased build: scope, prototype, validate with real data, then automate operations.`;
  }
  return `${profile.name}: I can help with strategy, implementation, and smart decision insights. Ask me about a specific project or challenge.`;
};

chatForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!activeProfile || !chatInput) {
    return;
  }

  const message = chatInput.value.trim();
  if (!message) return;
  chatInput.value = '';

  appendMessage('user', message);
  saveToHistory(activeProfile.id, 'user', message);

  appendMessage('bot', 'Thinking...');
  const thinkingNode = chatLog ? chatLog.lastElementChild : null;

  try {
    const reply = await askProfileModel(activeProfile, message);
    if (thinkingNode) {
      thinkingNode.textContent = reply || fallbackReply(activeProfile, message);
    }
    saveToHistory(activeProfile.id, 'bot', reply || fallbackReply(activeProfile, message));
  } catch {
    const reply = fallbackReply(activeProfile, message);
    if (thinkingNode) {
      thinkingNode.textContent = reply;
    }
    saveToHistory(activeProfile.id, 'bot', reply);
  }
});

profileSearch?.addEventListener('input', () => {
  searchQuery = profileSearch.value;
  renderProfiles();
});

renderProfiles();
renderAgents();
setActiveProfile(TEAM_PROFILES[0].id);
updateBridgeStatus();

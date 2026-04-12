const roomList = document.querySelector('#roomList');
const roomGrid = document.querySelector('#roomGrid');
const roomDetail = document.querySelector('#roomDetail');
const eventLog = document.querySelector('#eventLog');
const kpis = document.querySelector('#kpis');
const agentStatus = document.querySelector('#agentStatus');
const toggleSimBtn = document.querySelector('#toggleSimBtn');
const nextTickBtn = document.querySelector('#nextTickBtn');

const AGENTS = [
  { name: 'Campus Ops Agent', message: 'Balancing room utilization and session continuity.' },
  { name: 'Vision Guard Agent', message: 'Monitoring camera health and blind spots.' },
  { name: 'Speech Intel Agent', message: 'Tracking active speeches and audience engagement.' },
  { name: 'Safety Pulse Agent', message: 'Watching alerts and escalation readiness.' }
];

const TOPICS = [
  'AI for Smart Infrastructure',
  'Digital Twin Operations',
  'Urban Sustainability Models',
  'Campus Cybersecurity Briefing',
  'Data Ethics in Public Systems',
  'Autonomous Mobility Seminar',
  'Water Reliability Workshop'
];

const ROOMS = [
  { id: 'MU-Conf-A', building: 'Memorial Union', type: 'Conference', capacity: 120, cameras: 6 },
  { id: 'MU-Conf-B', building: 'Memorial Union', type: 'Conference', capacity: 90, cameras: 4 },
  { id: 'ENG-201', building: 'Engineering Hall', type: 'Lecture', capacity: 80, cameras: 3 },
  { id: 'ENG-310', building: 'Engineering Hall', type: 'Lab', capacity: 52, cameras: 4 },
  { id: 'ODE-114', building: 'Odegard', type: 'Lecture', capacity: 140, cameras: 5 },
  { id: 'ODE-302', building: 'Odegard', type: 'Seminar', capacity: 44, cameras: 2 },
  { id: 'LIB-Forum', building: 'Chester Fritz Library', type: 'Forum', capacity: 200, cameras: 8 },
  { id: 'LIB-212', building: 'Chester Fritz Library', type: 'Classroom', capacity: 60, cameras: 3 },
  { id: 'SCI-105', building: 'Science Center', type: 'Lecture', capacity: 110, cameras: 5 },
  { id: 'SCI-Lab-4', building: 'Science Center', type: 'Lab', capacity: 36, cameras: 3 },
  { id: 'BUS-220', building: 'Business School', type: 'Classroom', capacity: 70, cameras: 3 },
  { id: 'BUS-Conf', building: 'Business School', type: 'Conference', capacity: 65, cameras: 4 }
].map((room, index) => ({
  ...room,
  attendees: Math.floor(room.capacity * (0.35 + ((index % 4) * 0.1))),
  cameraOnline: room.cameras,
  speaking: index % 2 === 0,
  topic: TOPICS[index % TOPICS.length],
  speaker: `Speaker ${index + 1}`,
  noise: 34 + (index * 3) % 16,
  temperature: 21 + (index % 3),
  alert: 'ok'
}));

let selectedRoomId = ROOMS[0].id;
let running = true;
let clockMinute = 0;
let intervalId = null;
const logs = [];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getRoomState = (room) => {
  const ratio = room.attendees / room.capacity;
  if (room.cameraOnline < room.cameras - 1 || ratio > 0.95 || room.noise > 55) {
    return 'risk';
  }
  if (room.cameraOnline < room.cameras || ratio > 0.82 || room.noise > 50) {
    return 'warn';
  }
  return 'ok';
};

const pushLog = (message) => {
  logs.unshift({ minute: clockMinute, message });
  while (logs.length > 20) logs.pop();
};

const randomTopic = () => TOPICS[Math.floor(Math.random() * TOPICS.length)];

const tickRoom = (room) => {
  const attendeeShift = Math.floor((Math.random() * 17) - 8);
  room.attendees = clamp(room.attendees + attendeeShift, 0, room.capacity);

  if (Math.random() < 0.16) {
    room.speaking = !room.speaking;
    room.topic = room.speaking ? randomTopic() : 'Session break';
  }

  if (Math.random() < 0.12) {
    const cameraShift = Math.random() < 0.5 ? -1 : 1;
    room.cameraOnline = clamp(room.cameraOnline + cameraShift, 0, room.cameras);
  }

  room.noise = clamp(room.noise + Math.floor((Math.random() * 9) - 4), 28, 65);
  room.temperature = clamp(room.temperature + ((Math.random() < 0.5) ? -1 : 1), 19, 27);
  room.alert = getRoomState(room);

  if (room.alert === 'risk' && Math.random() < 0.45) {
    pushLog(`${room.id}: Elevated risk due to occupancy/camera/noise condition.`);
  }
};

const renderKpis = () => {
  const totalRooms = ROOMS.length;
  const totalAttendees = ROOMS.reduce((sum, room) => sum + room.attendees, 0);
  const totalCapacity = ROOMS.reduce((sum, room) => sum + room.capacity, 0);
  const totalCamera = ROOMS.reduce((sum, room) => sum + room.cameras, 0);
  const onlineCamera = ROOMS.reduce((sum, room) => sum + room.cameraOnline, 0);
  const activeSpeeches = ROOMS.filter((room) => room.speaking).length;
  const utilization = Math.round((totalAttendees / totalCapacity) * 100);

  kpis.innerHTML = `
    <article class="kpi"><span>Rooms Live</span><strong>${totalRooms}</strong></article>
    <article class="kpi"><span>Total Attendance</span><strong>${totalAttendees}</strong></article>
    <article class="kpi"><span>Camera Uptime</span><strong>${onlineCamera}/${totalCamera}</strong></article>
    <article class="kpi"><span>Speech Sessions</span><strong>${activeSpeeches} active | ${utilization}% utilization</strong></article>
  `;
};

const renderRoomList = () => {
  roomList.innerHTML = '';
  ROOMS.forEach((room) => {
    const item = document.createElement('article');
    item.className = `room-item ${room.id === selectedRoomId ? 'active' : ''}`;
    item.innerHTML = `
      <h4>${room.id}</h4>
      <p>${room.building} | ${room.type}</p>
      <p>${room.attendees}/${room.capacity} attending | Cameras ${room.cameraOnline}/${room.cameras}</p>
    `;
    item.addEventListener('click', () => {
      selectedRoomId = room.id;
      renderAll();
    });
    roomList.appendChild(item);
  });
};

const renderRoomGrid = () => {
  roomGrid.innerHTML = '';
  ROOMS.forEach((room) => {
    const stateClass = room.alert === 'risk' ? 'state-risk' : room.alert === 'warn' ? 'state-warn' : 'state-ok';
    const cell = document.createElement('article');
    cell.className = `grid-cell ${stateClass}`;
    cell.innerHTML = `
      <h5>${room.id}</h5>
      <p>${room.attendees}/${room.capacity} attendees</p>
      <p>${room.speaking ? 'Speech: active' : 'Speech: idle'}</p>
    `;
    cell.addEventListener('click', () => {
      selectedRoomId = room.id;
      renderAll();
    });
    roomGrid.appendChild(cell);
  });
};

const renderDetail = () => {
  const room = ROOMS.find((entry) => entry.id === selectedRoomId);
  if (!room) return;

  roomDetail.innerHTML = `
    <h3>${room.id}</h3>
    <p>${room.building} | ${room.type}</p>
    <p>Topic: ${room.topic}</p>
    <p>Speaker: ${room.speaker}</p>
    <div class="detail-grid">
      <article class="mini"><span>Attendees</span><strong>${room.attendees}/${room.capacity}</strong></article>
      <article class="mini"><span>Cameras</span><strong>${room.cameraOnline}/${room.cameras}</strong></article>
      <article class="mini"><span>Noise</span><strong>${room.noise} dB</strong></article>
      <article class="mini"><span>Temp</span><strong>${room.temperature} C</strong></article>
      <article class="mini"><span>Speech</span><strong>${room.speaking ? 'Active' : 'Idle'}</strong></article>
      <article class="mini"><span>Alert</span><strong>${room.alert.toUpperCase()}</strong></article>
    </div>
  `;
};

const renderLog = () => {
  eventLog.innerHTML = '';
  logs.forEach((entry) => {
    const line = document.createElement('article');
    line.className = 'log-item';
    line.textContent = `T+${entry.minute}m | ${entry.message}`;
    eventLog.appendChild(line);
  });
};

const renderAgents = () => {
  const riskRooms = ROOMS.filter((room) => room.alert === 'risk').length;
  const warnRooms = ROOMS.filter((room) => room.alert === 'warn').length;
  const speakingRooms = ROOMS.filter((room) => room.speaking).length;

  const dynamicMessages = [
    `Campus Ops Agent: ${warnRooms + riskRooms} rooms require capacity balancing actions.`,
    `Vision Guard Agent: ${ROOMS.reduce((s, r) => s + r.cameraOnline, 0)} cameras online across campus spaces.`,
    `Speech Intel Agent: ${speakingRooms} rooms currently running active speeches/lectures.`,
    `Safety Pulse Agent: ${riskRooms} high-priority rooms and ${warnRooms} warning rooms.`
  ];

  agentStatus.innerHTML = '';
  AGENTS.forEach((agent, index) => {
    const item = document.createElement('article');
    item.className = 'agent-item';
    item.innerHTML = `<strong>${agent.name}</strong><span>${dynamicMessages[index] || agent.message}</span>`;
    agentStatus.appendChild(item);
  });
};

const renderAll = () => {
  renderKpis();
  renderRoomList();
  renderRoomGrid();
  renderDetail();
  renderLog();
  renderAgents();
};

const tick = () => {
  clockMinute += 1;
  ROOMS.forEach(tickRoom);

  if (Math.random() < 0.35) {
    const room = ROOMS[Math.floor(Math.random() * ROOMS.length)];
    pushLog(`${room.id}: ${room.speaking ? 'Speech in progress' : 'Session transition'} | ${room.attendees} attendees.`);
  }

  renderAll();
};

const start = () => {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    if (running) tick();
  }, 2600);
};

toggleSimBtn?.addEventListener('click', () => {
  running = !running;
  toggleSimBtn.textContent = running ? 'Pause Simulation' : 'Resume Simulation';
  if (!running) {
    pushLog('Simulation paused by operator.');
  } else {
    pushLog('Simulation resumed by operator.');
  }
  renderLog();
});

nextTickBtn?.addEventListener('click', () => {
  tick();
  pushLog('Manual simulation tick executed.');
  renderLog();
});

pushLog('Campus telemetry initialized with room sensors, camera streams, and speech tracking.');
renderAll();
start();

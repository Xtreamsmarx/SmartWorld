const feedNode = document.querySelector('#feed');
const trendsNode = document.querySelector('#trends');
const storiesNode = document.querySelector('#stories');
const pulseNode = document.querySelector('#pulse');
const roomsNode = document.querySelector('#rooms');
const activeRoomLabel = document.querySelector('#activeRoomLabel');
const suggestedPeopleNode = document.querySelector('#suggestedPeople');
const zoneFilterLabel = document.querySelector('#zoneFilterLabel');
const clearZoneFilterBtn = document.querySelector('#clearZoneFilter');
const cityMapCanvas = document.querySelector('#cityMap');
const zoneStatsNode = document.querySelector('#zoneStats');
const signalFeedNode = document.querySelector('#signalFeed');

const postForm = document.querySelector('#postForm');
const roomForm = document.querySelector('#roomForm');
const authorInput = document.querySelector('#authorInput');
const postInput = document.querySelector('#postInput');
const tagsInput = document.querySelector('#tagsInput');
const fileInput = document.querySelector('#fileInput');
const searchInput = document.querySelector('#searchInput');
const roomNameInput = document.querySelector('#roomNameInput');
const tabForYou = document.querySelector('#tabForYou');
const tabFollowing = document.querySelector('#tabFollowing');
const mapModeSelect = document.querySelector('#mapMode');

const STORAGE_POSTS = 'smartworld.social.posts.v2';
const STORAGE_LIKES = 'smartworld.social.likes.v2';
const STORAGE_ROOMS = 'smartworld.social.rooms.v1';
const STORAGE_ACTIVE_ROOM = 'smartworld.social.activeRoom.v1';

const MAX_ATTACHMENT_SIZE = 6 * 1024 * 1024;

const cityZones = [
  { id: 'north-campus', name: 'North Campus Grid', x: 0.2, y: 0.28, color: '#9ad9ff' },
  { id: 'south-campus', name: 'South Research Belt', x: 0.32, y: 0.7, color: '#ffb6d4' },
  { id: 'water-core', name: 'Water Ops Core', x: 0.58, y: 0.62, color: '#98f0e5' },
  { id: 'ai-district', name: 'AI District', x: 0.75, y: 0.3, color: '#ffe28f' },
  { id: 'command-ring', name: 'Command Ring', x: 0.5, y: 0.18, color: '#c9b6ff' }
];

const seedRooms = [
  { id: crypto.randomUUID(), name: 'Campus AI Briefing', participants: 16 },
  { id: crypto.randomUUID(), name: 'Water Treatment Ops', participants: 11 },
  { id: crypto.randomUUID(), name: 'Digital Twin Engineering', participants: 22 },
  { id: crypto.randomUUID(), name: 'Emergency Command Room', participants: 8 }
];

let rooms = loadJson(STORAGE_ROOMS, seedRooms);
let activeRoomId = localStorage.getItem(STORAGE_ACTIVE_ROOM) || rooms[0].id;

if (!Array.isArray(rooms) || rooms.length === 0) {
  rooms = seedRooms;
}
if (!activeRoomId) {
  activeRoomId = rooms[0].id;
}

const seedPosts = [
  {
    id: crypto.randomUUID(),
    roomId: rooms[0].id,
    author: 'Meisam Moradi',
    handle: '@lead',
    text: 'Opening today conference briefing: AI adoption progress by sections. Upload your files here.',
    tags: ['#conference', '#aiadoption'],
    attachments: [],
    likes: 18,
    comments: ['Ready with roadmaps.'],
    createdAt: Date.now() - 1000 * 60 * 42
  },
  {
    id: crypto.randomUUID(),
    roomId: rooms[1].id,
    author: 'Neda Farhadi',
    handle: '@water',
    text: 'Sharing clarifier trend and short maintenance voice note for today shift.',
    tags: ['#water', '#operations'],
    attachments: [],
    likes: 24,
    comments: ['Please pin this in room.'],
    createdAt: Date.now() - 1000 * 60 * 96
  },
  {
    id: crypto.randomUUID(),
    roomId: rooms[2].id,
    author: 'Fatemeh Kazemi',
    handle: '@nlp',
    text: 'Room note: persona-chat tuning merged. Drop demo videos and logs in this thread.',
    tags: ['#agents', '#engineering'],
    attachments: [],
    likes: 15,
    comments: ['Testing now.'],
    createdAt: Date.now() - 1000 * 60 * 150
  }
];

const likedPosts = new Set(loadJson(STORAGE_LIKES, []));
let posts = loadJson(STORAGE_POSTS, seedPosts);
let query = '';
let feedMode = 'for-you';
const followingHandles = new Set(['@lead', '@water', '@ops', '@planner']);
let activeZoneId = '';

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // no-op
  }
}

function timeAgo(ts) {
  const minutes = Math.max(1, Math.floor((Date.now() - ts) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getActiveRoom() {
  return rooms.find((room) => room.id === activeRoomId) || rooms[0] || null;
}

function inferZoneFromRoom(roomId) {
  const room = rooms.find((item) => item.id === roomId);
  const name = (room?.name || '').toLowerCase();
  if (name.includes('water')) return 'water-core';
  if (name.includes('command') || name.includes('emergency')) return 'command-ring';
  if (name.includes('ai')) return 'ai-district';
  if (name.includes('engineering') || name.includes('twin')) return 'south-campus';
  return 'north-campus';
}

function zoneById(zoneId) {
  return cityZones.find((zone) => zone.id === zoneId) || cityZones[0];
}

function normalizePosts() {
  posts = (posts || []).map((post) => ({
    ...post,
    zoneId: post.zoneId || inferZoneFromRoom(post.roomId),
    reposts: Number.isFinite(post.reposts) ? post.reposts : 0,
    shares: Number.isFinite(post.shares) ? post.shares : 0
  }));
}

function updateZoneFilterLabel() {
  if (!zoneFilterLabel) return;
  if (!activeZoneId) {
    zoneFilterLabel.textContent = 'Geo Lens: All Zones';
    return;
  }
  const zone = zoneById(activeZoneId);
  zoneFilterLabel.textContent = `Geo Lens: ${zone.name}`;
}

function updateActiveRoomLabel() {
  const room = getActiveRoom();
  if (!activeRoomLabel) return;
  if (room) {
    activeRoomLabel.textContent = `Room: ${room.name}`;
  } else {
    activeRoomLabel.textContent = 'Room: none';
  }
}

function renderRooms() {
  if (!roomsNode) return;
  roomsNode.innerHTML = '';

  for (const room of rooms) {
    const card = document.createElement('article');
    card.className = `room-card ${room.id === activeRoomId ? 'active' : ''}`;
    card.innerHTML = `
      <div>
        <strong>${room.name}</strong>
        <span>${room.participants} participants</span>
      </div>
      <button type="button">Join</button>
    `;

    card.querySelector('button')?.addEventListener('click', () => {
      activeRoomId = room.id;
      localStorage.setItem(STORAGE_ACTIVE_ROOM, room.id);
      updateActiveRoomLabel();
      renderAll();
    });

    roomsNode.appendChild(card);
  }
}

function getFilteredPosts() {
  const q = query.trim().toLowerCase();
  const activeRoom = getActiveRoom();
  const roomId = activeRoom ? activeRoom.id : null;

  let filtered = posts;
  if (roomId) {
    filtered = filtered.filter((post) => post.roomId === roomId);
  }

  if (feedMode === 'following') {
    filtered = filtered.filter((post) => followingHandles.has(post.handle));
  }

  if (activeZoneId) {
    filtered = filtered.filter((post) => post.zoneId === activeZoneId);
  }

  if (!q) return filtered;
  return filtered.filter((post) => {
    const target = `${post.author} ${post.handle} ${post.text} ${post.tags.join(' ')}`.toLowerCase();
    return target.includes(q);
  });
}

function renderZoneStats() {
  if (!zoneStatsNode) return;
  const stats = cityZones.map((zone) => {
    const scopedPosts = posts.filter((post) => post.zoneId === zone.id);
    const score = scopedPosts.reduce((sum, post) => sum + post.likes + post.comments.length + post.reposts + post.shares, 0);
    return { zone, count: scopedPosts.length, score };
  });

  zoneStatsNode.innerHTML = '';
  for (const item of stats.sort((a, b) => b.score - a.score)) {
    const row = document.createElement('article');
    row.className = `zone-row ${item.zone.id === activeZoneId ? 'active' : ''}`;
    row.innerHTML = `
      <div>
        <strong>${item.zone.name}</strong>
        <span>${item.count} posts | score ${item.score}</span>
      </div>
      <button class="social-btn" type="button">Lens</button>
    `;
    row.querySelector('button')?.addEventListener('click', () => {
      activeZoneId = item.zone.id;
      updateZoneFilterLabel();
      renderAll();
    });
    zoneStatsNode.appendChild(row);
  }
}

function renderSignalFeed() {
  if (!signalFeedNode) return;
  const ranked = [...posts]
    .sort((a, b) => (b.likes + b.comments.length + b.reposts + b.shares) - (a.likes + a.comments.length + a.reposts + a.shares))
    .slice(0, 6);

  signalFeedNode.innerHTML = '';
  for (const post of ranked) {
    const zone = zoneById(post.zoneId);
    const score = post.likes + post.comments.length + post.reposts + post.shares;
    const row = document.createElement('article');
    row.className = 'signal-row';
    row.innerHTML = `
      <strong>${post.author} in ${zone.name}</strong>
      <span>signal ${score} | ${post.text.slice(0, 70)}</span>
    `;
    signalFeedNode.appendChild(row);
  }
}

function drawMapNode(ctx, x, y, radius, color, isActive, label, value) {
  const glow = isActive ? 18 : 10;
  ctx.beginPath();
  ctx.arc(x, y, radius + glow, 0, Math.PI * 2);
  ctx.fillStyle = `${color}22`;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.strokeStyle = isActive ? '#ffd1e4' : 'rgba(255,255,255,0.3)';
  ctx.lineWidth = isActive ? 2.4 : 1.4;
  ctx.stroke();

  ctx.fillStyle = '#eaf4ff';
  ctx.font = '11px Space Grotesk, Segoe UI, sans-serif';
  ctx.fillText(label, x + 10, y - 6);
  ctx.fillStyle = '#b7d2f0';
  ctx.fillText(`density ${value}`, x + 10, y + 9);
}

function renderCityMap() {
  if (!cityMapCanvas) return;
  const ctx = cityMapCanvas.getContext('2d');
  if (!ctx) return;

  const rect = cityMapCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(400, Math.floor(rect.width));
  const height = Math.max(220, Math.floor(rect.height));

  if (cityMapCanvas.width !== width * dpr || cityMapCanvas.height !== height * dpr) {
    cityMapCanvas.width = width * dpr;
    cityMapCanvas.height = height * dpr;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const mode = mapModeSelect?.value || 'pulse';
  const modeTint = mode === 'risk' ? 'rgba(255, 130, 146, 0.15)' : mode === 'flow' ? 'rgba(130, 255, 220, 0.12)' : 'rgba(130, 186, 255, 0.12)';
  ctx.fillStyle = modeTint;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(157, 204, 255, 0.18)';
  ctx.lineWidth = 1;
  for (let x = 24; x < width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 20; y < height; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const points = cityZones.map((zone) => {
    const x = zone.x * width;
    const y = zone.y * height;
    const density = posts.filter((post) => post.zoneId === zone.id).length;
    return { zone, x, y, density };
  });

  ctx.strokeStyle = 'rgba(151, 214, 255, 0.35)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  for (const point of points) {
    const radius = 6 + Math.min(14, point.density * 1.2);
    drawMapNode(
      ctx,
      point.x,
      point.y,
      radius,
      point.zone.color,
      point.zone.id === activeZoneId,
      point.zone.name,
      point.density
    );
  }
}

function hitZoneFromCanvas(event) {
  if (!cityMapCanvas) return '';
  const rect = cityMapCanvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  const width = rect.width;
  const height = rect.height;

  for (const zone of cityZones) {
    const x = zone.x * width;
    const y = zone.y * height;
    const dx = clickX - x;
    const dy = clickY - y;
    if (Math.sqrt(dx * dx + dy * dy) <= 26) {
      return zone.id;
    }
  }
  return '';
}

function renderSuggestedPeople() {
  if (!suggestedPeopleNode) return;
  const seen = new Set();
  const suggested = [];

  for (const post of posts) {
    if (seen.has(post.handle) || followingHandles.has(post.handle)) continue;
    seen.add(post.handle);
    suggested.push({ author: post.author, handle: post.handle, roomId: post.roomId });
    if (suggested.length >= 5) break;
  }

  suggestedPeopleNode.innerHTML = '';
  if (!suggested.length) {
    suggestedPeopleNode.innerHTML = '<article class="person-card"><div><strong>No new people</strong><span>You follow most active members</span></div></article>';
    return;
  }

  for (const person of suggested) {
    const card = document.createElement('article');
    card.className = 'person-card';
    card.innerHTML = `
      <div>
        <strong>${person.author}</strong>
        <span>${person.handle}</span>
      </div>
      <button type="button">Follow</button>
    `;

    card.querySelector('button')?.addEventListener('click', () => {
      followingHandles.add(person.handle);
      renderAll();
    });

    suggestedPeopleNode.appendChild(card);
  }
}

function renderStories() {
  storiesNode.innerHTML = '';
  const seen = new Set();
  for (const post of posts) {
    if (seen.has(post.author)) continue;
    seen.add(post.author);
    const card = document.createElement('article');
    card.className = 'story';
    card.innerHTML = `<strong>${post.author}</strong><span>${post.tags[0] || '#smartworld'} story update</span>`;
    storiesNode.appendChild(card);
  }
}

function renderTrends() {
  const counter = new Map();
  for (const post of posts) {
    for (const tag of post.tags) {
      counter.set(tag, (counter.get(tag) || 0) + 1);
    }
  }

  const top = Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  trendsNode.innerHTML = '';
  for (const [tag, count] of top) {
    const row = document.createElement('article');
    row.className = 'trend';
    row.innerHTML = `<strong>${tag}</strong><span>${count} mentions</span>`;
    trendsNode.appendChild(row);
  }
}

function renderPulse() {
  const activeRoom = getActiveRoom();
  if (!activeRoom) {
    pulseNode.innerHTML = '';
    return;
  }
  const roomPosts = posts.filter((post) => post.roomId === activeRoom.id);
  const totalLikes = roomPosts.reduce((sum, post) => sum + post.likes, 0);
  const totalComments = roomPosts.reduce((sum, post) => sum + post.comments.length, 0);
  const totalAttachments = roomPosts.reduce((sum, post) => sum + (post.attachments ? post.attachments.length : 0), 0);

  const rows = [
    { title: 'Room Posts', value: String(roomPosts.length) },
    { title: 'Room Likes', value: String(totalLikes) },
    { title: 'Comments', value: String(totalComments) },
    { title: 'Files Shared', value: String(totalAttachments) }
  ];

  pulseNode.innerHTML = '';
  for (const item of rows) {
    const row = document.createElement('article');
    row.className = 'pulse-item';
    row.innerHTML = `<strong>${item.title}</strong><span>${item.value}</span>`;
    pulseNode.appendChild(row);
  }
}

function renderAttachment(attachment) {
  const safeName = attachment.name || 'file';
  const type = attachment.type || 'application/octet-stream';
  const url = attachment.dataUrl;

  if (!url) {
    return `<div class="attachment"><a href="#">${safeName} (metadata only)</a></div>`;
  }

  if (type.startsWith('image/')) {
    return `<div class="attachment"><img src="${url}" alt="${safeName}" /></div>`;
  }
  if (type.startsWith('audio/')) {
    return `<div class="attachment"><audio controls src="${url}"></audio></div>`;
  }
  if (type.startsWith('video/')) {
    return `<div class="attachment"><video controls src="${url}"></video></div>`;
  }
  return `<div class="attachment"><a href="${url}" download="${safeName}">${safeName}</a></div>`;
}

function renderFeed() {
  const visible = getFilteredPosts();
  feedNode.innerHTML = '';

  if (!visible.length) {
    const empty = document.createElement('article');
    empty.className = 'post';
    empty.innerHTML = '<div class="post-body">No matching posts in this room. Start a room update.</div>';
    feedNode.appendChild(empty);
    return;
  }

  for (const post of visible) {
    const postEl = document.createElement('article');
    postEl.className = 'post';
    const authorInitials = post.author
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const commentsHtml = post.comments.map((c) => `<div class="comment">${c}</div>`).join('');
    const tagsHtml = post.tags.map((tag) => `<span class="tag">${tag}</span>`).join('');
    const attachmentsHtml = (post.attachments || []).map(renderAttachment).join('');
    const room = rooms.find((r) => r.id === post.roomId);
    const reposts = Number.isFinite(post.reposts) ? post.reposts : 0;
    const shares = Number.isFinite(post.shares) ? post.shares : 0;
    const zone = zoneById(post.zoneId);

    postEl.innerHTML = `
      <div class="post-head">
        <div class="author-row">
          <div class="avatar">${authorInitials || 'SW'}</div>
          <div>
            <strong>${post.author}</strong>
            <span class="handle">${post.handle}</span>
          </div>
        </div>
        <span>${timeAgo(post.createdAt)}</span>
      </div>
      <div class="post-body">${post.text}</div>
      <div class="post-room">Room: ${room ? room.name : 'General'} <span class="zone-chip">${zone.name}</span></div>
      <div class="tags">${tagsHtml}</div>
      <div class="attachments">${attachmentsHtml}</div>
      <div class="post-actions">
        <button class="action-btn like-btn" data-id="${post.id}">${likedPosts.has(post.id) ? 'Unlike' : 'Like'} (${post.likes})</button>
        <button class="social-btn repost-btn" data-id="${post.id}">Repost (${reposts})</button>
        <button class="social-btn share-btn" data-id="${post.id}">Share (${shares})</button>
      </div>
      <form class="comment-row" data-id="${post.id}">
        <input type="text" placeholder="Write a comment" maxlength="180" />
        <button type="submit">Reply</button>
      </form>
      <div class="comments">${commentsHtml}</div>
    `;

    const likeBtn = postEl.querySelector('.like-btn');
    likeBtn?.addEventListener('click', () => {
      const target = posts.find((p) => p.id === post.id);
      if (!target) return;
      if (likedPosts.has(post.id)) {
        likedPosts.delete(post.id);
        target.likes = Math.max(0, target.likes - 1);
      } else {
        likedPosts.add(post.id);
        target.likes += 1;
      }
      saveJson(STORAGE_LIKES, Array.from(likedPosts));
      saveJson(STORAGE_POSTS, posts);
      renderAll();
    });

    const repostBtn = postEl.querySelector('.repost-btn');
    repostBtn?.addEventListener('click', () => {
      const target = posts.find((p) => p.id === post.id);
      if (!target) return;
      target.reposts = (target.reposts || 0) + 1;
      saveJson(STORAGE_POSTS, posts);
      renderAll();
    });

    const shareBtn = postEl.querySelector('.share-btn');
    shareBtn?.addEventListener('click', async () => {
      const target = posts.find((p) => p.id === post.id);
      if (!target) return;
      target.shares = (target.shares || 0) + 1;
      saveJson(STORAGE_POSTS, posts);

      const shareText = `${post.author}: ${post.text.slice(0, 130)}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(shareText);
        } catch {
          // no-op
        }
      }

      renderAll();
    });

    const commentForm = postEl.querySelector('.comment-row');
    commentForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = commentForm.querySelector('input');
      const value = input && input.value ? input.value.trim() : '';
      if (!value) return;
      const target = posts.find((p) => p.id === post.id);
      if (!target) return;
      target.comments.unshift(value);
      if (target.comments.length > 8) {
        target.comments.pop();
      }
      saveJson(STORAGE_POSTS, posts);
      renderAll();
    });

    feedNode.appendChild(postEl);
  }
}

async function filesToAttachments(fileList) {
  const items = [];
  const files = Array.from(fileList || []);
  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_SIZE) {
      items.push({ name: file.name, type: file.type || 'application/octet-stream', dataUrl: '' });
      continue;
    }

    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });

    items.push({
      name: file.name,
      type: file.type || 'application/octet-stream',
      dataUrl
    });
  }
  return items;
}

function renderAll() {
  renderRooms();
  renderStories();
  renderSuggestedPeople();
  renderZoneStats();
  renderSignalFeed();
  renderTrends();
  renderPulse();
  renderFeed();
  renderCityMap();
}

postForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const author = (authorInput?.value || '').trim();
  const text = (postInput?.value || '').trim();
  const rawTags = (tagsInput?.value || '').trim();

  if (!author || !text) return;

  const tags = rawTags
    ? rawTags.split(/\s+/).map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
    : ['#update'];

  const attachments = await filesToAttachments(fileInput?.files);

  posts.unshift({
    id: crypto.randomUUID(),
    roomId: activeRoomId,
    zoneId: activeZoneId || inferZoneFromRoom(activeRoomId),
    author,
    handle: `@${author.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 12) || 'user'}`,
    text,
    tags,
    attachments,
    likes: 0,
    comments: [],
    createdAt: Date.now()
  });

  if (posts.length > 120) {
    posts = posts.slice(0, 120);
  }

  saveJson(STORAGE_POSTS, posts);
  if (postInput) postInput.value = '';
  if (tagsInput) tagsInput.value = '';
  if (fileInput) fileInput.value = '';
  renderAll();
});

roomForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = (roomNameInput?.value || '').trim();
  if (!name) return;

  const room = {
    id: crypto.randomUUID(),
    name,
    participants: 3 + Math.floor(Math.random() * 18)
  };

  rooms.unshift(room);
  activeRoomId = room.id;
  localStorage.setItem(STORAGE_ACTIVE_ROOM, room.id);
  saveJson(STORAGE_ROOMS, rooms);
  if (roomNameInput) roomNameInput.value = '';
  updateActiveRoomLabel();
  renderAll();
});

searchInput?.addEventListener('input', () => {
  query = searchInput.value || '';
  renderFeed();
});

tabForYou?.addEventListener('click', () => {
  feedMode = 'for-you';
  tabForYou.classList.add('active');
  tabFollowing?.classList.remove('active');
  renderFeed();
});

tabFollowing?.addEventListener('click', () => {
  feedMode = 'following';
  tabFollowing.classList.add('active');
  tabForYou?.classList.remove('active');
  renderFeed();
});

mapModeSelect?.addEventListener('change', () => {
  renderCityMap();
});

clearZoneFilterBtn?.addEventListener('click', () => {
  activeZoneId = '';
  updateZoneFilterLabel();
  renderAll();
});

cityMapCanvas?.addEventListener('click', (event) => {
  const zoneId = hitZoneFromCanvas(event);
  if (!zoneId) return;
  activeZoneId = zoneId;
  updateZoneFilterLabel();
  renderAll();
});

window.addEventListener('resize', () => {
  renderCityMap();
});

if (!rooms.some((room) => room.id === activeRoomId) && rooms[0]) {
  activeRoomId = rooms[0].id;
}
normalizePosts();
saveJson(STORAGE_POSTS, posts);
updateActiveRoomLabel();
updateZoneFilterLabel();
renderAll();
setInterval(renderCityMap, 1800);

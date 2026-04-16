const desktop = document.querySelector('#desktop');
const appIcons = document.querySelectorAll('.app-icon');
const appWindow = document.querySelector('#appWindow');
const appFrame = document.querySelector('#appFrame');
const windowTitle = document.querySelector('#windowTitle');
const windowBar = document.querySelector('#windowBar');
const btnClose = document.querySelector('#btnClose');
const btnMin = document.querySelector('#btnMin');
const btnMax = document.querySelector('#btnMax');
const resizeE = document.querySelector('#resizeE');
const resizeS = document.querySelector('#resizeS');
const resizeSE = document.querySelector('#resizeSE');
const taskbarApps = document.querySelector('#taskbarApps');
const quickOpenButtons = document.querySelectorAll('.quick-open');
const qtToggle = document.querySelector('#qtToggle');
const qtList   = document.querySelector('#qtList');

if (qtToggle && qtList) {
  qtToggle.addEventListener('click', () => {
    const isOpen = qtToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      qtList.classList.add('qt-closing');
      qtList.classList.remove('qt-open');
      qtList.addEventListener('animationend', () => {
        qtList.hidden = true;
        qtList.classList.remove('qt-closing');
      }, { once: true });
      qtToggle.setAttribute('aria-expanded', 'false');
    } else {
      qtList.hidden = false;
      // force reflow so animation re-triggers
      void qtList.offsetWidth;
      qtList.classList.add('qt-open');
      qtToggle.setAttribute('aria-expanded', 'true');
    }
  });
}
const topClock = document.querySelector('#topClock');
const widgetClock = document.querySelector('#widgetClock');

const startPill = document.querySelector('#startPill');
const osSearch = document.querySelector('.os-search');
const superBadge = document.querySelector('#superBadge');
const iconMenu = document.querySelector('#iconMenu');
const unhideLastBtn = document.querySelector('#unhideLastBtn');
const aiOrbBtn = document.querySelector('#aiOrbBtn');

const ICON_POSITIONS_KEY = 'smartworld.os.iconPositions.v1';
const DESKTOP_BG_KEY = 'und-desktop-bg';
const APP_VISIBILITY_KEY = 'smartworld.os.appVisibility.v1';
const GLOBAL_POLICY_USER = '__global';
const DEFAULT_BG_BY_TENANT = {
  und: './background/Smart%20World.jpg'
};
const TENANT_DEFAULT_APPS = {
  municipal_grandforks: ['gf-twin', 'water-treatment']
};

const applyDesktopBg = () => {
  const bgImg = document.querySelector('#desktopBgImg');
  const bgVideo = document.querySelector('.desktop-video');
  let raw = localStorage.getItem(DESKTOP_BG_KEY);

  // If no custom bg saved, use tenant default
  if (!raw && window.SmartWorldAuth && typeof window.SmartWorldAuth.getTenantId === 'function') {
    const tenantId = window.SmartWorldAuth.getTenantId();
    if (DEFAULT_BG_BY_TENANT[tenantId]) {
      raw = DEFAULT_BG_BY_TENANT[tenantId];
    }
  }

  if (raw) {
    if (bgImg) {
      bgImg.src = raw;
      bgImg.classList.add('active');
    }
    if (bgVideo) bgVideo.style.display = 'none';
    if (desktop) desktop.classList.add('has-bg-image');
  } else {
    if (bgImg) {
      bgImg.src = '';
      bgImg.classList.remove('active');
    }
    if (bgVideo) bgVideo.style.display = '';
    if (desktop) desktop.classList.remove('has-bg-image');
  }
};

let openApps = [];
let activeAppId = null;
let isMaximized = false;
let restoreRect = null;
let menuIconAppId = null;
let lastHiddenAppId = null;



const simpleAiInit = () => {
  return true;
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getScaleFromWindow = () => {
  const widthScale = window.innerWidth / 1366;
  const heightScale = window.innerHeight / 768;
  return clamp(Math.min(widthScale, heightScale), 0.78, 1);
};

const applyOsResponsiveScale = () => {
  const scale = getScaleFromWindow();
  document.documentElement.style.setProperty('--ui-scale', String(scale));
};

const applyFrameResponsiveScale = () => {
  if (!appFrame || !appWindow || appWindow.classList.contains('hidden')) {
    return;
  }

  let contentBody = null;
  try {
    contentBody = appFrame.contentDocument && appFrame.contentDocument.body;
  } catch {
    contentBody = null;
  }

  if (!contentBody) {
    return;
  }

  const frameRect = appFrame.getBoundingClientRect();
  const widthScale = frameRect.width / 980;
  const heightScale = frameRect.height / 620;
  const scale = clamp(Math.min(widthScale, heightScale), 0.78, 1);

  // Keep app internals proportional to the available app window size.
  contentBody.style.zoom = String(scale);
  contentBody.style.transformOrigin = 'top left';
};

applyOsResponsiveScale();

if (startPill && window.SmartWorldAuth && typeof window.SmartWorldAuth.getTenant === 'function') {
  const tenant = window.SmartWorldAuth.getTenant();
  if (tenant && tenant.label) {
    startPill.textContent = tenant.label;
  }
}

const showWindow = () => {
  if (!appWindow) {
    return;
  }
  appWindow.classList.remove('hidden');
};

const minimizeWindow = () => {
  if (!appWindow) {
    return;
  }
  appWindow.classList.add('hidden');
};

const widgetDate = document.querySelector('#widgetDate');

// ── 3-D Globe widget ─────────────────────────────────────────────────────────
(function initGlobe() {
  const canvas = document.querySelector('#widgetGlobe');
  if (!canvas || !window.THREE) return;

  const W = 198, H = 198;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.z = 2.2;

  // Ambient + directional light
  scene.add(new THREE.AmbientLight(0xaacfff, 0.7));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(5, 3, 5);
  scene.add(sun);

  // Sphere
  const geo = new THREE.SphereGeometry(1, 64, 64);

  // Load Earth texture from a reliable public CDN
  const loader = new THREE.TextureLoader();
  loader.crossOrigin = 'anonymous';
  const earthTex = loader.load(
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    undefined, undefined,
    () => { mat.color.set(0x1a4a7a); } // fallback colour if texture fails
  );
  const mat = new THREE.MeshPhongMaterial({
    map: earthTex,
    specular: new THREE.Color(0x333333),
    shininess: 18
  });
  const globe = new THREE.Mesh(geo, mat);
  scene.add(globe);

  // Atmosphere glow (additive blending shell)
  const atmMat = new THREE.MeshPhongMaterial({
    color: 0x3399ff,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide
  });
  const atm = new THREE.Mesh(new THREE.SphereGeometry(1.06, 32, 32), atmMat);
  scene.add(atm);

  // Auto-rotation + drag
  let autoRotY = 0.003;
  let isDragging = false, lastX = 0, lastY = 0;
  let velX = 0, velY = 0;

  canvas.addEventListener('pointerdown', e => {
    isDragging = true; lastX = e.clientX; lastY = e.clientY;
    velX = velY = 0;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (!isDragging) return;
    velX = (e.clientX - lastX) * 0.008;
    velY = (e.clientY - lastY) * 0.008;
    globe.rotation.y += velX;
    globe.rotation.x += velY;
    lastX = e.clientX; lastY = e.clientY;
  });
  canvas.addEventListener('pointerup', () => { isDragging = false; });

  // Render loop
  (function animate() {
    requestAnimationFrame(animate);
    if (!isDragging) {
      globe.rotation.y += autoRotY + velX * 0.92;
      globe.rotation.x += velY * 0.92;
      velX *= 0.92; velY *= 0.92;
    }
    renderer.render(scene, camera);
  }());
}());
const wWeatherIcon = document.querySelector('#wWeatherIcon');
const wWeatherTemp = document.querySelector('#wWeatherTemp');
const wWeatherDesc = document.querySelector('#wWeatherDesc');
const wWeatherLoc  = document.querySelector('#wWeatherLoc');

const updateClocks = () => {
  const now = new Date();
  const timeVal = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateVal = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  if (topClock)    topClock.textContent = timeVal;
  if (widgetClock) widgetClock.textContent = timeVal;
  if (widgetDate)  widgetDate.textContent = dateVal;
};
updateClocks();
setInterval(updateClocks, 1000);

// Weather via Open-Meteo (no API key needed)
(function fetchWeather() {
  // Grand Forks, ND coordinates
  const lat = 47.9253, lon = -97.0329;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit`;

  const WMO_ICONS = {
    0:'☀️', 1:'🌤', 2:'⛅', 3:'☁️',
    45:'🌫', 48:'🌫',
    51:'🌦', 53:'🌦', 55:'🌧',
    61:'🌧', 63:'🌧', 65:'🌧',
    71:'🌨', 73:'🌨', 75:'❄️',
    80:'🌦', 81:'🌧', 82:'⛈',
    95:'⛈', 96:'⛈', 99:'⛈'
  };
  const WMO_DESC = {
    0:'Clear sky', 1:'Mainly clear', 2:'Partly cloudy', 3:'Overcast',
    45:'Foggy', 48:'Icy fog',
    51:'Light drizzle', 53:'Drizzle', 55:'Heavy drizzle',
    61:'Light rain', 63:'Rain', 65:'Heavy rain',
    71:'Light snow', 73:'Snow', 75:'Heavy snow',
    80:'Rain showers', 81:'Rain showers', 82:'Violent showers',
    95:'Thunderstorm', 96:'Thunderstorm', 99:'Thunderstorm'
  };

  fetch(url)
    .then(r => r.json())
    .then(data => {
      const cw = data && data.current_weather;
      if (!cw) return;
      const code = cw.weathercode;
      if (wWeatherIcon) wWeatherIcon.textContent = WMO_ICONS[code] || '🌡';
      if (wWeatherTemp) wWeatherTemp.textContent = Math.round(cw.temperature) + '°F';
      if (wWeatherDesc) wWeatherDesc.textContent = WMO_DESC[code] || 'Weather';
    })
    .catch(() => {
      if (wWeatherDesc) wWeatherDesc.textContent = 'Unavailable';
    });

  // refresh every 10 min
  setTimeout(fetchWeather, 10 * 60 * 1000);
}());

const renderTaskbarApp = () => {
  if (!taskbarApps) {
    return;
  }
  taskbarApps.innerHTML = '';
  if (!openApps.length) {
    return;
  }

  for (const item of openApps) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'task-app';
    if (item.id === activeAppId) {
      btn.classList.add('active');
    }
    btn.textContent = item.title;
    btn.addEventListener('click', () => {
      if (!appWindow || !appFrame || !windowTitle) {
        return;
      }

      const isActive = item.id === activeAppId;
      if (isActive && !appWindow.classList.contains('hidden')) {
        minimizeWindow();
        return;
      }

      activeAppId = item.id;
      appFrame.src = item.target;
      windowTitle.textContent = item.title;
      showWindow();
      applyFrameResponsiveScale();
      renderTaskbarApp();
    });
    taskbarApps.appendChild(btn);
  }
};

const openInWindow = (target, title, appId) => {
  if (!appWindow || !appFrame || !windowTitle) {
    return;
  }

  const id = appId || target;
  const existing = openApps.find((item) => item.id === id);
  if (existing) {
    existing.target = target;
    existing.title = title || existing.title || 'App';
  } else {
    openApps.push({ id, target, title: title || 'App' });
  }

  activeAppId = id;
  appFrame.src = target;
  windowTitle.textContent = title || 'App';
  appWindow.classList.remove('maximized');
  isMaximized = false;
  restoreRect = null;
  if (btnMax) {
    btnMax.textContent = '[]';
  }
  showWindow();
  renderTaskbarApp();
  applyFrameResponsiveScale();
};

const appIndex = Array.from(appIcons).map((icon) => {
  const labelNode = icon.querySelector('p');
  const title = labelNode ? (labelNode.textContent || '').trim() : 'App';
  const target = icon.getAttribute('data-target') || '';
  const appId = icon.getAttribute('data-app') || '';
  return {
    icon,
    title,
    target,
    appId,
    defaultLeft: icon.style.left || '',
    defaultTop: icon.style.top || '',
    searchText: `${title} ${appId} ${target}`.toLowerCase()
  };
});

const hideIconMenu = () => {
  if (!iconMenu) {
    return;
  }
  iconMenu.classList.add('hidden');
  menuIconAppId = null;
};

const showIconMenu = (icon, event) => {
  if (!iconMenu || !desktop) {
    return;
  }

  event.preventDefault();
  const appId = icon.getAttribute('data-app') || '';
  menuIconAppId = appId;

  iconMenu.classList.remove('hidden');
  if (unhideLastBtn) {
    unhideLastBtn.disabled = !lastHiddenAppId;
  }
  const desktopRect = desktop.getBoundingClientRect();
  const menuWidth = 180;
  const menuHeight = 132;
  const left = Math.min(Math.max(0, event.clientX - desktopRect.left), Math.max(0, desktopRect.width - menuWidth));
  const top = Math.min(Math.max(0, event.clientY - desktopRect.top), Math.max(0, desktopRect.height - menuHeight));
  iconMenu.style.left = `${left}px`;
  iconMenu.style.top = `${top}px`;
};

const safeReadJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const getCurrentUser = () => {
  if (!window.SmartWorldAuth || typeof window.SmartWorldAuth.getUser !== 'function') {
    return 'anonymous';
  }
  return window.SmartWorldAuth.getUser() || 'anonymous';
};

const getVisibilityKey = () => `${APP_VISIBILITY_KEY}.${getCurrentUser()}`;
const getGlobalVisibilityKey = () => `${APP_VISIBILITY_KEY}.${GLOBAL_POLICY_USER}`;

const hideAppForCurrentLocation = (appId) => {
  const tenantId = getTenantId();
  const matrix = safeReadJson(getVisibilityKey(), {});
  if (!matrix[tenantId]) {
    matrix[tenantId] = {};
  }
  matrix[tenantId][appId] = false;
  localStorage.setItem(getVisibilityKey(), JSON.stringify(matrix));
  lastHiddenAppId = appId;
};

const unhideAppForCurrentLocation = (appId) => {
  if (!appId) {
    return;
  }
  const tenantId = getTenantId();
  const matrix = safeReadJson(getVisibilityKey(), {});
  if (!matrix[tenantId]) {
    matrix[tenantId] = {};
  }
  matrix[tenantId][appId] = true;
  localStorage.setItem(getVisibilityKey(), JSON.stringify(matrix));
};

const getTenantId = () => {
  if (!window.SmartWorldAuth || typeof window.SmartWorldAuth.getTenant !== 'function') {
    return 'und';
  }
  const tenant = window.SmartWorldAuth.getTenant();
  return tenant && tenant.id ? tenant.id : 'und';
};

const isSuperUser = () => Boolean(window.SmartWorldAuth && typeof window.SmartWorldAuth.isSuperUser === 'function' && window.SmartWorldAuth.isSuperUser());

const getQuickToolAppId = (button) => {
  const target = button.getAttribute('data-open') || '';
  if (target.includes('/chatbot/')) return 'chatbot';
  if (target.includes('/python-computer/')) return 'python';
  if (target.includes('/control-center/')) return 'control';
  if (target.includes('/agent-market/')) return 'market';
  if (target.includes('/smarket/')) return 'smarket';
  if (target.includes('/simulation-lab/')) return 'simlab';
  if (target.includes('/grand-forks-twin/')) return 'gf-twin';
  if (target.includes('/team/team.html')) return 'teamhub';
  if (target.includes('/campus/')) return 'campus';
  if (target.includes('/ai-adoption/')) return 'ai-adoption';
  if (target.includes('/gf-water-treatment/')) return 'water-treatment';
  if (target.includes('/social-media/')) return 'social';
  if (target.includes('/ait-transfer/')) return 'ait-transfer';
  if (target.includes('/code-studio/')) return 'code-studio';
  return null;
};

const applyAppPermissions = () => {
  const tenantId = getTenantId();
  const globalMatrix = safeReadJson(getGlobalVisibilityKey(), {});
  const userMatrix = safeReadJson(getVisibilityKey(), {});
  const globalTenantRules = globalMatrix[tenantId] || {};
  const userTenantRules = userMatrix[tenantId] || {};
  const defaults = TENANT_DEFAULT_APPS[tenantId] || appIndex.map((entry) => entry.appId);
  const visible = new Set(defaults);

  if (!isSuperUser()) {
    for (const appId of Object.keys(globalTenantRules)) {
      if (globalTenantRules[appId]) {
        visible.add(appId);
      } else {
        visible.delete(appId);
      }
    }

    for (const appId of Object.keys(userTenantRules)) {
      if (userTenantRules[appId]) {
        visible.add(appId);
      } else {
        visible.delete(appId);
      }
    }
  }

  for (const entry of appIndex) {
    const permitted = isSuperUser() ? true : visible.has(entry.appId);
    entry.icon.dataset.permitted = permitted ? '1' : '0';
    entry.icon.style.display = permitted ? '' : 'none';
  }

  const restrictedTenant = Boolean(TENANT_DEFAULT_APPS[tenantId]);
  for (const button of quickOpenButtons) {
    const appId = getQuickToolAppId(button);
    const permitted = isSuperUser() || (appId ? visible.has(appId) : !restrictedTenant);
    button.style.display = permitted ? '' : 'none';
  }
};

const saveIconPositions = () => {
  const payload = {};
  for (const entry of appIndex) {
    const { icon, appId } = entry;
    if (!appId) continue;
    payload[appId] = {
      left: icon.style.left || '',
      top: icon.style.top || ''
    };
  }
  try {
    localStorage.setItem(ICON_POSITIONS_KEY, JSON.stringify(payload));
  } catch {
    // Best-effort persistence only.
  }
};

const loadIconPositions = () => {
  try {
    const raw = localStorage.getItem(ICON_POSITIONS_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    for (const entry of appIndex) {
      const { icon, appId } = entry;
      const saved = data[appId];
      if (!saved) continue;
      if (typeof saved.left === 'string' && saved.left) {
        icon.style.left = saved.left;
      }
      if (typeof saved.top === 'string' && saved.top) {
        icon.style.top = saved.top;
      }
    }
  } catch {
    // Ignore invalid storage payloads.
  }
};

const filterApps = (queryRaw) => {
  const query = (queryRaw || '').trim().toLowerCase();
  let firstVisible = null;

  for (const entry of appIndex) {
    const permitted = entry.icon.dataset.permitted !== '0';
    const isMatch = permitted && (!query || entry.searchText.includes(query));
    entry.icon.style.display = isMatch ? '' : 'none';
    if (!firstVisible && isMatch) {
      firstVisible = entry;
    }
  }

  return firstVisible;
};

applyAppPermissions();
loadIconPositions();

if (superBadge) {
  superBadge.classList.toggle('hidden', !isSuperUser());
}

if (appFrame) {
  appFrame.addEventListener('load', () => {
    applyFrameResponsiveScale();
  });
}

if (btnClose && appWindow && appFrame) {
  btnClose.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
  });
  btnClose.addEventListener('click', () => {
    const closingId = activeAppId;
    openApps = openApps.filter((item) => item.id !== closingId);
    activeAppId = openApps.length ? openApps[openApps.length - 1].id : null;

    if (activeAppId) {
      const next = openApps.find((item) => item.id === activeAppId);
      if (next) {
        appFrame.src = next.target;
        windowTitle.textContent = next.title;
      }
      renderTaskbarApp();
      return;
    }

    appWindow.classList.add('hidden');
    appFrame.src = 'about:blank';
    renderTaskbarApp();
  });
}

if (btnMin && appWindow) {
  btnMin.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
  });
  btnMin.addEventListener('click', () => {
    minimizeWindow();
    renderTaskbarApp();
  });
}

if (btnMax && appWindow) {
  btnMax.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
  });

  btnMax.addEventListener('click', () => {
    if (!isMaximized) {
      const rect = appWindow.getBoundingClientRect();
      restoreRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
      appWindow.classList.add('maximized');
      btnMax.textContent = 'R';
      isMaximized = true;
      applyFrameResponsiveScale();
      return;
    }

    appWindow.classList.remove('maximized');
    if (restoreRect) {
      appWindow.style.left = `${restoreRect.left}px`;
      appWindow.style.top = `${restoreRect.top}px`;
      appWindow.style.width = `${restoreRect.width}px`;
      appWindow.style.height = `${restoreRect.height}px`;
    }
    btnMax.textContent = '[]';
    isMaximized = false;
    applyFrameResponsiveScale();
  });
}

for (const button of quickOpenButtons) {
  button.addEventListener('click', () => {
    const target = button.getAttribute('data-open');
    const title = button.getAttribute('data-title') || 'App';
    if (target) {
      openInWindow(target, title, target);
    }
  });
}

if (windowBar && appWindow) {
  let wDragging = false;
  let wStartX = 0;
  let wStartY = 0;
  let wOriginX = 0;
  let wOriginY = 0;

  windowBar.addEventListener('pointerdown', (event) => {
    const rect = appWindow.getBoundingClientRect();
    wStartX = event.clientX;
    wStartY = event.clientY;
    wOriginX = rect.left;
    wOriginY = rect.top;
    wDragging = true;
    windowBar.setPointerCapture(event.pointerId);
  });

  windowBar.addEventListener('pointermove', (event) => {
    if (!wDragging) {
      return;
    }
    const deltaX = event.clientX - wStartX;
    const deltaY = event.clientY - wStartY;
    if (isMaximized) {
      appWindow.classList.remove('maximized');
      isMaximized = false;
      if (btnMax) {
        btnMax.textContent = '[]';
      }
      if (restoreRect) {
        appWindow.style.left = `${restoreRect.left}px`;
        appWindow.style.top = `${restoreRect.top}px`;
        appWindow.style.width = `${restoreRect.width}px`;
        appWindow.style.height = `${restoreRect.height}px`;
      }
    }
    const nextX = Math.min(Math.max(0, wOriginX + deltaX), window.innerWidth - appWindow.offsetWidth);
    const nextY = Math.min(Math.max(0, wOriginY + deltaY), desktop.clientHeight - appWindow.offsetHeight);
    appWindow.style.left = `${nextX}px`;
    appWindow.style.top = `${nextY}px`;
    applyFrameResponsiveScale();
  });

  windowBar.addEventListener('pointerup', (event) => {
    wDragging = false;
    if (windowBar.hasPointerCapture(event.pointerId)) {
      windowBar.releasePointerCapture(event.pointerId);
    }
  });
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && appWindow && !appWindow.classList.contains('hidden')) {
    minimizeWindow();
    renderTaskbarApp();
  }
});

if (appWindow) {
  const minWidth = 360;
  const minHeight = 240;

  const bindResize = (handle, mode) => {
    if (!handle) {
      return;
    }

    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    let resizing = false;

    handle.addEventListener('pointerdown', (event) => {
      const rect = appWindow.getBoundingClientRect();
      startX = event.clientX;
      startY = event.clientY;
      startWidth = rect.width;
      startHeight = rect.height;
      resizing = true;
      handle.setPointerCapture(event.pointerId);
    });

    handle.addEventListener('pointermove', (event) => {
      if (!resizing) {
        return;
      }

      if (isMaximized) {
        appWindow.classList.remove('maximized');
        isMaximized = false;
        if (btnMax) {
          btnMax.textContent = '[]';
        }
        if (restoreRect) {
          appWindow.style.left = `${restoreRect.left}px`;
          appWindow.style.top = `${restoreRect.top}px`;
          appWindow.style.width = `${restoreRect.width}px`;
          appWindow.style.height = `${restoreRect.height}px`;
          startWidth = restoreRect.width;
          startHeight = restoreRect.height;
        }
      }

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      const maxWidth = window.innerWidth - appWindow.offsetLeft;
      const maxHeight = desktop.clientHeight - appWindow.offsetTop;

      if (mode === 'e' || mode === 'se') {
        const nextWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + deltaX));
        appWindow.style.width = `${nextWidth}px`;
      }

      if (mode === 's' || mode === 'se') {
        const nextHeight = Math.min(maxHeight, Math.max(minHeight, startHeight + deltaY));
        appWindow.style.height = `${nextHeight}px`;
      }

      applyFrameResponsiveScale();
    });

    handle.addEventListener('pointerup', (event) => {
      resizing = false;
      handle.releasePointerCapture(event.pointerId);
    });
  };

  bindResize(resizeE, 'e');
  bindResize(resizeS, 's');
  bindResize(resizeSE, 'se');
}

for (const icon of appIcons) {
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  let dragging = false;
  let moved = false;

  icon.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) {
      return;
    }
    const rect = icon.getBoundingClientRect();
    startX = event.clientX;
    startY = event.clientY;
    originX = rect.left;
    originY = rect.top;
    dragging = true;
    moved = false;
    icon.classList.add('dragging');
    icon.setPointerCapture(event.pointerId);
  });

  icon.addEventListener('pointermove', (event) => {
    if (!dragging) {
      return;
    }

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      moved = true;
    }

    const nextX = Math.min(Math.max(0, originX + deltaX), window.innerWidth - icon.offsetWidth);
    const nextY = Math.min(Math.max(0, originY + deltaY), desktop.clientHeight - icon.offsetHeight);

    icon.style.left = `${nextX}px`;
    icon.style.top = `${nextY}px`;
  });

  icon.addEventListener('pointerup', (event) => {
    dragging = false;
    icon.classList.remove('dragging');
    if (icon.hasPointerCapture(event.pointerId)) {
      icon.releasePointerCapture(event.pointerId);
    }

    if (!moved) {
      const target = icon.getAttribute('data-target');
      if (target) {
        const title = icon.querySelector('p') ? icon.querySelector('p').textContent : 'App';
        const appId = icon.getAttribute('data-app') || target;
        openInWindow(target, title, appId);
      }
    } else {
      saveIconPositions();
    }
  });

  icon.addEventListener('contextmenu', (event) => {
    showIconMenu(icon, event);
  });
}

if (iconMenu) {
  iconMenu.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    const action = button.getAttribute('data-action');

    if (action === 'unhide-last') {
      unhideAppForCurrentLocation(lastHiddenAppId);
      lastHiddenAppId = null;
      applyAppPermissions();
      if (osSearch && osSearch.value.trim()) {
        filterApps(osSearch.value);
      }
      hideIconMenu();
      return;
    }

    if (!menuIconAppId) {
      return;
    }

    const entry = appIndex.find((item) => item.appId === menuIconAppId);
    if (!entry) {
      hideIconMenu();
      return;
    }

    if (action === 'open' && entry.target) {
      openInWindow(entry.target, entry.title, entry.appId || entry.target);
    }

    if (action === 'reset') {
      entry.icon.style.left = entry.defaultLeft;
      entry.icon.style.top = entry.defaultTop;
      saveIconPositions();
    }

    if (action === 'hide') {
      hideAppForCurrentLocation(entry.appId);
      applyAppPermissions();
      if (osSearch && osSearch.value.trim()) {
        filterApps(osSearch.value);
      }
    }

    hideIconMenu();
  });
}

desktop?.addEventListener('pointerdown', (event) => {
  const target = event && event.target ? event.target : null;
  const inIcon = Boolean(target && target.closest && target.closest('#iconMenu'));
  if (!inIcon) {
    hideIconMenu();
  }
});

window.addEventListener('blur', () => {
  hideIconMenu();
  hideAiMenu();
  hideGlobalAskMenu();
});

// Simple Smart button - just opens the chatbot app
if (aiOrbBtn) {
  aiOrbBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    openInWindow('./apps/chatbot/chatbot.html', 'Chat', 'chatbot');
  });
}

if (osSearch) {
  osSearch.addEventListener('input', () => {
    filterApps(osSearch.value);
  });

  osSearch.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const firstVisible = filterApps(osSearch.value);
    if (firstVisible && firstVisible.target) {
      openInWindow(firstVisible.target, firstVisible.title, firstVisible.appId || firstVisible.target);
    }
  });
}

window.addEventListener('keydown', (event) => {
  const isCmdK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
  if (isCmdK && osSearch) {
    event.preventDefault();
    osSearch.focus();
    osSearch.select();
  }
});

window.addEventListener('resize', () => {
  applyOsResponsiveScale();
  applyFrameResponsiveScale();
});

applyDesktopBg();
simpleAiInit();

window.addEventListener('storage', (e) => {
  if (e.key === DESKTOP_BG_KEY) {
    applyDesktopBg();
  }
  if (e.key && e.key.startsWith(APP_VISIBILITY_KEY)) {
    applyAppPermissions();
    if (osSearch && osSearch.value.trim()) {
      filterApps(osSearch.value);
    }
  }
});

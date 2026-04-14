const sectionName = document.querySelector('#sectionName');
const sectionDesc = document.querySelector('#sectionDesc');
const sectionStage = document.querySelector('#sectionStage');
const sectionCoverage = document.querySelector('#sectionCoverage');
const sectionPriority = document.querySelector('#sectionPriority');
const sectionTarget = document.querySelector('#sectionTarget');
const roadmapList = document.querySelector('#roadmapList');
const sceneRoot = document.querySelector('#sceneRoot');
const mapImageInput = document.querySelector('#mapImageInput');
const mapSourceLabel = document.querySelector('#mapSourceLabel');

const STATUS_COLORS = {
  deployed: 0x27d17f,
  pilot: 0x4aa3ff,
  planned: 0xffb74d,
  none: 0x8f9eb4
};

const MAP_CONFIG = {
  centerLat: 47.9226,
  centerLon: -97.0727,
  zoom: 16,
  tileGrid: 3,
  tileSizePx: 256,
  mapSizeWorld: 13.5,
  screenshotWidth: 1832,
  screenshotHeight: 768
};

const sections = [
  {
    id: 'admin',
    name: 'Administration and Registrar',
    status: 'deployed',
    coverage: '82%',
    priority: 'Automation and governance',
    target: 'Q4 2026',
    desc: 'AI copilots are active for workflow routing, records triage, and student support ticket classification.',
    roadmap: [
      'Q2 2026: Expand policy-aware document copilot to all registrar units.',
      'Q3 2026: Add predictive workload balancing for service counters.',
      'Q4 2026: Complete compliance monitoring dashboard.'
    ],
    lat: 47.9237,
    lon: -97.0715,
    pixel: [760, 240],
    footprint: 1.05,
    height: 1.6
  },
  {
    id: 'engineering',
    name: 'Engineering and Labs',
    status: 'pilot',
    coverage: '58%',
    priority: 'Lab intelligence and simulation',
    target: 'Q1 2027',
    desc: 'Pilot AI is running for lab safety alerts, equipment booking optimization, and design-assistant workflows.',
    roadmap: [
      'Q3 2026: Instrument high-traffic labs with live risk scoring.',
      'Q4 2026: Launch AI code assistant in capstone labs.',
      'Q1 2027: Integrate simulation outputs with maintenance planning.'
    ],
    lat: 47.9228,
    lon: -97.075,
    pixel: [1085, 338],
    footprint: 1.2,
    height: 1.3
  },
  {
    id: 'library',
    name: 'Library and Learning Commons',
    status: 'deployed',
    coverage: '76%',
    priority: 'Knowledge retrieval and tutoring',
    target: 'Q4 2026',
    desc: 'AI search and recommendation engines are active for research support, citation guidance, and tutoring prompts.',
    roadmap: [
      'Q2 2026: AI subject navigator across all major repositories.',
      'Q3 2026: Multilingual accessibility assistant rollout.',
      'Q4 2026: Personalized study-path recommendation engine.'
    ],
    lat: 47.9244,
    lon: -97.0734,
    pixel: [640, 368],
    footprint: 1.1,
    height: 1.45
  },
  {
    id: 'health',
    name: 'Health Services and Wellness',
    status: 'planned',
    coverage: '24%',
    priority: 'Triage and wellbeing analytics',
    target: 'Q2 2027',
    desc: 'AI use is currently limited to planning and policy design for non-diagnostic assistance and appointment triage.',
    roadmap: [
      'Q4 2026: Deploy intake summarization with privacy controls.',
      'Q1 2027: Start counseling wait-time prediction pilot.',
      'Q2 2027: Scale campus-wide wellbeing trend dashboard.'
    ],
    lat: 47.9218,
    lon: -97.0704,
    pixel: [1418, 350],
    footprint: 0.95,
    height: 1.1
  },
  {
    id: 'facilities',
    name: 'Facilities and Energy Operations',
    status: 'pilot',
    coverage: '44%',
    priority: 'Maintenance and energy optimization',
    target: 'Q1 2027',
    desc: 'AI pilots monitor HVAC anomalies and prioritize work orders, but full building coverage is not complete yet.',
    roadmap: [
      'Q3 2026: Extend anomaly detection to all major halls.',
      'Q4 2026: Add predictive energy baseline alerts.',
      'Q1 2027: Connect AI recommendations to maintenance dispatch.'
    ],
    lat: 47.9216,
    lon: -97.0735,
    pixel: [927, 432],
    footprint: 1.15,
    height: 1.25
  },
  {
    id: 'security',
    name: 'Campus Security and Transit',
    status: 'planned',
    coverage: '31%',
    priority: 'Safety analytics and mobility',
    target: 'Q2 2027',
    desc: 'Computer vision and incident intelligence are in phased planning, with limited pilot camera analytics.',
    roadmap: [
      'Q4 2026: Pilot AI incident triage in two zones.',
      'Q1 2027: Integrate transit demand forecasting.',
      'Q2 2027: Deploy full safety command dashboard.'
    ],
    lat: 47.923,
    lon: -97.0695,
    pixel: [1302, 454],
    footprint: 1.0,
    height: 1.15
  },
  {
    id: 'humanities',
    name: 'Humanities and Social Sciences',
    status: 'none',
    coverage: '9%',
    priority: 'Faculty enablement',
    target: 'Q3 2027',
    desc: 'This section is mostly not using AI yet and needs onboarding, policy templates, and curriculum support.',
    roadmap: [
      'Q1 2027: Faculty AI literacy bootcamp.',
      'Q2 2027: Ethical AI classroom toolkit rollout.',
      'Q3 2027: Shared prompt and assessment framework.'
    ],
    lat: 47.9252,
    lon: -97.075,
    pixel: [1110, 110],
    footprint: 1.0,
    height: 0.95
  }
];

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(sceneRoot.clientWidth, sceneRoot.clientHeight);
sceneRoot.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x06162f);

const camera = new THREE.PerspectiveCamera(46, sceneRoot.clientWidth / sceneRoot.clientHeight, 0.1, 140);
camera.position.set(13, 13, 13);

scene.add(new THREE.HemisphereLight(0xb5dfff, 0x0a1833, 0.9));
const dir = new THREE.DirectionalLight(0xffffff, 0.85);
dir.position.set(16, 24, 8);
scene.add(dir);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const sectionMeshes = [];

const labelCanvas = document.createElement('canvas');
labelCanvas.width = 768;
labelCanvas.height = 140;
const labelCtx = labelCanvas.getContext('2d');
const labelTexture = new THREE.CanvasTexture(labelCanvas);
const labelSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture, transparent: true }));
labelSprite.scale.set(8.6, 1.8, 1);
labelSprite.position.set(0, 4.7, 0);
scene.add(labelSprite);

let currentMapMode = 'osm';
let mapPlane = null;
let selectedMesh = null;

const updateLabel = (text) => {
  labelCtx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
  labelCtx.fillStyle = 'rgba(4, 12, 31, 0.86)';
  labelCtx.fillRect(14, 24, 740, 92);
  labelCtx.strokeStyle = 'rgba(126, 206, 255, 0.94)';
  labelCtx.lineWidth = 3;
  labelCtx.strokeRect(14, 24, 740, 92);
  labelCtx.fillStyle = '#e8f6ff';
  labelCtx.font = '600 38px sans-serif';
  labelCtx.textAlign = 'center';
  labelCtx.fillText(text, 384, 83);
  labelTexture.needsUpdate = true;
};

const setDetails = (item) => {
  sectionName.textContent = item ? item.name : 'Campus Overview';
  sectionDesc.textContent = item
    ? item.desc
    : 'Select a section in the map to view where AI is active and where adoption has not started.';
  sectionStage.textContent = item ? item.status.toUpperCase() : 'Mixed';
  sectionCoverage.textContent = item ? item.coverage : '51%';
  sectionPriority.textContent = item ? item.priority : 'Balanced Rollout';
  sectionTarget.textContent = item ? item.target : 'Q2 2027';

  roadmapList.innerHTML = '';
  const milestones = item
    ? item.roadmap
    : [
        'Q3 2026: Complete data readiness across all colleges.',
        'Q4 2026: Expand AI pilots to support and operations teams.',
        'Q1 2027: Standardize governance, privacy, and model evaluation.',
        'Q2 2027: Achieve campus-wide adoption in priority services.'
      ];

  for (const point of milestones) {
    const li = document.createElement('li');
    li.textContent = point;
    roadmapList.appendChild(li);
  }
};

const toWorldPixel = (lat, lon, zoom) => {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const scale = Math.pow(2, zoom) * MAP_CONFIG.tileSizePx;
  const x = ((lon + 180) / 360) * scale;
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return { x, y };
};

const centerWorldPixel = toWorldPixel(MAP_CONFIG.centerLat, MAP_CONFIG.centerLon, MAP_CONFIG.zoom);

const latLonToScene = (lat, lon) => {
  const px = toWorldPixel(lat, lon, MAP_CONFIG.zoom);
  const dxTiles = (px.x - centerWorldPixel.x) / MAP_CONFIG.tileSizePx;
  const dyTiles = (px.y - centerWorldPixel.y) / MAP_CONFIG.tileSizePx;
  return {
    x: dxTiles * (MAP_CONFIG.mapSizeWorld / MAP_CONFIG.tileGrid),
    z: -dyTiles * (MAP_CONFIG.mapSizeWorld / MAP_CONFIG.tileGrid)
  };
};

const pixelToScene = (pixelX, pixelY) => {
  const nx = pixelX / MAP_CONFIG.screenshotWidth;
  const ny = pixelY / MAP_CONFIG.screenshotHeight;
  return {
    x: (nx - 0.5) * MAP_CONFIG.mapSizeWorld,
    z: (0.5 - ny) * MAP_CONFIG.mapSizeWorld
  };
};

const buildFallbackMapTexture = () => {
  const c = document.createElement('canvas');
  c.width = MAP_CONFIG.tileGrid * MAP_CONFIG.tileSizePx;
  c.height = MAP_CONFIG.tileGrid * MAP_CONFIG.tileSizePx;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#0e284e';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = 'rgba(98, 159, 221, 0.25)';
  for (let i = 0; i <= 12; i += 1) {
    const stepX = (c.width / 12) * i;
    const stepY = (c.height / 12) * i;
    ctx.beginPath();
    ctx.moveTo(stepX, 0);
    ctx.lineTo(stepX, c.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, stepY);
    ctx.lineTo(c.width, stepY);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(180, 216, 255, 0.9)';
  ctx.font = 'bold 42px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Map Tiles Unavailable - Fallback Grid', c.width / 2, c.height / 2);

  const texture = new THREE.CanvasTexture(c);
  texture.anisotropy = 4;
  return texture;
};

const loadOsmTexture = () => new Promise((resolve) => {
  const centerTileX = Math.floor((MAP_CONFIG.centerLon + 180) / 360 * Math.pow(2, MAP_CONFIG.zoom));
  const centerTileY = Math.floor(
    (1 - Math.log(Math.tan((MAP_CONFIG.centerLat * Math.PI) / 180) + 1 / Math.cos((MAP_CONFIG.centerLat * Math.PI) / 180)) / Math.PI) /
      2 * Math.pow(2, MAP_CONFIG.zoom)
  );

  const half = Math.floor(MAP_CONFIG.tileGrid / 2);
  const canvas = document.createElement('canvas');
  canvas.width = MAP_CONFIG.tileGrid * MAP_CONFIG.tileSizePx;
  canvas.height = MAP_CONFIG.tileGrid * MAP_CONFIG.tileSizePx;
  const ctx = canvas.getContext('2d');
  let completed = 0;
  const total = MAP_CONFIG.tileGrid * MAP_CONFIG.tileGrid;

  const finish = () => {
    completed += 1;
    if (completed >= total) {
      const tex = new THREE.CanvasTexture(canvas);
      tex.anisotropy = 4;
      resolve(tex);
    }
  };

  for (let gy = 0; gy < MAP_CONFIG.tileGrid; gy += 1) {
    for (let gx = 0; gx < MAP_CONFIG.tileGrid; gx += 1) {
      const tileX = centerTileX + (gx - half);
      const tileY = centerTileY + (gy - half);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, gx * MAP_CONFIG.tileSizePx, gy * MAP_CONFIG.tileSizePx, MAP_CONFIG.tileSizePx, MAP_CONFIG.tileSizePx);
        finish();
      };
      img.onerror = () => {
        ctx.fillStyle = '#0f274d';
        ctx.fillRect(gx * MAP_CONFIG.tileSizePx, gy * MAP_CONFIG.tileSizePx, MAP_CONFIG.tileSizePx, MAP_CONFIG.tileSizePx);
        finish();
      };
      img.src = `https://tile.openstreetmap.org/${MAP_CONFIG.zoom}/${tileX}/${tileY}.png`;
    }
  }

  setTimeout(() => {
    if (completed < total) {
      resolve(buildFallbackMapTexture());
    }
  }, 2600);
});

const setMapPlane = (texture) => {
  if (mapPlane) {
    scene.remove(mapPlane);
    mapPlane.geometry.dispose();
  }

  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92, metalness: 0.02 });
  mapPlane = new THREE.Mesh(new THREE.PlaneGeometry(MAP_CONFIG.mapSizeWorld, MAP_CONFIG.mapSizeWorld), material);
  mapPlane.rotation.x = -Math.PI / 2;
  mapPlane.receiveShadow = true;
  scene.add(mapPlane);
};

const clearSectionMeshes = () => {
  while (sectionMeshes.length) {
    const mesh = sectionMeshes.pop();
    scene.remove(mesh);
    mesh.geometry.dispose();
  }
  selectedMesh = null;
};

const createSectionMesh = (item) => {
  const scenePos = currentMapMode === 'image'
    ? pixelToScene(item.pixel[0], item.pixel[1])
    : latLonToScene(item.lat, item.lon);

  const material = new THREE.MeshStandardMaterial({
    color: STATUS_COLORS[item.status],
    roughness: 0.5,
    metalness: 0.14,
    emissive: STATUS_COLORS[item.status],
    emissiveIntensity: 0.12
  });

  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(item.footprint * 0.42, item.footprint * 0.55, item.height, 18),
    material
  );
  mesh.position.set(scenePos.x, item.height / 2, scenePos.z);
  mesh.userData.section = item;
  mesh.userData.baseY = item.height / 2;

  const topDisc = new THREE.Mesh(
    new THREE.CircleGeometry(item.footprint * 0.38, 20),
    new THREE.MeshBasicMaterial({ color: 0xe4f2ff, transparent: true, opacity: 0.8 })
  );
  topDisc.rotation.x = -Math.PI / 2;
  topDisc.position.y = item.height / 2 + 0.03;
  mesh.add(topDisc);

  scene.add(mesh);
  sectionMeshes.push(mesh);
};

const rebuildSectionMeshes = () => {
  clearSectionMeshes();
  sections.forEach(createSectionMesh);
};

const selectMesh = (mesh) => {
  if (selectedMesh) {
    selectedMesh.material.emissiveIntensity = 0.12;
  }
  selectedMesh = mesh;

  if (selectedMesh) {
    selectedMesh.material.emissiveIntensity = 0.35;
    setDetails(selectedMesh.userData.section);
    updateLabel(selectedMesh.userData.section.name);
  } else {
    setDetails(null);
    updateLabel('UND AI Adoption Map');
  }
};

renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(sectionMeshes, false);
  if (hits.length) {
    selectMesh(hits[0].object);
  }
});

if (mapImageInput) {
  mapImageInput.addEventListener('change', () => {
    const file = mapImageInput.files && mapImageInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const texture = new THREE.Texture(image);
        texture.needsUpdate = true;
        texture.anisotropy = 4;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        currentMapMode = 'image';
        setMapPlane(texture);
        rebuildSectionMeshes();
        if (mapSourceLabel) {
          mapSourceLabel.textContent = `Map source: uploaded image (${file.name})`;
        }
        updateLabel('UND AI Adoption Map (Image Mode)');
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

let dragging = false;
let lastX = 0;
let orbitAngle = 0.82;
let orbitRadius = 16;
let orbitHeight = 11.5;

const updateCameraOrbit = () => {
  camera.position.x = Math.cos(orbitAngle) * orbitRadius;
  camera.position.z = Math.sin(orbitAngle) * orbitRadius;
  camera.position.y = orbitHeight;
  camera.lookAt(0, 0.9, 0);
};

updateCameraOrbit();

renderer.domElement.addEventListener('pointerdown', (event) => {
  dragging = true;
  lastX = event.clientX;
  renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  const dx = event.clientX - lastX;
  lastX = event.clientX;
  orbitAngle -= dx * 0.0065;
  updateCameraOrbit();
});

renderer.domElement.addEventListener('pointerup', (event) => {
  dragging = false;
  renderer.domElement.releasePointerCapture(event.pointerId);
});

window.addEventListener('wheel', (event) => {
  orbitRadius += event.deltaY * 0.01;
  orbitRadius = Math.min(24, Math.max(9, orbitRadius));
  updateCameraOrbit();
}, { passive: true });

window.addEventListener('resize', () => {
  const width = sceneRoot.clientWidth;
  const height = sceneRoot.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

const clock = new THREE.Clock();

const animate = () => {
  const t = clock.getElapsedTime();
  for (let i = 0; i < sectionMeshes.length; i += 1) {
    const mesh = sectionMeshes[i];
    mesh.position.y = mesh.userData.baseY + Math.sin(t * 1.2 + i * 0.9) * 0.03;
  }
  labelSprite.position.y = 4.7 + Math.sin(t * 1.3) * 0.05;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

const init = async () => {
  setDetails(null);
  updateLabel('UND AI Adoption Map');

  let texture;
  try {
    texture = await loadOsmTexture();
  } catch {
    texture = buildFallbackMapTexture();
  }

  setMapPlane(texture);
  rebuildSectionMeshes();
  animate();
};

init();

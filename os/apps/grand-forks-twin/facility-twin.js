const titleNode = document.querySelector('#facilityTitle');
const subtitleNode = document.querySelector('#facilitySubtitle');
const selectionCard = document.querySelector('#selectionCard');
const kpiGrid = document.querySelector('#kpiGrid');
const assetList = document.querySelector('#assetList');
const insightList = document.querySelector('#insightList');
const modeLabel = document.querySelector('#modeLabel');
const assetCount = document.querySelector('#assetCount');
const resetCameraBtn = document.querySelector('#resetCameraBtn');
const toggleDayBtn = document.querySelector('#toggleDayBtn');
const threeStage = document.querySelector('#threeStage');

const CONFIG = window.TWIN_CONFIG || {};

if (titleNode) {
  titleNode.textContent = CONFIG.name || 'Facility Twin';
}
if (subtitleNode) {
  subtitleNode.textContent = CONFIG.subtitle || 'Operational digital twin view.';
}

if (!window.THREE || !threeStage) {
  if (threeStage) {
    threeStage.innerHTML = '<p style="margin:0;padding:1rem;color:#ffd59c;">Three.js failed to load.</p>';
  }
} else {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x091425, 0.009);

  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 500);
  const center = new THREE.Vector3(
    CONFIG.cameraTarget?.x || 0,
    0,
    CONFIG.cameraTarget?.z || 0
  );

  let radius = 62;
  let theta = 0.7;
  let phi = 0.95;
  let isNight = true;
  let dragMode = null;
  let lastX = 0;
  let lastY = 0;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  threeStage.appendChild(renderer.domElement);

  const hemi = new THREE.HemisphereLight(0x97c0ff, 0x1b2f4b, 1.0);
  const dir = new THREE.DirectionalLight(0xffffff, 1.3);
  dir.position.set(34, 42, 22);
  const accent = new THREE.PointLight(CONFIG.themeColor || 0x63b5ff, 1.2, 170);
  accent.position.set(-20, 12, -10);

  scene.add(hemi, dir, accent);

  const city = new THREE.Group();
  scene.add(city);

  const district = new THREE.Mesh(
    new THREE.BoxGeometry(66, 0.4, 56),
    new THREE.MeshStandardMaterial({
      color: CONFIG.themeColor || 0x63b5ff,
      transparent: true,
      opacity: 0.14,
      emissive: CONFIG.themeColor || 0x63b5ff,
      emissiveIntensity: 0.18
    })
  );
  district.position.y = 0.12;
  city.add(district);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(140, 140),
    new THREE.MeshStandardMaterial({ color: 0x15243b, roughness: 0.95, metalness: 0.04 })
  );
  ground.rotation.x = -Math.PI / 2;
  city.add(ground);

  const grid = new THREE.GridHelper(140, 28, 0x24426f, 0x183256);
  grid.position.y = 0.02;
  grid.material.opacity = 0.3;
  grid.material.transparent = true;
  city.add(grid);

  const roadGroup = new THREE.Group();
  const markerGroup = new THREE.Group();
  const labelGroup = new THREE.Group();
  city.add(roadGroup, markerGroup, labelGroup);

  const makePath = (path) => {
    const points = path.points || [];
    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i];
      const b = points[i + 1];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const length = Math.sqrt(dx * dx + dz * dz);
      const segment = new THREE.Mesh(
        new THREE.BoxGeometry(path.width || 1.8, 0.07, Math.max(length, 0.2)),
        new THREE.MeshStandardMaterial({ color: path.color || 0x2f4668, roughness: 0.95 })
      );
      segment.position.set((a.x + b.x) * 0.5, 0.05, (a.z + b.z) * 0.5);
      segment.rotation.y = Math.atan2(dx, dz);
      roadGroup.add(segment);
    }
  };

  (CONFIG.paths || []).forEach(makePath);

  const assets = CONFIG.assets || [];
  const markers = [];
  const clickable = [];
  let selectedId = null;

  const createLabel = (text) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.font = '700 28px Space Grotesk, sans-serif';
    const width = Math.ceil(ctx.measureText(text).width) + 26;
    const height = 46;
    canvas.width = width;
    canvas.height = height;
    ctx.font = '700 28px Space Grotesk, sans-serif';
    ctx.fillStyle = 'rgba(6, 15, 32, 0.85)';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(181, 220, 255, 0.9)';
    ctx.strokeRect(1, 1, width - 2, height - 2);
    ctx.fillStyle = '#ecf4ff';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 12, height * 0.5);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const spr = new THREE.Sprite(mat);
    spr.scale.set(width * 0.018, height * 0.018, 1);
    return spr;
  };

  const addAsset = (asset) => {
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(asset.size?.x || 4, asset.height || 6, asset.size?.z || 4),
      new THREE.MeshStandardMaterial({
        color: asset.color || (CONFIG.themeColor || 0x63b5ff),
        emissive: asset.color || (CONFIG.themeColor || 0x63b5ff),
        emissiveIntensity: isNight ? 0.08 : 0.02,
        roughness: 0.6,
        metalness: 0.2
      })
    );
    base.position.set(asset.x, (asset.height || 6) * 0.5, asset.z);
    city.add(base);

    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 16, 16),
      new THREE.MeshStandardMaterial({
        color: asset.markerColor || 0xd3e7ff,
        emissive: asset.markerColor || 0xd3e7ff,
        emissiveIntensity: isNight ? 0.92 : 0.22
      })
    );
    marker.position.set(asset.x, (asset.height || 6) + 2.2, asset.z);
    marker.userData = asset;
    markerGroup.add(marker);

    const label = createLabel(asset.name);
    if (label) {
      label.position.set(asset.x, (asset.height || 6) + 4.2, asset.z);
      labelGroup.add(label);
      marker.userData.label = label;
    }

    markers.push(marker);
    clickable.push(marker);
  };

  assets.forEach(addAsset);

  const setSelection = (asset) => {
    selectedId = asset ? asset.id : null;
    if (selectionCard) {
      if (!asset) {
        selectionCard.innerHTML = '<h3>No asset selected</h3><p>Click an asset marker or select from the list to inspect operations data.</p>';
      } else {
        selectionCard.innerHTML = `<h3>${asset.name}</h3><p>${asset.desc || 'Operational node.'}</p><p><strong>Status:</strong> ${asset.status || 'Online'}</p>`;
      }
    }

    document.querySelectorAll('.list-item').forEach((node) => {
      node.classList.toggle('active', node.dataset.id === selectedId);
    });

    if (asset) {
      center.set(asset.x, 0, asset.z);
      radius = Math.max(24, radius * 0.74);
    }
  };

  if (assetCount) {
    assetCount.textContent = String(assets.length);
  }

  if (kpiGrid) {
    kpiGrid.innerHTML = '';
    (CONFIG.metrics || []).forEach((metric) => {
      const card = document.createElement('article');
      card.className = 'kpi';
      card.innerHTML = `<span class="kpi-label">${metric.label}</span><strong>${metric.value}</strong><small>${metric.trend || ''}</small>`;
      kpiGrid.appendChild(card);
    });
  }

  if (assetList) {
    assetList.innerHTML = '';
    assets.forEach((asset) => {
      const row = document.createElement('article');
      row.className = 'list-item';
      row.dataset.id = asset.id;
      row.innerHTML = `<h4>${asset.name}</h4><p>${asset.status || 'Online'} | ${asset.kpi || 'Nominal'}</p>`;
      row.addEventListener('click', () => setSelection(asset));
      assetList.appendChild(row);
    });
  }

  if (insightList) {
    insightList.innerHTML = '';
    (CONFIG.insights || []).forEach((insight) => {
      const li = document.createElement('li');
      li.textContent = insight;
      insightList.appendChild(li);
    });
  }

  const updateCamera = () => {
    const sinPhi = Math.sin(phi);
    camera.position.set(
      center.x + radius * sinPhi * Math.sin(theta),
      center.y + radius * Math.cos(phi),
      center.z + radius * sinPhi * Math.cos(theta)
    );
    camera.lookAt(center);
  };

  const setNightMode = (night) => {
    isNight = night;
    renderer.setClearColor(night ? 0x050b16 : 0xcfe8ff, 1);
    scene.fog.color.setHex(night ? 0x091425 : 0xddeeff);
    hemi.intensity = night ? 1.0 : 1.35;
    dir.intensity = night ? 1.3 : 1.7;
    accent.intensity = night ? 1.2 : 0.44;

    markers.forEach((m) => {
      m.material.emissiveIntensity = night ? 0.92 : 0.24;
    });

    city.traverse((child) => {
      if (child.isMesh && child.material && child.material.emissiveIntensity !== undefined && !markers.includes(child)) {
        child.material.emissiveIntensity = night ? 0.08 : 0.02;
      }
    });

    if (modeLabel) {
      modeLabel.textContent = night ? 'Night Simulation' : 'Day Simulation';
    }
    if (toggleDayBtn) {
      toggleDayBtn.textContent = night ? 'Day Mode' : 'Night Mode';
    }
  };

  const resize = () => {
    const { clientWidth, clientHeight } = threeStage;
    camera.aspect = clientWidth / Math.max(clientHeight, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight, false);
  };

  resize();
  setNightMode(true);
  updateCamera();
  window.addEventListener('resize', resize);

  resetCameraBtn?.addEventListener('click', () => {
    radius = 62;
    theta = 0.7;
    phi = 0.95;
    center.set(CONFIG.cameraTarget?.x || 0, 0, CONFIG.cameraTarget?.z || 0);
    setSelection(null);
  });

  toggleDayBtn?.addEventListener('click', () => setNightMode(!isNight));

  threeStage.addEventListener('pointerdown', (event) => {
    dragMode = event.button === 2 ? 'pan' : 'orbit';
    lastX = event.clientX;
    lastY = event.clientY;
  });

  threeStage.addEventListener('pointermove', (event) => {
    if (!dragMode) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;

    if (dragMode === 'orbit') {
      theta -= dx * 0.0058;
      phi = Math.min(Math.max(0.34, phi + dy * 0.0058), 1.42);
    } else {
      center.x -= dx * 0.08;
      center.z -= dy * 0.08;
    }
  });

  window.addEventListener('pointerup', () => {
    dragMode = null;
  });

  threeStage.addEventListener('wheel', (event) => {
    event.preventDefault();
    radius = Math.min(120, Math.max(18, radius + event.deltaY * 0.03));
  }, { passive: false });

  threeStage.addEventListener('contextmenu', (event) => event.preventDefault());

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  threeStage.addEventListener('click', (event) => {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(clickable, false);
    if (hits.length > 0) {
      setSelection(hits[0].object.userData);
    }
  });

  const clock = new THREE.Clock();
  const animate = () => {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Auto-orbit to keep the twin visibly rotating for dashboard mode.
    if (!dragMode) {
      theta += 0.0014;
    }

    markers.forEach((marker, index) => {
      marker.position.y = (assets[index].height || 6) + 2.2 + Math.sin(elapsed * 1.6 + index) * 0.1;
      marker.rotation.y += 0.01;
      const label = marker.userData.label;
      if (label && label.material) {
        label.material.opacity = 0.82 + Math.sin(elapsed * 1.2 + index) * 0.08;
      }
    });

    updateCamera();
    renderer.render(scene, camera);
  };

  animate();
}

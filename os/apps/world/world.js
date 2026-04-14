const threeStage = document.querySelector('#threeStage');
const selectionCard = document.querySelector('#selectionCard');
const locationList = document.querySelector('#locationList');
const locationSearch = document.querySelector('#locationSearch');
const toggleClouds = document.querySelector('#toggleClouds');
const toggleRoutes = document.querySelector('#toggleRoutes');
const toggleBorders = document.querySelector('#toggleBorders');
const toggleGrid = document.querySelector('#toggleGrid');
const toggleStars = document.querySelector('#toggleStars');
const toggleAtmosphere = document.querySelector('#toggleAtmosphere');
const toggleNightLights = document.querySelector('#toggleNightLights');
const resetCameraBtn = document.querySelector('#resetCameraBtn');
const cycleViewBtn = document.querySelector('#cycleViewBtn');
const modeLabel = document.querySelector('#modeLabel');
const locationCount = document.querySelector('#locationCount');
const routeCount = document.querySelector('#routeCount');
const cloudSpeedLabel = document.querySelector('#cloudSpeedLabel');
const focusChips = document.querySelectorAll('.focus-chip');

if (!window.THREE) {
  if (threeStage) {
    threeStage.innerHTML = '<p class="three-error">Three.js failed to load.</p>';
  }
} else if (threeStage) {
  const LOCATIONS = [
    { id: 'new-york', name: 'New York', region: 'North America', lat: 40.7128, lon: -74.0060, color: 0x74d5ff, population: '19.6M', desc: 'Global finance, media, and dense urban mobility.', connections: ['london', 'dubai', 'sao-paulo'] },
    { id: 'london', name: 'London', region: 'Europe', lat: 51.5072, lon: -0.1276, color: 0x56f0d8, population: '9.7M', desc: 'Historic world city linking finance, design, policy, and transit.', connections: ['new-york', 'dubai', 'singapore'] },
    { id: 'dubai', name: 'Dubai', region: 'Middle East', lat: 25.2048, lon: 55.2708, color: 0xffbf64, population: '3.7M', desc: 'A high-growth logistics and innovation gateway between continents.', connections: ['london', 'singapore', 'cape-town'] },
    { id: 'tokyo', name: 'Tokyo', region: 'East Asia', lat: 35.6762, lon: 139.6503, color: 0xff86c6, population: '37.4M', desc: 'Large-scale metropolitan coordination, technology, and transport systems.', connections: ['singapore', 'sydney', 'new-york'] },
    { id: 'singapore', name: 'Singapore', region: 'Southeast Asia', lat: 1.3521, lon: 103.8198, color: 0x7ee6ff, population: '5.9M', desc: 'Port, urban systems, and digital infrastructure powerhouse.', connections: ['tokyo', 'dubai', 'sydney'] },
    { id: 'sydney', name: 'Sydney', region: 'Oceania', lat: -33.8688, lon: 151.2093, color: 0x9dffb4, population: '5.3M', desc: 'Harbor city balancing resilience, growth, and urban lifestyle.', connections: ['singapore', 'tokyo', 'cape-town'] },
    { id: 'sao-paulo', name: 'Sao Paulo', region: 'South America', lat: -23.5505, lon: -46.6333, color: 0xff9b74, population: '22.6M', desc: 'Massive regional engine for commerce, industry, and culture.', connections: ['new-york', 'cape-town', 'london'] },
    { id: 'cape-town', name: 'Cape Town', region: 'Africa', lat: -33.9249, lon: 18.4241, color: 0xb690ff, population: '4.8M', desc: 'Strategic coastal city shaped by tourism, trade, and climate adaptation.', connections: ['dubai', 'sydney', 'sao-paulo'] }
  ];

  const locationMap = new Map(LOCATIONS.map((item) => [item.id, item]));

  const textureUrls = {
    day: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    bump: 'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
    spec: 'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
    clouds: 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/fair_clouds_4k.png',
    lights: 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/earth_lights_2048.png',
    borders: 'https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json'
  };

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020611, 0.0009);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
  camera.position.set(0, 0.25, 7.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  if ('outputEncoding' in renderer && THREE.sRGBEncoding) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }
  threeStage.appendChild(renderer.domElement);

  const root = new THREE.Group();
  scene.add(root);

  const earthGroup = new THREE.Group();
  const routeGroup = new THREE.Group();
  const markerGroup = new THREE.Group();
  const borderGroup = new THREE.Group();
  const gridGroup = new THREE.Group();
  root.add(earthGroup);
  earthGroup.add(routeGroup, markerGroup, borderGroup, gridGroup);

  const ambient = new THREE.HemisphereLight(0xb1d7ff, 0x041120, 1.25);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffffff, 1.7);
  sun.position.set(8, 3, 5);
  scene.add(sun);

  const rim = new THREE.PointLight(0x56f0d8, 1.4, 50);
  rim.position.set(-6, -2, -4);
  scene.add(rim);

  const loader = new THREE.TextureLoader();
  loader.crossOrigin = 'anonymous';

  const safeLoad = (url) => new Promise((resolve) => {
    loader.load(
      url,
      (texture) => resolve(texture),
      undefined,
      () => resolve(null)
    );
  });

  const earthMaterial = new THREE.MeshPhongMaterial({
    color: 0x3d75b8,
    specular: new THREE.Color(0x223344),
    shininess: 18
  });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(2, 128, 128), earthMaterial);
  earthGroup.add(earth);

  const cloudsMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.28,
    depthWrite: false
  });
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(2.045, 96, 96), cloudsMaterial);
  earthGroup.add(clouds);

  const nightMaterial = new THREE.MeshBasicMaterial({
    color: 0x5caeff,
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const nightLights = new THREE.Mesh(new THREE.SphereGeometry(2.01, 96, 96), nightMaterial);
  earthGroup.add(nightLights);

  const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(0x63c4ff) },
      viewVector: { value: camera.position.clone() }
    },
    vertexShader: [
      'uniform vec3 viewVector;',
      'varying float intensity;',
      'void main() {',
      '  vec3 transformedNormal = normalize(normalMatrix * normal);',
      '  vec3 worldPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;',
      '  vec3 viewDir = normalize(viewVector - worldPosition);',
      '  intensity = pow(0.72 - dot(transformedNormal, viewDir), 4.0);',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 glowColor;',
      'varying float intensity;',
      'void main() {',
      '  gl_FragColor = vec4(glowColor, intensity * 0.95);',
      '}'
    ].join('\n'),
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  });
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(2.22, 96, 96), atmosphereMaterial);
  earthGroup.add(atmosphere);

  const starGeometry = new THREE.BufferGeometry();
  const starCount = 5200;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const radius = 26 + Math.random() * 64;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const index = i * 3;
    starPositions[index] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[index + 1] = radius * Math.cos(phi);
    starPositions[index + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({ color: 0xd9ecff, size: 0.18, sizeAttenuation: true, transparent: true, opacity: 0.95 })
  );
  scene.add(stars);

  const clickable = [];
  const markerMeshes = [];
  const routeMeshes = [];
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const focusTarget = new THREE.Vector3();

  let activeLocationId = null;
  let autoRotate = true;
  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let viewMode = 0;
  let cloudSpeed = 1;

  const latLonToVector = (lat, lon, radius) => {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon + 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  const createLabelSprite = (text) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const fontSize = 30;
    const padX = 18;
    const padY = 12;
    ctx.font = `700 ${fontSize}px Space Grotesk, sans-serif`;
    const width = Math.ceil(ctx.measureText(text).width) + padX * 2;
    const height = fontSize + padY * 2;
    canvas.width = width;
    canvas.height = height;
    ctx.font = `700 ${fontSize}px Space Grotesk, sans-serif`;
    ctx.fillStyle = 'rgba(6, 16, 30, 0.78)';
    ctx.strokeStyle = 'rgba(116, 213, 255, 0.88)';
    ctx.lineWidth = 2;
    const radius = 16;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.quadraticCurveTo(width, 0, width, radius);
    ctx.lineTo(width, height - radius);
    ctx.quadraticCurveTo(width, height, width - radius, height);
    ctx.lineTo(radius, height);
    ctx.quadraticCurveTo(0, height, 0, height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#edf6ff';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, padX, height * 0.5);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(width * 0.008, height * 0.008, 1);
    return sprite;
  };

  const createGeoLine = (points, material, lineType = 'line') => {
    if (!points || points.length < 2) return null;
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    if (lineType === 'loop') {
      return new THREE.LineLoop(geometry, material);
    }
    return new THREE.Line(geometry, material);
  };

  const buildGraticule = () => {
    const latitudes = [-60, -30, 0, 30, 60];
    const longitudes = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];
    const material = new THREE.LineBasicMaterial({
      color: 0x62bfff,
      transparent: true,
      opacity: 0.18
    });

    latitudes.forEach((lat) => {
      const points = [];
      for (let lon = -180; lon <= 180; lon += 6) {
        points.push(latLonToVector(lat, lon, 2.013));
      }
      const line = createGeoLine(points, material, 'loop');
      if (line) gridGroup.add(line);
    });

    longitudes.forEach((lon) => {
      const points = [];
      for (let lat = -85; lat <= 85; lat += 4) {
        points.push(latLonToVector(lat, lon, 2.013));
      }
      const line = createGeoLine(points, material);
      if (line) gridGroup.add(line);
    });
  };

  const loadCountryBorders = async () => {
    try {
      const response = await fetch(textureUrls.borders);
      if (!response.ok) {
        throw new Error(`Border request failed: ${response.status}`);
      }
      const geojson = await response.json();
      const material = new THREE.LineBasicMaterial({
        color: 0xa8d8ff,
        transparent: true,
        opacity: 0.42
      });

      const addRing = (ring) => {
        const points = ring
          .filter((coord) => Array.isArray(coord) && coord.length >= 2)
          .map((coord) => latLonToVector(coord[1], coord[0], 2.015));
        const line = createGeoLine(points, material, 'loop');
        if (line) borderGroup.add(line);
      };

      geojson.features.forEach((feature) => {
        if (!feature || !feature.geometry) return;
        const { type, coordinates } = feature.geometry;
        if (type === 'Polygon') {
          coordinates.forEach(addRing);
        } else if (type === 'MultiPolygon') {
          coordinates.forEach((polygon) => polygon.forEach(addRing));
        }
      });
    } catch {
      borderGroup.visible = false;
      if (toggleBorders) toggleBorders.checked = false;
    }
  };

  const drawRoutes = () => {
    routeGroup.clear();
    routeMeshes.length = 0;

    const added = new Set();
    LOCATIONS.forEach((fromLocation) => {
      fromLocation.connections.forEach((targetId) => {
        const key = [fromLocation.id, targetId].sort().join(':');
        if (added.has(key)) return;
        added.add(key);
        const toLocation = locationMap.get(targetId);
        if (!toLocation) return;
        const start = latLonToVector(fromLocation.lat, fromLocation.lon, 2.04);
        const end = latLonToVector(toLocation.lat, toLocation.lon, 2.04);
        const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(3.15);
        const curve = new THREE.CatmullRomCurve3([start, mid, end]);
        const geometry = new THREE.TubeGeometry(curve, 64, 0.012, 8, false);
        const material = new THREE.MeshBasicMaterial({
          color: 0x69cfff,
          transparent: true,
          opacity: 0.32,
          blending: THREE.AdditiveBlending
        });
        const tube = new THREE.Mesh(geometry, material);
        tube.userData = { fromId: fromLocation.id, toId: toLocation.id };
        routeGroup.add(tube);
        routeMeshes.push(tube);
      });
    });

    routeCount.textContent = String(routeMeshes.length);
  };

  const makeMarkers = () => {
    LOCATIONS.forEach((location) => {
      const anchor = latLonToVector(location.lat, location.lon, 2.03);
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 24, 24),
        new THREE.MeshBasicMaterial({ color: location.color })
      );
      marker.position.copy(anchor);
      marker.userData = { locationId: location.id };

      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 24, 24),
        new THREE.MeshBasicMaterial({ color: location.color, transparent: true, opacity: 0.18 })
      );
      halo.position.copy(anchor);

      const label = createLabelSprite(location.name);
      if (label) {
        const outward = anchor.clone().normalize().multiplyScalar(0.28);
        label.position.copy(anchor).add(outward);
        markerGroup.add(label);
        marker.userData.label = label;
      }

      markerGroup.add(halo);
      markerGroup.add(marker);
      marker.userData.halo = halo;
      marker.userData.location = location;
      markerMeshes.push(marker);
      clickable.push(marker);
    });
  };

  const renderLocationList = (filter = '') => {
    const query = filter.trim().toLowerCase();
    const filtered = LOCATIONS.filter((location) => {
      if (!query) return true;
      const text = `${location.name} ${location.region} ${location.desc}`.toLowerCase();
      return text.includes(query);
    });

    locationCount.textContent = String(filtered.length);
    locationList.innerHTML = filtered.map((location) => `
      <article class="location-item${location.id === activeLocationId ? ' active' : ''}">
        <div>
          <h3>${location.name}</h3>
          <small>${location.region} · ${location.population}</small>
          <p>${location.desc}</p>
        </div>
        <button type="button" data-focus-id="${location.id}">Focus</button>
      </article>
    `).join('');

    locationList.querySelectorAll('[data-focus-id]').forEach((button) => {
      button.addEventListener('click', () => focusLocation(button.getAttribute('data-focus-id')));
    });
  };

  const updateSelectionCard = (location) => {
    if (!location) {
      selectionCard.innerHTML = '<h3>Earth Overview</h3><p>Click a city marker or use Quick Focus to center the globe on a region.</p>';
      return;
    }

    selectionCard.innerHTML = `
      <h3>${location.name}</h3>
      <p>${location.desc}</p>
      <p><strong>Region:</strong> ${location.region}<br><strong>Population:</strong> ${location.population}<br><strong>Routes:</strong> ${location.connections.length}</p>
    `;
  };

  const emphasizeRoutes = (locationId) => {
    routeMeshes.forEach((route) => {
      const active = route.userData.fromId === locationId || route.userData.toId === locationId;
      route.material.opacity = active || !locationId ? 0.68 : 0.14;
      route.material.color.set(active ? 0xffbf64 : 0x69cfff);
    });
  };

  const focusLocation = (locationId) => {
    const location = locationMap.get(locationId);
    if (!location) return;
    activeLocationId = locationId;
    updateSelectionCard(location);
    renderLocationList(locationSearch.value || '');
    emphasizeRoutes(locationId);
    const target = latLonToVector(location.lat, location.lon, 2);
    focusTarget.copy(target);
    autoRotate = false;
  };

  const resetView = () => {
    activeLocationId = null;
    autoRotate = true;
    velocityX = 0;
    velocityY = 0;
    focusTarget.set(0, 0, 0);
    updateSelectionCard(null);
    emphasizeRoutes(null);
    renderLocationList(locationSearch.value || '');
    cloudSpeedLabel.textContent = '1.00x';
    cloudSpeed = 1;
  };

  const applyViewMode = () => {
    if (viewMode === 0) {
      camera.position.set(0, 0.25, 7.2);
      modeLabel.textContent = 'Cinematic Earth';
      cloudSpeed = 1;
    } else if (viewMode === 1) {
      camera.position.set(0.6, 1.1, 6.2);
      modeLabel.textContent = 'High Orbit';
      cloudSpeed = 1.3;
    } else {
      camera.position.set(-1.2, -0.2, 5.6);
      modeLabel.textContent = 'Close Pass';
      cloudSpeed = 1.6;
    }
    cloudSpeedLabel.textContent = `${cloudSpeed.toFixed(2)}x`;
  };

  const setSize = () => {
    const width = threeStage.clientWidth;
    const height = threeStage.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const handlePointer = () => {
    threeStage.addEventListener('pointerdown', (event) => {
      dragging = true;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      velocityX = 0;
      velocityY = 0;
      threeStage.setPointerCapture(event.pointerId);
    });

    threeStage.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const dx = event.clientX - dragStartX;
      const dy = event.clientY - dragStartY;
      velocityX = dx * 0.0022;
      velocityY = dy * 0.0018;
      root.rotation.y += velocityX;
      root.rotation.x += velocityY;
      root.rotation.x = THREE.MathUtils.clamp(root.rotation.x, -0.55, 0.55);
      dragStartX = event.clientX;
      dragStartY = event.clientY;
    });

    threeStage.addEventListener('pointerup', (event) => {
      dragging = false;
      try {
        threeStage.releasePointerCapture(event.pointerId);
      } catch {
        // ignore capture release errors
      }
      const rect = threeStage.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(clickable, false)[0];
      if (hit && hit.object && hit.object.userData.locationId) {
        focusLocation(hit.object.userData.locationId);
      }
    });

    threeStage.addEventListener('wheel', (event) => {
      event.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + event.deltaY * 0.002, 4.2, 9.5);
    }, { passive: false });
  };

  const bindUi = () => {
    locationSearch.addEventListener('input', () => renderLocationList(locationSearch.value || ''));

    focusChips.forEach((chip) => {
      chip.addEventListener('click', () => focusLocation(chip.getAttribute('data-focus')));
    });

    resetCameraBtn.addEventListener('click', () => {
      applyViewMode();
      resetView();
    });

    cycleViewBtn.addEventListener('click', () => {
      viewMode = (viewMode + 1) % 3;
      applyViewMode();
    });

    toggleClouds.addEventListener('change', () => {
      clouds.visible = toggleClouds.checked;
    });
    toggleRoutes.addEventListener('change', () => {
      routeGroup.visible = toggleRoutes.checked;
    });
    toggleBorders.addEventListener('change', () => {
      borderGroup.visible = toggleBorders.checked;
    });
    toggleGrid.addEventListener('change', () => {
      gridGroup.visible = toggleGrid.checked;
    });
    toggleStars.addEventListener('change', () => {
      stars.visible = toggleStars.checked;
    });
    toggleAtmosphere.addEventListener('change', () => {
      atmosphere.visible = toggleAtmosphere.checked;
    });
    toggleNightLights.addEventListener('change', () => {
      nightLights.visible = toggleNightLights.checked;
    });
  };

  const animate = () => {
    requestAnimationFrame(animate);
    const t = performance.now() * 0.001;

    if (autoRotate && !dragging) {
      root.rotation.y += 0.0018;
    }

    if (!dragging) {
      root.rotation.y += velocityX;
      root.rotation.x += velocityY;
      root.rotation.x = THREE.MathUtils.clamp(root.rotation.x, -0.55, 0.55);
      velocityX *= 0.94;
      velocityY *= 0.92;
    }

    if (activeLocationId) {
      const desiredY = Math.atan2(focusTarget.x, focusTarget.z);
      const desiredX = Math.asin(THREE.MathUtils.clamp(focusTarget.y / 2, -1, 1)) * 0.65;
      root.rotation.y += (desiredY - root.rotation.y) * 0.03;
      root.rotation.x += (-desiredX - root.rotation.x) * 0.03;
    }

    earth.rotation.y += 0.0006;
    clouds.rotation.y += 0.0012 * cloudSpeed;
    nightLights.rotation.y += 0.00062;
    atmosphere.scale.setScalar(1 + Math.sin(t * 1.8) * 0.003);
    stars.rotation.y = t * 0.01;
    stars.rotation.x = Math.sin(t * 0.08) * 0.08;

    markerMeshes.forEach((marker, index) => {
      const pulse = 1 + Math.sin(t * 2.2 + index * 1.3) * 0.18;
      marker.scale.setScalar(activeLocationId === marker.userData.locationId ? 1.75 : pulse);
      if (marker.userData.halo) {
        marker.userData.halo.scale.setScalar(activeLocationId === marker.userData.locationId ? 1.85 : pulse * 1.2);
        marker.userData.halo.material.opacity = activeLocationId === marker.userData.locationId ? 0.42 : 0.16;
      }
      if (marker.userData.label) {
        marker.userData.label.visible = !activeLocationId || activeLocationId === marker.userData.locationId;
      }
    });

    routeMeshes.forEach((route, index) => {
      route.material.opacity = Math.max(route.material.opacity, 0.16 + (Math.sin(t * 2 + index) + 1) * 0.05);
    });

    atmosphereMaterial.uniforms.viewVector.value.copy(camera.position);
    renderer.render(scene, camera);
  };

  Promise.all([
    safeLoad(textureUrls.day),
    safeLoad(textureUrls.bump),
    safeLoad(textureUrls.spec),
    safeLoad(textureUrls.clouds),
    safeLoad(textureUrls.lights)
  ]).then(([dayMap, bumpMap, specMap, cloudsMap, lightsMap]) => {
    if (dayMap) earthMaterial.map = dayMap;
    if (bumpMap) {
      earthMaterial.bumpMap = bumpMap;
      earthMaterial.bumpScale = 0.08;
    }
    if (specMap) {
      earthMaterial.specularMap = specMap;
      earthMaterial.specular = new THREE.Color(0x4a647a);
    }
    if (cloudsMap) {
      cloudsMaterial.map = cloudsMap;
      cloudsMaterial.opacity = 0.34;
    }
    if (lightsMap) {
      nightMaterial.map = lightsMap;
      nightMaterial.opacity = 0.4;
    }
    earthMaterial.needsUpdate = true;
    cloudsMaterial.needsUpdate = true;
    nightMaterial.needsUpdate = true;
  });

  drawRoutes();
  makeMarkers();
  buildGraticule();
  loadCountryBorders();
  renderLocationList('');
  updateSelectionCard(null);
  applyViewMode();
  bindUi();
  handlePointer();
  setSize();
  window.addEventListener('resize', setSize);
  animate();
}
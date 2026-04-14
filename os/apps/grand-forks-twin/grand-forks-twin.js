const threeStage = document.querySelector('#threeStage');
const selectionCard = document.querySelector('#selectionCard');
const districtList = document.querySelector('#districtList');
const landmarkList = document.querySelector('#landmarkList');
const searchInput = document.querySelector('#searchInput');
const toggleDistricts = document.querySelector('#toggleDistricts');
const toggleLandmarks = document.querySelector('#toggleLandmarks');
const toggleTraffic = document.querySelector('#toggleTraffic');
const toggleGlow = document.querySelector('#toggleGlow');
const resetCameraBtn = document.querySelector('#resetCameraBtn');
const toggleDayBtn = document.querySelector('#toggleDayBtn');
const modeLabel = document.querySelector('#modeLabel');
const landmarkCount = document.querySelector('#landmarkCount');
const focusChips = document.querySelectorAll('.focus-chip');

if (!window.THREE) {
  if (threeStage) {
    threeStage.innerHTML = '<p class="three-error">Three.js failed to load.</p>';
  }
} else if (threeStage) {
  const DISTRICTS = [
    {
      id: 'und-campus',
      name: 'UND Campus',
      center: { x: -24, z: -8 },
      size: { x: 22, z: 18 },
      color: 0x45c2ff,
      description: 'University district with academic buildings, athletics, student services, and research corridors.',
      points: [[-36, -18], [-12, -18], [-10, -5], [-17, 4], [-34, 3], [-38, -7]]
    },
    {
      id: 'downtown',
      name: 'Downtown',
      center: { x: 2, z: -4 },
      size: { x: 18, z: 16 },
      color: 0xff9a4d,
      description: 'Dense civic, retail, and office core with the city center and event spaces.',
      points: [[-5, -12], [10, -12], [12, 3], [-4, 5], [-7, -2]]
    },
    {
      id: 'hospital-corridor',
      name: 'Hospital Corridor',
      center: { x: 18, z: 0 },
      size: { x: 16, z: 14 },
      color: 0xf46fd3,
      description: 'Regional healthcare district including Altru and supporting service buildings.',
      points: [[10, -8], [28, -8], [29, 8], [11, 10], [8, 1]]
    },
    {
      id: 'airport',
      name: 'Airport',
      center: { x: -44, z: -28 },
      size: { x: 18, z: 14 },
      color: 0x7fd3ff,
      description: 'Aviation and logistics zone representing Grand Forks International Airport.',
      points: [[-58, -36], [-34, -38], [-30, -21], [-38, -12], [-60, -16]]
    },
    {
      id: 'industrial-park',
      name: 'Industrial Park',
      center: { x: 28, z: 22 },
      size: { x: 20, z: 16 },
      color: 0x7ff0b1,
      description: 'Warehousing, manufacturing, and service operations district.',
      points: [[16, 10], [42, 10], [45, 32], [18, 34], [12, 18]]
    },
    {
      id: 'riverfront',
      name: 'Riverfront',
      center: { x: 10, z: -2 },
      size: { x: 10, z: 40 },
      color: 0x60b5ff,
      description: 'Red River greenway, levees, bridges, and adjacent riverfront activity zones.',
      points: [[6, -56], [18, -56], [20, 56], [7, 56]]
    }
  ];

  const LANDMARKS = [
    { id: 'memorial-union', district: 'und-campus', name: 'Memorial Union', x: -22, z: -6, height: 7, color: 0x6effd8, type: 'student-life', desc: 'Central student hub for dining, events, and services.' },
    { id: 'chester-fritz-library', district: 'und-campus', name: 'Chester Fritz Library', x: -25, z: -2, height: 11, color: 0x7ec8ff, type: 'academic', desc: 'Primary research library and study anchor.' },
    { id: 'odegard', district: 'und-campus', name: 'Odegard Hall', x: -18, z: -8, height: 9, color: 0x82b7ff, type: 'academic', desc: 'Aerospace and engineering learning complex.' },
    { id: 'engelstad-arena', district: 'und-campus', name: 'Ralph Engelstad Arena', x: -30, z: -10, height: 14, color: 0xffd166, type: 'athletics', desc: 'Signature athletics venue for hockey and large events.' },
    { id: 'city-hall', district: 'downtown', name: 'City Hall', x: -2, z: -2, height: 10, color: 0xffad66, type: 'civic', desc: 'Municipal government and public administration node.' },
    { id: 'downtown-core', district: 'downtown', name: 'Downtown Core', x: 4, z: -5, height: 13, color: 0xff8b5c, type: 'commercial', desc: 'Mixed-use downtown retail, offices, and public life.' },
    { id: 'town-square', district: 'downtown', name: 'Town Square', x: 1, z: 2, height: 6, color: 0xffc270, type: 'public-space', desc: 'A public gathering square anchoring the downtown blocks near the river-facing edge.' },
    { id: 'flood-memorial', district: 'riverfront', name: 'Flood Memorial Reach', x: 9, z: 6, height: 5, color: 0x66d7ff, type: 'riverfront', desc: 'River protection and resilience corridor.' },
    { id: 'sorlie-bridge', district: 'riverfront', name: 'Riverfront Bridge', x: 11.5, z: 11, height: 6, color: 0xc3dcff, type: 'bridge', desc: 'Signature river crossing tying downtown to the greenway, inspired by the bridge in the reference photo.' },
    { id: 'riverfront-park', district: 'riverfront', name: 'Riverfront Park', x: 2.5, z: 11.5, height: 4, color: 0x7ef3a8, type: 'park', desc: 'Tree-heavy parkland and trails between the downtown edge and the riverbank.' },
    { id: 'altru-main', district: 'hospital-corridor', name: 'Altru Hospital', x: 20, z: 2, height: 12, color: 0xff87d8, type: 'health', desc: 'Regional healthcare campus and emergency access node.' },
    { id: 'clinic-north', district: 'hospital-corridor', name: 'Clinic North', x: 15, z: -3, height: 8, color: 0xff9ae3, type: 'health', desc: 'Support care and outpatient services cluster.' },
    { id: 'gfk-terminal', district: 'airport', name: 'Grand Forks Airport', x: -42, z: -26, height: 7, color: 0x89dbff, type: 'airport', desc: 'Passenger terminal and aviation operations.' },
    { id: 'runway-hub', district: 'airport', name: 'Runway Operations', x: -36, z: -20, height: 4, color: 0xb0e6ff, type: 'airport', desc: 'Runway and airfield support systems.' },
    { id: 'industrial-yard', district: 'industrial-park', name: 'Industrial Yard', x: 27, z: 20, height: 8, color: 0x89ffb0, type: 'industry', desc: 'Warehouse and manufacturing support area.' },
    { id: 'rail-freight', district: 'industrial-park', name: 'Freight Connector', x: 34, z: 14, height: 6, color: 0xb6ff6f, type: 'industry', desc: 'Logistics handoff between road and freight movement.' },
    { id: 'red-river', district: 'riverfront', name: 'Red River Corridor', x: 11, z: -10, height: 6, color: 0x58b6ff, type: 'riverfront', desc: 'River spine shaping flood resilience, recreation, and edge development.' }
  ];

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07111f, 0.008);

  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 500);
  const cameraTarget = new THREE.Vector3(4, 0, -2);
  let radius = 92;
  let theta = 0.7;
  let phi = 1.0;
  let isNight = true;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  threeStage.appendChild(renderer.domElement);

  const ambientLight = new THREE.HemisphereLight(0x8db9ff, 0x1b2840, 1.1);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
  sunLight.position.set(35, 48, 18);
  scene.add(sunLight);

  const accentLight = new THREE.PointLight(0x00d6c7, 1.6, 180);
  accentLight.position.set(-25, 16, -10);
  scene.add(accentLight);

  const cityGroup = new THREE.Group();
  scene.add(cityGroup);

  const districtGroup = new THREE.Group();
  const landmarkGroup = new THREE.Group();
  const roadGroup = new THREE.Group();
  const trafficGroup = new THREE.Group();
  const labelGroup = new THREE.Group();
  cityGroup.add(districtGroup, landmarkGroup, roadGroup, trafficGroup, labelGroup);

  const clickable = [];
  const districtMeshes = [];
  const landmarkMeshes = [];
  const trafficDots = [];

  const createLabelSprite = (text, color = '#eaf5ff', bg = 'rgba(8,20,52,0.78)') => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const fontSize = 32;
    const padX = 20;
    const padY = 12;
    ctx.font = `700 ${fontSize}px Space Grotesk, sans-serif`;
    const width = Math.ceil(ctx.measureText(text).width) + padX * 2;
    const height = fontSize + padY * 2;
    canvas.width = width;
    canvas.height = height;
    ctx.font = `700 ${fontSize}px Space Grotesk, sans-serif`;
    ctx.fillStyle = bg;
    ctx.strokeStyle = 'rgba(174,231,255,0.92)';
    ctx.lineWidth = 2;
    const r = 18;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(width - r, 0);
    ctx.quadraticCurveTo(width, 0, width, r);
    ctx.lineTo(width, height - r);
    ctx.quadraticCurveTo(width, height, width - r, height);
    ctx.lineTo(r, height);
    ctx.quadraticCurveTo(0, height, 0, height - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, padX, height * 0.5);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(width * 0.02, height * 0.02, 1);
    return sprite;
  };

  const worldToCanvas = (x, z, size) => ({
    x: ((x + 80) / 160) * size,
    y: ((z + 80) / 160) * size
  });

  const createCityTexture = () => {
    const size = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    const road = (points, width, color, alpha = 1) => {
      if (points.length < 2) return;
      ctx.save();
      ctx.beginPath();
      points.forEach((point, index) => {
        const mapped = worldToCanvas(point.x, point.z, size);
        if (index === 0) ctx.moveTo(mapped.x, mapped.y);
        else ctx.lineTo(mapped.x, mapped.y);
      });
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.stroke();
      ctx.restore();
    };

    ctx.fillStyle = '#132337';
    ctx.fillRect(0, 0, size, size);

    for (let gx = 0; gx < size; gx += 64) {
      ctx.fillStyle = gx % 128 === 0 ? 'rgba(255,255,255,0.012)' : 'rgba(255,255,255,0.006)';
      ctx.fillRect(gx, 0, 4, size);
    }
    for (let gy = 0; gy < size; gy += 64) {
      ctx.fillStyle = gy % 128 === 0 ? 'rgba(255,255,255,0.012)' : 'rgba(255,255,255,0.006)';
      ctx.fillRect(0, gy, size, 4);
    }

    const riverGradient = ctx.createLinearGradient(0, 0, size, 0);
    riverGradient.addColorStop(0, 'rgba(47, 114, 186, 0.35)');
    riverGradient.addColorStop(1, 'rgba(38, 102, 182, 0.75)');
    ctx.fillStyle = riverGradient;
    ctx.beginPath();
    [
      { x: 6, z: -56 }, { x: 12, z: -40 }, { x: 12, z: -20 }, { x: 8, z: 0 }, { x: 5, z: 28 }, { x: 11, z: 56 },
      { x: 18, z: 56 }, { x: 16, z: 30 }, { x: 16, z: 0 }, { x: 20, z: -30 }, { x: 14, z: -56 }
    ].forEach((point, index) => {
      const mapped = worldToCanvas(point.x, point.z, size);
      if (index === 0) ctx.moveTo(mapped.x, mapped.y);
      else ctx.lineTo(mapped.x, mapped.y);
    });
    ctx.closePath();
    ctx.fill();

    DISTRICTS.forEach((district) => {
      if (!district.points) return;
      ctx.beginPath();
      district.points.forEach((point, index) => {
        const mapped = worldToCanvas(point[0], point[1], size);
        if (index === 0) ctx.moveTo(mapped.x, mapped.y);
        else ctx.lineTo(mapped.x, mapped.y);
      });
      ctx.closePath();
      ctx.fillStyle = `#${district.color.toString(16).padStart(6, '0')}22`;
      ctx.fill();
    });

    road([{ x: -62, z: -4 }, { x: 42, z: -4 }], 34, 'rgba(51,71,97,0.96)');
    road([{ x: -62, z: -18 }, { x: 34, z: -18 }], 24, 'rgba(47,66,90,0.94)');
    road([{ x: -40, z: 16 }, { x: 48, z: 16 }], 28, 'rgba(51,71,97,0.94)');
    road([{ x: -28, z: 30 }, { x: 44, z: 30 }], 24, 'rgba(47,66,90,0.92)');
    road([{ x: -26, z: -30 }, { x: -26, z: 18 }], 24, 'rgba(51,71,97,0.94)');
    road([{ x: -10, z: -24 }, { x: -10, z: 26 }], 20, 'rgba(49,69,93,0.92)');
    road([{ x: 10, z: -54 }, { x: 10, z: 44 }], 20, 'rgba(49,69,93,0.92)');
    road([{ x: 26, z: -12 }, { x: 26, z: 40 }], 22, 'rgba(51,71,97,0.94)');

    road([{ x: -62, z: -4 }, { x: 42, z: -4 }], 6, 'rgba(245,214,126,0.42)');
    road([{ x: 10, z: -54 }, { x: 10, z: 44 }], 6, 'rgba(245,214,126,0.38)');

    ctx.fillStyle = 'rgba(231, 240, 255, 0.12)';
    [[-48, -28, 28, 6], [-44, -18, 24, 5]].forEach(([x, z, w, d]) => {
      const p = worldToCanvas(x, z, size);
      const p2 = worldToCanvas(x + w, z + d, size);
      ctx.save();
      ctx.translate((p.x + p2.x) / 2, (p.y + p2.y) / 2);
      ctx.rotate(-0.08);
      ctx.fillRect(-(p2.x - p.x) / 2, -(p2.y - p.y) / 2, p2.x - p.x, p2.y - p.y);
      ctx.restore();
    });

    ctx.fillStyle = 'rgba(103, 171, 95, 0.18)';
    [[-35, -18, 28, 20], [0, 8, 18, 22], [10, -56, 8, 112]].forEach(([x, z, w, d]) => {
      const p = worldToCanvas(x, z, size);
      const p2 = worldToCanvas(x + w, z + d, size);
      ctx.fillRect(Math.min(p.x, p2.x), Math.min(p.y, p2.y), Math.abs(p2.x - p.x), Math.abs(p2.y - p.y));
    });

    ctx.fillStyle = 'rgba(222, 236, 255, 0.3)';
    ctx.font = '600 30px Space Grotesk';
    [
      { text: 'Gateway Dr', x: -40, z: -8 },
      { text: 'Demers Ave', x: -8, z: -22 },
      { text: 'Columbia Rd', x: -32, z: -2, r: -Math.PI / 2 },
      { text: 'Washington St', x: 6, z: -8, r: -Math.PI / 2 },
      { text: '32nd Ave S', x: -12, z: 22 },
      { text: 'Red River', x: 20, z: 2, r: -Math.PI / 2 }
    ].forEach((label) => {
      const mapped = worldToCanvas(label.x, label.z, size);
      ctx.save();
      ctx.translate(mapped.x, mapped.y);
      ctx.rotate(label.r || 0);
      ctx.fillText(label.text, 0, 0);
      ctx.restore();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    texture.needsUpdate = true;
    return texture;
  };

  const makeGround = () => {
    const groundTexture = createCityTexture();
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 160, 1, 1),
      new THREE.MeshStandardMaterial({ map: groundTexture || null, color: groundTexture ? 0xffffff : 0x16243c, roughness: 0.96, metalness: 0.04 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    cityGroup.add(ground);

    const grid = new THREE.GridHelper(160, 32, 0x264468, 0x163251);
    grid.position.y = 0.01;
    grid.material.opacity = 0.12;
    grid.material.transparent = true;
    cityGroup.add(grid);

    const scan = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 160, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0x8fd7ff, transparent: true, opacity: 0.035 })
    );
    scan.rotation.x = -Math.PI / 2;
    scan.position.y = 0.015;
    cityGroup.add(scan);
  };

  const makeRiver = () => {
    const riverShape = new THREE.Shape();
    riverShape.moveTo(6, -56);
    riverShape.bezierCurveTo(12, -40, 12, -20, 8, 0);
    riverShape.bezierCurveTo(4, 16, 5, 32, 11, 56);
    riverShape.lineTo(18, 56);
    riverShape.bezierCurveTo(12, 32, 12, 16, 16, 0);
    riverShape.bezierCurveTo(20, -20, 20, -40, 14, -56);
    riverShape.closePath();

    const river = new THREE.Mesh(
      new THREE.ShapeGeometry(riverShape),
      new THREE.MeshStandardMaterial({ color: 0x2d83ff, emissive: 0x114bb1, emissiveIntensity: 0.6, transparent: true, opacity: 0.88 })
    );
    river.rotation.x = -Math.PI / 2;
    river.position.y = 0.08;
    cityGroup.add(river);
  };

  const makeRiverfrontPark = () => {
    const parkAreas = [
      { x: 2, z: 12, w: 15, d: 10, color: 0x294b2f },
      { x: 0, z: 18, w: 12, d: 11, color: 0x335d35 },
      { x: 15, z: 18, w: 7, d: 14, color: 0x315634 }
    ];

    parkAreas.forEach((area) => {
      const park = new THREE.Mesh(
        new THREE.BoxGeometry(area.w, 0.08, area.d),
        new THREE.MeshStandardMaterial({ color: area.color, roughness: 1, emissive: area.color, emissiveIntensity: isNight ? 0.03 : 0.01 })
      );
      park.position.set(area.x, 0.02, area.z);
      cityGroup.add(park);
    });

    for (let index = 0; index < 28; index += 1) {
      const treeX = -4 + (index % 7) * 3.2 + (index % 2 ? 0.8 : -0.4);
      const treeZ = 7 + Math.floor(index / 7) * 3.3 + (index % 3 ? 0.6 : -0.5);
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.18, 1.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x6c4f31, roughness: 1 })
      );
      trunk.position.set(treeX, 0.75, treeZ);
      cityGroup.add(trunk);

      const canopy = new THREE.Mesh(
        new THREE.SphereGeometry(0.9 + (index % 4) * 0.08, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x63a654, emissive: 0x2d5a28, emissiveIntensity: isNight ? 0.05 : 0.01, roughness: 0.92 })
      );
      canopy.position.set(treeX, 1.85, treeZ);
      cityGroup.add(canopy);
    }

    const promenade = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.05, 28),
      new THREE.MeshStandardMaterial({ color: 0xcab38a, roughness: 1 })
    );
    promenade.position.set(4.9, 0.04, 15);
    promenade.rotation.y = -0.05;
    cityGroup.add(promenade);
  };

  const makeBridge = () => {
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(11.3, 0.7, 10.8);
    bridgeGroup.rotation.y = -0.22;

    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(17, 0.45, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xb5c1cf, metalness: 0.68, roughness: 0.42, emissive: 0x4d5e74, emissiveIntensity: isNight ? 0.16 : 0.03 })
    );
    bridgeGroup.add(deck);

    const railMaterial = new THREE.MeshStandardMaterial({ color: 0xd9e4ee, metalness: 0.72, roughness: 0.3 });
    [-0.9, 0.9].forEach((offset) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(17.4, 0.14, 0.12), railMaterial);
      rail.position.set(0, 0.5, offset);
      bridgeGroup.add(rail);
    });

    for (let index = -3; index <= 3; index += 1) {
      const truss = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 2.1, 0.16),
        new THREE.MeshStandardMaterial({ color: 0xd7e0ea, metalness: 0.75, roughness: 0.28 })
      );
      truss.position.set(index * 2.25, 1.2, 0);
      bridgeGroup.add(truss);

      if (index < 3) {
        const diagA = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 0.12), railMaterial);
        diagA.position.set(index * 2.25 + 1.1, 1.75, 0);
        diagA.rotation.z = 0.62;
        bridgeGroup.add(diagA);

        const diagB = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 0.12), railMaterial);
        diagB.position.set(index * 2.25 + 1.1, 0.82, 0);
        diagB.rotation.z = -0.62;
        bridgeGroup.add(diagB);
      }
    }

    [-7.2, 7.2].forEach((x) => {
      const pier = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 3.2, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x80776c, roughness: 0.9 })
      );
      pier.position.set(x, -1.3, 0);
      bridgeGroup.add(pier);
    });

    cityGroup.add(bridgeGroup);
  };

  const makeRoad = (x, z, width, depth, rot = 0) => {
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.06, depth),
      new THREE.MeshStandardMaterial({ color: 0x32445d, roughness: 0.95 })
    );
    road.position.set(x, 0.04, z);
    road.rotation.y = rot;
    roadGroup.add(road);
  };

  const buildRoads = () => {
    [
      [-10, -4, 108, 2.8, 0],
      [-12, -18, 96, 2.2, 0],
      [8, 16, 104, 2.7, 0],
      [8, 30, 84, 2.2, 0],
      [-26, -8, 2.4, 54, 0],
      [-10, -2, 2.4, 64, 0],
      [10, -4, 2.5, 112, 0],
      [26, 14, 2.7, 54, 0],
      [-44, -24, 30, 2.4, 0.08],
      [-38, -18, 22, 2.2, 0.08]
    ].forEach(([x, z, width, depth, rot]) => makeRoad(x, z, width, depth, rot));

    [
      [-10, -4, 108, 0.16, 0],
      [10, -4, 0.16, 112, 0],
      [8, 16, 104, 0.16, 0],
      [-26, -8, 0.16, 54, 0]
    ].forEach(([x, z, width, depth, rot]) => {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.03, depth),
        new THREE.MeshBasicMaterial({ color: 0xf1d98e, transparent: true, opacity: 0.7 })
      );
      stripe.position.set(x, 0.08, z);
      stripe.rotation.y = rot;
      roadGroup.add(stripe);
    });
  };

  const buildDistricts = () => {
    DISTRICTS.forEach((district) => {
      let geometry;
      if (district.points) {
        const shape = new THREE.Shape();
        district.points.forEach(([x, z], index) => {
          if (index === 0) shape.moveTo(x, z);
          else shape.lineTo(x, z);
        });
        geometry = new THREE.ShapeGeometry(shape);
      } else {
        geometry = new THREE.PlaneGeometry(district.size.x, district.size.z);
      }

      const districtMesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({ color: district.color, transparent: true, opacity: 0.18, emissive: district.color, emissiveIntensity: 0.18 })
      );
      districtMesh.rotation.x = -Math.PI / 2;
      districtMesh.position.set(district.center.x, 0.12, district.center.z);
      districtMesh.userData = { type: 'district', ...district };
      districtGroup.add(districtMesh);
      districtMeshes.push(districtMesh);
      clickable.push(districtMesh);

      const label = createLabelSprite(district.name, '#eef7ff', 'rgba(8,17,33,0.86)');
      if (label) {
        label.position.set(district.center.x, 5.4, district.center.z);
        label.userData = { districtId: district.id, kind: 'district-label' };
        labelGroup.add(label);
      }
    });
  };

  const addBuilding = (x, z, w, h, d, color, roughness = 0.58) => {
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: isNight ? 0.08 : 0.02, roughness, metalness: 0.18 })
    );
    building.position.set(x, h * 0.5, z);
    cityGroup.add(building);
    return building;
  };

  const addMarker = (item) => {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 2.4, 10),
      new THREE.MeshStandardMaterial({ color: 0xd9eaff, emissive: 0x90c8ff, emissiveIntensity: isNight ? 0.5 : 0.18 })
    );
    pole.position.set(item.x, item.height + 1.2, item.z);
    landmarkGroup.add(pole);

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 20, 20),
      new THREE.MeshStandardMaterial({ color: item.color, emissive: item.color, emissiveIntensity: isNight ? 0.95 : 0.26 })
    );
    beacon.position.set(item.x, item.height + 2.5, item.z);
    beacon.userData = { type: 'landmark', ...item };
    landmarkGroup.add(beacon);
    landmarkMeshes.push(beacon);
    clickable.push(beacon);

    const label = createLabelSprite(item.name, '#f2f7ff', 'rgba(5,12,30,0.82)');
    if (label) {
      label.position.set(item.x, item.height + 4.3, item.z);
      label.userData = { landmarkId: item.id, kind: 'landmark-label' };
      labelGroup.add(label);
    }
  };

  const buildLandmarks = () => {
    LANDMARKS.forEach((item) => {
      addBuilding(item.x, item.z, 4.2, item.height, 4.2, item.color);
      addMarker(item);
    });

    const addCluster = (originX, originZ, cols, rows, palette, spacingX = 4.4, spacingZ = 4.1, baseHeight = 4.5) => {
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = originX + col * spacingX + ((row % 2) * 0.45);
          const z = originZ + row * spacingZ;
          const height = baseHeight + ((row + col) % 5) * 1.1;
          const width = 2.6 + (col % 3) * 0.4;
          const depth = 2.5 + (row % 2) * 0.6;
          const color = palette[(row + col) % palette.length];
          addBuilding(x, z, width, height, depth, color, 0.62);
        }
      }
    };

    addCluster(-30, -14, 5, 4, [0x446f9d, 0x527ca9, 0x5d88b6], 4.8, 4.2, 5.2);
    addCluster(-6, -10, 5, 4, [0x8f6b4f, 0xa37856, 0xc18d67], 4.2, 4.2, 6.4);
    addCluster(15, -6, 4, 3, [0x8c6a93, 0x9f77a4, 0xb784b9], 4.5, 4.4, 5.6);
    addCluster(20, 14, 5, 3, [0x507b5d, 0x5d8868, 0x6b9774], 4.8, 4.4, 4.5);

    [[-44, -28, 12, 3.6, 8, 0x496d8d], [-37, -22, 10, 3.2, 7, 0x5a7fa5], [-39, -18, 18, 2.6, 4.5, 0x6f98c2]].forEach(
      ([x, z, w, h, d, color]) => addBuilding(x, z, w, h, d, color, 0.74)
    );
  };

  const buildTraffic = () => {
    const curves = [
      [new THREE.Vector3(-34, 0.18, -4), new THREE.Vector3(-12, 0.18, -4), new THREE.Vector3(8, 0.18, -4), new THREE.Vector3(34, 0.18, -4)],
      [new THREE.Vector3(10, 0.18, -40), new THREE.Vector3(10, 0.18, -12), new THREE.Vector3(10, 0.18, 16), new THREE.Vector3(10, 0.18, 40)],
      [new THREE.Vector3(18, 0.18, -24), new THREE.Vector3(28, 0.18, -22), new THREE.Vector3(34, 0.18, -20), new THREE.Vector3(38, 0.18, -18)]
    ].map((points) => new THREE.CatmullRomCurve3(points));

    curves.forEach((curve, curveIndex) => {
      for (let i = 0; i < 8; i += 1) {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 10, 10),
          new THREE.MeshStandardMaterial({ color: curveIndex === 0 ? 0x6effd8 : curveIndex === 1 ? 0xffd166 : 0xff8a5c, emissive: curveIndex === 0 ? 0x2bd9b0 : curveIndex === 1 ? 0xe5aa2b : 0xff6f3c, emissiveIntensity: 0.9 })
        );
        const progress = (i / 8) + curveIndex * 0.06;
        dot.userData = { curve, progress, speed: 0.03 + i * 0.002 };
        trafficDots.push(dot);
        trafficGroup.add(dot);
      }
    });
  };

  makeGround();
  makeRiver();
  makeRiverfrontPark();
  makeBridge();
  buildRoads();
  buildDistricts();
  buildLandmarks();
  buildTraffic();

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const clock = new THREE.Clock();
  let selectedId = null;
  let dragMode = null;
  let lastX = 0;
  let lastY = 0;

  landmarkCount.textContent = String(LANDMARKS.length);

  const updateSelectionCard = (item, kind = 'landmark') => {
    if (!selectionCard) return;
    if (!item) {
      selectionCard.innerHTML = '<h3>Nothing selected</h3><p>Click a marker in the scene or use Quick Focus.</p>';
      return;
    }
    selectionCard.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description || item.desc}</p>
      <p><strong>Type:</strong> ${kind === 'district' ? 'District' : item.type || 'landmark'}</p>
    `;
  };

  const updateActiveList = () => {
    document.querySelectorAll('.list-item').forEach((node) => {
      node.classList.toggle('active', node.dataset.id === selectedId);
    });
  };

  const selectById = (id) => {
    selectedId = id;
    const district = DISTRICTS.find((item) => item.id === id);
    const landmark = LANDMARKS.find((item) => item.id === id);
    if (district) {
      updateSelectionCard(district, 'district');
      cameraTarget.set(district.center.x, 0, district.center.z);
    }
    if (landmark) {
      updateSelectionCard(landmark, 'landmark');
      cameraTarget.set(landmark.x, 3, landmark.z);
      radius = Math.max(26, radius * 0.72);
    }
    updateActiveList();
  };

  const renderLists = (query = '') => {
    const normalized = query.trim().toLowerCase();

    districtList.innerHTML = '';
    DISTRICTS.forEach((district) => {
      const div = document.createElement('article');
      div.className = 'list-item';
      div.dataset.id = district.id;
      div.innerHTML = `<h3>${district.name}</h3><p>${district.description}</p>`;
      div.addEventListener('click', () => selectById(district.id));
      districtList.appendChild(div);
    });

    landmarkList.innerHTML = '';
    LANDMARKS
      .filter((item) => !normalized || `${item.name} ${item.type} ${item.desc}`.toLowerCase().includes(normalized))
      .forEach((item) => {
        const div = document.createElement('article');
        div.className = 'list-item';
        div.dataset.id = item.id;
        div.innerHTML = `<h4>${item.name}</h4><p>${item.desc}</p>`;
        div.addEventListener('click', () => selectById(item.id));
        landmarkList.appendChild(div);
      });
    updateActiveList();
  };

  renderLists();

  const updateCamera = () => {
    const sinPhi = Math.sin(phi);
    camera.position.set(
      cameraTarget.x + radius * sinPhi * Math.sin(theta),
      cameraTarget.y + radius * Math.cos(phi),
      cameraTarget.z + radius * sinPhi * Math.cos(theta)
    );
    camera.lookAt(cameraTarget);
  };

  const setNightMode = (night) => {
    isNight = night;
    renderer.setClearColor(night ? 0x050b16 : 0xcfe8ff, 1);
    scene.fog.color.setHex(night ? 0x07111f : 0xdcecff);
    ambientLight.intensity = night ? 1.1 : 1.45;
    sunLight.intensity = night ? 1.4 : 1.8;
    accentLight.intensity = night ? 1.6 : 0.5;
    landmarkMeshes.forEach((mesh) => {
      mesh.material.emissiveIntensity = night && toggleGlow.checked ? 0.95 : 0.15;
    });
    cityGroup.traverse((child) => {
      if (child.isMesh && child.material && child.material.emissiveIntensity !== undefined && !landmarkMeshes.includes(child)) {
        child.material.emissiveIntensity = night && toggleGlow.checked ? 0.08 : 0.01;
      }
    });
    modeLabel.textContent = night ? 'Night Twin' : 'Day Twin';
    toggleDayBtn.textContent = night ? 'Day Mode' : 'Night Mode';
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

  searchInput?.addEventListener('input', () => renderLists(searchInput.value));
  toggleDistricts?.addEventListener('change', () => {
    districtGroup.visible = toggleDistricts.checked;
    labelGroup.children.forEach((sprite) => {
      if (sprite.userData.kind === 'district-label') {
        sprite.visible = toggleDistricts.checked;
      }
    });
  });
  toggleLandmarks?.addEventListener('change', () => {
    landmarkGroup.visible = toggleLandmarks.checked;
    labelGroup.children.forEach((sprite) => {
      if (sprite.userData.kind === 'landmark-label') {
        sprite.visible = toggleLandmarks.checked;
      }
    });
  });
  toggleTraffic?.addEventListener('change', () => {
    trafficGroup.visible = toggleTraffic.checked;
  });
  toggleGlow?.addEventListener('change', () => setNightMode(isNight));
  resetCameraBtn?.addEventListener('click', () => {
    radius = 92;
    theta = 0.7;
    phi = 1.0;
    cameraTarget.set(4, 0, -2);
    selectedId = null;
    updateSelectionCard(null);
    updateActiveList();
  });
  toggleDayBtn?.addEventListener('click', () => setNightMode(!isNight));
  focusChips.forEach((chip) => {
    chip.addEventListener('click', () => selectById(chip.dataset.target));
  });

  threeStage.addEventListener('pointerdown', (event) => {
    lastX = event.clientX;
    lastY = event.clientY;
    dragMode = event.button === 2 ? 'pan' : 'orbit';
  });

  threeStage.addEventListener('pointermove', (event) => {
    if (!dragMode) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;

    if (dragMode === 'orbit') {
      theta -= dx * 0.006;
      phi = Math.min(Math.max(0.3, phi + dy * 0.006), 1.45);
    } else {
      cameraTarget.x -= dx * 0.08;
      cameraTarget.z -= dy * 0.08;
    }
  });

  window.addEventListener('pointerup', () => {
    dragMode = null;
  });

  threeStage.addEventListener('wheel', (event) => {
    event.preventDefault();
    radius = Math.min(140, Math.max(18, radius + event.deltaY * 0.03));
  }, { passive: false });

  threeStage.addEventListener('contextmenu', (event) => event.preventDefault());

  threeStage.addEventListener('click', (event) => {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(clickable, false);
    if (hits.length > 0) {
      const item = hits[0].object.userData;
      selectById(item.id);
    }
  });

  const animate = () => {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    if (!dragMode) {
      theta += 0.0012;
    }
    updateCamera();

    trafficDots.forEach((dot) => {
      dot.userData.progress = (dot.userData.progress + dot.userData.speed * 0.0018) % 1;
      const pos = dot.userData.curve.getPointAt(dot.userData.progress);
      dot.position.copy(pos);
      dot.position.y = 0.35 + Math.sin(elapsed * 2 + dot.userData.progress * Math.PI * 2) * 0.03;
    });

    landmarkMeshes.forEach((mesh, index) => {
      mesh.position.y = LANDMARKS[index].height + 2.5 + Math.sin(elapsed * 1.8 + index) * 0.12;
      mesh.rotation.y += 0.01;
    });

    labelGroup.children.forEach((sprite, index) => {
      sprite.material.opacity = 0.82 + Math.sin(elapsed * 1.2 + index) * 0.08;
    });

    renderer.render(scene, camera);
  };

  animate();
}

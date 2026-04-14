const sceneRoot = document.querySelector('#sceneRoot');
const unitName = document.querySelector('#unitName');
const unitDesc = document.querySelector('#unitDesc');
const unitStatus = document.querySelector('#unitStatus');
const unitEfficiency = document.querySelector('#unitEfficiency');
const unitLoad = document.querySelector('#unitLoad');
const unitAlert = document.querySelector('#unitAlert');
const processList = document.querySelector('#processList');

const kpiInflow = document.querySelector('#kpiInflow');
const kpiTurbidity = document.querySelector('#kpiTurbidity');
const kpiChlorine = document.querySelector('#kpiChlorine');
const kpiOutput = document.querySelector('#kpiOutput');
const kpiEnergy = document.querySelector('#kpiEnergy');

const toggleSimBtn = document.querySelector('#toggleSimBtn');
const flowSlider = document.querySelector('#flowSlider');

const units = [
  {
    id: 'intake',
    name: 'River Intake and Screening',
    desc: 'Raw water enters from Red River intake and passes coarse and fine debris screening.',
    status: 'Stable',
    efficiency: '94%',
    load: 'High Inflow',
    alert: 'Minor debris spike 18m ago',
    roadmap: ['Automated gate tuning', 'Debris AI forecast', 'Pump wear prediction'],
    position: [-8, 0.7, -2],
    size: [2.2, 1.4, 2.2],
    color: 0x4fb7ff
  },
  {
    id: 'coag',
    name: 'Coagulation and Flocculation',
    desc: 'Chemical dosing and mixers aggregate suspended particles for easier removal.',
    status: 'Stable',
    efficiency: '96%',
    load: 'Optimal',
    alert: 'None',
    roadmap: ['Dose optimization agent', 'Jar test recommendation model', 'Polymer savings dashboard'],
    position: [-4.4, 0.8, 0.2],
    size: [2.3, 1.6, 2.4],
    color: 0x58c8ff
  },
  {
    id: 'clarifier',
    name: 'Clarification Basin',
    desc: 'Settles formed flocs and removes sludge before filtration stage.',
    status: 'Watch',
    efficiency: '91%',
    load: 'Rising Sludge',
    alert: 'Sludge blanket near threshold',
    roadmap: ['Sludge blanket CV detection', 'Auto desludge timing', 'Overflow risk predictor'],
    position: [-0.6, 0.75, 0.6],
    size: [2.8, 1.5, 2.6],
    color: 0x6ed6ff
  },
  {
    id: 'filter',
    name: 'Dual Media Filters',
    desc: 'High-rate filters polish water by removing remaining fine particulates.',
    status: 'Stable',
    efficiency: '97%',
    load: 'Balanced',
    alert: 'Backwash in 24 min',
    roadmap: ['Adaptive backwash controller', 'Headloss prediction', 'Filter performance twin'],
    position: [3.1, 0.9, -0.1],
    size: [2.6, 1.8, 2.2],
    color: 0x71e0ff
  },
  {
    id: 'disinfection',
    name: 'Disinfection and Contact Tanks',
    desc: 'Disinfection ensures microbial safety and residual protection in distribution.',
    status: 'Stable',
    efficiency: '98%',
    load: 'Nominal',
    alert: 'Residual setpoint adjusted',
    roadmap: ['Residual optimization AI', 'CT compliance copilot', 'Auto alarm triage'],
    position: [6.6, 0.8, -1.6],
    size: [2.1, 1.6, 2.6],
    color: 0x84ecff
  },
  {
    id: 'distribution',
    name: 'Clearwell and Distribution Pumps',
    desc: 'Finished water storage and variable-speed pumps feed city distribution network.',
    status: 'Stable',
    efficiency: '95%',
    load: 'Evening ramp',
    alert: 'Pump 3 vibration trending up',
    roadmap: ['Pump maintenance forecasting', 'Pressure optimization', 'District demand prediction'],
    position: [9.7, 0.75, 0.8],
    size: [2.2, 1.5, 2.4],
    color: 0x98f3ff
  }
];

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(sceneRoot.clientWidth, sceneRoot.clientHeight);
sceneRoot.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x06162f);
scene.fog = new THREE.Fog(0x081a37, 24, 56);

const camera = new THREE.PerspectiveCamera(45, sceneRoot.clientWidth / sceneRoot.clientHeight, 0.1, 160);
camera.position.set(14, 12, 16);

scene.add(new THREE.HemisphereLight(0xaedcff, 0x08172d, 0.9));
const sun = new THREE.DirectionalLight(0xffffff, 0.92);
sun.position.set(18, 24, 8);
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(36, 24),
  new THREE.MeshStandardMaterial({ color: 0x0b2a52, roughness: 0.92, metalness: 0.03 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const channel = new THREE.Mesh(
  new THREE.PlaneGeometry(31, 2.4),
  new THREE.MeshStandardMaterial({ color: 0x1f7cc7, roughness: 0.3, metalness: 0.06 })
);
channel.rotation.x = -Math.PI / 2;
channel.position.set(1.2, 0.02, -2.1);
scene.add(channel);

const pipes = [];
const pipeMaterial = new THREE.MeshStandardMaterial({ color: 0x8eb8dd, roughness: 0.38, metalness: 0.62 });

for (let i = 0; i < units.length - 1; i += 1) {
  const a = units[i].position;
  const b = units[i + 1].position;
  const dx = b[0] - a[0];
  const dz = b[2] - a[2];
  const len = Math.sqrt(dx * dx + dz * dz);
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, len, 16), pipeMaterial);
  pipe.rotation.z = Math.PI / 2;
  pipe.rotation.y = Math.atan2(dz, dx);
  pipe.position.set((a[0] + b[0]) / 2, 1.16, (a[2] + b[2]) / 2);
  scene.add(pipe);
  pipes.push(pipe);
}

const unitMeshes = [];

const createUnitMesh = (u) => {
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(u.size[0], u.size[1], u.size[2]),
    new THREE.MeshStandardMaterial({
      color: u.color,
      roughness: 0.44,
      metalness: 0.14,
      emissive: u.color,
      emissiveIntensity: 0.15
    })
  );
  body.position.set(u.position[0], u.size[1] / 2, u.position[2]);
  body.userData.unit = u;
  body.userData.baseY = u.size[1] / 2;

  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(u.size[0] * 0.72, 0.12, u.size[2] * 0.72),
    new THREE.MeshStandardMaterial({ color: 0xe8f6ff, roughness: 0.8 })
  );
  cap.position.y = u.size[1] / 2 + 0.08;
  body.add(cap);

  scene.add(body);
  unitMeshes.push(body);
};

units.forEach(createUnitMesh);

const particles = [];
for (let i = 0; i < 140; i += 1) {
  const drop = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x8bd8ff, transparent: true, opacity: 0.78 })
  );
  drop.position.set(-10 + Math.random() * 22, 0.4 + Math.random() * 0.5, -2.1 + (Math.random() - 0.5) * 1.7);
  drop.userData.speed = 0.03 + Math.random() * 0.03;
  scene.add(drop);
  particles.push(drop);
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let activeUnit = null;
let simulationRunning = true;
let flowScale = 1;

const setUnitDetails = (u) => {
  if (!u) {
    unitName.textContent = 'Plant Overview';
    unitDesc.textContent = 'Click any treatment unit in the 3D scene to inspect status and process role.';
    unitStatus.textContent = 'Stable';
    unitEfficiency.textContent = '96%';
    unitLoad.textContent = 'Normal';
    unitAlert.textContent = 'None';
    processList.innerHTML = '';
    ['Raw intake to clearwell pipeline active', 'Automated control loops regulating turbidity and residuals', 'Predictive maintenance guarding pump reliability'].forEach((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      processList.appendChild(li);
    });
    return;
  }

  unitName.textContent = u.name;
  unitDesc.textContent = u.desc;
  unitStatus.textContent = u.status;
  unitEfficiency.textContent = u.efficiency;
  unitLoad.textContent = u.load;
  unitAlert.textContent = u.alert;
  processList.innerHTML = '';
  u.roadmap.forEach((t) => {
    const li = document.createElement('li');
    li.textContent = t;
    processList.appendChild(li);
  });
};

const selectUnit = (mesh) => {
  if (activeUnit) {
    activeUnit.material.emissiveIntensity = 0.15;
  }
  activeUnit = mesh;
  if (activeUnit) {
    activeUnit.material.emissiveIntensity = 0.35;
    setUnitDetails(activeUnit.userData.unit);
  } else {
    setUnitDetails(null);
  }
};

renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(unitMeshes, false);
  if (hits.length) {
    selectUnit(hits[0].object);
  }
});

if (toggleSimBtn) {
  toggleSimBtn.addEventListener('click', () => {
    simulationRunning = !simulationRunning;
    toggleSimBtn.textContent = simulationRunning ? 'Pause Simulation' : 'Resume Simulation';
  });
}

if (flowSlider) {
  flowSlider.addEventListener('input', () => {
    const val = Number(flowSlider.value || 100);
    flowScale = val / 100;
  });
}

let orbitAngle = 0.9;
let orbitRadius = 22;
let orbitHeight = 12;
let dragging = false;
let lastX = 0;

const updateCamera = () => {
  camera.position.x = Math.cos(orbitAngle) * orbitRadius;
  camera.position.z = Math.sin(orbitAngle) * orbitRadius;
  camera.position.y = orbitHeight;
  camera.lookAt(0.8, 1.2, -0.7);
};

updateCamera();

renderer.domElement.addEventListener('pointerdown', (event) => {
  dragging = true;
  lastX = event.clientX;
  renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  const dx = event.clientX - lastX;
  lastX = event.clientX;
  orbitAngle -= dx * 0.006;
  updateCamera();
});

renderer.domElement.addEventListener('pointerup', (event) => {
  dragging = false;
  renderer.domElement.releasePointerCapture(event.pointerId);
});

window.addEventListener('wheel', (event) => {
  orbitRadius += event.deltaY * 0.01;
  orbitRadius = Math.min(32, Math.max(12, orbitRadius));
  updateCamera();
}, { passive: true });

window.addEventListener('resize', () => {
  const width = sceneRoot.clientWidth;
  const height = sceneRoot.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

const updateKpis = (time) => {
  const inflow = 18.4 * flowScale + Math.sin(time * 0.22) * 0.3;
  const turb = 0.31 + (2 - flowScale) * 0.03 + Math.sin(time * 0.25) * 0.01;
  const chlor = 1.8 + Math.sin(time * 0.31) * 0.08;
  const output = inflow - 0.4 - Math.max(0, (flowScale - 1) * 0.25);
  const energy = 4.2 + (flowScale - 1) * 0.8 + Math.abs(Math.sin(time * 0.19)) * 0.18;

  if (kpiInflow) kpiInflow.textContent = `${inflow.toFixed(1)} MGD`;
  if (kpiTurbidity) kpiTurbidity.textContent = `${turb.toFixed(2)} NTU`;
  if (kpiChlorine) kpiChlorine.textContent = `${chlor.toFixed(2)} mg/L`;
  if (kpiOutput) kpiOutput.textContent = `${output.toFixed(1)} MGD`;
  if (kpiEnergy) kpiEnergy.textContent = `${energy.toFixed(1)} MW`;
};

const clock = new THREE.Clock();

const animate = () => {
  const t = clock.getElapsedTime();

  if (simulationRunning) {
    for (let i = 0; i < unitMeshes.length; i += 1) {
      const m = unitMeshes[i];
      const bob = Math.sin(t * 1.1 + i * 0.7) * 0.03;
      m.position.y = m.userData.baseY + bob;
    }

    for (const p of particles) {
      p.position.x += p.userData.speed * flowScale;
      if (p.position.x > 12) {
        p.position.x = -10.6;
      }
      p.material.opacity = 0.55 + Math.sin((p.position.x + t) * 1.6) * 0.22;
    }

    for (let i = 0; i < pipes.length; i += 1) {
      pipes[i].material.emissive = new THREE.Color(0x2a6cb0);
      pipes[i].material.emissiveIntensity = 0.05 + (Math.sin(t * 2 + i) + 1) * 0.08;
    }

    updateKpis(t);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

setUnitDetails(null);
animate();

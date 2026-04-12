const revealNodes = document.querySelectorAll('.reveal');
const cursorGlow = document.querySelector('.cursor-glow');
const tiltCards = document.querySelectorAll('.tilt-card');
const orbOne = document.querySelector('.orb-one');
const orbTwo = document.querySelector('.orb-two');
const orbThree = document.querySelector('.orb-three');
const threeStage = document.querySelector('.three-stage');
const chatLog = document.querySelector('#chatLog');
const chatForm = document.querySelector('#chatForm');
const chatInput = document.querySelector('#chatInput');
const promptChips = document.querySelectorAll('.prompt-chip');

let pointerX = window.innerWidth * 0.5;
let pointerY = window.innerHeight * 0.5;

for (const node of revealNodes) {
  const delay = Number.parseFloat(node.getAttribute('data-delay') || '0');
  node.style.setProperty('--reveal-delay', `${delay}s`);
}

window.addEventListener('pointermove', (event) => {
  pointerX = event.clientX;
  pointerY = event.clientY;

  if (cursorGlow) {
    cursorGlow.style.left = `${pointerX}px`;
    cursorGlow.style.top = `${pointerY}px`;
  }

  const centerX = window.innerWidth * 0.5;
  const centerY = window.innerHeight * 0.5;
  const offsetX = (pointerX - centerX) / centerX;
  const offsetY = (pointerY - centerY) / centerY;

  if (orbOne) {
    orbOne.style.transform = `translate(${offsetX * -20}px, ${offsetY * -14}px)`;
  }
  if (orbTwo) {
    orbTwo.style.transform = `translate(${offsetX * 18}px, ${offsetY * 16}px)`;
  }
  if (orbThree) {
    orbThree.style.transform = `translate(${offsetX * 10}px, ${offsetY * -18}px)`;
  }
});

for (const card of tiltCards) {
  card.addEventListener('pointermove', (event) => {
    const bounds = card.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const rotateY = ((x / bounds.width) - 0.5) * 14;
    const rotateX = (0.5 - (y / bounds.height)) * 14;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  });

  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
}

if (threeStage && !window.THREE) {
  threeStage.innerHTML = '<p class="three-error">3D engine failed to load. Check internet or script blockers.</p>';
}

if (threeStage && window.THREE) {
  try {
    const internalTargetMain = '../learning-paths/learning-paths.html';
    const internalTargetLab = '../digital-twin-lab/digital-twin-lab.html';
    const pointTargetUrl = internalTargetMain;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1038, 0.035);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 0.35, 6.9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeStage.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0x77d7ff, 2.8, 36);
    keyLight.position.set(4.2, 2.8, 8.2);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xff7a18, 2, 32);
    fillLight.position.set(-3.8, -2.6, 5);
    scene.add(fillLight);

    const backLight = new THREE.PointLight(0xf94bb3, 1.8, 26);
    backLight.position.set(0, 1.8, -4.5);
    scene.add(backLight);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    const clickable = [];
    const knowledge = [];

    const registerNode = (mesh, details) => {
      mesh.userData = { ...mesh.userData, ...details };
      clickable.push(mesh);
      knowledge.push({
        id: details.id,
        title: details.title,
        keywords: details.keywords,
        url: details.url,
        mesh
      });
    };

    const worldGeometry = new THREE.SphereGeometry(1.45, 64, 64);
    const worldMaterial = new THREE.MeshStandardMaterial({
      color: 0x55b9ff,
      emissive: 0x1f5dba,
      emissiveIntensity: 0.55,
      metalness: 0.28,
      roughness: 0.38
    });
    const worldSphere = new THREE.Mesh(worldGeometry, worldMaterial);
    registerNode(worldSphere, {
      id: 'world-core',
      title: 'World Overview',
      keywords: ['world', 'overview', 'gateway', 'digital twin', 'core'],
      url: internalTargetMain
    });
    worldGroup.add(worldSphere);

    const latLonToVector = (latDeg, lonDeg, radius) => {
      const lat = THREE.MathUtils.degToRad(latDeg);
      const lon = THREE.MathUtils.degToRad(lonDeg);
      const x = radius * Math.cos(lat) * Math.sin(lon);
      const y = radius * Math.sin(lat);
      const z = radius * Math.cos(lat) * Math.cos(lon);
      return new THREE.Vector3(x, y, z);
    };

    const drawRoundedRect = (ctx, x, y, w, h, r) => {
      const rr = Math.min(r, w * 0.5, h * 0.5);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.lineTo(x + w - rr, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
      ctx.lineTo(x + w, y + h - rr);
      ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
      ctx.lineTo(x + rr, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
      ctx.lineTo(x, y + rr);
      ctx.quadraticCurveTo(x, y, x + rr, y);
      ctx.closePath();
    };

    const createDotLabel = (text) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const fontSize = 34;
      const paddingX = 18;
      const paddingY = 12;

      if (!ctx) {
        return null;
      }

      ctx.font = `700 ${fontSize}px Space Grotesk, sans-serif`;
      const textWidth = Math.ceil(ctx.measureText(text).width);
      canvas.width = textWidth + paddingX * 2;
      canvas.height = fontSize + paddingY * 2;

      ctx.font = `700 ${fontSize}px Space Grotesk, sans-serif`;
      ctx.fillStyle = 'rgba(8, 20, 52, 0.78)';
      ctx.strokeStyle = 'rgba(174, 231, 255, 0.9)';
      ctx.lineWidth = 2;

      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(1, 1, canvas.width - 2, canvas.height - 2, 16);
      } else {
        drawRoundedRect(ctx, 1, 1, canvas.width - 2, canvas.height - 2, 16);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#eaf5ff';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, paddingX, canvas.height * 0.5);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: false
      });

      const sprite = new THREE.Sprite(material);
      const worldScale = 0.006;
      sprite.scale.set(canvas.width * worldScale, canvas.height * worldScale, 1);
      return sprite;
    };

    const globeLinkPoints = [
      {
        id: 'point-a',
        title: 'Learning Paths Hub',
        keywords: ['learning', 'paths', 'hub', 'point'],
        color: 0x00d6c7,
        lat: 24,
        lon: 38,
        url: pointTargetUrl
      },
      {
        id: 'point-b',
        title: 'Gateway Project Point',
        keywords: ['gateway', 'project', 'main', 'point'],
        color: 0xf94bb3,
        lat: -18,
        lon: 132,
        url: pointTargetUrl
      },
      {
        id: 'point-c',
        title: 'Twin Lab Center',
        keywords: ['twin', 'lab', 'center', 'point'],
        color: 0xff7a18,
        lat: 12,
        lon: -48,
        url: pointTargetUrl
      },
      {
        id: 'point-d',
        title: 'World Guide Point',
        keywords: ['guide', 'world', 'overview', 'point'],
        color: 0x6eff6a,
        lat: -34,
        lon: -140,
        url: pointTargetUrl
      },
      {
        id: 'point-e',
        title: 'Path Discovery Point',
        keywords: ['learn', 'path', 'discovery', 'point'],
        color: 0xffd166,
        lat: 42,
        lon: -112,
        url: pointTargetUrl
      },
      {
        id: 'point-f',
        title: 'Twin Navigation Point',
        keywords: ['twin', 'navigation', 'flow', 'point'],
        color: 0x7ec8ff,
        lat: -8,
        lon: -8,
        url: pointTargetUrl
      },
      {
        id: 'point-g',
        title: 'Core Skills Point',
        keywords: ['core', 'skills', 'basics', 'point'],
        color: 0xb9ff7c,
        lat: 8,
        lon: 156,
        url: pointTargetUrl
      },
      {
        id: 'point-h',
        title: 'Progress Journey Point',
        keywords: ['journey', 'training', 'progress', 'point'],
        color: 0xff8ccf,
        lat: -46,
        lon: 70,
        url: pointTargetUrl
      }
    ];

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.62, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x74d8ff, transparent: true, opacity: 0.18 })
    );
    worldGroup.add(atmosphere);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.08, 24, 120),
      new THREE.MeshStandardMaterial({
        color: 0x6eff6a,
        emissive: 0x6eff6a,
        emissiveIntensity: 0.35,
        metalness: 0.5,
        roughness: 0.2
      })
    );
    ring.rotation.x = Math.PI * 0.32;
    registerNode(ring, {
      id: 'orbit-ring',
      title: 'Twin Lab Ring',
      keywords: ['ring', 'orbit', 'guide', 'twin lab'],
      url: internalTargetLab
    });
    worldGroup.add(ring);

    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xffd166,
        emissive: 0x8a5f00,
        emissiveIntensity: 0.25,
        metalness: 0.22,
        roughness: 0.6
      })
    );
    moon.position.set(2.3, 0.42, -0.4);
    registerNode(moon, {
      id: 'moon-node',
      title: 'Twin Lab Moon Point',
      keywords: ['moon', 'twin', 'lab', 'point'],
      url: internalTargetLab
    });
    worldGroup.add(moon);

    const nodeMeshes = [];
    for (const node of globeLinkPoints) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 20, 20),
        new THREE.MeshStandardMaterial({
          color: node.color,
          emissive: node.color,
          emissiveIntensity: 0.48,
          metalness: 0.34,
          roughness: 0.22
        })
      );
      mesh.position.copy(latLonToVector(node.lat, node.lon, 1.58));
      registerNode(mesh, {
        id: node.id,
        title: node.title,
        keywords: node.keywords,
        url: node.url
      });

      const label = createDotLabel(node.title);
      if (label) {
        const outward = mesh.position.clone().normalize().multiplyScalar(0.24);
        label.position.copy(mesh.position).add(outward);
        worldSphere.add(label);
      }

      worldSphere.add(mesh);
      nodeMeshes.push(mesh);
    }

    const starCount = 650;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const i3 = i * 3;
      starPositions[i3] = (Math.random() - 0.5) * 40;
      starPositions[i3 + 1] = (Math.random() - 0.5) * 22;
      starPositions[i3 + 2] = -2 - Math.random() * 26;
    }
    const starsGeometry = new THREE.BufferGeometry();
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starsGeometry,
      new THREE.PointsMaterial({ color: 0xd7e8ff, size: 0.04, transparent: true, opacity: 0.8 })
    );
    scene.add(stars);

    const linksGeometry = new THREE.BufferGeometry();
    const linePositions = [];
    for (const mesh of nodeMeshes) {
      linePositions.push(0, 0, 0, mesh.position.x, mesh.position.y, mesh.position.z);
    }
    linePositions.push(0, 0, 0, moon.position.x, moon.position.y, moon.position.z);
    linksGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const links = new THREE.LineSegments(
      linksGeometry,
      new THREE.LineBasicMaterial({ color: 0xd6eeff, transparent: true, opacity: 0.72 })
    );
    worldGroup.add(links);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const tempVector = new THREE.Vector3();
    let focusedMesh = worldSphere;
    let isDraggingSphere = false;
    let dragMoved = false;
    let dragLastX = 0;
    let dragLastY = 0;

    const goToUrl = (url) => {
      if (typeof url === 'string' && url.length > 0) {
        window.location.assign(url);
      }
    };

    const escapeHtml = (value) => value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');

    const appendMessage = (role, html) => {
      if (!chatLog) {
        return;
      }
      const message = document.createElement('p');
      message.className = `chat-msg ${role}`;
      message.innerHTML = html;
      chatLog.appendChild(message);
      chatLog.scrollTop = chatLog.scrollHeight;
    };

    const pulseMesh = (mesh) => {
      if (!mesh || !mesh.material || typeof mesh.material.emissiveIntensity !== 'number') {
        return;
      }
      mesh.material.emissiveIntensity += 0.55;
      setTimeout(() => {
        mesh.material.emissiveIntensity = Math.max(0.25, mesh.material.emissiveIntensity - 0.55);
      }, 260);
    };

    const scoreNode = (query, item) => {
      let score = 0;
      const words = query.split(/\s+/).filter(Boolean);
      const title = item.title.toLowerCase();
      const keywords = item.keywords.join(' ').toLowerCase();

      for (const word of words) {
        if (title.includes(word)) {
          score += 4;
        }
        if (keywords.includes(word)) {
          score += 2;
        }
      }

      if (title.includes(query)) {
        score += 5;
      }
      return score;
    };

    const searchWorld = (rawQuery) => {
      const query = rawQuery.trim().toLowerCase();
      if (!query) {
        appendMessage('bot', 'Type what you want to find in this 3D world.');
        return;
      }

      const ranked = knowledge
        .map((item) => ({ item, score: scoreNode(query, item) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      if (ranked.length === 0) {
        appendMessage('bot', 'No matching point found. Try words like <strong>learning</strong>, <strong>paths</strong>, <strong>twin</strong>, or <strong>world</strong>.');
        return;
      }

      focusedMesh = ranked[0].item.mesh;
      pulseMesh(focusedMesh);

      const openIntent = /open|go|visit|launch/.test(query);
      const top = ranked[0].item;

      if (openIntent) {
        appendMessage('bot', `Opening <strong>${escapeHtml(top.title)}</strong> now.`);
        goToUrl(top.url);
        return;
      }

      const list = ranked
        .map((entry) => `<a href="${entry.item.url}">${escapeHtml(entry.item.title)}</a>`)
        .join(' | ');

      appendMessage('bot', `Best matches: ${list}`);
    };

    const sizeRenderer = () => {
      const width = threeStage.clientWidth;
      const height = threeStage.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const moveCameraFromPointer = () => {
      const rect = threeStage.getBoundingClientRect();
      const localX = (pointerX - rect.left) / rect.width;
      const localY = (pointerY - rect.top) / rect.height;
      if (localX >= 0 && localX <= 1 && localY >= 0 && localY <= 1) {
        camera.position.x = (localX - 0.5) * 1.05;
        camera.position.y = (0.5 - localY) * 0.72 + 0.3;
        camera.lookAt(0, 0, 0);
      }
    };

    threeStage.addEventListener('pointerdown', (event) => {
      isDraggingSphere = true;
      dragMoved = false;
      dragLastX = event.clientX;
      dragLastY = event.clientY;
      threeStage.setPointerCapture(event.pointerId);
    });

    threeStage.addEventListener('pointermove', (event) => {
      if (!isDraggingSphere) {
        return;
      }
      const deltaX = event.clientX - dragLastX;
      const deltaY = event.clientY - dragLastY;
      if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
        dragMoved = true;
      }
      worldSphere.rotation.y += deltaX * 0.012;
      worldSphere.rotation.x += deltaY * 0.008;
      dragLastX = event.clientX;
      dragLastY = event.clientY;
    });

    threeStage.addEventListener('pointerup', (event) => {
      if (!dragMoved) {
        const rect = threeStage.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(clickable, true)[0];
        if (hit && hit.object && hit.object.userData.url) {
          focusedMesh = hit.object;
          pulseMesh(hit.object);
          appendMessage('bot', `Opening <strong>${escapeHtml(hit.object.userData.title || 'resource')}</strong>.`);
          goToUrl(hit.object.userData.url);
        }
      }
      isDraggingSphere = false;
      threeStage.releasePointerCapture(event.pointerId);
    });

    threeStage.addEventListener('pointerleave', () => {
      isDraggingSphere = false;
    });

    if (chatForm && chatInput) {
      chatForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = chatInput.value.trim();
        if (!query) {
          return;
        }
        appendMessage('user', escapeHtml(query));
        searchWorld(query);
        chatInput.value = '';
      });
    }

    for (const chip of promptChips) {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt') || '';
        if (!prompt) {
          return;
        }
        appendMessage('user', escapeHtml(prompt));
        searchWorld(prompt);
      });
    }

    window.addEventListener('resize', sizeRenderer);
    sizeRenderer();

    threeStage.classList.add('is-ready');

    const animate = () => {
      requestAnimationFrame(animate);
      moveCameraFromPointer();

      const t = performance.now() * 0.001;
      worldGroup.rotation.y += 0.0023;
      worldSphere.rotation.y += 0.0052;
      worldSphere.rotation.x += 0.0022;
      worldSphere.rotation.y += ((pointerX / window.innerWidth) - 0.5) * 0.0024;
      worldSphere.rotation.x += ((pointerY / window.innerHeight) - 0.5) * 0.0018;

      atmosphere.scale.setScalar(1 + Math.sin(t * 1.8) * 0.01);
      ring.rotation.z += 0.003;

      moon.position.x = Math.cos(t * 0.9) * 2.35;
      moon.position.z = Math.sin(t * 0.9) * 1.05;
      moon.position.y = Math.sin(t * 1.7) * 0.22;

      for (let i = 0; i < nodeMeshes.length; i += 1) {
        const mesh = nodeMeshes[i];
        mesh.position.y += Math.sin(t * 1.6 + i * 1.5) * 0.0016;
        mesh.position.x += Math.cos(t * 1.25 + i * 1.8) * 0.0011;
      }

      stars.rotation.y = t * 0.016;
      stars.rotation.x = Math.sin(t * 0.2) * 0.03;

      if (focusedMesh) {
        const target = focusedMesh.getWorldPosition(tempVector);
        worldGroup.position.x += (target.x * -0.08 - worldGroup.position.x) * 0.04;
        worldGroup.position.y += (target.y * -0.08 - worldGroup.position.y) * 0.04;
      }

      renderer.render(scene, camera);
    };

    animate();
  } catch (error) {
    console.error(error);
    threeStage.classList.remove('is-ready');
    threeStage.innerHTML = '<p class="three-error">Unable to render 3D sphere in this browser.</p>';
  }
}

const modesNode = document.querySelector('#modes');
const gatewayGrid = document.querySelector('#gatewayGrid');
const lifecycleNode = document.querySelector('#lifecycle');
const supportGrid = document.querySelector('#supportGrid');
const readinessCanvas = document.querySelector('#readinessCanvas');
const readinessLegend = document.querySelector('#readinessLegend');
const pipelineNode = document.querySelector('#pipeline');
const alignmentNode = document.querySelector('#alignment');
const cycleState = document.querySelector('#cycleState');
const runReadinessBtn = document.querySelector('#runReadiness');
const simulateTransferBtn = document.querySelector('#simulateTransfer');

const leftModelInput = document.querySelector('#leftModelInput');
const rightModelInput = document.querySelector('#rightModelInput');
const leftUploadBtn = document.querySelector('#leftUploadBtn');
const rightUploadBtn = document.querySelector('#rightUploadBtn');
const transferCanvas = document.querySelector('#transferCanvas');
const jobQueue = document.querySelector('#jobQueue');
const processLog = document.querySelector('#processLog');

const metricModel = document.querySelector('#metricModel');
const metricSource = document.querySelector('#metricSource');
const metricSize = document.querySelector('#metricSize');
const metricHash = document.querySelector('#metricHash');
const metricValidation = document.querySelector('#metricValidation');
const metricRisk = document.querySelector('#metricRisk');
const metricAccuracy = document.querySelector('#metricAccuracy');
const metricLatency = document.querySelector('#metricLatency');
const metricReadiness = document.querySelector('#metricReadiness');
const metricStatus = document.querySelector('#metricStatus');

const transferModes = [
	{
		title: 'Inward Transfer',
		text: 'Adopt evolving AI models and platforms into teaching, research, and operations.'
	},
	{
		title: 'Internal Transfer',
		text: 'Share AI workflows and best practices across departments and disciplines.'
	},
	{
		title: 'Outward Transfer',
		text: 'Enable trusted collaboration with industry, government, and community partners.'
	}
];

const gatewayStages = [
	['Model Intake', 'Version registration, metadata capture, provenance traceability'],
	['Safety Validation', 'Risk checks, misuse tests, and policy conformance assessment'],
	['Compliance Review', 'Data stewardship, privacy controls, and governance mapping'],
	['Performance Evaluation', 'Task benchmarks, latency checks, reliability thresholds'],
	['Controlled Deployment', 'Role-based release, environment gating, and observability'],
	['Lifecycle Monitoring', 'Continuous auditing, drift alerts, and retraining triggers']
];

const lifecycleStages = [
	['Design', 'Define outcomes, guardrails, and ownership'],
	['Pilot', 'Small-scale validation with selected departments'],
	['Scale', 'Institution-wide rollout with support resources'],
	['Monitor', 'Track risk, quality, and educational impact'],
	['Improve', 'Feedback-driven model tuning and workflow updates']
];

const supportTeam = [
	['Graduate AI Mentors', 'Hands-on consultations for faculty and research labs'],
	['Undergraduate Assistants', 'Peer onboarding, labs, and practical tool adoption'],
	['Technical Specialists', 'Infrastructure engineering, MLOps, and platform reliability'],
	['AI Help Desk', 'Centralized issue triage, training schedules, and support routing']
];

const pipeline = [
	['Research Output', 'Novel methods and prototypes from UND initiatives'],
	['AIT Transfer Intake', 'Suitability scoring and institutional relevance mapping'],
	['Gateway Validation', 'Security, compliance, and performance checks'],
	['Operational Integration', 'Embedding in courses, labs, and admin workflows'],
	['Regional Impact', 'Transfer to partners for broader societal value']
];

const alignCards = [
	['Moonshot Co.AI', 'Unified architecture for AI-enabled transformation across UND'],
	['Academic Excellence', 'Improved teaching support and adaptive learning experiences'],
	['Research Competitiveness', 'Faster pathway from discovery to practical deployment'],
	['Workforce Readiness', 'Institution-wide AI literacy and role-specific upskilling'],
	['Responsible AI Leadership', 'Transparent governance aligned with national priorities']
];

const readiness = [
	{ axis: 'Teaching', value: 74 },
	{ axis: 'Research', value: 82 },
	{ axis: 'Operations', value: 69 },
	{ axis: 'Infrastructure', value: 77 },
	{ axis: 'Governance', value: 71 },
	{ axis: 'Workforce', value: 67 }
];

const transferStageLabels = [
	'Gateway Intake',
	'Safety Validation',
	'Compliance Review',
	'Performance Evaluation',
	'Deployment Decision'
];

const acceptedExt = new Set(['onnx', 'pt', 'pth', 'bin', 'safetensors', 'gguf', 'json']);
const modelQueue = [];
const logItems = [];
let activeJob = null;

const transfer3D = {
	ready: false,
	scene: null,
	camera: null,
	renderer: null,
	token: null,
	ring: null,
	stageMeshes: [],
	lights: [],
	width: 0,
	height: 0,
	path: [],
	targetIndex: 0,
	moveResolver: null,
	leftPoint: null,
	rightPoint: null,
	gatewayPoint: null,
	stagePoints: [],
	finalPoint: null
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function formatBytes(value) {
	if (!Number.isFinite(value) || value <= 0) return '0 B';
	const units = ['B', 'KB', 'MB', 'GB'];
	let size = value;
	let i = 0;
	while (size >= 1024 && i < units.length - 1) {
		size /= 1024;
		i += 1;
	}
	return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[i]}`;
}

function shortText(text, max) {
	if (!text) return '';
	return text.length > max ? `${text.slice(0, max)}...` : text;
}

function renderCards(target, items, className) {
	if (!target) return;
	target.innerHTML = '';
	for (const [title, text] of items) {
		const card = document.createElement('article');
		card.className = className;
		card.innerHTML = `<strong>${title}</strong><span>${text}</span>`;
		target.appendChild(card);
	}
}

function renderModes() {
	if (!modesNode) return;
	modesNode.innerHTML = '';
	for (const mode of transferModes) {
		const card = document.createElement('article');
		card.className = 'mode-card';
		card.innerHTML = `<strong>${mode.title}</strong><span>${mode.text}</span>`;
		modesNode.appendChild(card);
	}
}

function renderReadinessLegend() {
	if (!readinessLegend) return;
	readinessLegend.innerHTML = '';
	for (const row of readiness) {
		const cls = row.value >= 75 ? 'pulse-ok' : row.value >= 68 ? 'pulse-warn' : 'pulse-alert';
		const item = document.createElement('div');
		item.className = `legend-item ${cls}`;
		item.innerHTML = `<b>${row.axis}</b> ${row.value}%`;
		readinessLegend.appendChild(item);
	}
}

function drawReadiness() {
	if (!readinessCanvas) return;
	const ctx = readinessCanvas.getContext('2d');
	if (!ctx) return;

	const rect = readinessCanvas.getBoundingClientRect();
	const dpr = window.devicePixelRatio || 1;
	const width = Math.max(320, Math.floor(rect.width));
	const height = Math.max(220, Math.floor(rect.height));

	if (readinessCanvas.width !== width * dpr || readinessCanvas.height !== height * dpr) {
		readinessCanvas.width = width * dpr;
		readinessCanvas.height = height * dpr;
	}

	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, width, height);

	const centerX = width / 2;
	const centerY = height / 2;
	const maxR = Math.min(width, height) * 0.34;
	const levels = 5;

	ctx.strokeStyle = 'rgba(149, 207, 255, 0.28)';
	ctx.fillStyle = 'rgba(149, 207, 255, 0.06)';
	for (let i = levels; i >= 1; i -= 1) {
		const r = (maxR * i) / levels;
		ctx.beginPath();
		ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}

	const angleStep = (Math.PI * 2) / readiness.length;
	const points = [];

	for (let i = 0; i < readiness.length; i += 1) {
		const angle = -Math.PI / 2 + i * angleStep;
		const r = (readiness[i].value / 100) * maxR;
		const x = centerX + Math.cos(angle) * r;
		const y = centerY + Math.sin(angle) * r;
		points.push([x, y]);

		const axisX = centerX + Math.cos(angle) * (maxR + 16);
		const axisY = centerY + Math.sin(angle) * (maxR + 16);

		ctx.strokeStyle = 'rgba(177, 224, 255, 0.25)';
		ctx.beginPath();
		ctx.moveTo(centerX, centerY);
		ctx.lineTo(centerX + Math.cos(angle) * maxR, centerY + Math.sin(angle) * maxR);
		ctx.stroke();

		ctx.fillStyle = '#dbeeff';
		ctx.font = '11px Space Grotesk, Segoe UI, sans-serif';
		ctx.fillText(readiness[i].axis, axisX - 26, axisY);
	}

	ctx.beginPath();
	for (let i = 0; i < points.length; i += 1) {
		const [x, y] = points[i];
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	}
	ctx.closePath();
	ctx.fillStyle = 'rgba(126, 240, 215, 0.25)';
	ctx.strokeStyle = 'rgba(126, 240, 215, 0.95)';
	ctx.lineWidth = 2;
	ctx.fill();
	ctx.stroke();

	for (const [x, y] of points) {
		ctx.beginPath();
		ctx.arc(x, y, 4.5, 0, Math.PI * 2);
		ctx.fillStyle = '#7ef0d7';
		ctx.fill();
	}
}

function animateLifecycle() {
	if (!lifecycleNode) return;
	const cards = Array.from(lifecycleNode.querySelectorAll('.lifecycle-step'));
	if (!cards.length) return;

	let idx = 0;
	cards[idx].classList.add('active');
	if (!activeJob && cycleState) {
		cycleState.textContent = cards[idx].querySelector('strong')?.textContent || 'Running';
	}

	setInterval(() => {
		cards[idx].classList.remove('active');
		idx = (idx + 1) % cards.length;
		cards[idx].classList.add('active');
		if (!activeJob && cycleState) {
			cycleState.textContent = cards[idx].querySelector('strong')?.textContent || 'Running';
		}
	}, 1600);
}

function runReadinessScan() {
	for (const row of readiness) {
		const jitter = Math.round((Math.random() * 12 - 6) * 10) / 10;
		row.value = Math.max(55, Math.min(95, Math.round(row.value + jitter)));
	}
	drawReadiness();
	renderReadinessLegend();
}

function simulateTransferCycle() {
	const outcome = [
		'Inward transfer strengthened: 3 colleges onboarded to AI Gateway.',
		'Internal transfer accelerated: 8 workflows shared across units.',
		'Outward transfer activated: 2 industry pilots launched responsibly.'
	];

	const randomIndex = Math.floor(Math.random() * outcome.length);
	if (!activeJob && cycleState) {
		cycleState.textContent = outcome[randomIndex];
	}
}

function addLog(text) {
	const stamp = new Date().toLocaleTimeString();
	logItems.unshift(`${stamp} | ${text}`);
	if (logItems.length > 28) {
		logItems.pop();
	}
	renderProcessLog();
}

function renderProcessLog() {
	if (!processLog) return;
	processLog.innerHTML = '';
	if (!logItems.length) {
		processLog.innerHTML = '<div class="meta-item">No processing activity yet.</div>';
		return;
	}
	for (const row of logItems) {
		const item = document.createElement('div');
		item.className = 'meta-item';
		item.textContent = row;
		processLog.appendChild(item);
	}
}

function renderQueue() {
	if (!jobQueue) return;
	jobQueue.innerHTML = '';

	if (activeJob) {
		const activeItem = document.createElement('div');
		activeItem.className = 'meta-item';
		activeItem.textContent = `ACTIVE | ${activeJob.file.name} | ${activeJob.source}`;
		jobQueue.appendChild(activeItem);
	}

	if (!modelQueue.length && !activeJob) {
		jobQueue.innerHTML = '<div class="meta-item">Queue is empty.</div>';
		return;
	}

	for (const queued of modelQueue) {
		const item = document.createElement('div');
		item.className = 'meta-item';
		item.textContent = `QUEUED | ${queued.file.name} | ${queued.source}`;
		jobQueue.appendChild(item);
	}
}

function updateMetricTargets(values) {
	metricModel.textContent = values.model || 'None';
	metricSource.textContent = values.source || '-';
	metricSize.textContent = values.size || '-';
	metricHash.textContent = values.hash || '-';
	metricValidation.textContent = values.validation || '-';
	metricRisk.textContent = values.risk || '-';
	metricAccuracy.textContent = values.accuracy || '-';
	metricLatency.textContent = values.latency || '-';
	metricReadiness.textContent = values.readiness || '-';
	metricStatus.textContent = values.status || 'Idle';
}

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function sha256Fingerprint(file) {
	const maxBytes = 8 * 1024 * 1024;
	const chunk = file.size > maxBytes ? file.slice(0, maxBytes) : file;
	const buff = await chunk.arrayBuffer();
	const digest = await crypto.subtle.digest('SHA-256', buff);
	const bytes = Array.from(new Uint8Array(digest));
	const hash = bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
	return file.size > maxBytes ? `${hash.slice(0, 56)}*` : hash;
}

function extensionOf(name) {
	const parts = String(name || '').toLowerCase().split('.');
	return parts.length > 1 ? parts.pop() || '' : '';
}

async function estimateEntropy(file) {
	const sample = file.slice(0, 65536);
	const buffer = await sample.arrayBuffer();
	const bytes = new Uint8Array(buffer);
	if (!bytes.length) return 0;

	const hist = new Array(256).fill(0);
	for (const b of bytes) hist[b] += 1;

	let entropy = 0;
	for (const count of hist) {
		if (!count) continue;
		const p = count / bytes.length;
		entropy -= p * Math.log2(p);
	}
	return entropy / 8;
}

function evaluateModel(file, entropy, source) {
	const sizeMB = file.size / (1024 * 1024);
	const ext = extensionOf(file.name);
	const accepted = acceptedExt.has(ext);
	const sizePenalty = sizeMB > 200 ? 12 : sizeMB > 70 ? 5 : 0;
	const sourceBias = source === 'UND Internal' ? 4 : 0;

	const validation = clamp(Math.round(56 + (accepted ? 18 : -10) + entropy * 14 + sourceBias - sizePenalty), 22, 98);
	const risk = clamp(Math.round(72 - validation + (accepted ? -4 : 12) + (sizeMB > 140 ? 8 : 0)), 3, 96);
	const accuracy = clamp(Math.round(59 + entropy * 19 + (accepted ? 6 : -5) - risk * 0.08), 35, 99);
	const latency = clamp(Math.round(70 + sizeMB * 1.8 + (source === 'External Partner' ? 14 : 6)), 42, 320);
	const readiness = clamp(Math.round(validation * 0.4 + accuracy * 0.37 + (100 - risk) * 0.23), 20, 99);
	const status = readiness >= 74 ? 'Approved for controlled deployment' : 'Needs remediation and review';

	return {
		accepted,
		ext,
		sizeMB,
		validation,
		risk,
		accuracy,
		latency,
		readiness,
		status
	};
}

function updateReadinessFromEvaluation(evalResult) {
	readiness[0].value = clamp(Math.round(60 + evalResult.readiness * 0.36), 50, 98);
	readiness[1].value = clamp(Math.round(63 + evalResult.accuracy * 0.33), 50, 99);
	readiness[2].value = clamp(Math.round(58 + evalResult.validation * 0.3), 45, 97);
	readiness[3].value = clamp(Math.round(57 + (100 - evalResult.latency / 3.4)), 40, 96);
	readiness[4].value = clamp(Math.round(68 + (100 - evalResult.risk) * 0.24), 45, 99);
	readiness[5].value = clamp(Math.round(54 + evalResult.readiness * 0.34), 40, 99);
}

function enqueueFile(file, source) {
	if (!file) return;
	const job = {
		id: crypto.randomUUID(),
		file,
		source
	};
	modelQueue.push(job);
	addLog(`Queued ${file.name} from ${source}.`);
	renderQueue();
	if (!activeJob) {
		void processNextJob();
	}
}

function activateStage(index) {
	if (!transfer3D.ready) return;
	for (let i = 0; i < transfer3D.stageMeshes.length; i += 1) {
		const material = transfer3D.stageMeshes[i].material;
		material.emissive.setHex(i === index ? 0x3ecdbf : 0x102338);
	}
}

function setTokenColor(hex) {
	if (!transfer3D.ready || !transfer3D.token) return;
	transfer3D.token.material.color.setHex(hex);
	transfer3D.token.material.emissive.setHex(hex);
}

function configurePathForSource(source) {
	if (!transfer3D.ready) return;
	const srcPoint = source === 'UND Internal' ? transfer3D.leftPoint : transfer3D.rightPoint;
	transfer3D.path = [
		srcPoint,
		transfer3D.gatewayPoint,
		...transfer3D.stagePoints,
		transfer3D.finalPoint
	];
	transfer3D.targetIndex = 0;
	transfer3D.token.position.copy(srcPoint);
}

function moveTokenTo(index) {
	if (!transfer3D.ready) return Promise.resolve();
	transfer3D.targetIndex = clamp(index, 0, transfer3D.path.length - 1);
	return new Promise((resolve) => {
		transfer3D.moveResolver = resolve;
	});
}

async function processNextJob() {
	if (activeJob || !modelQueue.length) return;
	activeJob = modelQueue.shift() || null;
	if (!activeJob) return;
	renderQueue();

	const file = activeJob.file;
	updateMetricTargets({
		model: file.name,
		source: activeJob.source,
		size: formatBytes(file.size),
		hash: 'Calculating...',
		validation: 'Pending',
		risk: 'Pending',
		accuracy: 'Pending',
		latency: 'Pending',
		readiness: 'Pending',
		status: 'In processing'
	});

	configurePathForSource(activeJob.source);
	setTokenColor(0x85e2ff);
	activateStage(-1);
	addLog(`Processing started for ${file.name}.`);
	if (cycleState) cycleState.textContent = `Processing ${shortText(file.name, 28)}`;

	await moveTokenTo(1);
	addLog('Gateway intake complete.');

	const [fingerprint, entropy] = await Promise.all([sha256Fingerprint(file), estimateEntropy(file)]);
	const evaluation = evaluateModel(file, entropy, activeJob.source);

	updateMetricTargets({
		model: file.name,
		source: activeJob.source,
		size: `${formatBytes(file.size)} | .${evaluation.ext || 'unknown'}`,
		hash: shortText(fingerprint, 64),
		validation: `${evaluation.validation}%`,
		risk: `${evaluation.risk}%`,
		accuracy: `${evaluation.accuracy}%`,
		latency: `${evaluation.latency} ms`,
		readiness: `${evaluation.readiness}%`,
		status: 'Evaluating stages'
	});

	for (let i = 0; i < transferStageLabels.length; i += 1) {
		activateStage(i);
		await moveTokenTo(i + 2);
		addLog(`${transferStageLabels[i]} complete.`);
		if (cycleState) cycleState.textContent = transferStageLabels[i];
		await sleep(280);
	}

	await moveTokenTo(transfer3D.path.length - 1);
	updateReadinessFromEvaluation(evaluation);
	drawReadiness();
	renderReadinessLegend();

	const approved = evaluation.readiness >= 74;
	setTokenColor(approved ? 0x72f6c8 : 0xffa0b8);
	updateMetricTargets({
		model: file.name,
		source: activeJob.source,
		size: `${formatBytes(file.size)} | .${evaluation.ext || 'unknown'}`,
		hash: shortText(fingerprint, 64),
		validation: `${evaluation.validation}%`,
		risk: `${evaluation.risk}%`,
		accuracy: `${evaluation.accuracy}%`,
		latency: `${evaluation.latency} ms`,
		readiness: `${evaluation.readiness}%`,
		status: evaluation.status
	});
	addLog(`Final status: ${evaluation.status}.`);
	if (cycleState) cycleState.textContent = evaluation.status;

	activeJob = null;
	renderQueue();
	activateStage(-1);
	if (modelQueue.length) {
		await sleep(300);
		void processNextJob();
	}
}

function initTransferScene() {
	if (!transferCanvas || !window.THREE) {
		addLog('Three.js unavailable. Visual pipeline disabled.');
		return;
	}

	const THREERef = window.THREE;
	transfer3D.scene = new THREERef.Scene();
	transfer3D.camera = new THREERef.PerspectiveCamera(42, 1, 0.1, 100);
	transfer3D.camera.position.set(0, 5.6, 13);
	transfer3D.camera.lookAt(0, 0.8, 1);

	transfer3D.renderer = new THREERef.WebGLRenderer({ canvas: transferCanvas, antialias: true, alpha: true });
	transfer3D.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

	const ambient = new THREERef.AmbientLight(0x8bc3ff, 0.72);
	const key = new THREERef.PointLight(0x9ee7ff, 1.5, 40);
	key.position.set(0, 7, 5);
	const rim = new THREERef.PointLight(0xb39fff, 0.95, 35);
	rim.position.set(0, 2, -8);
	transfer3D.scene.add(ambient, key, rim);

	const floor = new THREERef.Mesh(
		new THREERef.PlaneGeometry(18, 14),
		new THREERef.MeshStandardMaterial({ color: 0x0a1e33, roughness: 0.9, metalness: 0.1 })
	);
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = -0.55;
	transfer3D.scene.add(floor);

	const srcGeo = new THREERef.SphereGeometry(0.5, 24, 24);
	const leftSource = new THREERef.Mesh(srcGeo, new THREERef.MeshStandardMaterial({ color: 0x6fd8ff, emissive: 0x103355 }));
	const rightSource = new THREERef.Mesh(srcGeo, new THREERef.MeshStandardMaterial({ color: 0xffadc8, emissive: 0x3c1630 }));
	leftSource.position.set(-6.1, 0.55, 0);
	rightSource.position.set(6.1, 0.55, 0);
	transfer3D.scene.add(leftSource, rightSource);

	const ring = new THREERef.Mesh(
		new THREERef.TorusGeometry(0.95, 0.16, 24, 48),
		new THREERef.MeshStandardMaterial({ color: 0x9de7ff, emissive: 0x173b62, metalness: 0.4, roughness: 0.2 })
	);
	ring.position.set(0, 0.9, 0);
	transfer3D.scene.add(ring);
	transfer3D.ring = ring;

	const stageXs = [-3.2, -1.6, 0, 1.6, 3.2];
	transfer3D.stagePoints = [];
	transfer3D.stageMeshes = [];
	for (const x of stageXs) {
		const cube = new THREERef.Mesh(
			new THREERef.BoxGeometry(0.85, 0.5, 0.85),
			new THREERef.MeshStandardMaterial({ color: 0x203f66, emissive: 0x102338, roughness: 0.35, metalness: 0.5 })
		);
		cube.position.set(x, 0.38, 3.2);
		transfer3D.scene.add(cube);
		transfer3D.stageMeshes.push(cube);
		transfer3D.stagePoints.push(new THREERef.Vector3(x, 0.95, 3.2));
	}

	const finalNode = new THREERef.Mesh(
		new THREERef.CylinderGeometry(0.8, 0.8, 0.42, 32),
		new THREERef.MeshStandardMaterial({ color: 0x8cf2d5, emissive: 0x15433a, roughness: 0.3, metalness: 0.55 })
	);
	finalNode.position.set(0, 0.3, 6.4);
	transfer3D.scene.add(finalNode);

	transfer3D.token = new THREERef.Mesh(
		new THREERef.SphereGeometry(0.24, 22, 22),
		new THREERef.MeshStandardMaterial({ color: 0x87deff, emissive: 0x2f8fb2, metalness: 0.42, roughness: 0.28 })
	);
	transfer3D.scene.add(transfer3D.token);

	transfer3D.leftPoint = new THREERef.Vector3(-6.1, 0.95, 0);
	transfer3D.rightPoint = new THREERef.Vector3(6.1, 0.95, 0);
	transfer3D.gatewayPoint = new THREERef.Vector3(0, 1.08, 0);
	transfer3D.finalPoint = new THREERef.Vector3(0, 0.95, 6.4);
	transfer3D.path = [transfer3D.leftPoint, transfer3D.gatewayPoint, ...transfer3D.stagePoints, transfer3D.finalPoint];
	transfer3D.token.position.copy(transfer3D.leftPoint);

	transfer3D.ready = true;
	resizeTransferScene();
	animateTransferScene();
}

function resizeTransferScene() {
	if (!transfer3D.ready || !transferCanvas) return;
	const rect = transferCanvas.getBoundingClientRect();
	const width = Math.max(320, Math.floor(rect.width));
	const height = Math.max(220, Math.floor(rect.height));
	if (width === transfer3D.width && height === transfer3D.height) return;

	transfer3D.width = width;
	transfer3D.height = height;
	transfer3D.camera.aspect = width / height;
	transfer3D.camera.updateProjectionMatrix();
	transfer3D.renderer.setSize(width, height, false);
}

function animateTransferScene() {
	if (!transfer3D.ready) return;
	requestAnimationFrame(animateTransferScene);

	resizeTransferScene();

	transfer3D.ring.rotation.y += 0.012;
	transfer3D.ring.rotation.x += 0.003;

	const target = transfer3D.path[transfer3D.targetIndex] || transfer3D.path[0];
	transfer3D.token.position.lerp(target, 0.075);
	transfer3D.token.position.y += Math.sin(performance.now() * 0.005) * 0.002;

	const dist = transfer3D.token.position.distanceTo(target);
	if (dist < 0.05 && transfer3D.moveResolver) {
		const resolve = transfer3D.moveResolver;
		transfer3D.moveResolver = null;
		resolve();
	}

	transfer3D.renderer.render(transfer3D.scene, transfer3D.camera);
}

function onUploadClicked(inputNode, source) {
	const file = inputNode?.files && inputNode.files[0] ? inputNode.files[0] : null;
	if (!file) {
		addLog(`No file selected for ${source}.`);
		return;
	}
	enqueueFile(file, source);
	inputNode.value = '';
}

renderModes();
renderCards(gatewayGrid, gatewayStages, 'gateway-node');
renderCards(lifecycleNode, lifecycleStages, 'lifecycle-step');
renderCards(supportGrid, supportTeam, 'support-item');
renderCards(pipelineNode, pipeline, 'pipeline-node');
renderCards(alignmentNode, alignCards, 'align-card');
renderReadinessLegend();
drawReadiness();
animateLifecycle();
renderQueue();
renderProcessLog();
updateMetricTargets({ status: 'Idle' });
initTransferScene();

runReadinessBtn?.addEventListener('click', runReadinessScan);
simulateTransferBtn?.addEventListener('click', simulateTransferCycle);
leftUploadBtn?.addEventListener('click', () => onUploadClicked(leftModelInput, 'UND Internal'));
rightUploadBtn?.addEventListener('click', () => onUploadClicked(rightModelInput, 'External Partner'));

window.addEventListener('resize', () => {
	drawReadiness();
	resizeTransferScene();
});

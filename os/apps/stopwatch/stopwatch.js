// ── Tab switching ──────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.remove('hidden');
  });
});

// ── Stopwatch ──────────────────────────────────────────
let swRunning = false, swStart = 0, swElapsed = 0, swRaf = null;
let lapTimes = [], lastLapElapsed = 0;

const swDisplay = document.getElementById('swDisplay');
const swRing    = document.getElementById('swRing');
const swBtn     = document.getElementById('swStart');
const lapBtn    = document.getElementById('swLap');
const resetBtn  = document.getElementById('swReset');
const lapList   = document.getElementById('lapList');
const CIRCUM    = 339.29;

const fmtSw = ms => {
  const h   = Math.floor(ms / 3600000);
  const m   = Math.floor((ms % 3600000) / 60000);
  const s   = Math.floor((ms % 60000) / 1000);
  const mil = ms % 1000;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(mil).padStart(3,'0')}`;
};

const tickSw = () => {
  swElapsed = Date.now() - swStart;
  swDisplay.textContent = fmtSw(swElapsed);
  const frac = (swElapsed % 60000) / 60000;
  swRing.style.strokeDashoffset = CIRCUM - frac * CIRCUM;
  swRaf = requestAnimationFrame(tickSw);
};

swBtn.addEventListener('click', () => {
  if (!swRunning) {
    swStart = Date.now() - swElapsed;
    swRunning = true;
    swBtn.textContent = 'Pause';
    lapBtn.disabled = false;
    swRaf = requestAnimationFrame(tickSw);
  } else {
    cancelAnimationFrame(swRaf);
    swRunning = false;
    swBtn.textContent = 'Resume';
    lapBtn.disabled = true;
  }
});

lapBtn.addEventListener('click', () => {
  const lapMs = swElapsed - lastLapElapsed;
  lastLapElapsed = swElapsed;
  lapTimes.push({ n: lapTimes.length + 1, total: swElapsed, split: lapMs });
  reRenderLaps();
});

resetBtn.addEventListener('click', () => {
  cancelAnimationFrame(swRaf);
  swRunning = false; swElapsed = 0; swStart = 0; lastLapElapsed = 0; lapTimes = [];
  swDisplay.textContent = '00:00:00.000';
  swRing.style.strokeDashoffset = CIRCUM;
  swBtn.textContent = 'Start';
  lapBtn.disabled = true;
  lapList.innerHTML = '';
});

const reRenderLaps = () => {
  lapList.innerHTML = '';
  [...lapTimes].reverse().forEach(l => {
    const li = document.createElement('li');
    li.className = 'lap-item';
    li.innerHTML = `<span class="lap-label">Lap ${l.n}</span><span class="lap-time">${fmtSw(l.split)}</span>`;
    lapList.appendChild(li);
  });
};

// ── Timer ──────────────────────────────────────────────
let tH = 0, tM = 5, tS = 0;
let tRemaining = 0, tRunning = false, tInterval = null;

const pickH = document.getElementById('pickH');
const pickM = document.getElementById('pickM');
const pickS = document.getElementById('pickS');
const timerDisplay = document.getElementById('timerDisplay');
const timerSet     = document.getElementById('timerSet');
const timerMsg     = document.getElementById('timerMsg');
const tStart       = document.getElementById('tStart');
const tReset       = document.getElementById('tReset');

const pad2 = n => String(n).padStart(2,'0');
const updatePickerView = () => { pickH.textContent = pad2(tH); pickM.textContent = pad2(tM); pickS.textContent = pad2(tS); };
updatePickerView();

document.querySelectorAll('.arrow-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const { field, dir } = btn.dataset;
    const delta = dir === 'up' ? 1 : -1;
    if (field === 'h') tH = (tH + delta + 24) % 24;
    if (field === 'm') tM = (tM + delta + 60) % 60;
    if (field === 's') tS = (tS + delta + 60) % 60;
    updatePickerView();
  });
});

const fmtTimer = s => `${pad2(Math.floor(s/3600))}:${pad2(Math.floor((s%3600)/60))}:${pad2(s%60)}`;

tStart.addEventListener('click', () => {
  if (!tRunning) {
    if (tRemaining === 0) {
      tRemaining = tH * 3600 + tM * 60 + tS;
      if (tRemaining === 0) return;
    }
    timerSet.classList.add('hidden');
    timerDisplay.classList.remove('hidden');
    timerMsg.classList.add('hidden');
    tRunning = true;
    tStart.textContent = 'Pause';
    timerDisplay.textContent = fmtTimer(tRemaining);
    tInterval = setInterval(() => {
      tRemaining--;
      timerDisplay.textContent = fmtTimer(tRemaining);
      if (tRemaining <= 0) {
        clearInterval(tInterval);
        tRunning = false;
        tStart.textContent = 'Start';
        timerMsg.classList.remove('hidden');
        try { new Audio('https://cdn.freesound.org/previews/131/131660_2398403-lq.mp3').play(); } catch {}
      }
    }, 1000);
  } else {
    clearInterval(tInterval);
    tRunning = false;
    tStart.textContent = 'Resume';
  }
});

tReset.addEventListener('click', () => {
  clearInterval(tInterval);
  tRunning = false; tRemaining = 0;
  tStart.textContent = 'Start';
  timerDisplay.classList.add('hidden');
  timerSet.classList.remove('hidden');
  timerMsg.classList.add('hidden');
});

// ── World Clock ─────────────────────────────────────────
const CITIES = [
  { name: 'New York',    tz: 'America/New_York'   },
  { name: 'London',      tz: 'Europe/London'       },
  { name: 'Paris',       tz: 'Europe/Paris'        },
  { name: 'Dubai',       tz: 'Asia/Dubai'          },
  { name: 'Tokyo',       tz: 'Asia/Tokyo'          },
  { name: 'Sydney',      tz: 'Australia/Sydney'    },
  { name: 'Los Angeles', tz: 'America/Los_Angeles' },
  { name: 'Chicago',     tz: 'America/Chicago'     },
  { name: 'São Paulo',   tz: 'America/Sao_Paulo'   },
  { name: 'Singapore',   tz: 'Asia/Singapore'      },
  { name: 'Beijing',     tz: 'Asia/Shanghai'       },
  { name: 'Moscow',      tz: 'Europe/Moscow'       },
];
const wcGrid = document.getElementById('wcGrid');
CITIES.forEach(c => {
  const card = document.createElement('div');
  card.className = 'wc-card';
  card.innerHTML = `<div class="wc-city">${c.name}</div><div class="wc-time" id="wct-${c.name.replace(/\s/g,'_')}">--:--</div><div class="wc-date" id="wcd-${c.name.replace(/\s/g,'_')}"></div>`;
  wcGrid.appendChild(card);
});

const tickWC = () => {
  const now = new Date();
  CITIES.forEach(c => {
    const key = c.name.replace(/\s/g,'_');
    const tEl = document.getElementById('wct-'+key);
    const dEl = document.getElementById('wcd-'+key);
    if (!tEl) return;
    tEl.textContent = now.toLocaleTimeString('en-US', { timeZone: c.tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    dEl.textContent = now.toLocaleDateString('en-US', { timeZone: c.tz, weekday: 'short', month: 'short', day: 'numeric' });
  });
};
tickWC();
setInterval(tickWC, 1000);

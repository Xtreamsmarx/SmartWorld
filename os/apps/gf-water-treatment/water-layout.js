const nowNode = document.querySelector('#nowTime');

function tickNow() {
  if (!nowNode) return;
  nowNode.textContent = new Date().toLocaleTimeString();
}

tickNow();
setInterval(tickNow, 1000);

const liveNodes = Array.from(document.querySelectorAll('[data-live]'));

function updateLiveNodes() {
  if (!liveNodes.length) return;
  const time = Date.now() / 1000;
  liveNodes.forEach((node, idx) => {
    const base = Number(node.dataset.base || '0');
    const amp = Number(node.dataset.amp || '1');
    const unit = node.dataset.unit || '';
    const precision = Number(node.dataset.precision || '1');
    const value = base + Math.sin(time * 0.55 + idx * 1.2) * amp;
    node.textContent = `${value.toFixed(precision)}${unit}`;

    const metric = node.closest('.metric');
    if (metric) {
      metric.classList.toggle('pulse', Math.floor(time + idx) % 4 === 0);
    }
  });
}

updateLiveNodes();
setInterval(updateLiveNodes, 2500);

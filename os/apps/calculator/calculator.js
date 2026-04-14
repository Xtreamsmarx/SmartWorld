const display = document.getElementById('displayVal');
const exprEl  = document.getElementById('expression');
const memLabel = document.getElementById('memLabel');
const modeToggle = document.getElementById('modeToggle');
const modeLabel  = document.getElementById('modeLabel');

let current = '0';
let expression = '';
let memory = 0;
let freshResult = false;
let sciMode = false;

const update = () => {
  display.textContent = current;
  exprEl.innerHTML = expression || '&nbsp;';
  memLabel.textContent = memory !== 0 ? `M: ${memory}` : '';
};

const pressKey = (key) => {
  if (key === 'C') {
    current = '0'; expression = ''; freshResult = false;
  } else if (key === 'CE') {
    current = '0';
  } else if (key === '+/-') {
    current = String(-parseFloat(current));
  } else if (key === '%') {
    current = String(parseFloat(current) / 100);
  } else if (key === 'MC') {
    memory = 0;
  } else if (key === 'MR') {
    current = String(memory); freshResult = true;
  } else if (key === 'M+') {
    memory += parseFloat(current);
  } else if (key === 'M-') {
    memory -= parseFloat(current);
  } else if (['+', '-', '*', '/'].includes(key)) {
    expression = (freshResult ? current : (expression + current)) + ' ' + key + ' ';
    current = '';
    freshResult = false;
  } else if (key === '=') {
    if (!expression) return;
    const expr = expression + current;
    try {
      const result = Function('"use strict"; return (' + expr + ')')();
      expression = expr + ' =';
      current = String(parseFloat(result.toFixed(10)));
      freshResult = true;
    } catch {
      current = 'Error'; expression = ''; freshResult = true;
    }
  } else if (key === 'sin') {
    current = String(parseFloat(Math.sin(parseFloat(current) * Math.PI / 180).toFixed(10)));
  } else if (key === 'cos') {
    current = String(parseFloat(Math.cos(parseFloat(current) * Math.PI / 180).toFixed(10)));
  } else if (key === 'tan') {
    current = String(parseFloat(Math.tan(parseFloat(current) * Math.PI / 180).toFixed(10)));
  } else if (key === 'sqrt') {
    current = String(parseFloat(Math.sqrt(parseFloat(current)).toFixed(10)));
  } else if (key === 'pow2') {
    current = String(parseFloat(current) ** 2);
  } else if (key === 'log') {
    current = String(parseFloat(Math.log10(parseFloat(current)).toFixed(10)));
  } else if (key === 'ln') {
    current = String(parseFloat(Math.log(parseFloat(current)).toFixed(10)));
  } else if (key === 'pi') {
    current = String(Math.PI);
  } else if (key === '.') {
    if (freshResult) { current = '0.'; freshResult = false; return update(); }
    if (!current.includes('.')) current += '.';
  } else if (key === 'Backspace') {
    if (current.length > 1) current = current.slice(0, -1);
    else current = '0';
  } else {
    // digit
    if (freshResult || current === '0') { current = key; freshResult = false; }
    else current += key;
  }
  update();
};

document.getElementById('keypad').addEventListener('click', e => {
  const btn = e.target.closest('[data-key]');
  if (btn) pressKey(btn.dataset.key);
});

document.addEventListener('keydown', e => {
  const map = { 'Enter': '=', 'Escape': 'C', 'Backspace': 'Backspace', '*': '*', '/': '/', '+': '+', '-': '-', '.': '.', '%': '%' };
  const key = map[e.key] || ('0123456789'.includes(e.key) ? e.key : null);
  if (key) { e.preventDefault(); pressKey(key); }
});

modeToggle.addEventListener('click', () => {
  sciMode = !sciMode;
  document.querySelectorAll('.sci-only').forEach(el => el.classList.toggle('hidden', !sciMode));
  modeToggle.textContent = sciMode ? 'Basic' : 'Scientific';
  modeLabel.textContent  = sciMode ? 'Scientific' : 'Basic';
});

update();

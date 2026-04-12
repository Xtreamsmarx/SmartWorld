const desktop = document.querySelector('#desktop');
const appIcons = document.querySelectorAll('.app-icon');
const appWindow = document.querySelector('#appWindow');
const appFrame = document.querySelector('#appFrame');
const windowTitle = document.querySelector('#windowTitle');
const windowBar = document.querySelector('#windowBar');
const btnClose = document.querySelector('#btnClose');
const btnMin = document.querySelector('#btnMin');
const btnMax = document.querySelector('#btnMax');
const resizeE = document.querySelector('#resizeE');
const resizeS = document.querySelector('#resizeS');
const resizeSE = document.querySelector('#resizeSE');
const taskbarApps = document.querySelector('#taskbarApps');
const quickOpenButtons = document.querySelectorAll('.quick-open');
const topClock = document.querySelector('#topClock');
const widgetClock = document.querySelector('#widgetClock');

let currentApp = null;
let isMaximized = false;
let restoreRect = null;

const showWindow = () => {
  if (!appWindow) {
    return;
  }
  appWindow.classList.remove('hidden');
};

const minimizeWindow = () => {
  if (!appWindow) {
    return;
  }
  appWindow.classList.add('hidden');
};

const updateClocks = () => {
  const now = new Date();
  const value = now.toLocaleTimeString();
  if (topClock) {
    topClock.textContent = value;
  }
  if (widgetClock) {
    widgetClock.textContent = value;
  }
};
updateClocks();
setInterval(updateClocks, 1000);

const renderTaskbarApp = () => {
  if (!taskbarApps) {
    return;
  }
  taskbarApps.innerHTML = '';
  if (!currentApp) {
    return;
  }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'task-app';
  btn.textContent = currentApp.title;
  btn.addEventListener('click', () => {
    if (!appWindow) {
      return;
    }

    // Toggle like a desktop taskbar button: restore if hidden, minimize if visible.
    if (appWindow.classList.contains('hidden')) {
      showWindow();
      return;
    }
    minimizeWindow();
  });
  taskbarApps.appendChild(btn);
};

const openInWindow = (target, title) => {
  if (!appWindow || !appFrame || !windowTitle) {
    return;
  }
  currentApp = { target, title: title || 'App' };
  appFrame.src = target;
  windowTitle.textContent = title || 'App';
  appWindow.classList.remove('maximized');
  isMaximized = false;
  restoreRect = null;
  if (btnMax) {
    btnMax.textContent = '[]';
  }
  showWindow();
  renderTaskbarApp();
};

if (btnClose && appWindow && appFrame) {
  btnClose.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
  });
  btnClose.addEventListener('click', () => {
    appWindow.classList.add('hidden');
    appFrame.src = 'about:blank';
    currentApp = null;
    renderTaskbarApp();
  });
}

if (btnMin && appWindow) {
  btnMin.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
  });
  btnMin.addEventListener('click', () => {
    minimizeWindow();
    renderTaskbarApp();
  });
}

if (btnMax && appWindow) {
  btnMax.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
  });

  btnMax.addEventListener('click', () => {
    if (!isMaximized) {
      const rect = appWindow.getBoundingClientRect();
      restoreRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
      appWindow.classList.add('maximized');
      btnMax.textContent = 'R';
      isMaximized = true;
      return;
    }

    appWindow.classList.remove('maximized');
    if (restoreRect) {
      appWindow.style.left = `${restoreRect.left}px`;
      appWindow.style.top = `${restoreRect.top}px`;
      appWindow.style.width = `${restoreRect.width}px`;
      appWindow.style.height = `${restoreRect.height}px`;
    }
    btnMax.textContent = '[]';
    isMaximized = false;
  });
}

for (const button of quickOpenButtons) {
  button.addEventListener('click', () => {
    const target = button.getAttribute('data-open');
    const title = button.getAttribute('data-title') || 'App';
    if (target) {
      openInWindow(target, title);
    }
  });
}

if (windowBar && appWindow) {
  let wDragging = false;
  let wStartX = 0;
  let wStartY = 0;
  let wOriginX = 0;
  let wOriginY = 0;

  windowBar.addEventListener('pointerdown', (event) => {
    const rect = appWindow.getBoundingClientRect();
    wStartX = event.clientX;
    wStartY = event.clientY;
    wOriginX = rect.left;
    wOriginY = rect.top;
    wDragging = true;
    windowBar.setPointerCapture(event.pointerId);
  });

  windowBar.addEventListener('pointermove', (event) => {
    if (!wDragging) {
      return;
    }
    const deltaX = event.clientX - wStartX;
    const deltaY = event.clientY - wStartY;
    if (isMaximized) {
      appWindow.classList.remove('maximized');
      isMaximized = false;
      if (btnMax) {
        btnMax.textContent = '[]';
      }
      if (restoreRect) {
        appWindow.style.left = `${restoreRect.left}px`;
        appWindow.style.top = `${restoreRect.top}px`;
        appWindow.style.width = `${restoreRect.width}px`;
        appWindow.style.height = `${restoreRect.height}px`;
      }
    }
    const nextX = Math.min(Math.max(0, wOriginX + deltaX), window.innerWidth - appWindow.offsetWidth);
    const nextY = Math.min(Math.max(0, wOriginY + deltaY), desktop.clientHeight - appWindow.offsetHeight);
    appWindow.style.left = `${nextX}px`;
    appWindow.style.top = `${nextY}px`;
  });

  windowBar.addEventListener('pointerup', (event) => {
    wDragging = false;
    if (windowBar.hasPointerCapture(event.pointerId)) {
      windowBar.releasePointerCapture(event.pointerId);
    }
  });
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && appWindow && !appWindow.classList.contains('hidden')) {
    minimizeWindow();
    renderTaskbarApp();
  }
});

if (appWindow) {
  const minWidth = 360;
  const minHeight = 240;

  const bindResize = (handle, mode) => {
    if (!handle) {
      return;
    }

    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    let resizing = false;

    handle.addEventListener('pointerdown', (event) => {
      const rect = appWindow.getBoundingClientRect();
      startX = event.clientX;
      startY = event.clientY;
      startWidth = rect.width;
      startHeight = rect.height;
      resizing = true;
      handle.setPointerCapture(event.pointerId);
    });

    handle.addEventListener('pointermove', (event) => {
      if (!resizing) {
        return;
      }

      if (isMaximized) {
        appWindow.classList.remove('maximized');
        isMaximized = false;
        if (btnMax) {
          btnMax.textContent = '[]';
        }
        if (restoreRect) {
          appWindow.style.left = `${restoreRect.left}px`;
          appWindow.style.top = `${restoreRect.top}px`;
          appWindow.style.width = `${restoreRect.width}px`;
          appWindow.style.height = `${restoreRect.height}px`;
          startWidth = restoreRect.width;
          startHeight = restoreRect.height;
        }
      }

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      const maxWidth = window.innerWidth - appWindow.offsetLeft;
      const maxHeight = desktop.clientHeight - appWindow.offsetTop;

      if (mode === 'e' || mode === 'se') {
        const nextWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + deltaX));
        appWindow.style.width = `${nextWidth}px`;
      }

      if (mode === 's' || mode === 'se') {
        const nextHeight = Math.min(maxHeight, Math.max(minHeight, startHeight + deltaY));
        appWindow.style.height = `${nextHeight}px`;
      }
    });

    handle.addEventListener('pointerup', (event) => {
      resizing = false;
      handle.releasePointerCapture(event.pointerId);
    });
  };

  bindResize(resizeE, 'e');
  bindResize(resizeS, 's');
  bindResize(resizeSE, 'se');
}

for (const icon of appIcons) {
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  let dragging = false;
  let moved = false;

  icon.addEventListener('pointerdown', (event) => {
    const rect = icon.getBoundingClientRect();
    startX = event.clientX;
    startY = event.clientY;
    originX = rect.left;
    originY = rect.top;
    dragging = true;
    moved = false;
    icon.classList.add('dragging');
    icon.setPointerCapture(event.pointerId);
  });

  icon.addEventListener('pointermove', (event) => {
    if (!dragging) {
      return;
    }

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      moved = true;
    }

    const nextX = Math.min(Math.max(0, originX + deltaX), window.innerWidth - icon.offsetWidth);
    const nextY = Math.min(Math.max(0, originY + deltaY), desktop.clientHeight - icon.offsetHeight);

    icon.style.left = `${nextX}px`;
    icon.style.top = `${nextY}px`;
  });

  icon.addEventListener('pointerup', (event) => {
    dragging = false;
    icon.classList.remove('dragging');
    if (icon.hasPointerCapture(event.pointerId)) {
      icon.releasePointerCapture(event.pointerId);
    }

    if (!moved) {
      const target = icon.getAttribute('data-target');
      if (target) {
        const title = icon.querySelector('p') ? icon.querySelector('p').textContent : 'App';
        openInWindow(target, title);
      }
    }
  });
}

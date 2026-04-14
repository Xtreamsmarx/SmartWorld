(function () {
  if (window.__smartChatbotMounted) {
    return;
  }
  window.__smartChatbotMounted = true;

  var DATA_KEY = 'smartworld.chatbot.docs.v1';
  var OPEN_KEY = 'smartworld.chatbot.open.v1';
  var FAB_POSITION_KEY = 'smartworld.chatbot.fab.position.v1';
  var CHAT_HISTORY_KEY = 'smartworld.chatbot.history.v1';
  var LLM_SETTINGS_KEY = 'smartworld.llm.settings.v1';
  var SUPER_VAULT_KEY = 'smartworld.superUserVault.v1';
  var SUPER_VAULT_SETTINGS_KEY = 'smartworld.superUserVault.settings.v1';
  var CHAT_HISTORY_LIMIT = 80;

  var providerDefaults = {
    local: { model: '', baseUrl: '' },
    openai: { model: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1/chat/completions' },
    openrouter: { model: 'openai/gpt-4o-mini', baseUrl: 'https://openrouter.ai/api/v1/chat/completions' },
    groq: { model: 'llama-3.1-8b-instant', baseUrl: 'https://api.groq.com/openai/v1/chat/completions' },
    custom: { model: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1/chat/completions' }
  };

  var ui = document.createElement('div');
  ui.className = 'sw-chat';
  ui.innerHTML = '' +
    '<button class="sw-chat-fab" type="button" aria-label="Open Smart Chatbot" aria-expanded="false">' +
      '<span class="sw-fab-dot" aria-hidden="true">∞</span>' +
    '</button>' +
    '<div class="sw-avatar" hidden>' +
      '<div class="sw-avatar-bubble"><b>Smart AI</b><br>Click to chat →</div>' +
      '<div class="sw-avatar-head" tabindex="0" role="button" aria-label="Open Smart Chat">' +
        '<div class="sw-avatar-ring"></div>' +
        '<div class="sw-avatar-face">' +
          '<div class="sw-avatar-eyes"><div class="sw-avatar-eye sw-eye-l"></div><div class="sw-avatar-eye sw-eye-r"></div></div>' +
          '<div class="sw-avatar-mouth"></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<section class="sw-chat-panel" aria-label="Smart Chatbot">' +
      '<header class="sw-chat-head">' +
        '<strong>Smart Chat</strong>' +
        '<div class="sw-chat-head-actions">' +
          '<button class="sw-chat-settings" type="button" title="Settings" aria-label="Settings">⚙</button>' +
          '<button class="sw-chat-close" type="button" title="Close">×</button>' +
        '</div>' +
      '</header>' +
      '<div class="sw-chat-meta">Ask anything.</div>' +
      '<div class="sw-chat-config" hidden>' +
        '<select class="sw-chat-provider" title="Select provider">' +
          '<option value="local">Local</option>' +
          '<option value="openai">OpenAI</option>' +
          '<option value="openrouter">OpenRouter</option>' +
          '<option value="groq">Groq</option>' +
          '<option value="custom">Custom</option>' +
        '</select>' +
        '<input class="sw-chat-model-input" type="text" placeholder="Model (e.g. gpt-4o-mini)" />' +
        '<input class="sw-chat-base-input" type="text" placeholder="Base URL" />' +
        '<input class="sw-chat-key-input" type="password" placeholder="API Key" />' +
        '<div class="sw-chat-config-actions">' +
          '<label class="sw-chat-upload" title="Upload CSV, JSON, TXT, MD">Upload<input type="file" multiple /></label>' +
          '<button class="sw-chat-clear" type="button" title="Clear uploaded data">Clear</button>' +
          '<button class="sw-chat-model-save" type="button">Save</button>' +
        '</div>' +
      '</div>' +
      '<div class="sw-chat-log" role="log" aria-live="polite"></div>' +
      '<form class="sw-chat-form">' +
        '<textarea class="sw-chat-input" placeholder="Type your message..." rows="2"></textarea>' +
        '<button type="submit">Smart</button>' +
      '</form>' +
    '</section>';

  var style = document.createElement('style');
  style.textContent = '' +
    '.sw-chat{position:fixed;right:16px;bottom:86px;z-index:999999;font-family:Space Grotesk,Segoe UI,sans-serif;background:transparent;}' +
    '.sw-chat-fab{width:46px;height:46px;border-radius:50%;border:0;background:transparent;color:#bfe7ff;cursor:grab;touch-action:none;user-select:none;display:grid;place-items:center;box-shadow:none;transition:transform .18s ease,text-shadow .2s ease,filter .2s ease;}' +
    '.sw-chat-fab:hover{transform:translateY(-2px) scale(1.05);text-shadow:0 0 18px rgba(118,206,255,.85),0 0 36px rgba(84,166,255,.45);filter:saturate(1.08);}' +
    '.sw-chat-fab[aria-expanded="true"]{transform:scale(1.03);}' +
    '.sw-chat-fab.sw-dragging{cursor:grabbing;transform:none;}' +
    '.sw-fab-dot{font:800 30px Sora,Space Grotesk,sans-serif;line-height:1;text-shadow:0 0 14px rgba(117,202,255,.58);}' +
    '.sw-chat-panel{position:absolute;right:0;bottom:64px;width:min(396px,92vw);height:min(568px,82vh);min-width:300px;min-height:360px;max-width:92vw;max-height:82vh;resize:both;background:linear-gradient(180deg,#0e1e31 0%,#0a1626 56%,#091321 100%);border:1px solid #294768;border-radius:18px;box-shadow:0 26px 55px rgba(0,0,0,.52),0 0 0 1px rgba(124,187,245,.08) inset;color:#ebf6ff;opacity:0;pointer-events:none;transform:translateY(14px) scale(.98);transform-origin:bottom right;transition:opacity .2s ease,transform .24s ease;overflow:auto;display:flex;flex-direction:column;backdrop-filter:blur(6px);}' +
    '.sw-chat-panel::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,#66c2ff 0%,#4f8fff 45%,#58e0ff 100%);opacity:.85;pointer-events:none;}' +
    '.sw-chat-panel.sw-open{opacity:1;pointer-events:auto;transform:translateY(0) scale(1);}' +
    '.sw-chat-head{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:linear-gradient(180deg,#142b45 0%,#12263d 100%);border-bottom:1px solid #2a496c;}' +
    '.sw-chat-head strong{font-size:15px;font-weight:700;letter-spacing:.2px;}' +
    '.sw-chat-head-actions{display:flex;align-items:center;gap:8px;}' +
    '.sw-chat-close{border:1px solid #48698f;background:#1b3450;color:#e9f6ff;border-radius:10px;width:38px;height:38px;cursor:pointer;font-size:28px;line-height:1;display:grid;place-items:center;padding-bottom:4px;transition:background .16s ease,border-color .16s ease,transform .16s ease;}' +
    '.sw-chat-close:hover{background:#24466a;border-color:#5f86b2;transform:translateY(-1px);}' +
    '.sw-chat-meta{padding:9px 14px;font-size:12px;color:#b8d4ef;border-bottom:1px solid #223f5e;background:rgba(12,30,48,.64);}' +
    '.sw-chat-config{display:grid;gap:8px;padding:12px 14px;background:linear-gradient(180deg,#102236 0%,#0f1f31 100%);border-bottom:1px solid #223f5e;}' +
    '.sw-chat-config[hidden]{display:none;}' +
    '.sw-chat-provider,.sw-chat-config input{border:1px solid #385d84;background:#0a1422;color:#eaf6ff;border-radius:10px;padding:9px 10px;font-size:12px;}' +
    '.sw-chat-provider:focus,.sw-chat-config input:focus{outline:none;border-color:#76b7f3;box-shadow:0 0 0 2px rgba(105,183,245,.2);}' +
    '.sw-chat-config-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}' +
    '.sw-chat-upload,.sw-chat-clear,.sw-chat-model-save{border:1px solid #456a93;background:#1e4065;color:#eaf6ff;border-radius:10px;padding:7px 11px;font-size:12px;cursor:pointer;transition:background .16s ease,border-color .16s ease,transform .16s ease;}' +
    '.sw-chat-upload input{display:none;}' +
    '.sw-chat-upload:hover,.sw-chat-clear:hover,.sw-chat-model-save:hover{background:#285686;border-color:#6996c3;transform:translateY(-1px);}' +
    '.sw-chat-log{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:9px;background:linear-gradient(180deg,#091524 0%,#071120 100%);}' +
    '.sw-chat-log::-webkit-scrollbar{width:10px;}' +
    '.sw-chat-log::-webkit-scrollbar-thumb{background:#33577e;border-radius:99px;border:2px solid #0b1726;}' +
    '.sw-msg{max-width:92%;padding:9px 11px;border-radius:12px;line-height:1.42;font-size:13px;white-space:pre-wrap;box-shadow:0 5px 14px rgba(3,12,24,.28);}' +
    '.sw-msg-user{align-self:flex-end;background:linear-gradient(180deg,#2b5f98 0%,#244f82 100%);border:1px solid #4f7fb3;}' +
    '.sw-msg-bot{align-self:flex-start;background:linear-gradient(180deg,#1f3551 0%,#182b43 100%);border:1px solid #3e638c;}' +
    '.sw-chat-form{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:flex-end;padding:12px;border-top:1px solid #223f5e;background:linear-gradient(180deg,#0d1d30 0%,#0b1828 100%);}' +
    '.sw-chat-input{display:block;width:100% !important;min-width:0;min-height:44px;max-height:110px;resize:none;border:1px solid #3c6188;background:#081423;color:#eaf6ff;border-radius:14px;padding:11px 12px;box-shadow:0 0 0 1px rgba(88,145,198,.06) inset;}' +
    '.sw-chat-input::placeholder{color:#96bbdf;}' +
    '.sw-chat-input:focus{outline:none;border-color:#82c4ff;box-shadow:0 0 0 2px rgba(101,177,244,.24);}' +
    '.sw-chat-settings,.sw-chat-form button[type="submit"]{border:1px solid #4d78a8;background:linear-gradient(180deg,#2f6eb0 0%,#265b92 100%);color:#eaf6ff;border-radius:11px;padding:8px 11px;font-size:12px;cursor:pointer;height:38px;transition:background .16s ease,border-color .16s ease,transform .16s ease,box-shadow .2s ease;}' +
    '.sw-chat-head .sw-chat-settings{width:38px;min-width:38px;padding:0;font-size:17px;line-height:1;display:grid;place-items:center;}' +
    '.sw-chat-form > button[type="submit"]{width:auto !important;min-width:100px;justify-self:end;font-weight:700;letter-spacing:.2px;}' +
    '.sw-chat-settings:hover,.sw-chat-form button[type="submit"]:hover{background:linear-gradient(180deg,#3a80cb 0%,#2d6cac 100%);border-color:#6ea0d3;transform:translateY(-1px);box-shadow:0 8px 18px rgba(13,36,62,.35);}' +
    '.sw-avatar{position:absolute;right:0;bottom:60px;display:flex;flex-direction:column;align-items:flex-end;gap:10px;pointer-events:none;opacity:0;transform:translateY(14px) scale(.9);transition:opacity .22s ease,transform .28s cubic-bezier(.34,1.52,.64,1);}' +
    '.sw-avatar.sw-aopen{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}' +
    '.sw-avatar-head{width:74px;height:74px;border-radius:50%;background:radial-gradient(circle at 38% 32%,#1e4a78,#0b1c36);border:2.5px solid rgba(100,200,255,.6);box-shadow:0 0 22px rgba(80,180,255,.45),0 0 0 5px rgba(80,180,255,.12);position:relative;cursor:pointer;display:flex;align-items:center;justify-content:center;}' +
    '.sw-avatar-ring{position:absolute;inset:-8px;border-radius:50%;border:2px dashed rgba(100,200,255,.4);animation:sw-ring-spin 3.5s linear infinite;}' +
    '.sw-avatar-ring::after{content:"";position:absolute;top:-4px;left:50%;width:8px;height:8px;background:#66d4ff;border-radius:50%;box-shadow:0 0 10px #66d4ff;transform:translateX(-50%);}' +
    '@keyframes sw-ring-spin{to{transform:rotate(360deg)}}' +
    '.sw-avatar-face{display:flex;flex-direction:column;align-items:center;gap:9px;}' +
    '.sw-avatar-eyes{display:flex;gap:14px;}' +
    '.sw-avatar-eye{width:11px;height:11px;border-radius:50%;background:#7ee8ff;box-shadow:0 0 9px #7ee8ff,0 0 18px rgba(126,232,255,.5);animation:sw-blink 4.2s ease-in-out infinite;}' +
    '.sw-eye-r{animation-delay:.15s;}' +
    '@keyframes sw-blink{0%,88%,100%{transform:scaleY(1)}93%{transform:scaleY(.08)}}' +
    '.sw-avatar-mouth{width:20px;height:5px;border-radius:3px;background:linear-gradient(90deg,#3bc8f0,#66e0ff);box-shadow:0 0 8px rgba(91,200,240,.7);animation:sw-talk .38s ease-in-out infinite alternate;}' +
    '@keyframes sw-talk{from{height:3px;width:15px}to{height:11px;width:24px;border-radius:5px 5px 3px 3px}}' +
    '.sw-avatar-bubble{background:linear-gradient(135deg,#0e2040,#0a1830);border:1px solid rgba(100,200,255,.45);border-radius:14px 14px 4px 14px;padding:9px 13px;font-size:12px;color:#d8f0ff;line-height:1.45;box-shadow:0 8px 22px rgba(0,0,0,.48);cursor:pointer;white-space:nowrap;}' +
    '.sw-avatar-bubble b{color:#7ee8ff;font-weight:700;}' +
    '@media (max-width:640px){.sw-chat{right:10px;bottom:10px}.sw-chat-panel{width:min(94vw,390px);height:min(76vh,568px);max-height:76vh}.sw-chat-close{width:36px;height:36px}.sw-chat-head .sw-chat-settings{width:36px;min-width:36px}}';

  document.head.appendChild(style);
  document.body.appendChild(ui);

  var fab = ui.querySelector('.sw-chat-fab');
  var avatar = ui.querySelector('.sw-avatar');
  var panel = ui.querySelector('.sw-chat-panel');
  var providerSelect = ui.querySelector('.sw-chat-provider');
  var settingsBtn = ui.querySelector('.sw-chat-settings');
  var uploadInput = ui.querySelector('.sw-chat-upload input');
  var clearBtn = ui.querySelector('.sw-chat-clear');
  var configPanel = ui.querySelector('.sw-chat-config');
  var modelInput = ui.querySelector('.sw-chat-model-input');
  var baseInput = ui.querySelector('.sw-chat-base-input');
  var keyInput = ui.querySelector('.sw-chat-key-input');
  var saveSettingsBtn = ui.querySelector('.sw-chat-model-save');
  var closeBtn = ui.querySelector('.sw-chat-close');
  var meta = ui.querySelector('.sw-chat-meta');
  var log = ui.querySelector('.sw-chat-log');
  var form = ui.querySelector('.sw-chat-form');
  var input = ui.querySelector('.sw-chat-input');

  var docs = readDocs();
  var history = readChatHistory();
  var interactionBuffer = [];
  var flushTimerId = null;
  var snapshotTimerId = null;
  var isOpen = false;
  var isAvatarOpen = false;
  var settings = readLlmSettings();
  var dragState = { active: false, moved: false, startX: 0, startY: 0, originX: 0, originY: 0, pointerId: null };
  var suppressFabClick = false;

  restoreFabPosition();

  hydrateSettingsUi();

  setOpen(localStorage.getItem(OPEN_KEY) === '1');

  if (history.length) {
    renderHistory(history);
  } else {
    addBot('Smart Chatbot ready. Ask about this page.');
  }
  refreshMeta();
  initInteractionLogging();

  fab.addEventListener('click', function (event) {
    if (suppressFabClick) {
      suppressFabClick = false;
      return;
    }
    event.stopPropagation();
    if (isOpen) {
      setOpen(false);
      return;
    }
    setAvatarOpen(!isAvatarOpen);
  });

  avatar.addEventListener('click', function (event) {
    event.stopPropagation();
    setAvatarOpen(false);
    setOpen(true);
  });

  avatar.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setAvatarOpen(false);
      setOpen(true);
    }
  });

  fab.addEventListener('pointerdown', function (event) {
    if (event.button !== 0) {
      return;
    }
    var rect = ui.getBoundingClientRect();
    dragState.active = true;
    dragState.moved = false;
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;
    dragState.originX = rect.left;
    dragState.originY = rect.top;
    dragState.pointerId = event.pointerId;
    fab.classList.add('sw-dragging');
    fab.setPointerCapture(event.pointerId);
  });

  fab.addEventListener('pointermove', function (event) {
    if (!dragState.active || event.pointerId !== dragState.pointerId) {
      return;
    }
    var dx = event.clientX - dragState.startX;
    var dy = event.clientY - dragState.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) {
      dragState.moved = true;
    }
    setChatPosition(dragState.originX + dx, dragState.originY + dy);
  });

  fab.addEventListener('pointerup', function (event) {
    if (!dragState.active || event.pointerId !== dragState.pointerId) {
      return;
    }
    dragState.active = false;
    fab.classList.remove('sw-dragging');
    if (dragState.moved) {
      persistFabPosition();
      suppressFabClick = true;
    }
    try {
      fab.releasePointerCapture(event.pointerId);
    } catch {
      // ignore capture errors
    }
  });

  window.addEventListener('resize', function () {
    if (!ui.style.left || !ui.style.top) {
      return;
    }
    setChatPosition(Number(ui.style.left.replace('px', '')), Number(ui.style.top.replace('px', '')));
    persistFabPosition();
  });

  closeBtn.addEventListener('click', function () {
    setOpen(false);
  });

  document.addEventListener('pointerdown', function (event) {
    var inside = ui.contains(event.target);
    if (!inside) {
      if (isOpen) { setOpen(false); }
      if (isAvatarOpen) { setAvatarOpen(false); }
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setOpen(false);
    }
  });

  settingsBtn.addEventListener('click', function () {
    configPanel.hidden = !configPanel.hidden;
  });

  providerSelect.addEventListener('change', function () {
    settings = readLlmSettings();
    settings.provider = providerSelect.value;
    if (!settings.model) settings.model = (providerDefaults[settings.provider] || providerDefaults.local).model;
    if (!settings.baseUrl) settings.baseUrl = (providerDefaults[settings.provider] || providerDefaults.local).baseUrl;
    persistLlmSettings(settings);
    hydrateSettingsUi();
    refreshMeta();
  });

  saveSettingsBtn.addEventListener('click', function () {
    settings = {
      provider: providerSelect.value,
      model: clean(modelInput.value),
      baseUrl: clean(baseInput.value),
      apiKey: clean(keyInput.value)
    };
    persistLlmSettings(settings);
    refreshMeta();
    addBot('Settings saved.');
  });

  uploadInput.addEventListener('change', function () {
    var files = Array.prototype.slice.call(uploadInput.files || []);
    if (!files.length) {
      return;
    }
    loadFiles(files).then(function (items) {
      docs = docs.concat(items);
      persistDocs(docs);
      addBot('Loaded ' + items.length + ' file(s).');
    }).catch(function () {
      addBot('Could not read one or more files.');
    });
    uploadInput.value = '';
  });

  clearBtn.addEventListener('click', function () {
    docs = [];
    persistDocs(docs);
    addBot('Uploaded data cleared.');
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var q = (input.value || '').trim();
    if (!q) {
      return;
    }
    addUser(q);
    input.value = '';
    respond(q);
  });

  function respond(question) {
    var localAnswer = answerQuestionLocal(question);
    if (!canUseLlm()) {
      addBot(localAnswer);
      return;
    }

    callLlm(question).then(function (text) {
      addBot(text || localAnswer);
    }).catch(function () {
      addBot(localAnswer + '\n\n(LLM API unavailable, used local answer.)');
    });
  }

  function setOpen(next) {
    isOpen = Boolean(next);
    if (isOpen && isAvatarOpen) { setAvatarOpen(false); }
    panel.classList.toggle('sw-open', isOpen);
    fab.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    localStorage.setItem(OPEN_KEY, isOpen ? '1' : '0');
  }

  function setAvatarOpen(next) {
    isAvatarOpen = Boolean(next);
    if (isAvatarOpen) {
      avatar.hidden = false;
      requestAnimationFrame(function () { avatar.classList.add('sw-aopen'); });
    } else {
      avatar.classList.remove('sw-aopen');
      avatar.addEventListener('transitionend', function hide() {
        if (!isAvatarOpen) { avatar.hidden = true; }
        avatar.removeEventListener('transitionend', hide);
      });
    }
  }

  function setChatPosition(x, y) {
    var clamped = clampPosition(x, y);
    ui.style.left = clamped.x + 'px';
    ui.style.top = clamped.y + 'px';
    ui.style.right = 'auto';
    ui.style.bottom = 'auto';
  }

  function clampPosition(x, y) {
    var pad = 8;
    var width = fab.offsetWidth || 46;
    var height = fab.offsetHeight || 46;
    var maxX = Math.max(pad, window.innerWidth - width - pad);
    var maxY = Math.max(pad, window.innerHeight - height - pad);
    return {
      x: Math.min(maxX, Math.max(pad, Math.round(Number(x) || 0))),
      y: Math.min(maxY, Math.max(pad, Math.round(Number(y) || 0)))
    };
  }

  function restoreFabPosition() {
    var fallback = {
      x: Math.max(8, window.innerWidth - 72),
      y: Math.max(8, Math.round(window.innerHeight * 0.55))
    };

    try {
      var raw = localStorage.getItem(FAB_POSITION_KEY);
      if (!raw) {
        setChatPosition(fallback.x, fallback.y);
        return;
      }
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.x !== 'number' || typeof parsed.y !== 'number') {
        setChatPosition(fallback.x, fallback.y);
        return;
      }
      setChatPosition(parsed.x, parsed.y);
    } catch {
      setChatPosition(fallback.x, fallback.y);
    }
  }

  function persistFabPosition() {
    try {
      localStorage.setItem(FAB_POSITION_KEY, JSON.stringify({
        x: Number((ui.style.left || '').replace('px', '')) || 0,
        y: Number((ui.style.top || '').replace('px', '')) || 0
      }));
    } catch {
      // best effort only
    }
  }

  function canUseLlm() {
    settings = readLlmSettings();
    return settings.provider !== 'local' && Boolean(settings.apiKey && settings.baseUrl && settings.model);
  }

  function callLlm(question) {
    settings = readLlmSettings();
    var context = buildContext(question);
    return fetch(settings.baseUrl, {
      method: 'POST',
      headers: buildHeaders(settings),
      body: JSON.stringify({
        model: settings.model,
        messages: [
          {
            role: 'system',
            content: 'You are Smart World assistant. Use page context and uploaded data when relevant. Be concise and practical.'
          },
          {
            role: 'user',
            content: 'Question: ' + question + '\n\nContext:\n' + context
          }
        ],
        temperature: 0.2,
        max_tokens: 700
      })
    }).then(function (res) {
      if (!res.ok) {
        throw new Error('api');
      }
      return res.json();
    }).then(function (payload) {
      var content = payload && payload.choices && payload.choices[0] && payload.choices[0].message && payload.choices[0].message.content;
      return typeof content === 'string' ? content.trim() : '';
    });
  }

  function buildHeaders(currentSettings) {
    var headers = {
      Authorization: 'Bearer ' + currentSettings.apiKey,
      'Content-Type': 'application/json'
    };
    if (currentSettings.provider === 'openrouter') {
      headers['HTTP-Referer'] = window.location.origin;
      headers['X-Title'] = 'Smart World OS';
    }
    return headers;
  }

  function buildContext(question) {
    var pageContext = getPageContext();
    var docHits = searchDocs(question, docs).slice(0, 5).map(function (h) {
      return h.source + ': ' + h.snippet;
    });

    return [
      'Page title: ' + pageContext.title,
      'Page URL: ' + pageContext.url,
      'Headings: ' + pageContext.headings.join(' | '),
      'Page summary: ' + pageContext.text.slice(0, 1600),
      'Uploaded data hints: ' + (docHits.length ? docHits.join(' || ') : 'none')
    ].join('\n');
  }

  function addUser(text) {
    captureInteraction('chat.user', { length: text.length });
    renderMessage('user', text);
    persistChatMessage('user', text);
  }

  function addBot(text) {
    captureInteraction('chat.bot', { length: (text || '').length });
    renderMessage('bot', text);
    persistChatMessage('bot', text);
  }

  function renderMessage(role, text) {
    var node = document.createElement('div');
    node.className = role === 'user' ? 'sw-msg sw-msg-user' : 'sw-msg sw-msg-bot';
    node.textContent = String(text || '');
    log.appendChild(node);
    log.scrollTop = log.scrollHeight;
  }

  function renderHistory(items) {
    items.forEach(function (item) {
      if (!item || !item.text) {
        return;
      }
      var role = item.role === 'user' ? 'user' : 'bot';
      renderMessage(role, item.text);
    });
  }

  function refreshMeta() {
    settings = readLlmSettings();
    var mode = settings.provider === 'local' ? 'Local' : ('Provider: ' + settings.provider + ' | Model: ' + (settings.model || 'n/a'));
    meta.textContent = mode + '. Ready.';
  }

  function hydrateSettingsUi() {
    settings = readLlmSettings();
    providerSelect.value = settings.provider || 'local';
    var defaults = providerDefaults[providerSelect.value] || providerDefaults.local;
    modelInput.value = settings.model || defaults.model || '';
    baseInput.value = settings.baseUrl || defaults.baseUrl || '';
    keyInput.value = settings.apiKey || '';
  }

  function answerQuestionLocal(question) {
    var q = question.toLowerCase();
    if (q === 'help' || q.indexOf('what can you do') >= 0) {
      return 'I can answer from this page, use uploaded files, and use LLM mode if configured.';
    }

    var pageContext = getPageContext();
    var hits = searchDocs(question, docs);
    if (hits.length) {
      var summary = hits.slice(0, 3).map(function (h, idx) {
        return (idx + 1) + '. ' + h.source + ': ' + h.snippet;
      }).join('\n');
      return 'I found relevant uploaded data:\n' + summary + '\n\nPage: ' + pageContext.title;
    }

    var pageHits = searchPage(question, pageContext);
    if (pageHits.length) {
      return 'From this page, relevant points:\n' + pageHits.slice(0, 4).map(function (x, i) {
        return (i + 1) + '. ' + x;
      }).join('\n');
    }

    return 'I could not find a precise match yet. Try upload data or ask with specific keywords.';
  }

  function getPageContext() {
    var headingNodes = Array.prototype.slice.call(document.querySelectorAll('h1, h2, h3')).slice(0, 15);
    var headings = headingNodes.map(function (n) { return clean(n.textContent); }).filter(Boolean);

    var text = clean((document.body && document.body.innerText) || '');
    if (text.length > 5000) {
      text = text.slice(0, 5000);
    }

    return {
      title: document.title || 'Untitled Page',
      url: location.href,
      headings: headings,
      text: text
    };
  }

  function searchPage(question, context) {
    var terms = tokenize(question);
    var pool = context.headings.concat(context.text.split(/\n+/).slice(0, 150)).map(clean).filter(Boolean);
    return rankTextPool(terms, pool).slice(0, 6);
  }

  function searchDocs(question, allDocs) {
    var terms = tokenize(question);
    var out = [];
    allDocs.forEach(function (doc) {
      var pool = doc.chunks || [];
      var ranked = rankTextPool(terms, pool).slice(0, 2);
      ranked.forEach(function (snippet) {
        out.push({ source: doc.name, snippet: snippet });
      });
    });
    return out.slice(0, 8);
  }

  function rankTextPool(terms, pool) {
    var scored = pool.map(function (line) {
      var l = line.toLowerCase();
      var score = 0;
      terms.forEach(function (t) {
        if (l.indexOf(t) >= 0) score += 2;
      });
      if (score === 0 && terms.length && l.indexOf(terms[0]) >= 0) score = 1;
      return { line: line, score: score };
    }).filter(function (x) { return x.score > 0; });

    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.map(function (x) { return x.line; });
  }

  function tokenize(text) {
    return clean(text).toLowerCase().split(/\s+/).filter(function (w) {
      return w.length > 2 && !/^(the|and|for|with|from|this|that|what|when|where|which|about)$/i.test(w);
    }).slice(0, 12);
  }

  function clean(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function readDocs() {
    try {
      var raw = localStorage.getItem(DATA_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function persistDocs(payload) {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(payload.slice(-25)));
    } catch {
      // best effort only
    }
  }

  function readLlmSettings() {
    try {
      var raw = localStorage.getItem(LLM_SETTINGS_KEY);
      if (!raw) {
        return { provider: 'local', model: '', baseUrl: '', apiKey: '' };
      }
      var parsed = JSON.parse(raw);
      return {
        provider: parsed.provider || 'local',
        model: parsed.model || '',
        baseUrl: parsed.baseUrl || '',
        apiKey: parsed.apiKey || ''
      };
    } catch {
      return { provider: 'local', model: '', baseUrl: '', apiKey: '' };
    }
  }

  function readChatHistory() {
    try {
      var raw = localStorage.getItem(CHAT_HISTORY_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter(function (item) {
        return item && typeof item.text === 'string' && item.text.trim().length > 0;
      }).slice(-CHAT_HISTORY_LIMIT);
    } catch {
      return [];
    }
  }

  function persistChatMessage(role, text) {
    var safeText = clean(String(text || ''));
    if (!safeText) {
      return;
    }
    history.push({
      role: role === 'user' ? 'user' : 'bot',
      text: safeText,
      ts: new Date().toISOString()
    });
    if (history.length > CHAT_HISTORY_LIMIT) {
      history = history.slice(-CHAT_HISTORY_LIMIT);
    }
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
    } catch {
      // best effort only
    }
  }


  function persistLlmSettings(payload) {
    try {
      localStorage.setItem(LLM_SETTINGS_KEY, JSON.stringify(payload));
    } catch {
      // best effort only
    }
  }

  function initInteractionLogging() {
    captureInteraction('session.start', {});

    document.addEventListener('click', function (event) {
      var target = event.target;
      captureInteraction('click', {
        tag: target && target.tagName ? target.tagName.toLowerCase() : '',
        id: target && target.id ? target.id : '',
        cls: target && target.className ? String(target.className).slice(0, 80) : ''
      });
    }, true);

    document.addEventListener('input', function (event) {
      var target = event.target;
      var type = target && target.type ? String(target.type) : '';
      if (type === 'password') {
        return;
      }
      captureInteraction('input', {
        id: target && target.id ? target.id : '',
        name: target && target.name ? target.name : '',
        type: type,
        valueLength: target && typeof target.value === 'string' ? target.value.length : 0
      });
    }, true);

    document.addEventListener('keydown', function (event) {
      captureInteraction('keydown', {
        key: event.key,
        ctrl: Boolean(event.ctrlKey),
        shift: Boolean(event.shiftKey),
        alt: Boolean(event.altKey)
      });
    }, true);

    window.addEventListener('scroll', function () {
      captureInteraction('scroll', {
        x: Math.round(window.scrollX || 0),
        y: Math.round(window.scrollY || 0)
      });
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      captureInteraction('visibility', { state: document.visibilityState || 'unknown' });
    });

    startVaultTimers();

    window.addEventListener('storage', function (event) {
      if (event.key === SUPER_VAULT_SETTINGS_KEY) {
        startVaultTimers();
      }
    });
  }

  function readVaultSettings() {
    try {
      var raw = localStorage.getItem(SUPER_VAULT_SETTINGS_KEY);
      if (!raw) {
        return { logRateMs: 1000, retentionDays: 30, autoSnapshot: true, snapshotRateMs: 3600000 };
      }
      var parsed = JSON.parse(raw);
      return {
        logRateMs: Number(parsed.logRateMs) || 1000,
        retentionDays: Number(parsed.retentionDays) || 30,
        autoSnapshot: typeof parsed.autoSnapshot === 'boolean' ? parsed.autoSnapshot : true,
        snapshotRateMs: Number(parsed.snapshotRateMs) || 3600000
      };
    } catch {
      return { logRateMs: 1000, retentionDays: 30, autoSnapshot: true, snapshotRateMs: 3600000 };
    }
  }

  function startVaultTimers() {
    var cfg = readVaultSettings();
    if (flushTimerId) {
      clearInterval(flushTimerId);
    }
    if (snapshotTimerId) {
      clearInterval(snapshotTimerId);
    }

    flushTimerId = setInterval(function () {
      flushInteractionTick(cfg);
    }, Math.max(1000, cfg.logRateMs));

    if (cfg.autoSnapshot) {
      snapshotTimerId = setInterval(function () {
        createVaultSnapshot();
      }, Math.max(60000, cfg.snapshotRateMs));
    }
  }

  function captureInteraction(type, payload) {
    interactionBuffer.push({
      ts: new Date().toISOString(),
      type: type,
      payload: payload || {}
    });
    if (interactionBuffer.length > 160) {
      interactionBuffer = interactionBuffer.slice(-160);
    }
  }

  function currentTenantInfo() {
    if (window.SmartWorldAuth && typeof window.SmartWorldAuth.getTenant === 'function') {
      var tenant = window.SmartWorldAuth.getTenant();
      if (tenant && tenant.id) {
        return {
          id: tenant.id,
          label: tenant.label || tenant.id,
          spatial: tenant.spatial || '',
          temporal: tenant.temporal || ''
        };
      }
    }
    return {
      id: 'public',
      label: 'Public Space',
      spatial: '',
      temporal: ''
    };
  }

  function currentUser() {
    if (window.SmartWorldAuth && typeof window.SmartWorldAuth.getUser === 'function') {
      return window.SmartWorldAuth.getUser() || 'guest';
    }
    return 'guest';
  }

  function readVault() {
    try {
      var raw = localStorage.getItem(SUPER_VAULT_KEY);
      if (!raw) {
        return { folders: {} };
      }
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        return { folders: {} };
      }
      if (!parsed.folders || typeof parsed.folders !== 'object') {
        parsed.folders = {};
      }
      return parsed;
    } catch {
      return { folders: {} };
    }
  }

  function writeVault(vault) {
    try {
      localStorage.setItem(SUPER_VAULT_KEY, JSON.stringify(vault));
    } catch {
      // best effort only
    }
  }

  function ensureFolder(vault, tenant) {
    if (!vault.folders[tenant.id]) {
      vault.folders[tenant.id] = {
        meta: {
          id: tenant.id,
          label: tenant.label,
          spatial: tenant.spatial,
          temporal: tenant.temporal,
          createdAt: new Date().toISOString()
        },
        logs: []
      };
    }
    return vault.folders[tenant.id];
  }

  function flushInteractionTick(cfgArg) {
    var cfg = cfgArg || readVaultSettings();
    var tenant = currentTenantInfo();
    var user = currentUser();
    var vault = readVault();
    var folder = ensureFolder(vault, tenant);

    folder.logs.push({
      ts: new Date().toISOString(),
      kind: 'tick',
      user: user,
      page: {
        title: document.title || 'Untitled',
        url: location.href
      },
      interactions: interactionBuffer.splice(0, interactionBuffer.length)
    });

    if (folder.logs.length > 3600) {
      folder.logs = folder.logs.slice(-3600);
    }

    pruneVaultByRetention(vault, cfg.retentionDays);

    writeVault(vault);
  }

  function pruneVaultByRetention(vault, retentionDays) {
    var days = Number(retentionDays) || 30;
    var cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    Object.keys(vault.folders || {}).forEach(function (entityId) {
      var folder = vault.folders[entityId];
      if (!folder || !Array.isArray(folder.logs)) {
        return;
      }
      folder.logs = folder.logs.filter(function (item) {
        var ts = Date.parse(item && item.ts ? item.ts : '');
        if (!Number.isFinite(ts)) {
          return true;
        }
        return ts >= cutoff;
      });
    });
  }

  function createVaultSnapshot() {
    var vault = readVault();
    var entities = Object.keys(vault.folders || {});
    var summary = {
      ts: new Date().toISOString(),
      entityCount: entities.length,
      logCount: 0,
      byEntity: {}
    };

    entities.forEach(function (entityId) {
      var count = Array.isArray(vault.folders[entityId].logs) ? vault.folders[entityId].logs.length : 0;
      summary.byEntity[entityId] = count;
      summary.logCount += count;
    });

    if (!Array.isArray(vault.snapshots)) {
      vault.snapshots = [];
    }
    vault.snapshots.push(summary);
    if (vault.snapshots.length > 240) {
      vault.snapshots = vault.snapshots.slice(-240);
    }
    writeVault(vault);
  }

  function loadFiles(files) {
    return Promise.all(files.map(readOneFile));
  }

  function readOneFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var text = String(reader.result || '');
          resolve({
            name: file.name,
            chunks: normalizeChunks(file.name, text)
          });
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  function normalizeChunks(name, text) {
    var lower = name.toLowerCase();
    if (lower.endsWith('.json')) {
      try {
        var obj = JSON.parse(text);
        return JSON.stringify(obj, null, 2).split(/\n/).map(clean).filter(Boolean).slice(0, 600);
      } catch {
        return text.split(/\n/).map(clean).filter(Boolean).slice(0, 600);
      }
    }

    return text.split(/\n/).map(clean).filter(Boolean).slice(0, 600);
  }
})();

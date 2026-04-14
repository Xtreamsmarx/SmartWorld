const form = document.querySelector('#signupForm');
const fullNameInput = document.querySelector('#fullName');
const emailInput = document.querySelector('#email');
const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');
const organizationInput = document.querySelector('#organization');
const titleInput = document.querySelector('#title');
const phoneInput = document.querySelector('#phone');
const tenantSelect = document.querySelector('#tenantSelect');
const appsGrid = document.querySelector('#appsGrid');
const selectAllAppsBtn = document.querySelector('#selectAllApps');
const clearAppsBtn = document.querySelector('#clearApps');
const signupMsg = document.querySelector('#signupMsg');

const getSelectedApps = () => Array.from(appsGrid.querySelectorAll('input[type="checkbox"]:checked')).map((item) => item.value);

const renderTenants = () => {
  if (!tenantSelect || !window.SmartWorldAuth) {
    return;
  }
  tenantSelect.innerHTML = '';
  const tenants = window.SmartWorldAuth.getTenants();
  for (const tenant of tenants) {
    const option = document.createElement('option');
    option.value = tenant.id;
    option.textContent = tenant.label;
    tenantSelect.appendChild(option);
  }
  tenantSelect.value = 'und';
};

const renderApps = () => {
  if (!appsGrid || !window.SmartWorldAuth || typeof window.SmartWorldAuth.getAppCatalog !== 'function') {
    return;
  }
  appsGrid.innerHTML = '';

  const apps = window.SmartWorldAuth.getAppCatalog();
  for (const app of apps) {
    const row = document.createElement('label');
    row.className = 'app-option';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = app.id;
    cb.checked = ['explorer', 'settings', 'chatbot', 'browser'].includes(app.id);

    const text = document.createElement('span');
    text.textContent = app.label;

    row.appendChild(cb);
    row.appendChild(text);
    appsGrid.appendChild(row);
  }
};

if (!window.SmartWorldAuth || typeof window.SmartWorldAuth.registerUser !== 'function') {
  if (signupMsg) {
    signupMsg.textContent = 'Auth module missing. Cannot create account.';
  }
} else {
  renderTenants();
  renderApps();

  selectAllAppsBtn?.addEventListener('click', () => {
    appsGrid.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.checked = true;
    });
  });

  clearAppsBtn?.addEventListener('click', () => {
    appsGrid.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.checked = false;
    });
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const selectedApps = getSelectedApps();
    if (!selectedApps.length) {
      if (signupMsg) {
        signupMsg.textContent = 'Select at least one app.';
      }
      return;
    }

    const result = window.SmartWorldAuth.registerUser({
      fullName: (fullNameInput?.value || '').trim(),
      email: (emailInput?.value || '').trim(),
      username: (usernameInput?.value || '').trim(),
      password: passwordInput?.value || '',
      organization: (organizationInput?.value || '').trim(),
      title: (titleInput?.value || '').trim(),
      phone: (phoneInput?.value || '').trim(),
      tenantId: tenantSelect?.value || 'und',
      apps: selectedApps
    });

    if (!result || !result.ok) {
      if (signupMsg) {
        signupMsg.textContent = result && result.message ? result.message : 'Signup failed.';
      }
      return;
    }

    if (signupMsg) {
      signupMsg.textContent = 'Account created. Redirecting to login...';
    }

    const userParam = encodeURIComponent(result.user || '');
    window.setTimeout(() => {
      window.location.href = `./login.html?u=${userParam}`;
    }, 700);
  });
}

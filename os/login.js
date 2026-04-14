const form = document.querySelector('#loginForm');
const userInput = document.querySelector('#username');
const passInput = document.querySelector('#password');
const errorNode = document.querySelector('#errorMsg');
const locationList = document.querySelector('#locationList');
const selectionNote = document.querySelector('#selectionNote');
const openMapBtn = document.querySelector('#openMapBtn');
const googleMapFrame = document.querySelector('#googleMapFrame');
const entitySignupForm = document.querySelector('#entitySignupForm');
const suUser = document.querySelector('#suUser');
const suPass = document.querySelector('#suPass');
const entityName = document.querySelector('#entityName');
const entitySpatial = document.querySelector('#entitySpatial');
const entityTemporal = document.querySelector('#entityTemporal');
const entityLat = document.querySelector('#entityLat');
const entityLng = document.querySelector('#entityLng');
const signupMsg = document.querySelector('#signupMsg');

let selectedTenantId = 'und';

const prefillFromQuery = () => {
  const params = new URLSearchParams(window.location.search);
  const user = params.get('u');
  if (userInput && user) {
    userInput.value = user;
  }
};

const updateTenantUi = () => {
  const tenant = window.SmartWorldAuth.getTenant();
  selectedTenantId = tenant.id;

  document.querySelectorAll('.location-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.tenant === selectedTenantId);
  });

  if (selectionNote) {
    selectionNote.textContent = `Selected portal: ${tenant.label} | Status: ${tenant.enabled ? 'Live' : 'Coming soon'}`;
  }

  if (openMapBtn) {
    openMapBtn.href = tenant.mapOpenUrl || 'https://www.google.com/maps?q=United+States&z=4';
  }

  if (googleMapFrame) {
    googleMapFrame.src = tenant.mapEmbedUrl || 'https://www.google.com/maps?q=United+States&z=4&output=embed';
  }
};

const selectTenant = (tenantId) => {
  if (!window.SmartWorldAuth.setTenant(tenantId)) {
    return;
  }
  updateTenantUi();
};

const renderLocations = () => {
  if (!locationList || !window.SmartWorldAuth) return;
  locationList.innerHTML = '';

  window.SmartWorldAuth.getTenants().forEach((tenant) => {
    const row = document.createElement('article');
    row.className = 'location-item';
    row.dataset.tenant = tenant.id;
    row.innerHTML = `
      <h3>${tenant.label}</h3>
      <p>${tenant.enabled ? 'OS available now' : 'Planned OS instance (coming soon)'}</p>
      <p>Lat/Lng: ${tenant.lat}, ${tenant.lng}</p>
    `;
    row.addEventListener('click', () => selectTenant(tenant.id));
    locationList.appendChild(row);
  });
};

if (!window.SmartWorldAuth) {
  if (errorNode) {
    errorNode.textContent = 'Auth module missing. Cannot sign in.';
  }
} else {
  prefillFromQuery();
  renderLocations();

  updateTenantUi();

  if (window.SmartWorldAuth.isAuthenticated()) {
    const route = window.SmartWorldAuth.getTenantRoute();
    if (route) {
      window.location.replace(route);
    }
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = (userInput?.value || '').trim();
    const password = passInput?.value || '';

    const ok = window.SmartWorldAuth.login(username, password);
    if (!ok) {
      if (errorNode) {
        errorNode.textContent = 'Invalid username or password.';
      }
      return;
    }

    if (errorNode) {
      errorNode.textContent = '';
    }

    const route = window.SmartWorldAuth.getTenantRoute();
    if (!route) {
      if (errorNode) {
        errorNode.textContent = 'Selected location OS is coming soon. Choose UND for now.';
      }
      return;
    }
    window.location.replace(route);
  });

  entitySignupForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const superUserName = (suUser?.value || '').trim();
    const superPassword = suPass?.value || '';
    const canCreate = typeof window.SmartWorldAuth.verifySuperCredentials === 'function'
      && window.SmartWorldAuth.verifySuperCredentials(superUserName, superPassword);

    if (!canCreate) {
      if (signupMsg) {
        signupMsg.textContent = 'Invalid Super User credentials.';
      }
      return;
    }

    // Authenticate as super user before creating entity-scoped OS nodes.
    window.SmartWorldAuth.login(superUserName, superPassword);

    const result = window.SmartWorldAuth.createSpatialTemporalTenant({
      name: (entityName?.value || '').trim(),
      spatial: (entitySpatial?.value || '').trim(),
      temporal: (entityTemporal?.value || '').trim(),
      lat: Number(entityLat?.value || ''),
      lng: Number(entityLng?.value || '')
    });

    if (!result || !result.ok) {
      if (signupMsg) {
        signupMsg.textContent = result && result.message ? result.message : 'Could not create spatial-temporal entity.';
      }
      return;
    }

    renderLocations();
    selectTenant(result.tenant.id);

    if (signupMsg) {
      signupMsg.textContent = `Created ${result.tenant.label}. Portal is live now.`;
    }

    entitySignupForm.reset();
  });
}

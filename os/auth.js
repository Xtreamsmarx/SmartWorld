(function () {
  const AUTH_KEY = 'smart_world_os_auth';
  const TENANT_KEY = 'smart_world_os_tenant';
  const DYNAMIC_TENANTS_KEY = 'smart_world_os_dynamic_tenants.v1';
  const SUPER_VAULT_KEY = 'smartworld.superUserVault.v1';
  const DYNAMIC_USERS_KEY = 'smart_world_os_users.v1';
  const USER_PROFILES_KEY = 'smart_world_os_user_profiles.v1';
  const APP_VISIBILITY_KEY = 'smartworld.os.appVisibility.v1';
  const USERS = {
    SmartWorld: { password: 'Xtream', role: 'standard' },
    XtreamWorld: { password: 'SuperXtream', role: 'super' }
  };

  const APP_CATALOG = [
    { id: 'explorer', label: 'Explorer' },
    { id: 'terminal', label: 'Terminal' },
    { id: 'settings', label: 'Settings' },
    { id: 'browser', label: 'Web Browser' },
    { id: 'home', label: 'Smart World' },
    { id: 'chatbot', label: 'Chatbot' },
    { id: 'python', label: 'Python Comp' },
    { id: 'control', label: 'Control Center' },
    { id: 'market', label: 'Agent Market' },
    { id: 'simlab', label: 'Smart World Lab' },
    { id: 'gf-twin', label: 'GF Digital Twin' },
    { id: 'teamhub', label: 'Team Hub' },
    { id: 'campus', label: 'Campus' },
    { id: 'ai-adoption', label: 'AI Adoption' },
    { id: 'water-treatment', label: 'GF Water Plant' },
    { id: 'social', label: 'Social' },
    { id: 'ait-transfer', label: 'AIT Transfer' },
    { id: 'code-studio', label: 'Code Studio' },
    { id: 'smarket', label: 'Smarket' }
  ];

  const TENANTS = {
    und: {
      id: 'und',
      label: 'University of North Dakota (UND)',
      route: './os.html',
      enabled: true,
      lat: 47.9222,
      lng: -97.0736,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=264+Centennial+Dr,+Grand+Forks,+ND+58202',
      mapEmbedUrl: 'https://www.google.com/maps?q=264+Centennial+Dr,+Grand+Forks,+ND+58202&z=16&output=embed'
    },
    umn: {
      id: 'umn',
      label: 'University of Minnesota',
      route: './os.html',
      enabled: true,
      lat: 44.9730,
      lng: -93.2277,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=100+Church+St+SE,+Minneapolis,+MN+55455',
      mapEmbedUrl: 'https://www.google.com/maps?q=100+Church+St+SE,+Minneapolis,+MN+55455&z=16&output=embed'
    },
    ndsu: {
      id: 'ndsu',
      label: 'North Dakota State University',
      route: './os.html',
      enabled: true,
      lat: 46.8937,
      lng: -96.8017,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=1340+Administration+Ave,+Fargo,+ND+58102',
      mapEmbedUrl: 'https://www.google.com/maps?q=1340+Administration+Ave,+Fargo,+ND+58102&z=16&output=embed'
    },
    ucla: {
      id: 'ucla',
      label: 'UCLA',
      route: './os.html',
      enabled: true,
      lat: 34.0689,
      lng: -118.4452,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=405+Hilgard+Ave,+Los+Angeles,+CA+90095',
      mapEmbedUrl: 'https://www.google.com/maps?q=405+Hilgard+Ave,+Los+Angeles,+CA+90095&z=16&output=embed'
    },
    ut_austin: {
      id: 'ut_austin',
      label: 'UT Austin',
      route: './os.html',
      enabled: true,
      lat: 30.2849,
      lng: -97.7341,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=110+Inner+Campus+Dr,+Austin,+TX+78705',
      mapEmbedUrl: 'https://www.google.com/maps?q=110+Inner+Campus+Dr,+Austin,+TX+78705&z=16&output=embed'
    },
    mit: {
      id: 'mit',
      label: 'MIT',
      route: './os.html',
      enabled: true,
      lat: 42.3601,
      lng: -71.0942,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=77+Massachusetts+Ave,+Cambridge,+MA+02139',
      mapEmbedUrl: 'https://www.google.com/maps?q=77+Massachusetts+Ave,+Cambridge,+MA+02139&z=16&output=embed'
    },
    nyu: {
      id: 'nyu',
      label: 'NYU',
      route: './os.html',
      enabled: true,
      lat: 40.7291,
      lng: -73.9965,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=70+Washington+Sq+S,+New+York,+NY+10012',
      mapEmbedUrl: 'https://www.google.com/maps?q=70+Washington+Sq+S,+New+York,+NY+10012&z=16&output=embed'
    },
    municipal_grandforks: {
      id: 'municipal_grandforks',
      label: 'Grand Forks Municipality',
      route: './os.html',
      enabled: true,
      lat: 47.9253,
      lng: -97.0329,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=255+N+4th+St,+Grand+Forks,+ND+58203',
      mapEmbedUrl: 'https://www.google.com/maps?q=255+N+4th+St,+Grand+Forks,+ND+58203&z=16&output=embed'
    },
    municipal_minneapolis: {
      id: 'municipal_minneapolis',
      label: 'Minneapolis Municipal',
      route: './os.html',
      enabled: true,
      lat: 44.9778,
      lng: -93.2650,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=350+S+5th+St,+Minneapolis,+MN+55415',
      mapEmbedUrl: 'https://www.google.com/maps?q=350+S+5th+St,+Minneapolis,+MN+55415&z=16&output=embed'
    },
    municipal_austin: {
      id: 'municipal_austin',
      label: 'Austin Municipal',
      route: './os.html',
      enabled: true,
      lat: 30.2672,
      lng: -97.7431,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=301+W+2nd+St,+Austin,+TX+78701',
      mapEmbedUrl: 'https://www.google.com/maps?q=301+W+2nd+St,+Austin,+TX+78701&z=16&output=embed'
    }
  };

  const readSession = () => {
    try {
      const raw = sessionStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.ok !== true) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const isAuthenticated = () => Boolean(readSession());

  const readJson = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch {
      return fallback;
    }
  };

  const writeJson = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const slugify = (value) => String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 42);

  const buildMapUrls = (label, lat, lng) => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return {
        mapOpenUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        mapEmbedUrl: `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`
      };
    }
    const query = encodeURIComponent(label || 'United States');
    return {
      mapOpenUrl: `https://www.google.com/maps/search/?api=1&query=${query}`,
      mapEmbedUrl: `https://www.google.com/maps?q=${query}&z=13&output=embed`
    };
  };

  const getDynamicTenants = () => readJson(DYNAMIC_TENANTS_KEY, {});
  const getDynamicUsers = () => readJson(DYNAMIC_USERS_KEY, {});
  const getUserProfiles = () => readJson(USER_PROFILES_KEY, {});

  const getAccount = (username) => {
    if (USERS[username]) {
      return USERS[username];
    }
    const dynamic = getDynamicUsers();
    return dynamic[username] || null;
  };

  const getVisibleAppIds = (apps) => {
    const allowedIds = new Set(APP_CATALOG.map((item) => item.id));
    const picked = Array.isArray(apps) ? apps : [];
    const visible = picked.filter((id) => allowedIds.has(id));
    return visible.length ? visible : ['explorer', 'settings', 'chatbot'];
  };

  const seedUserAppVisibility = (username, tenantId, apps) => {
    if (!username || !tenantId) {
      return;
    }
    const visibleIds = new Set(getVisibleAppIds(apps));
    const key = `${APP_VISIBILITY_KEY}.${username}`;
    const matrix = readJson(key, {});
    matrix[tenantId] = {};
    for (const item of APP_CATALOG) {
      matrix[tenantId][item.id] = visibleIds.has(item.id);
    }
    writeJson(key, matrix);
  };

  const getTenantById = (tenantId) => {
    if (TENANTS[tenantId]) {
      return TENANTS[tenantId];
    }
    const dynamic = getDynamicTenants();
    return dynamic[tenantId] || null;
  };

  const readVault = () => readJson(SUPER_VAULT_KEY, { folders: {} });

  const ensureVaultFolder = (tenant) => {
    if (!tenant || !tenant.id) {
      return;
    }
    const vault = readVault();
    if (!vault.folders[tenant.id]) {
      vault.folders[tenant.id] = {
        meta: {
          id: tenant.id,
          label: tenant.label || tenant.id,
          spatial: tenant.spatial || '',
          temporal: tenant.temporal || '',
          createdAt: tenant.createdAt || new Date().toISOString()
        },
        logs: []
      };
      writeJson(SUPER_VAULT_KEY, vault);
    }
  };

  const appendInteractionLog = (tenantId, event) => {
    const target = getTenantById(tenantId) || { id: tenantId || 'und', label: tenantId || 'und' };
    ensureVaultFolder(target);
    const vault = readVault();
    const folder = vault.folders[target.id];
    if (!folder) {
      return;
    }
    folder.logs.push(event);
    if (folder.logs.length > 3600) {
      folder.logs = folder.logs.slice(-3600);
    }
    writeJson(SUPER_VAULT_KEY, vault);
  };

  const login = (username, password) => {
    const account = getAccount(username);
    if (!account || account.password !== password) {
      return false;
    }

    sessionStorage.setItem(
      AUTH_KEY,
      JSON.stringify({ ok: true, username, role: account.role || 'standard' })
    );
    return true;
  };

  const verifySuperCredentials = (username, password) => {
    const account = getAccount(username);
    return Boolean(account && account.role === 'super' && account.password === password);
  };

  const registerUser = ({
    username,
    password,
    fullName,
    email,
    organization,
    title,
    phone,
    tenantId,
    apps
  }) => {
    const user = (username || '').trim();
    const pass = String(password || '');
    const name = (fullName || '').trim();
    const emailValue = (email || '').trim();
    const targetTenant = (tenantId || '').trim() || 'und';

    if (!user || !pass || !name || !emailValue) {
      return { ok: false, message: 'Username, password, full name, and email are required.' };
    }
    if (!/^[A-Za-z0-9._-]{3,32}$/.test(user)) {
      return { ok: false, message: 'Username must be 3-32 chars: letters, numbers, dot, underscore, hyphen.' };
    }
    if (pass.length < 6) {
      return { ok: false, message: 'Password must be at least 6 characters.' };
    }
    if (!/.+@.+\..+/.test(emailValue)) {
      return { ok: false, message: 'Please enter a valid email.' };
    }
    if (getAccount(user)) {
      return { ok: false, message: 'Username already exists.' };
    }
    if (!getTenantById(targetTenant)) {
      return { ok: false, message: 'Selected location is invalid.' };
    }

    const users = getDynamicUsers();
    users[user] = {
      password: pass,
      role: 'standard',
      createdAt: new Date().toISOString()
    };
    writeJson(DYNAMIC_USERS_KEY, users);

    const visibleApps = getVisibleAppIds(apps);
    const profiles = getUserProfiles();
    profiles[user] = {
      username: user,
      fullName: name,
      email: emailValue,
      organization: (organization || '').trim(),
      title: (title || '').trim(),
      phone: (phone || '').trim(),
      tenantId: targetTenant,
      apps: visibleApps,
      createdAt: new Date().toISOString()
    };
    writeJson(USER_PROFILES_KEY, profiles);

    seedUserAppVisibility(user, targetTenant, visibleApps);

    return { ok: true, user, tenantId: targetTenant };
  };

  const getUserProfile = (username) => {
    const user = (username || '').trim();
    if (!user) {
      return null;
    }
    const profiles = getUserProfiles();
    return profiles[user] || null;
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
  };

  const getUser = () => {
    const session = readSession();
    return session ? session.username : '';
  };

  const getRole = () => {
    const session = readSession();
    return session && session.role ? session.role : 'standard';
  };

  const isSuperUser = () => getRole() === 'super';

  const setTenant = (tenantId) => {
    if (!getTenantById(tenantId)) return false;
    sessionStorage.setItem(TENANT_KEY, tenantId);
    return true;
  };

  const getTenantId = () => sessionStorage.getItem(TENANT_KEY) || 'und';

  const getTenant = () => getTenantById(getTenantId()) || TENANTS.und;

  const getTenantRoute = () => {
    const tenant = getTenant();
    if (isSuperUser()) {
      return tenant.route || './os.html';
    }
    return tenant.enabled ? tenant.route : '';
  };

  const getTenants = () => {
    const dynamic = Object.values(getDynamicTenants());
    return Object.values(TENANTS).concat(dynamic);
  };

  const createSpatialTemporalTenant = ({ name, spatial, temporal, lat, lng }) => {
    const session = readSession();
    if (!session || session.role !== 'super') {
      return { ok: false, message: 'Super User login required.' };
    }

    const safeName = (name || '').trim();
    if (!safeName) {
      return { ok: false, message: 'Entity name is required.' };
    }

    const spatialValue = (spatial || '').trim();
    const temporalValue = (temporal || '').trim();
    const idBase = slugify(`${safeName}_${spatialValue}_${temporalValue}`) || `entity_${Date.now()}`;
    const tenantId = `${idBase}_${Date.now().toString(36).slice(-5)}`;

    const latNum = Number(lat);
    const lngNum = Number(lng);
    const mapUrls = buildMapUrls(safeName, Number.isFinite(latNum) ? latNum : NaN, Number.isFinite(lngNum) ? lngNum : NaN);

    const tenant = {
      id: tenantId,
      label: `${safeName} (${spatialValue || 'Spatial N/A'} | ${temporalValue || 'Temporal N/A'})`,
      route: './os.html',
      enabled: true,
      lat: Number.isFinite(latNum) ? latNum : 0,
      lng: Number.isFinite(lngNum) ? lngNum : 0,
      mapOpenUrl: mapUrls.mapOpenUrl,
      mapEmbedUrl: mapUrls.mapEmbedUrl,
      spatial: spatialValue,
      temporal: temporalValue,
      createdAt: new Date().toISOString(),
      createdBy: session.username,
      dynamic: true
    };

    const dynamic = getDynamicTenants();
    dynamic[tenant.id] = tenant;
    writeJson(DYNAMIC_TENANTS_KEY, dynamic);
    ensureVaultFolder(tenant);

    return { ok: true, tenant };
  };

  window.SmartWorldAuth = {
    isAuthenticated,
    login,
    verifySuperCredentials,
    logout,
    getUser,
    getRole,
    isSuperUser,
    setTenant,
    getTenant,
    getTenantId,
    getTenantRoute,
    getTenants,
    getAppCatalog: () => APP_CATALOG.slice(),
    registerUser,
    getUserProfile,
    createSpatialTemporalTenant,
    appendInteractionLog
  };
})();

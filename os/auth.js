(function () {
  const AUTH_USER = 'SmartWorld';
  const AUTH_PASS = 'Xtream';
  const AUTH_KEY = 'smart_world_os_auth';
  const TENANT_KEY = 'smart_world_os_tenant';

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
      route: '',
      enabled: false,
      lat: 44.9730,
      lng: -93.2277,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=100+Church+St+SE,+Minneapolis,+MN+55455',
      mapEmbedUrl: 'https://www.google.com/maps?q=100+Church+St+SE,+Minneapolis,+MN+55455&z=16&output=embed'
    },
    ndsu: {
      id: 'ndsu',
      label: 'North Dakota State University',
      route: '',
      enabled: false,
      lat: 46.8937,
      lng: -96.8017,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=1340+Administration+Ave,+Fargo,+ND+58102',
      mapEmbedUrl: 'https://www.google.com/maps?q=1340+Administration+Ave,+Fargo,+ND+58102&z=16&output=embed'
    },
    ucla: {
      id: 'ucla',
      label: 'UCLA',
      route: '',
      enabled: false,
      lat: 34.0689,
      lng: -118.4452,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=405+Hilgard+Ave,+Los+Angeles,+CA+90095',
      mapEmbedUrl: 'https://www.google.com/maps?q=405+Hilgard+Ave,+Los+Angeles,+CA+90095&z=16&output=embed'
    },
    ut_austin: {
      id: 'ut_austin',
      label: 'UT Austin',
      route: '',
      enabled: false,
      lat: 30.2849,
      lng: -97.7341,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=110+Inner+Campus+Dr,+Austin,+TX+78705',
      mapEmbedUrl: 'https://www.google.com/maps?q=110+Inner+Campus+Dr,+Austin,+TX+78705&z=16&output=embed'
    },
    mit: {
      id: 'mit',
      label: 'MIT',
      route: '',
      enabled: false,
      lat: 42.3601,
      lng: -71.0942,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=77+Massachusetts+Ave,+Cambridge,+MA+02139',
      mapEmbedUrl: 'https://www.google.com/maps?q=77+Massachusetts+Ave,+Cambridge,+MA+02139&z=16&output=embed'
    },
    nyu: {
      id: 'nyu',
      label: 'NYU',
      route: '',
      enabled: false,
      lat: 40.7291,
      lng: -73.9965,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=70+Washington+Sq+S,+New+York,+NY+10012',
      mapEmbedUrl: 'https://www.google.com/maps?q=70+Washington+Sq+S,+New+York,+NY+10012&z=16&output=embed'
    },
    municipal_grandforks: {
      id: 'municipal_grandforks',
      label: 'Grand Forks Municipal',
      route: '',
      enabled: false,
      lat: 47.9253,
      lng: -97.0329,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=255+N+4th+St,+Grand+Forks,+ND+58203',
      mapEmbedUrl: 'https://www.google.com/maps?q=255+N+4th+St,+Grand+Forks,+ND+58203&z=16&output=embed'
    },
    municipal_minneapolis: {
      id: 'municipal_minneapolis',
      label: 'Minneapolis Municipal',
      route: '',
      enabled: false,
      lat: 44.9778,
      lng: -93.2650,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=350+S+5th+St,+Minneapolis,+MN+55415',
      mapEmbedUrl: 'https://www.google.com/maps?q=350+S+5th+St,+Minneapolis,+MN+55415&z=16&output=embed'
    },
    municipal_austin: {
      id: 'municipal_austin',
      label: 'Austin Municipal',
      route: '',
      enabled: false,
      lat: 30.2672,
      lng: -97.7431,
      mapOpenUrl: 'https://www.google.com/maps/search/?api=1&query=301+W+2nd+St,+Austin,+TX+78701',
      mapEmbedUrl: 'https://www.google.com/maps?q=301+W+2nd+St,+Austin,+TX+78701&z=16&output=embed'
    }
  };

  const isAuthenticated = () => sessionStorage.getItem(AUTH_KEY) === 'ok';

  const login = (username, password) => {
    const ok = username === AUTH_USER && password === AUTH_PASS;
    if (ok) {
      sessionStorage.setItem(AUTH_KEY, 'ok');
    }
    return ok;
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
  };

  const setTenant = (tenantId) => {
    if (!TENANTS[tenantId]) return false;
    sessionStorage.setItem(TENANT_KEY, tenantId);
    return true;
  };

  const getTenantId = () => sessionStorage.getItem(TENANT_KEY) || 'und';

  const getTenant = () => TENANTS[getTenantId()] || TENANTS.und;

  const getTenantRoute = () => {
    const tenant = getTenant();
    return tenant.enabled ? tenant.route : '';
  };

  const getTenants = () => Object.values(TENANTS);

  window.SmartWorldAuth = {
    isAuthenticated,
    login,
    logout,
    setTenant,
    getTenant,
    getTenantRoute,
    getTenants
  };
})();

// Application configuration.
// window.APP_CONFIG is set inline in index.html before this script loads.
// This file provides defaults and a helper so app.js can read config safely.

window.APP_CONFIG = Object.assign(
  {
    googleClientId: '',
    microsoftClientId: '',
    baseUrl: window.location.origin,
  },
  window.APP_CONFIG || {}
);

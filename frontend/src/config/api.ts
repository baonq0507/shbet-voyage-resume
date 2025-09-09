// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
};

// App Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'DINAMONDBET68',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
};

import axios from 'axios';

// axios.create() returns a new Axios instance with its own default config.
// Using an instance (not the global axios object directly) matters because:
//
// 1. baseURL: set once here; all service files use relative paths ('/api/ping').
//    When the production URL changes, only VITE_API_BASE_URL needs updating.
//
// 2. Interceptors (future week): this is where you will add the JWT interceptor:
//    api.interceptors.request.use(config => {
//      config.headers.Authorization = 'Bearer ' + getToken();
//      return config;
//    });
//    One interceptor here covers every request across every service file.

const api = axios.create({
  // import.meta.env is Vite's build-time env variable system.
  // Only variables prefixed VITE_ are embedded into the browser bundle.
  // Server-only secrets (DB passwords, AI keys) must never use this prefix.
  baseURL: import.meta.env.VITE_API_BASE_URL,

  headers: {
    // Default Content-Type for all requests. Ignored for GET, used for POST/PUT.
    'Content-Type': 'application/json',
  },
});

export default api;
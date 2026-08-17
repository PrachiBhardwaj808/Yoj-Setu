import api from './api';

// getPing calls GET /api/ping through the shared Axios instance.
// The relative path '/api/ping' is combined with the baseURL from api.js.
//
// Axios response shape: { data, status, headers, config, ... }
// Our backend returns the plain string "pong", so response.data === "pong".
// We return response.data directly so callers receive the clean value.
//
// Error handling: Axios automatically throws for non-2xx HTTP status codes.
// We let errors propagate to the caller (LandingPage) which handles them
// by switching to the 'error' UI state. Service functions fetch and return;
// they never catch UI-level errors or render anything.

export async function getPing() {
  const response = await api.get('/api/ping');
  return response.data;
}
import api from './api';

/**
 * registerUser - sends a registration request to the backend.
 * 
 * @param {Object} registrationData - contains email and password
 * @returns {Promise} - resolves with response data
 */
export const registerUser = async (registrationData) => {
  const response = await api.post('/auth/register', registrationData);
  return response.data;
};

/**
 * loginUser - sends a login request with credentials.
 * 
 * @param {Object} credentials - contains email and password
 * @returns {Promise} - resolves with response data
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

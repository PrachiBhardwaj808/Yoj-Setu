import api from './api';

// ─── REGISTER API ─────────────────────────────────────────────────────────────

export const requestRegisterOTP = async (phone) => {
  const response = await api.post('/auth/register/request-otp', { phone });
  return response.data;
};

export const verifyRegisterOTP = async (phone, otp) => {
  const response = await api.post('/auth/register/verify-otp', { phone, otp });
  return response.data;
};

export const registerUser = async (registrationData) => {
  const response = await api.post('/auth/register', registrationData);
  return response.data;
};

// ─── LOGIN API ────────────────────────────────────────────────────────────────

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const requestLoginOTP = async (phone) => {
  const response = await api.post('/auth/login/request-otp', { phone });
  return response.data;
};

export const verifyLoginOTP = async (phone, otp) => {
  const response = await api.post('/auth/login/verify-otp', { phone, otp });
  return response.data;
};

// ─── FORGOT PASSWORD API ──────────────────────────────────────────────────────

export const requestForgotPasswordOTP = async (phone) => {
  const response = await api.post('/auth/forgot-password/request-otp', { phone });
  return response.data;
};

export const verifyForgotPasswordOTP = async (phone, otp) => {
  const response = await api.post('/auth/forgot-password/verify-otp', { phone, otp });
  return response.data;
};

export const resetPassword = async (resetToken, newPassword) => {
  const response = await api.post('/auth/reset-password', {
    reset_token: resetToken,
    new_password: newPassword,
  });
  return response.data;
};

// ─── CURRENT USER ─────────────────────────────────────────────────────────────

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

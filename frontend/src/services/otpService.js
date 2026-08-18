import api from './api';

// ─────────────────────────────────────────────────────────────────────────────
// otpService.js — network layer for OTP operations
//
// DESIGN RULE (same as pingService.js):
//   Service functions only fetch and return. They never catch errors or
//   touch React state. The calling component decides what to show the user.
//
// ⚠️  BACKEND STATUS: The endpoints below do NOT exist yet.
//   POST /auth/otp/send   — not implemented on the server
//   POST /auth/otp/verify — not implemented on the server
//
//   These calls WILL FAIL today with a network error or 404.
//   That is expected. The components that call these functions already
//   handle errors gracefully (they show an error message, never crash).
//   When the backend team builds these endpoints, this file needs zero changes.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * sendOtp — asks the backend to send an OTP SMS to the given phone number.
 *
 * @param {string} phoneNumber - 10-digit Indian mobile number (e.g. "9876543210")
 * @returns {Promise} - resolves with the response body on success
 *
 * The body sent: { phoneNumber: "9876543210" }
 * Expected success response: 200 OK (backend will define the exact shape)
 */
export async function sendOtp(phoneNumber) {
  const response = await api.post('/auth/otp/send', { phoneNumber });
  return response.data;
}

/**
 * verifyOtp — asks the backend to verify the OTP code the user typed in.
 *
 * @param {string} phoneNumber - same number that was used to request the OTP
 * @param {string} otp         - the 6-digit code the user received via SMS
 * @returns {Promise} - resolves with the response body on success
 *
 * The body sent: { phoneNumber: "9876543210", otp: "123456" }
 * Expected success response: 200 OK with a token or confirmation object
 */
export async function verifyOtp(phoneNumber, otp) {
  const response = await api.post('/auth/otp/verify', { phoneNumber, otp });
  return response.data;
}

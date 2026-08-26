import { useState } from 'react';
import { sendOtp } from '../../services/otpService';
import { Button } from '@/components/ui/button';

// ─────────────────────────────────────────────────────────────────────────────
// PhoneNumberForm.jsx — Step 1 of the registration flow
//
// SINGLE RESPONSIBILITY:
//   This component owns exactly one thing: collecting the phone number and
//   triggering the OTP send request. It does NOT decide what happens next.
//   When the OTP is successfully sent, it calls onOtpSent(phoneNumber) and
//   lets the PARENT (PhoneVerificationPage) decide to advance to Step 2.
//
//   Why? Because PhoneNumberForm doesn't know about OtpVerification.
//   Forms shouldn't know about each other. Only the page knows the full flow.
//
// PROPS:
//   onOtpSent(phoneNumber: string) — called when the API confirms the OTP was sent.
//     The parent uses this to advance to the OTP step and store the phone number.
//
// STATUS STATE MACHINE:
//   'idle'    → initial state, button is enabled
//   'loading' → request is in flight, button is disabled, spinner shown
//   'error'   → request failed (network error, 404, etc.), error message shown
//   'success' → OTP was sent, onOtpSent() has been called
//     (the component may never visually reach 'success' for long because the
//      parent immediately swaps it out for OtpVerificationForm)
//
// ─────────────────────────────────────────────────────────────────────────────

// ── Validation helpers ───────────────────────────────────────────────────────
//
// WHY validate client-side when the backend also validates?
//   Client-side validation is a UX kindness, not a security guarantee.
//   If someone types "1234567890" (starts with 1 — not a valid Indian mobile),
//   rejecting it instantly — before any network round-trip — means:
//     • Zero waiting time for the user
//     • Zero unnecessary API calls (saves backend resources)
//
//   BUT you can never trust client-side validation for security. Anyone can
//   open DevTools, disable your JS, or send a raw HTTP request and bypass it.
//   The backend MUST always re-validate. Client-side = fast pre-check for
//   obvious mistakes. Backend = the authoritative truth.
//
// Indian mobile number rules:
//   • Exactly 10 digits
//   • First digit must be 6, 7, 8, or 9 (TRAI numbering plan)
//   • No country code prefix (+91 or 0) — we want the bare 10 digits

function validatePhone(value) {
  // Strip any accidental spaces the user might type
  const cleaned = value.trim();

  if (cleaned.length === 0) {
    return 'Please enter your mobile number.';
  }
  if (!/^\d+$/.test(cleaned)) {
    return 'Only digits are allowed — no spaces, dashes, or +91.';
  }
  if (cleaned.length !== 10) {
    return `Must be exactly 10 digits (you entered ${cleaned.length}).`;
  }
  if (!/^[6-9]/.test(cleaned)) {
    return 'Indian mobile numbers start with 6, 7, 8, or 9.';
  }
  return null; // null means "no error" (valid input)
}

// ── Component ────────────────────────────────────────────────────────────────

export default function PhoneNumberForm({ onOtpSent }) {
  // phone      — what the user is typing in the input
  // touched    — did the user ever leave (blur) the field? We only show errors
  //              after they've interacted, not the instant the page loads.
  // status     — the state machine: 'idle' | 'loading' | 'error' | 'success'
  // errorMsg   — the human-readable error string to display (or null)

  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState(null);

  // Compute the validation error whenever `phone` changes.
  // We derive this — not store it in state — because it's fully determined
  // by the current value of `phone`. No need for a separate useEffect.
  const validationError = validatePhone(phone);
  const isFormValid = validationError === null;

  // ── Input change handler ──────────────────────────────────────────────────
  function handleChange(e) {
    setPhone(e.target.value);
    // If there's a previous API error, clear it when the user starts editing
    if (status === 'error') {
      setStatus('idle');
      setErrorMsg(null);
    }
  }

  // ── Form submit handler ───────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault(); // prevent browser from reloading the page

    // Mark as touched so validation errors show even if they skipped the field
    setTouched(true);

    // Don't even attempt the API call if the phone number is invalid.
    // This is the client-side gate.
    if (!isFormValid) return;

    setStatus('loading');
    setErrorMsg(null);

    try {
      // ⚠️  This call WILL FAIL today — the backend endpoint doesn't exist yet.
      // When it fails, Axios throws an error and we land in the catch block.
      // That's expected — the catch below handles it gracefully.
      await sendOtp(phone.trim());

      setStatus('success');
      // Tell the parent page that the OTP was sent and what phone we used.
      // The parent will switch to the OTP verification step.
      onOtpSent(phone.trim());

    } catch (err) {
      setStatus('error');

      // Try to extract a useful message from the Axios error.
      // err.response exists if the server replied (even with 4xx/5xx).
      // err.message exists for network errors, timeouts, etc.
      const serverMsg = err.response?.data?.message;
      setErrorMsg(
        serverMsg ||
        (err.message === 'Network Error'
          ? 'Could not reach the server. Is the backend running?'
          : err.message || 'Something went wrong. Please try again.')
      );
    }
  }

  // ── What error to SHOW in the UI ──────────────────────────────────────────
  // We show validation errors only after the field has been touched (blurred).
  // We show API errors immediately after a failed submit.
  const displayedError =
    status === 'error'
      ? errorMsg                              // API/network error
      : touched && validationError            // client-side validation error
        ? validationError
        : null;

  return (
    <div className="w-full">
      {/* ── Section heading ── */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 mb-4">
          <span className="text-2xl" role="img" aria-label="mobile phone">📱</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Verify your mobile number</h2>
        <p className="mt-1 text-sm text-slate-500">
          We'll send a one-time password to confirm it's really you.
        </p>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate aria-label="Phone number entry form">

        {/* Input group */}
        <div className="mb-4">
          <label
            htmlFor="phone-input"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Mobile number
          </label>

          <div className="flex">
            {/* Country prefix badge — read-only, just visual context */}
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-sm font-medium select-none">
              🇮🇳 +91
            </span>

            <input
              id="phone-input"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={phone}
              onChange={handleChange}
              onBlur={() => setTouched(true)}
              placeholder="9876543210"
              disabled={status === 'loading'}
              aria-invalid={!!displayedError}
              aria-describedby={displayedError ? 'phone-error' : undefined}
              className={`flex-1 min-w-0 px-4 py-2.5 rounded-r-lg border text-slate-800 text-base
                placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400
                disabled:bg-slate-100 disabled:cursor-not-allowed
                transition-colors duration-150
                ${displayedError
                  ? 'border-red-400 bg-red-50'
                  : 'border-slate-300 bg-white hover:border-slate-400'
                }`}
            />
          </div>

          {/* Inline error message */}
          {displayedError && (
            <p id="phone-error" role="alert" className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <span aria-hidden="true">⚠</span>
              {displayedError}
            </p>
          )}
        </div>

        {/* Submit button */}
        <Button
          id="send-otp-btn"
          type="submit"
          disabled={status === 'loading'}
          className="w-full"
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              {/* CSS spinner — no library needed */}
              <span
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                role="status"
                aria-label="Sending OTP…"
              />
              Sending OTP…
            </span>
          ) : (
            'Send OTP'
          )}
        </Button>

      </form>

      {/* Help text */}
      <p className="mt-4 text-xs text-center text-slate-400">
        Standard SMS charges may apply. Number used only for verification.
      </p>
    </div>
  );
}

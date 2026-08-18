import { useState } from 'react';
import { verifyOtp, sendOtp } from '../../services/otpService';

// ─────────────────────────────────────────────────────────────────────────────
// OtpVerification.jsx — Step 2 of the registration flow
//   (The prompt called this OtpVerificationForm; this file was already named
//    OtpVerification.jsx on disk, so we use that name consistently.)
//
// SINGLE RESPONSIBILITY:
//   This component owns exactly one thing: collecting the OTP code and verifying
//   it with the backend. It does NOT know about PhoneNumberForm or what comes
//   after verification. When verification succeeds, it calls onVerified() and
//   lets the PARENT (PhoneVerificationPage) advance to Step 3.
//
// PROPS:
//   phoneNumber (string) — the phone number from Step 1, used in the API call
//                          and displayed so the user knows which number we sent to.
//   onVerified  (fn)     — called when /auth/otp/verify returns 200.
//
// STATUS STATE MACHINE: same pattern as PhoneNumberForm
//   'idle' → 'loading' → 'success' | 'error'
//
// RESEND:
//   The Resend button calls sendOtp(phoneNumber) again. No cooldown timer today
//   (that's a future enhancement). The button is disabled while any request
//   is in flight to prevent duplicate sends.
//
// ⚠️  BACKEND STATUS: Both /auth/otp/verify and /auth/otp/send don't exist yet.
//   All API calls will fail with a network error. That's expected today.
// ─────────────────────────────────────────────────────────────────────────────

// ── Validation helper ─────────────────────────────────────────────────────────
// OTP must be exactly 6 digits, numeric only.
// Same reasoning as phone validation: catch obvious mistakes before a round-trip.

function validateOtp(value) {
  const cleaned = value.trim();
  if (cleaned.length === 0) return 'Please enter the OTP.';
  if (!/^\d+$/.test(cleaned)) return 'OTP must contain digits only.';
  if (cleaned.length !== 6) return `OTP must be exactly 6 digits (you entered ${cleaned.length}).`;
  return null; // valid
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OtpVerification({ phoneNumber, onVerified }) {
  const [otp, setOtp] = useState('');
  const [touched, setTouched] = useState(false);

  // Two independent status states: one for verify, one for resend.
  // They are separate because a user might resend while viewing a verify error,
  // and we don't want one operation's status to clobber the other.
  const [verifyStatus, setVerifyStatus] = useState('idle');
  const [verifyError, setVerifyError] = useState(null);

  const [resendStatus, setResendStatus] = useState('idle'); // 'idle'|'loading'|'success'|'error'
  const [resendMsg, setResendMsg] = useState(null);

  const validationError = validateOtp(otp);
  const isFormValid = validationError === null;
  const isBusy = verifyStatus === 'loading' || resendStatus === 'loading';

  // ── Input handler ──────────────────────────────────────────────────────────
  function handleChange(e) {
    setOtp(e.target.value);
    if (verifyStatus === 'error') {
      setVerifyStatus('idle');
      setVerifyError(null);
    }
  }

  // ── Verify submit ──────────────────────────────────────────────────────────
  async function handleVerify(e) {
    e.preventDefault();
    setTouched(true);
    if (!isFormValid) return;

    setVerifyStatus('loading');
    setVerifyError(null);
    setResendMsg(null);

    try {
      // ⚠️  Will fail today — backend endpoint not built yet. See file header.
      await verifyOtp(phoneNumber, otp.trim());
      setVerifyStatus('success');
      onVerified(); // tell the page we're done — page advances to 'verified' step
    } catch (err) {
      setVerifyStatus('error');
      const serverMsg = err.response?.data?.message;
      setVerifyError(
        serverMsg ||
        (err.message === 'Network Error'
          ? 'Could not reach the server. Is the backend running?'
          : err.message || 'Verification failed. Please try again.')
      );
    }
  }

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  async function handleResend() {
    if (isBusy) return; // prevent double-clicks while any request is in flight

    setResendStatus('loading');
    setResendMsg(null);
    setVerifyError(null); // clear verify error so the UI isn't confusing

    try {
      // ⚠️  Will also fail today — same reason as above.
      await sendOtp(phoneNumber);
      setResendStatus('success');
      setResendMsg(`OTP resent to +91 ${phoneNumber}.`);
      // Clear the OTP input so the user types the new code fresh
      setOtp('');
      setTouched(false);
    } catch (err) {
      setResendStatus('error');
      const serverMsg = err.response?.data?.message;
      setResendMsg(
        serverMsg ||
        (err.message === 'Network Error'
          ? 'Could not reach the server. Is the backend running?'
          : err.message || 'Could not resend OTP. Please try again.')
      );
    }
  }

  // ── Decide what validation error to display ────────────────────────────────
  const displayedError =
    verifyStatus === 'error'
      ? verifyError
      : touched && validationError
        ? validationError
        : null;

  return (
    <div className="w-full">
      {/* ── Section heading ── */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
          <span className="text-2xl" role="img" aria-label="lock">🔐</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Enter the OTP</h2>
        <p className="mt-1 text-sm text-slate-500">
          We sent a 6-digit code to{' '}
          <span className="font-semibold text-slate-700">+91 {phoneNumber}</span>
        </p>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleVerify} noValidate aria-label="OTP verification form">

        <div className="mb-4">
          <label htmlFor="otp-input" className="block text-sm font-medium text-slate-700 mb-1.5">
            6-digit OTP
          </label>

          <input
            id="otp-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={handleChange}
            onBlur={() => setTouched(true)}
            placeholder="123456"
            disabled={isBusy}
            aria-invalid={!!displayedError}
            aria-describedby={displayedError ? 'otp-error' : undefined}
            className={`w-full px-4 py-3 rounded-lg border text-center text-xl font-mono tracking-widest
              text-slate-800 placeholder:text-slate-400 placeholder:text-base placeholder:font-sans
              placeholder:tracking-normal
              focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400
              disabled:bg-slate-100 disabled:cursor-not-allowed
              transition-colors duration-150
              ${displayedError
                ? 'border-red-400 bg-red-50'
                : 'border-slate-300 bg-white hover:border-slate-400'
              }`}
          />

          {displayedError && (
            <p id="otp-error" role="alert" className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <span aria-hidden="true">⚠</span>
              {displayedError}
            </p>
          )}
        </div>

        {/* Verify button */}
        <button
          id="verify-otp-btn"
          type="submit"
          disabled={isBusy}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white text-sm
            transition-all duration-150 shadow-sm
            ${isBusy
              ? 'bg-green-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 active:scale-95 hover:shadow'
            }`}
        >
          {verifyStatus === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <span
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                role="status"
                aria-label="Verifying…"
              />
              Verifying…
            </span>
          ) : (
            'Verify OTP'
          )}
        </button>

      </form>

      {/* ── Resend section ── */}
      <div className="mt-5 text-center">
        {resendStatus === 'loading' ? (
          <span className="text-sm text-slate-500">Resending…</span>
        ) : (
          <button
            id="resend-otp-btn"
            type="button"
            onClick={handleResend}
            disabled={isBusy}
            className="text-sm text-orange-500 hover:text-orange-700 hover:underline
              disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Didn't receive it? Resend OTP
          </button>
        )}

        {/* Resend feedback message */}
        {resendMsg && (
          <p
            role="status"
            className={`mt-1.5 text-xs ${
              resendStatus === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {resendMsg}
          </p>
        )}
      </div>
    </div>
  );
}

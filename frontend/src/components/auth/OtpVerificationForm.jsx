import { useState } from 'react';
import { verifyOtp, sendOtp } from '../../services/otpService';
import { Button } from '@/components/ui/button';

// ─────────────────────────────────────────────────────────────────────────────
// OtpVerificationForm.jsx — Step 2 of the registration flow
//
// SINGLE RESPONSIBILITY:
//   This component collects the OTP code and verifies it with the backend.
//   When verification succeeds, it calls onVerified() and lets the parent page
//   decide where to navigate next.
//
// PROPS:
//   phoneNumber (string) — the phone number from Step 1, used in the API call.
//   onVerified  (fn)     — called when /auth/otp/verify returns 200.
// ─────────────────────────────────────────────────────────────────────────────

function validateOtp(value) {
  const cleaned = value.trim();
  if (cleaned.length === 0) return 'Please enter the OTP.';
  if (!/^\d+$/.test(cleaned)) return 'OTP must contain digits only.';
  if (cleaned.length !== 6) return `OTP must be exactly 6 digits (you entered ${cleaned.length}).`;
  return null; // valid
}

export default function OtpVerificationForm({ phoneNumber, onVerified }) {
  const [otp, setOtp] = useState('');
  const [touched, setTouched] = useState(false);

  // Two independent status states: verify and resend
  const [verifyStatus, setVerifyStatus] = useState('idle');
  const [verifyError, setVerifyError] = useState(null);

  const [resendStatus, setResendStatus] = useState('idle');
  const [resendMsg, setResendMsg] = useState(null);

  const validationError = validateOtp(otp);
  const isFormValid = validationError === null;
  const isBusy = verifyStatus === 'loading' || resendStatus === 'loading';

  function handleChange(e) {
    setOtp(e.target.value);
    if (verifyStatus === 'error') {
      setVerifyStatus('idle');
      setVerifyError(null);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setTouched(true);
    if (!isFormValid) return;

    setVerifyStatus('loading');
    setVerifyError(null);
    setResendMsg(null);

    try {
      await verifyOtp(phoneNumber, otp.trim());
      setVerifyStatus('success');
      onVerified();
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

  async function handleResend() {
    if (isBusy) return;

    setResendStatus('loading');
    setResendMsg(null);
    setVerifyError(null);

    try {
      await sendOtp(phoneNumber);
      setResendStatus('success');
      setResendMsg(`OTP resent to +91 ${phoneNumber}.`);
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

  const displayedError =
    verifyStatus === 'error'
      ? verifyError
      : touched && validationError
        ? validationError
        : null;

  return (
    <div className="w-full">
      {/* Heading */}
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

      {/* Form */}
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
              placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400
              disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors duration-150
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
        <Button
          id="verify-otp-btn"
          type="submit"
          disabled={isBusy}
          className="w-full bg-green-600 hover:bg-green-700 focus-visible:ring-green-400"
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
        </Button>
      </form>

      {/* Resend and status section */}
      <div className="mt-6 text-center">
        <Button
          type="button"
          variant="link"
          onClick={handleResend}
          disabled={isBusy}
          className="text-green-600 hover:text-green-700 font-semibold disabled:text-slate-400 transition-colors"
        >
          {resendStatus === 'loading' ? 'Resending...' : 'Resend OTP'}
        </Button>

        {resendMsg && (
          <p
            className={`mt-2 text-xs font-medium ${
              resendStatus === 'error' ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {resendMsg}
          </p>
        )}
      </div>
    </div>
  );
}

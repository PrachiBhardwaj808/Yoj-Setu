import { useState } from 'react';
import PhoneNumberForm from '../../components/auth/PhoneNumberForm';
import OtpVerification from '../../components/auth/OtpVerification';

// ─────────────────────────────────────────────────────────────────────────────
// PhoneVerificationPage.jsx — the orchestrator for the phone + OTP flow
//
// WHY STATE LIVES HERE (not in the form components):
//
//   This page is the only place in the app that knows about the full flow:
//     Step 1 → Step 2 → Step 3
//
//   PhoneNumberForm doesn't know OtpVerification exists.
//   OtpVerification doesn't know PhoneNumberForm exists.
//   Each form component owns only its own inputs — that's it.
//
//   If we put "which step are we on" inside PhoneNumberForm, it would have to
//   import and render OtpVerification itself — which creates tight coupling and
//   makes it impossible to reuse or test either form independently.
//
//   By "lifting state up" to the page:
//     • Forms are dumb, focused, reusable
//     • The page is the one coordinator that knows the whole sequence
//     • Adding a 4th step later means changing only the page, not the forms
//
// STEP STATE MACHINE:
//   'phone'    → show PhoneNumberForm (Step 1: enter phone number)
//   'otp'      → show OtpVerification (Step 2: enter the received OTP code)
//   'verified' → show success message (Step 3: placeholder, registration form is future)
//
// TRANSITIONS:
//   'phone'    → 'otp'      : PhoneNumberForm calls onOtpSent(phoneNumber)
//   'otp'      → 'verified' : OtpVerification calls onVerified()
// ─────────────────────────────────────────────────────────────────────────────

export default function PhoneVerificationPage() {
  // step: which of the three states are we in right now?
  const [step, setStep] = useState('phone');

  // phoneNumber: set when the user completes Step 1.
  // OtpVerification needs it to (a) display "we sent a code to X" and
  // (b) include it in the verifyOtp() API call.
  // It lives here because only the page outlives the step transitions.
  const [phoneNumber, setPhoneNumber] = useState('');

  // ── Transition: Step 1 → Step 2 ──────────────────────────────────────────
  // Called by PhoneNumberForm after a successful /auth/otp/send response.
  function handleOtpSent(phone) {
    setPhoneNumber(phone);
    setStep('otp');
  }

  // ── Transition: Step 2 → Step 3 ──────────────────────────────────────────
  // Called by OtpVerification after a successful /auth/otp/verify response.
  function handleVerified() {
    setStep('verified');
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      {/* Outer card container */}
      <div className="w-full max-w-md">

        {/* ── Step progress indicator ── */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {/* Step 1 dot */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                transition-colors duration-300
                ${step === 'phone'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-green-500 text-white'
                }`}
            >
              {step === 'phone' ? '1' : '✓'}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${step === 'phone' ? 'text-orange-600' : 'text-green-600'}`}>
              Phone
            </span>
          </div>

          {/* Connector line */}
          <div className={`h-px w-8 transition-colors duration-300 ${step !== 'phone' ? 'bg-green-400' : 'bg-slate-300'}`} />

          {/* Step 2 dot */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                transition-colors duration-300
                ${step === 'otp'
                  ? 'bg-green-600 text-white shadow-md'
                  : step === 'verified'
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
            >
              {step === 'verified' ? '✓' : '2'}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${
              step === 'otp' ? 'text-green-700' : step === 'verified' ? 'text-green-600' : 'text-slate-400'
            }`}>
              OTP
            </span>
          </div>

          {/* Connector line */}
          <div className={`h-px w-8 transition-colors duration-300 ${step === 'verified' ? 'bg-green-400' : 'bg-slate-300'}`} />

          {/* Step 3 dot */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                transition-colors duration-300
                ${step === 'verified'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-slate-200 text-slate-500'
                }`}
            >
              3
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${step === 'verified' ? 'text-green-600' : 'text-slate-400'}`}>
              Register
            </span>
          </div>
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 px-8 py-10">

          {/* ── Step 1: Phone number entry ── */}
          {step === 'phone' && (
            <PhoneNumberForm onOtpSent={handleOtpSent} />
          )}

          {/* ── Step 2: OTP verification ── */}
          {step === 'otp' && (
            <OtpVerification
              phoneNumber={phoneNumber}
              onVerified={handleVerified}
            />
          )}

          {/* ── Step 3: Success placeholder ── */}
          {/* This is intentionally minimal — the email/password registration form
              that replaces this is a SEPARATE future task. */}
          {step === 'verified' && (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-5">
                <span className="text-3xl" role="img" aria-label="check mark">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Phone verified!
              </h2>
              <p className="text-slate-500 text-sm mb-4">
                Your number{' '}
                <span className="font-semibold text-slate-700">+91 {phoneNumber}</span>{' '}
                has been confirmed.
              </p>
              {/* Placeholder notice — remove this div when the registration form is built */}
              <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
                <span className="font-semibold">🚧 Coming soon:</span>{' '}
                Registration form (email + password) — separate task, not built yet.
              </div>
            </div>
          )}

        </div>

        {/* Already have an account? */}
        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <a href="/login" className="text-orange-500 hover:text-orange-700 hover:underline font-medium transition-colors">
            Log in
          </a>
        </p>

      </div>
    </div>
  );
}

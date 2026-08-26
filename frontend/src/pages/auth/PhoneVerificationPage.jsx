import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneNumberForm from '../../components/auth/PhoneNumberForm';
import OtpVerificationForm from '../../components/auth/OtpVerificationForm';

// ─────────────────────────────────────────────────────────────────────────────
// PhoneVerificationPage.jsx — orchestrates the phone + OTP verification flow
// ─────────────────────────────────────────────────────────────────────────────

export default function PhoneVerificationPage() {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();

  function handleOtpSent(phone) {
    setPhoneNumber(phone);
    setStep('otp');
  }

  function handleVerified() {
    navigate('/register');
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Centered card layout */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 px-8 py-10">
          {step === 'phone' ? (
            <PhoneNumberForm onOtpSent={handleOtpSent} />
          ) : (
            <OtpVerificationForm
              phoneNumber={phoneNumber}
              onVerified={handleVerified}
            />
          )}
        </div>

        {/* Navigation link at bottom */}
        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
            className="text-orange-500 hover:text-orange-700 hover:underline font-medium transition-colors"
          >
            Log in
          </a>
        </p>

      </div>
    </div>
  );
}

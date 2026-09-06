import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LogoMark({ className = "w-7 h-7" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <rect width="32" height="32" rx="8" fill="#0F1B3D" />
      <path d="M9 16L14 21L23 10" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="23" cy="10" r="2.5" fill="#2563EB" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithOTP, requestLoginOTP, requestForgotPasswordOTP, verifyForgotPasswordOTP, resetPassword } = useAuth();

  const [activeTab, setActiveTab] = useState('password'); // 'password' | 'otp'
  
  // Password Login State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP Login State
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState('');

  // Common UI State
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Phone, 2: OTP, 3: New Password
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotOtpDigits, setForgotOtpDigits] = useState(['', '', '', '', '', '']);
  const [forgotResetToken, setForgotResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Refs for 6-digit OTP inputs
  const otpInputRefs = useRef([]);
  const forgotOtpInputRefs = useRef([]);

  // Resend Cooldown Countdown Timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle 6-digit OTP Box Inputs
  const handleOtpChange = (index, value, isForgot = false) => {
    if (!/^\d*$/.test(value)) return;
    const digits = isForgot ? [...forgotOtpDigits] : [...otpDigits];
    const refs = isForgot ? forgotOtpInputRefs : otpInputRefs;

    digits[index] = value.slice(-1);
    if (isForgot) setForgotOtpDigits(digits);
    else setOtpDigits(digits);

    // Auto-focus next input box
    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e, isForgot = false) => {
    const digits = isForgot ? forgotOtpDigits : otpDigits;
    const refs = isForgot ? forgotOtpInputRefs : otpInputRefs;

    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e, isForgot = false) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      if (isForgot) setForgotOtpDigits(digits);
      else setOtpDigits(digits);
      const refs = isForgot ? forgotOtpInputRefs : otpInputRefs;
      refs.current[5]?.focus();
    }
  };

  // ── Password Submit ──
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) {
      setError('Please enter your mobile number/email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Request ──
  const handleSendLoginOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      const res = await requestLoginOTP(phone);
      setOtpSent(true);
      setCooldown(res.cooldown || 60);
      setSuccessMsg('OTP code sent successfully.');
      if (res.dev_otp) setDevOtpHint(res.dev_otp);
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Verify Login ──
  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setError('');
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      await loginWithOTP(phone, fullOtp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password Handlers ──
  const handleRequestForgotOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!forgotPhone || forgotPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      const res = await requestForgotPasswordOTP(forgotPhone);
      setForgotStep(2);
      setSuccessMsg('OTP sent to your mobile number.');
      if (res.dev_otp) setDevOtpHint(res.dev_otp);
    } catch (err) {
      setError(err.message || 'Failed to request password reset OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotOtp = async (e) => {
    e.preventDefault();
    setError('');
    const fullOtp = forgotOtpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyForgotPasswordOTP(forgotPhone, fullOtp);
      setForgotResetToken(res.reset_token);
      setForgotStep(3);
      setSuccessMsg('OTP verified. Set a new password below.');
    } catch (err) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(forgotResetToken, newPassword);
      setShowForgotModal(false);
      setForgotStep(1);
      setActiveTab('password');
      setSuccessMsg('Password updated successfully. Please sign in with your new password.');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col justify-between font-sans">
      
      {/* Top Navbar Header */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark className="w-7 h-7" />
          <span className="font-semibold text-lg text-[#0F1B3D] tracking-tight">Yojsetu</span>
        </Link>
        <Link to="/register" className="text-sm font-medium text-[#2563EB] hover:text-blue-700">
          Create Account
        </Link>
      </header>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">Welcome back</h1>
            <p className="text-sm text-[#64748B]">Sign in to access your saved schemes and applications</p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0]">
            <button
              onClick={() => { setActiveTab('password'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'password' ? 'bg-white text-[#0F1B3D] shadow-xs' : 'text-[#64748B] hover:text-[#111827]'
              }`}
            >
              Password Login
            </button>
            <button
              onClick={() => { setActiveTab('otp'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'otp' ? 'bg-white text-[#0F1B3D] shadow-xs' : 'text-[#64748B] hover:text-[#111827]'
              }`}
            >
              Login with OTP
            </button>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="font-bold text-red-500 hover:text-red-700">×</button>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-xs">
              {successMsg}
            </div>
          )}

          {devOtpHint && (
            <div className="bg-blue-50 border border-blue-200 text-[#2563EB] px-4 py-2.5 rounded-xl text-xs font-mono">
              [DEV OTP]: {devOtpHint}
            </div>
          )}

          {/* ── PASSWORD LOGIN FORM ── */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#111827] mb-1.5">
                  Mobile Number or Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter 10-digit phone or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#111827]">Password</label>
                  <button
                    type="button"
                    onClick={() => { setShowForgotModal(true); setForgotStep(1); setError(''); setSuccessMsg(''); }}
                    className="text-xs font-medium text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm py-3 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          {/* ── OTP LOGIN FORM ── */}
          {activeTab === 'otp' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendLoginOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1.5">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm py-3 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Sending code...' : 'Request OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyLoginOtp} className="space-y-5">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-medium text-[#111827]">Verify your mobile number</p>
                    <p className="text-xs text-[#64748B]">Enter the 6-digit code sent to {phone}</p>
                  </div>

                  {/* 6 OTP Boxes */}
                  <div className="flex justify-between gap-2" onPaste={(e) => handleOtpPaste(e, false)}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value, false)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e, false)}
                        className="w-11 h-12 text-center text-lg font-semibold bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] transition-colors"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm py-3 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </button>

                  <div className="text-center pt-2 border-t border-[#E2E8F0]">
                    {cooldown > 0 ? (
                      <span className="text-xs text-[#64748B]">Resend code in {cooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendLoginOtp}
                        className="text-xs font-medium text-[#2563EB] hover:underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer Link */}
          <div className="text-center pt-4 border-t border-[#E2E8F0]">
            <p className="text-xs text-[#64748B]">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-[#2563EB] hover:underline">
                Register now
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-md w-full p-6 space-y-5 relative shadow-lg">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-semibold text-[#0F1B3D]">Reset Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-[#64748B] hover:text-[#111827] font-bold text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs">
                {error}
              </div>
            )}

            {/* Step 1: Phone */}
            {forgotStep === 1 && (
              <form onSubmit={handleRequestForgotOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter registered 10-digit number"
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2563EB] text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700"
                >
                  {loading ? 'Sending code...' : 'Send OTP Code'}
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
                <p className="text-xs text-[#64748B]">Enter the 6-digit code sent to {forgotPhone}</p>
                <div className="flex justify-between gap-2" onPaste={(e) => handleOtpPaste(e, true)}>
                  {forgotOtpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (forgotOtpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value, true)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e, true)}
                      className="w-11 h-12 text-center text-lg font-semibold bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2563EB] text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            )}

            {/* Step 3: Set New Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2563EB] text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700"
                >
                  {loading ? 'Updating...' : 'Set New Password'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      <footer className="py-4 text-center text-xs text-[#64748B]">
        © Yojsetu. All rights reserved.
      </footer>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/common/LanguageSelector';

export default function Register() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const logoSrc = theme === 'dark' ? '/yojsetu-logo-dark.png' : '/yojsetu-logo-light.png';
  const { requestRegisterOTP, verifyRegisterOTP, register } = useAuth();

  const [step, setStep] = useState(1); // 1: Details, 2: OTP Verification
  
  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState('');

  // UI State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const otpInputRefs = useRef([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle 6-digit OTP input changes
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const digits = [...otpDigits];
    digits[index] = value.slice(-1);
    setOtpDigits(digits);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtpDigits(pasted.split(''));
      otpInputRefs.current[5]?.focus();
    }
  };

  // Step 1 Submit: Validate and Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !phone || !password) {
      setError(t('auth.fillRequired', 'Please fill in all required fields.'));
      return;
    }
    if (phone.length < 10) {
      setError(t('auth.validPhone', 'Please enter a valid 10-digit mobile number.'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordLength', 'Password must be at least 6 characters long.'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordsMatch', 'Passwords do not match.'));
      return;
    }

    setLoading(true);
    try {
      const res = await requestRegisterOTP(phone);
      setStep(2);
      setCooldown(res.cooldown || 60);
      if (res.dev_otp) setDevOtpHint(res.dev_otp);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await requestRegisterOTP(phone);
      setCooldown(res.cooldown || 60);
      if (res.dev_otp) setDevOtpHint(res.dev_otp);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Submit: Verify OTP and Register User
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError(t('auth.otpRequired', 'Please enter the complete 6-digit OTP code.'));
      return;
    }

    setLoading(true);
    try {
      const verifyRes = await verifyRegisterOTP(phone, fullOtp);
      const verification_token = verifyRes.verification_token;

      await register({
        full_name: fullName,
        phone,
        email: email || undefined,
        password,
        verification_token,
      });

      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 text-[#111827] dark:text-gray-100 flex flex-col justify-between font-sans">
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-[#E2E8F0] dark:border-gray-800 px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" aria-label="YojSetu Home">
          <img
            src={logoSrc}
            alt="YojSetu Logo"
            className="h-12 md:h-14 w-auto object-contain hover:opacity-95 transition-opacity"
          />
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSelector compact align="right" />
          <Link to="/login" className="text-sm font-medium text-[#2563EB] hover:text-blue-700">
            {t('nav.signIn', 'Sign In')}
          </Link>
        </div>
      </header>

      {/* Main Register Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-[#E2E8F0] dark:border-gray-700 rounded-2xl shadow-sm p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
              <img
                src={logoSrc}
                alt="YojSetu Logo"
                className="h-24 md:h-28 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-semibold text-[#0F1B3D] dark:text-gray-100 tracking-tight">
              {step === 1 ? t('auth.registerTitle', 'Create your account') : t('auth.verifyPhoneTitle', 'Verify mobile number')}
            </h1>
            <p className="text-sm text-[#64748B] dark:text-gray-300">
              {step === 1
                ? t('auth.registerSubtitle', 'Join Yojsetu to discover and apply for eligible government schemes')
                : `${t('auth.verifyPhoneSubtitle', 'Enter the 6-digit verification code sent to')} +91 ${phone}`}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="font-bold text-red-500 hover:text-red-700">×</button>
            </div>
          )}

          {devOtpHint && (
            <div className="bg-blue-50 border border-blue-200 text-[#2563EB] px-4 py-2.5 rounded-xl text-xs font-mono text-center">
              [DEV OTP CODE]: {devOtpHint}
            </div>
          )}

          {/* ── STEP 1: ACCOUNT DETAILS ── */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#111827] dark:text-gray-200 mb-1.5">
                  {t('auth.fullNameLabel', 'Full Name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('auth.fullNamePlaceholder', 'e.g. Rahul Sharma')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 rounded-xl text-sm text-[#111827] dark:text-gray-100 focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111827] dark:text-gray-200 mb-1.5">
                  {t('auth.phoneLabel', 'Mobile Number')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder={t('auth.phonePlaceholder', '10-digit mobile number')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 rounded-xl text-sm text-[#111827] dark:text-gray-100 focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111827] dark:text-gray-200 mb-1.5">
                  {t('auth.emailOptionalLabel', 'Email Address (Optional)')}
                </label>
                <input
                  type="email"
                  placeholder={t('auth.emailPlaceholder', 'name@example.com')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 rounded-xl text-sm text-[#111827] dark:text-gray-100 focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111827] dark:text-gray-200 mb-1.5">
                  {t('auth.createPasswordLabel', 'Password')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder={t('auth.createPasswordPlaceholder', 'At least 6 characters')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 rounded-xl text-sm text-[#111827] dark:text-gray-100 focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111827] dark:text-gray-200 mb-1.5">
                  {t('auth.confirmPasswordLabel', 'Confirm Password')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder={t('auth.confirmPasswordPlaceholder', 'Re-enter password')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 rounded-xl text-sm text-[#111827] dark:text-gray-100 focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm py-3 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {loading ? t('auth.sendingOtp', 'Sending OTP...') : t('auth.continueOtpButton', 'Create account')}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP VERIFICATION ── */}
          {step === 2 && (
            <form onSubmit={handleVerifyAndRegister} className="space-y-6">
              
              {/* 6 OTP Input Boxes */}
              <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-lg font-semibold bg-white dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#2563EB] transition-colors"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm py-3 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {loading ? t('auth.verifying', 'Verifying...') : t('auth.completeRegistration', 'Verify & Continue')}
              </button>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E2E8F0] dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="text-[#64748B] dark:text-gray-400 hover:text-[#111827] dark:hover:text-white"
                >
                  ← {t('auth.backToDetails', 'Edit details')}
                </button>

                {cooldown > 0 ? (
                  <span className="text-[#64748B] dark:text-gray-400">
                    {t('auth.resendOtpIn', 'Resend code in {sec}s', { sec: cooldown })}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="font-medium text-[#2563EB] hover:underline cursor-pointer"
                  >
                    {t('auth.resendOtp', 'Resend OTP')}
                  </button>
                )}
              </div>

            </form>
          )}

          {/* Footer Link */}
          <div className="text-center pt-4 border-t border-[#E2E8F0] dark:border-gray-800">
            <p className="text-xs text-[#64748B] dark:text-gray-400">
              {t('auth.alreadyAccount', 'Already have an account?')}{' '}
              <Link to="/login" className="font-medium text-[#2563EB] hover:underline">
                {t('auth.signInLink', 'Sign in')}
              </Link>
            </p>
          </div>

        </div>
      </div>

      <footer className="py-4 text-center text-xs text-[#64748B]">
        {t('home.copyright', '© Yojsetu. All rights reserved.')}
      </footer>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import { Button } from '@/components/ui/button';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'error' | 'success'
  const [errorMsg, setErrorMsg] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();

  function validateForm() {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg(null);
    setValidationErrors({});

    if (!validateForm()) return;

    setStatus('loading');

    try {
      await registerUser({ email: email.trim(), password });
      setStatus('success');
      navigate('/login');
    } catch (err) {
      setStatus('error');
      const serverMsg = err.response?.data?.message;
      setErrorMsg(
        serverMsg ||
        (err.message === 'Network Error'
          ? 'Could not reach the server. Is the backend running?'
          : err.message || 'Registration failed. Please try again.')
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Register form">
      {errorMsg && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
          <span className="font-semibold" aria-hidden="true">⚠</span>
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Email input */}
      <div>
        <label htmlFor="email-input" className="block text-sm font-medium text-slate-700 mb-1">
          Email address
        </label>
        <input
          id="email-input"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: null }));
          }}
          placeholder="name@example.com"
          disabled={status === 'loading'}
          aria-invalid={!!validationErrors.email}
          aria-describedby={validationErrors.email ? 'email-error' : undefined}
          className={`w-full px-3 py-2 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors
            ${validationErrors.email ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'}`}
        />
        {validationErrors.email && (
          <p id="email-error" role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <span aria-hidden="true">⚠</span> {validationErrors.email}
          </p>
        )}
      </div>

      {/* Password input */}
      <div>
        <label htmlFor="password-input" className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          id="password-input"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: null }));
          }}
          placeholder="••••••"
          disabled={status === 'loading'}
          aria-invalid={!!validationErrors.password}
          aria-describedby={validationErrors.password ? 'password-error' : undefined}
          className={`w-full px-3 py-2 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors
            ${validationErrors.password ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'}`}
        />
        {validationErrors.password && (
          <p id="password-error" role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <span aria-hidden="true">⚠</span> {validationErrors.password}
          </p>
        )}
      </div>

      {/* Confirm Password input */}
      <div>
        <label htmlFor="confirm-password-input" className="block text-sm font-medium text-slate-700 mb-1">
          Confirm password
        </label>
        <input
          id="confirm-password-input"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (validationErrors.confirmPassword) setValidationErrors(prev => ({ ...prev, confirmPassword: null }));
          }}
          placeholder="••••••"
          disabled={status === 'loading'}
          aria-invalid={!!validationErrors.confirmPassword}
          aria-describedby={validationErrors.confirmPassword ? 'confirm-password-error' : undefined}
          className={`w-full px-3 py-2 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors
            ${validationErrors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'}`}
        />
        {validationErrors.confirmPassword && (
          <p id="confirm-password-error" role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <span aria-hidden="true">⚠</span> {validationErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit button */}
      <Button
        id="register-submit-btn"
        type="submit"
        disabled={status === 'loading'}
        className="w-full mt-2"
      >
        {status === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <span
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              role="status"
              aria-label="Registering…"
            />
            Registering…
          </span>
        ) : (
          'Register'
        )}
      </Button>
    </form>
  );
}

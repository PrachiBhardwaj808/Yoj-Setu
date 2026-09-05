import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Centered card layout */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 px-8 py-10">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 mb-4">
              <span className="text-2xl" role="img" aria-label="login key">🔑</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Log in to Yojsetu</h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter your credentials to access your account.
            </p>
          </div>

          <LoginForm />
        </div>

        {/* Navigation link at bottom */}
        <p className="mt-5 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <a
            href="/verify-phone"
            onClick={(e) => {
              e.preventDefault();
              navigate('/verify-phone');
            }}
            className="text-orange-500 hover:text-orange-700 hover:underline font-medium transition-colors"
          >
            Verify your phone
          </a>
        </p>

      </div>
    </div>
  );
}

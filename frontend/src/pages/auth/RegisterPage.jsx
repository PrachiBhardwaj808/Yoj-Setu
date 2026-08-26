import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Centered card layout */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 px-8 py-10">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 mb-4">
              <span className="text-2xl" role="img" aria-label="user registration">👤</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Create your account</h2>
            <p className="mt-1 text-sm text-slate-500">
              Provide your details to complete registration.
            </p>
          </div>

          <RegisterForm />
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

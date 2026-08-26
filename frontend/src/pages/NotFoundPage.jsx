import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-4 animate-pulse" role="img" aria-label="magnifying glass">🔍</div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2">404 — Page Not Found</h1>
      <p className="text-slate-500 text-sm max-w-sm mb-6">
        The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
      </p>
      
      <Button variant="default" asChild>
        <Link to="/">
          Go to Home Page
        </Link>
      </Button>
    </div>
  );
}

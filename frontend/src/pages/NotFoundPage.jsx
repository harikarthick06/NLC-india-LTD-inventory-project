import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-center">
      <p className="text-5xl font-bold text-brand-600">404</p>
      <p className="text-slate-600">This page doesn&apos;t exist.</p>
      <Link to="/dashboard" className="text-sm font-medium text-brand-600 hover:underline">
        Back to Dashboard
      </Link>
    </div>
  );
}

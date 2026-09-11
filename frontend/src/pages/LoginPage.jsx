import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../services/api.js';
import Button from '../components/ui/Button.jsx';
import FormField, { inputClass } from '../components/ui/FormField.jsx';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@nlcindia.example', password: 'Admin@123' },
  { role: 'Manager', email: 'manager@nlcindia.example', password: 'Manager@123' },
  { role: 'Staff', email: 'staff@nlcindia.example', password: 'Staff@123' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => setForm({ email: account.email, password: account.password });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-xl font-bold text-white">
            N
          </div>
          <h1 className="text-xl font-semibold text-slate-800">NLC Inventory Management</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage stock, reports and more.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Email" required>
            <input
              type="email"
              required
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@nlcindia.example"
            />
          </FormField>
          <FormField label="Password" required>
            <input
              type="password"
              required
              className={inputClass}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </FormField>
          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 rounded-lg bg-slate-50 p-3">
          <p className="mb-2 text-xs font-medium text-slate-500">Demo accounts (seeded data)</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                onClick={() => fillDemo(acc)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:border-brand-300 hover:text-brand-700"
              >
                {acc.role}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

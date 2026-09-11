import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import { formatDate } from '../utils/format.js';

const PERMISSIONS = {
  admin: ['Manage users', 'Manage inventory (create/edit/delete)', 'Manage categories/suppliers/locations', 'View all reports', 'Stock in/out/adjust', 'Use AI assistant'],
  manager: ['Manage inventory (create/edit)', 'Manage categories/suppliers/locations', 'View all reports', 'Stock in/out/adjust', 'Use AI assistant'],
  staff: ['View inventory', 'Search products', 'Stock in/out', 'Use AI assistant'],
};

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <Card title="Profile">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-base font-semibold text-slate-800">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="mt-1">
              <Badge value={user?.role} />
            </div>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-slate-400">Account Created</dt>
            <dd className="mt-0.5 text-slate-700">{formatDate(user?.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Last Login</dt>
            <dd className="mt-0.5 text-slate-700">{user?.lastLogin ? formatDate(user.lastLogin) : '-'}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Role & Permissions" subtitle={`What your role (${user?.role}) can do in this system`}>
        <ul className="space-y-2">
          {(PERMISSIONS[user?.role] || []).map((p) => (
            <li key={p} className="flex items-center gap-2 text-sm text-slate-600">
              <span className="text-emerald-500">✓</span> {p}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="About">
        <p className="text-sm text-slate-600">
          NLC Inventory Management System &middot; internal tool for tracking stock, transactions and reporting
          across NLC India Ltd. plant maintenance stores.
        </p>
      </Card>
    </div>
  );
}

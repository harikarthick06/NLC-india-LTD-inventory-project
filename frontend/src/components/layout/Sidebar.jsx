import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠', roles: ['admin', 'manager', 'staff'] },
  { to: '/inventory', label: 'Inventory', icon: '📦', roles: ['admin', 'manager', 'staff'] },
  { to: '/categories', label: 'Categories', icon: '🗂️', roles: ['admin', 'manager', 'staff'] },
  { to: '/suppliers', label: 'Suppliers', icon: '🚚', roles: ['admin', 'manager', 'staff'] },
  { to: '/locations', label: 'Locations', icon: '📍', roles: ['admin', 'manager', 'staff'] },
  { to: '/transactions', label: 'Transactions', icon: '🔁', roles: ['admin', 'manager', 'staff'] },
  { to: '/reports', label: 'Reports', icon: '📊', roles: ['admin', 'manager'] },
  { to: '/ai-assistant', label: 'AI Assistant', icon: '🤖', roles: ['admin', 'manager', 'staff'] },
  { to: '/users', label: 'Users', icon: '👥', roles: ['admin'] },
  { to: '/settings', label: 'Settings', icon: '⚙️', roles: ['admin', 'manager', 'staff'] },
];

export default function Sidebar({ open, onClose }) {
  const { hasRole } = useAuth();
  const items = NAV_ITEMS.filter((item) => hasRole(...item.roles));

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-200 transition-transform
        lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">N</div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">NLC Inventory</p>
            <p className="text-[11px] text-slate-400">Management System</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition
                ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-800 px-4 py-3 text-[11px] text-slate-500">
          NLC India Ltd &middot; Internal Use Only
        </div>
      </aside>
    </>
  );
}

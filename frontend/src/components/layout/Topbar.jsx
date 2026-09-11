import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Badge from '../ui/Badge.jsx';

export default function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          ☰
        </button>
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-slate-700 leading-tight">{user?.name}</p>
            <Badge value={user?.role} />
          </div>
          <span className="text-slate-400">▾</span>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <button
                className="block w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/settings');
                }}
              >
                Settings
              </button>
              <button
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

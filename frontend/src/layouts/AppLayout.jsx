import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar.jsx';
import Topbar from '../components/layout/Topbar.jsx';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/inventory': 'Inventory',
  '/categories': 'Categories',
  '/suppliers': 'Suppliers',
  '/locations': 'Locations',
  '/transactions': 'Transactions',
  '/reports': 'Reports',
  '/ai-assistant': 'AI Assistant',
  '/users': 'User Management',
  '/settings': 'Settings',
};

function resolveTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith('/inventory/')) return 'Product Details';
  const match = Object.keys(TITLES).find((k) => pathname.startsWith(k));
  return match ? TITLES[match] : 'NLC Inventory';
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={resolveTitle(location.pathname)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import ProtectedRoute from './routes/ProtectedRoute.jsx';
import RoleRoute from './routes/RoleRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import InventoryPage from './pages/InventoryPage.jsx';
import ProductDetailsPage from './pages/ProductDetailsPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import SuppliersPage from './pages/SuppliersPage.jsx';
import LocationsPage from './pages/LocationsPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import AIAssistantPage from './pages/AIAssistantPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/:id" element={<ProductDetailsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            <Route element={<RoleRoute roles={['admin', 'manager']} />}>
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
            <Route element={<RoleRoute roles={['admin']} />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

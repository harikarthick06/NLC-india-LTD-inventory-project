import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RoleRoute({ roles }) {
  const { hasRole } = useAuth();
  if (!hasRole(...roles)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

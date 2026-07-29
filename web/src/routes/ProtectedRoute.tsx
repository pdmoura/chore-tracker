import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import type { Role } from '../types';

export function ProtectedRoute({
  role,
  children,
}: {
  role?: Role;
  children?: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="page-status">Checking your session…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === 'PARENT' ? '/admin/tasks' : '/my-tasks'}
        replace
      />
    );
  }

  return children ?? <Outlet />;
}

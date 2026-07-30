import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { SessionStatusScreen } from '../components/SessionStatusScreen';
import type { Role } from '../types';

export function ProtectedRoute({
  role,
  children,
}: {
  role?: Role;
  children?: React.ReactNode;
}) {
  const { user, sessionStatus } = useAuth();

  if (sessionStatus === 'checking' || sessionStatus === 'error') {
    return <SessionStatusScreen />;
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

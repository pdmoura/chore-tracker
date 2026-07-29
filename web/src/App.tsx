import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/useAuth';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { UsersPage } from './pages/UsersPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

function HomeRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="page-status">Checking your session…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={user.role === 'PARENT' ? '/admin/tasks' : '/my-tasks'}
      replace
    />
  );
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/admin/tasks"
              element={
                <ProtectedRoute role="PARENT">
                  <PlaceholderPage
                    title="Tasks"
                    description="Parent task management is being prepared."
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute role="PARENT">
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-tasks"
              element={
                <ProtectedRoute role="CHILD">
                  <PlaceholderPage
                    title="My tasks"
                    description="Your assigned tasks are being prepared."
                  />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

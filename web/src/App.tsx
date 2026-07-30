import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/useAuth';
import { AppLayout } from './components/AppLayout';
import { SessionStatusScreen } from './components/SessionStatusScreen';
import { LoginPage } from './pages/LoginPage';
import { MyTasksPage } from './pages/MyTasksPage';
import { TasksPage } from './pages/TasksPage';
import { UsersPage } from './pages/UsersPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

function HomeRedirect() {
  const { user, sessionStatus } = useAuth();

  if (sessionStatus === 'checking' || sessionStatus === 'error') {
    return <SessionStatusScreen />;
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
                  <TasksPage />
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
                  <MyTasksPage />
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

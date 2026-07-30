import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/useAuth';
import { AppLayout } from './components/AppLayout';
import { SessionStatusScreen } from './components/SessionStatusScreen';
import { ProtectedRoute } from './routes/ProtectedRoute';

const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({
    default: module.LoginPage,
  })),
);
const MyTasksPage = lazy(() =>
  import('./pages/MyTasksPage').then((module) => ({
    default: module.MyTasksPage,
  })),
);
const TasksPage = lazy(() =>
  import('./pages/TasksPage').then((module) => ({
    default: module.TasksPage,
  })),
);
const UsersPage = lazy(() =>
  import('./pages/UsersPage').then((module) => ({
    default: module.UsersPage,
  })),
);

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
      <Suspense fallback={<RouteLoading />}>
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
      </Suspense>
    </AuthProvider>
  );
}

function RouteLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
      Loading…
    </div>
  );
}

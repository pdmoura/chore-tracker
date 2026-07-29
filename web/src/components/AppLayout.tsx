import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  function handleLogout() {
    logout();
    void navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <span className="eyebrow">Chore Tracker</span>
          <strong>{user.name}</strong>
          <span className="user-meta">
            {user.role === 'PARENT' ? 'Parent' : 'Child'} · {user.email}
          </span>
        </div>
        <nav aria-label="Primary navigation">
          {user.role === 'PARENT' ? (
            <>
              <NavLink to="/admin/tasks">Tasks</NavLink>
              <NavLink to="/admin/users">Users</NavLink>
            </>
          ) : (
            <NavLink to="/my-tasks">My tasks</NavLink>
          )}
          <button className="button button-quiet" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      </header>
      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
}

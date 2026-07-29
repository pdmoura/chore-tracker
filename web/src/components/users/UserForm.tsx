import { useState, type FormEvent } from 'react';
import type { Role, User } from '../../types';
import { ErrorMessage } from '../ErrorMessage';

export interface UserFormValues {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export function UserForm({
  user,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: {
  user?: User;
  isSubmitting: boolean;
  error: string;
  onSubmit: (values: UserFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(user?.role ?? 'CHILD');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await onSubmit({ name, email, password, role });
    } catch {
      return;
    }
  }

  return (
    <section className="form-panel" aria-labelledby="user-form-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{user ? 'Edit account' : 'New account'}</span>
          <h2 id="user-form-title">{user ? user.name : 'Add a family member'}</h2>
        </div>
        <button className="button button-quiet" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {error ? <ErrorMessage message={error} /> : null}

      <form onSubmit={(event) => void handleSubmit(event)}>
        <label>
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          {user ? 'New password (optional)' : 'Password'}
          <input
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required={!user}
          />
        </label>
        {user ? (
          <div>
            <span className="field-label">Role</span>
            <span className={`badge badge-${user.role.toLowerCase()}`}>
              {user.role === 'PARENT' ? 'Parent' : 'Child'}
            </span>
            <p className="field-help">Roles cannot be changed after creation.</p>
          </div>
        ) : (
          <label>
            Role
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              <option value="CHILD">Child</option>
              <option value="PARENT">Parent</option>
            </select>
          </label>
        )}
        <button className="button button-primary" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving…'
            : user
              ? 'Save changes'
              : 'Create account'}
        </button>
      </form>
    </section>
  );
}

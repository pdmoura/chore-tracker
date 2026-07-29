import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  UserForm,
  type UserFormValues,
} from '../components/users/UserForm';
import { apiRequest, getErrorMessage } from '../lib/api';
import type { User } from '../types';

type FormState = { mode: 'create' } | { mode: 'edit'; user: User } | null;

export function UsersPage() {
  const { token, user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState<FormState>(null);

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => apiRequest<User[]>('/users', { token }),
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      values,
      editing,
    }: {
      values: UserFormValues;
      editing?: User;
    }) => {
      if (editing) {
        return apiRequest<User>(`/users/${editing.id}`, {
          method: 'PATCH',
          token,
          body: {
            name: values.name,
            email: values.email,
            ...(values.password ? { password: values.password } : {}),
          },
        });
      }

      return apiRequest<User>('/users', {
        method: 'POST',
        token,
        body: values,
      });
    },
    onSuccess: async () => {
      setFormState(null);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/users/${id}`, { method: 'DELETE', token }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  async function handleSave(values: UserFormValues) {
    saveMutation.reset();
    await saveMutation.mutateAsync({
      values,
      editing: formState?.mode === 'edit' ? formState.user : undefined,
    });
  }

  function handleDelete(user: User) {
    deleteMutation.reset();
    if (
      window.confirm(
        `Delete ${user.name}? This cannot be undone and will fail if they have related tasks.`,
      )
    ) {
      deleteMutation.mutate(user.id);
    }
  }

  const users = usersQuery.data ?? [];

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <span className="eyebrow">Parent dashboard</span>
          <h1>Family accounts</h1>
          <p>Create and maintain the people who can use this tracker.</p>
        </div>
        <button
          className="button button-primary"
          onClick={() => {
            saveMutation.reset();
            setFormState({ mode: 'create' });
          }}
        >
          Add account
        </button>
      </header>

      {deleteMutation.isError ? (
        <ErrorMessage
          title="Unable to delete account"
          message={getErrorMessage(deleteMutation.error)}
        />
      ) : null}

      {formState ? (
        <UserForm
          key={formState.mode === 'edit' ? formState.user.id : 'create'}
          user={formState.mode === 'edit' ? formState.user : undefined}
          isSubmitting={saveMutation.isPending}
          error={
            saveMutation.isError ? getErrorMessage(saveMutation.error) : ''
          }
          onSubmit={handleSave}
          onCancel={() => {
            saveMutation.reset();
            setFormState(null);
          }}
        />
      ) : null}

      <section className="content-panel" aria-labelledby="users-list-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Directory</span>
            <h2 id="users-list-title">All users</h2>
          </div>
          {usersQuery.isFetching && !usersQuery.isPending ? (
            <span className="muted">Refreshing…</span>
          ) : null}
        </div>

        {usersQuery.isPending ? (
          <div className="inline-status">Loading family accounts…</div>
        ) : usersQuery.isError ? (
          <ErrorMessage
            title="Unable to load accounts"
            message={getErrorMessage(usersQuery.error)}
          />
        ) : users.length === 0 ? (
          <div className="empty-state">
            <strong>No accounts yet</strong>
            <span>Create the first Parent or Child account.</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong>
                      {user.id === currentUser?.id ? (
                        <span className="you-label">You</span>
                      ) : null}
                    </td>
                    <td>
                      <span className={`badge badge-${user.role.toLowerCase()}`}>
                        {user.role === 'PARENT' ? 'Parent' : 'Child'}
                      </span>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="button button-small button-quiet"
                          onClick={() => {
                            saveMutation.reset();
                            setFormState({ mode: 'edit', user });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="button button-small button-danger"
                          disabled={
                            user.id === currentUser?.id ||
                            deleteMutation.isPending
                          }
                          title={
                            user.id === currentUser?.id
                              ? 'You cannot delete your own active account'
                              : undefined
                          }
                          onClick={() => handleDelete(user)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

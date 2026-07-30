import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpDown,
  Baby,
  Info,
  MoreVertical,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import { DeleteConfirmation } from '@/components/DeleteConfirmation';
import { ErrorMessage } from '@/components/ErrorMessage';
import { PageHeader } from '@/components/PageHeader';
import { Pagination } from '@/components/Pagination';
import { ResponsiveFormOverlay } from '@/components/ResponsiveFormOverlay';
import { SearchField } from '@/components/SearchField';
import { StatCard } from '@/components/StatCard';
import { UserAvatar } from '@/components/UserAvatar';
import {
  UserForm,
  type UserFormValues,
} from '@/components/users/UserForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiRequest, getErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { paginate } from '@/lib/task-view';
import {
  filterUsers,
  getUserStats,
  sortUsers,
  type UserSort,
} from '@/lib/user-view';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

type FormState = { mode: 'create' } | { mode: 'edit'; user: User } | null;
const pageSize = 5;
const userFormId = 'user-form';

export function UsersPage() {
  const { token, user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState<FormState>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<UserSort>('DEFAULT');
  const [page, setPage] = useState(1);

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
      setDeleteTarget(null);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const users = usersQuery.data ?? [];
  const stats = getUserStats(users);
  const visibleUsers = sortUsers(filterUsers(users, search), sort);
  const pagination = paginate(visibleUsers, page, pageSize);
  const editingUser =
    formState?.mode === 'edit' ? formState.user : undefined;

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function toggleSort(field: 'name' | 'email' | 'role' | 'created') {
    const asc = `${field.toUpperCase()}_ASC` as UserSort;
    const desc = `${field.toUpperCase()}_DESC` as UserSort;
    setSort((current) => (current === asc ? desc : asc));
    setPage(1);
  }

  async function handleSave(values: UserFormValues) {
    saveMutation.reset();
    await saveMutation.mutateAsync({
      values,
      editing: editingUser,
    });
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Users"
        description="Manage family members and account access."
        actions={
          <>
            <SearchField
              value={search}
              onChange={updateSearch}
              placeholder="Search users…"
              label="Search users"
            />
            <Button
              onClick={() => {
                saveMutation.reset();
                setFormState({ mode: 'create' });
              }}
            >
              Add user
              <Plus aria-hidden="true" />
            </Button>
          </>
        }
      />

      <section
        className="grid gap-4 sm:grid-cols-3"
        aria-label="User summary"
      >
        <StatCard
          label="Total users"
          value={stats.total}
          caption="All accounts"
          icon={UsersRound}
          tone="blue"
        />
        <StatCard
          label="Parents"
          value={stats.parents}
          caption="Parent accounts"
          icon={ShieldCheck}
          tone="green"
        />
        <StatCard
          label="Children"
          value={stats.children}
          caption="Child accounts"
          icon={Baby}
          tone="violet"
        />
      </section>

      <Alert variant="info">
        <Info aria-hidden="true" />
        <AlertTitle>Roles are fixed after account creation</AlertTitle>
        <AlertDescription>
          An existing Parent or Child role cannot be changed.
        </AlertDescription>
      </Alert>

      {deleteMutation.isError ? (
        <ErrorMessage
          title="Unable to delete account"
          message={getErrorMessage(deleteMutation.error)}
        />
      ) : null}

      {usersQuery.isPending ? (
        <Card className="space-y-4 p-5" aria-label="Loading family accounts">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </Card>
      ) : usersQuery.isError ? (
        <ErrorMessage
          title="Unable to load accounts"
          message={getErrorMessage(usersQuery.error)}
        />
      ) : visibleUsers.length === 0 ? (
        <Card className="grid min-h-52 place-items-center p-8 text-center">
          <div>
            <UsersRound className="mx-auto size-10 text-muted-foreground" />
            <h2 className="mt-4 font-semibold">
              {users.length === 0 ? 'No accounts yet' : 'No matching users'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {users.length === 0
                ? 'Create the first Parent or Child account.'
                : 'Try a different name, email, or role.'}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <Card className="hidden overflow-hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortButton
                      label="Name"
                      active={sort.startsWith('NAME')}
                      onClick={() => toggleSort('name')}
                    />
                  </TableHead>
                  <TableHead>
                    <SortButton
                      label="Email"
                      active={sort.startsWith('EMAIL')}
                      onClick={() => toggleSort('email')}
                    />
                  </TableHead>
                  <TableHead>
                    <SortButton
                      label="Role"
                      active={sort.startsWith('ROLE')}
                      onClick={() => toggleSort('role')}
                    />
                  </TableHead>
                  <TableHead>
                    <SortButton
                      label="Created"
                      active={sort.startsWith('CREATED')}
                      onClick={() => toggleSort('created')}
                    />
                  </TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={user.name}
                          seed={user.id}
                          className="size-10"
                        />
                        <div className="min-w-0">
                          <strong className="block truncate">{user.name}</strong>
                          {user.id === currentUser?.id ? (
                            <Badge variant="outline" className="mt-1">
                              You
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <UserActions
                        user={user}
                        currentUserId={currentUser?.id}
                        deletePending={deleteMutation.isPending}
                        onEdit={() => {
                          saveMutation.reset();
                          setFormState({ mode: 'edit', user });
                        }}
                        onDelete={() => {
                          deleteMutation.reset();
                          setDeleteTarget(user);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="grid gap-4 md:hidden">
            {pagination.items.map((user) => (
              <Card key={user.id} className="p-5">
                <div className="flex items-start gap-3">
                  <UserAvatar name={user.name} seed={user.id} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <strong className="truncate">{user.name}</strong>
                      {user.id === currentUser?.id ? (
                        <Badge variant="outline">You</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <UserActions
                    user={user}
                    currentUserId={currentUser?.id}
                    deletePending={deleteMutation.isPending}
                    onEdit={() => {
                      saveMutation.reset();
                      setFormState({ mode: 'edit', user });
                    }}
                    onDelete={() => {
                      deleteMutation.reset();
                      setDeleteTarget(user);
                    }}
                  />
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <RoleBadge role={user.role} />
                  <span className="text-sm text-muted-foreground">
                    Created {formatDate(user.createdAt)}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onPageChange={setPage}
            itemLabel="users"
            firstItem={pagination.firstItem}
            lastItem={pagination.lastItem}
            totalItems={visibleUsers.length}
          />
        </>
      )}

      {formState ? (
        <ResponsiveFormOverlay
          open
          onOpenChange={(open) => {
            if (!open) {
              saveMutation.reset();
              setFormState(null);
            }
          }}
          title={editingUser ? 'Edit user' : 'Add user'}
          description={
            editingUser
              ? 'Update this account’s details.'
              : 'Create a new Parent or Child account.'
          }
          isBusy={saveMutation.isPending}
          footer={
            <>
              <Button
                variant="outline"
                disabled={saveMutation.isPending}
                onClick={() => setFormState(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form={userFormId}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending
                  ? 'Saving…'
                  : editingUser
                    ? 'Save changes'
                    : 'Create user'}
              </Button>
            </>
          }
        >
          <UserForm
            key={editingUser?.id ?? 'create'}
            formId={userFormId}
            user={editingUser}
            isSubmitting={saveMutation.isPending}
            error={
              saveMutation.isError ? getErrorMessage(saveMutation.error) : ''
            }
            onSubmit={handleSave}
          />
        </ResponsiveFormOverlay>
      ) : null}

      <DeleteConfirmation
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Delete ${deleteTarget?.name ?? 'this account'}?`}
        description="This account will be permanently removed. Deletion will be blocked when related tasks still exist."
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}

function RoleBadge({ role }: { role: User['role'] }) {
  return (
    <Badge variant={role === 'PARENT' ? 'default' : 'secondary'}>
      {role === 'PARENT' ? 'Parent' : 'Child'}
    </Badge>
  );
}

function SortButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex min-h-10 items-center gap-2 rounded-md text-xs font-semibold hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
        active && 'text-primary',
      )}
      onClick={onClick}
    >
      {label}
      <ArrowUpDown aria-hidden="true" />
    </button>
  );
}

function UserActions({
  user,
  currentUserId,
  deletePending,
  onEdit,
  onDelete,
}: {
  user: User;
  currentUserId?: string;
  deletePending: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={`Actions for ${user.name}`}
        >
          <MoreVertical aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil aria-hidden="true" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={user.id === currentUserId || deletePending}
          onSelect={onDelete}
        >
          <Trash2 aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

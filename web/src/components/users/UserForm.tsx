import { useState, type FormEvent } from 'react';
import { AlertTriangle, Eye, EyeOff, UserRound, UsersRound } from 'lucide-react';
import type { Role, User } from '@/types';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export interface UserFormValues {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export function UserForm({
  formId,
  user,
  isSubmitting,
  error,
  onSubmit,
}: {
  formId: string;
  user?: User;
  isSubmitting: boolean;
  error: string;
  onSubmit: (values: UserFormValues) => Promise<void>;
}) {
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(user?.role ?? 'CHILD');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await onSubmit({ name, email, password, role });
    } catch {
      return;
    }
  }

  return (
    <form
      id={formId}
      className="grid gap-5"
      onSubmit={(event) => void handleSubmit(event)}
    >
      {error ? (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>Unable to save account</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor={`${formId}-name`}>Full name</Label>
        <Input
          id={`${formId}-name`}
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter full name"
          maxLength={100}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${formId}-email`}>Email address</Label>
        <Input
          id={`${formId}-email`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter email address"
          disabled={isSubmitting}
          required
        />
      </div>

      {user ? (
        <div className="grid gap-2">
          <Label>Role</Label>
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
            <span className="font-medium">
              {user.role === 'PARENT' ? 'Parent' : 'Child'}
            </span>
          </div>
          <Alert variant="warning">
            <AlertTriangle aria-hidden="true" />
            <AlertTitle>Role is permanent</AlertTitle>
            <AlertDescription>
              A user’s role cannot be changed after the account is created.
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Role</legend>
          <div className="grid grid-cols-2 gap-2">
            {(['PARENT', 'CHILD'] as const).map((value) => {
              const Icon = value === 'PARENT' ? UserRound : UsersRound;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={role === value}
                  disabled={isSubmitting}
                  className={cn(
                    'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border text-sm font-semibold text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-50',
                    role === value &&
                      'border-primary bg-primary/5 text-primary ring-1 ring-primary',
                  )}
                  onClick={() => setRole(value)}
                >
                  <Icon aria-hidden="true" />
                  {value === 'PARENT' ? 'Parent' : 'Child'}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="grid gap-2">
        <Label htmlFor={`${formId}-password`}>
          {user ? 'New password' : 'Password'}
          {user ? (
            <span className="font-normal text-muted-foreground">(optional)</span>
          ) : null}
        </Label>
        <div className="relative">
          <Input
            id={`${formId}-password`}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={user ? 'Leave blank to keep current password' : 'Enter password'}
            className="pr-12"
            disabled={isSubmitting}
            required={!user}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" />
            ) : (
              <Eye aria-hidden="true" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Use between 8 and 72 characters.
        </p>
      </div>
    </form>
  );
}

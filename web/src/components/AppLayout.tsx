import {
  ChevronDown,
  ClipboardList,
  LogOut,
  Menu,
  Moon,
  Sun,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { useTheme } from '@/theme/useTheme';
import { cn } from '@/lib/utils';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { UserAvatar } from './UserAvatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle } from './ui/sheet';

export function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  if (!user) {
    return null;
  }

  function handleLogout() {
    logout();
    void navigate('/login', { replace: true });
  }

  const navigation =
    user.role === 'PARENT'
      ? [
          { to: '/admin/tasks', label: 'Tasks', icon: ClipboardList },
          { to: '/admin/users', label: 'Users', icon: Users },
        ]
      : [{ to: '/my-tasks', label: 'My tasks', icon: ClipboardList }];

  const navLinks = navigation.map(({ to, label, icon: Icon }) => (
    <NavLink
      key={to}
      to={to}
      onClick={() => setMobileNavigationOpen(false)}
      className={({ isActive }) =>
        cn(
          'flex min-h-12 items-center gap-3 rounded-lg px-4 text-sm font-semibold text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
          isActive &&
            'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm',
        )
      }
    >
      <Icon aria-hidden="true" />
      {label}
    </NavLink>
  ));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-20 items-center border-b border-sidebar-border px-7">
          <BrandLogo />
        </div>
        <nav className="grid gap-2 p-4" aria-label="Primary navigation">
          {navLinks}
        </nav>
        <div className="mt-auto space-y-5 p-4">
          <ThemeToggle />
          <div className="border-t border-sidebar-border pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut aria-hidden="true" />
              Log out
            </Button>
          </div>
        </div>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:h-20 md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Open navigation"
              onClick={() => setMobileNavigationOpen(true)}
            >
              <Menu aria-hidden="true" />
            </Button>
            <BrandLogo compact />
          </div>
          <div className="hidden md:block" />
          <AccountMenu
            user={user}
            theme={theme}
            onThemeChange={setTheme}
            onLogout={handleLogout}
          />
        </header>

        <main className="mx-auto w-full max-w-[90rem] px-4 py-7 sm:px-6 md:px-10 md:py-9">
          <Outlet />
        </main>
      </div>

      <Sheet
        open={mobileNavigationOpen}
        onOpenChange={setMobileNavigationOpen}
      >
        <SheetContent side="left" className="bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-20 items-center border-b border-sidebar-border px-6">
            <BrandLogo />
          </div>
          <nav className="grid gap-2 p-4" aria-label="Mobile navigation">
            {navLinks}
          </nav>
          <div className="mt-auto space-y-5 p-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut aria-hidden="true" />
              Log out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AccountMenu({
  user,
  theme,
  onThemeChange,
  onLogout,
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onLogout: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto min-h-12 gap-3 px-2 text-left"
          aria-label={`Open account menu for ${user.name}`}
        >
          <UserAvatar name={user.name} seed={user.id} />
          <span className="hidden min-w-28 sm:block">
            <span className="block max-w-40 truncate text-sm font-semibold">
              {user.name}
            </span>
            <span className="block text-xs font-normal text-muted-foreground">
              {user.role === 'PARENT' ? 'Parent' : 'Child'}
            </span>
          </span>
          <ChevronDown className="text-muted-foreground" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block truncate">{user.name}</span>
          <span className="block truncate font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onThemeChange('light')}>
          <Sun aria-hidden="true" />
          Light theme
          {theme === 'light' ? <span className="ml-auto">✓</span> : null}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onThemeChange('dark')}>
          <Moon aria-hidden="true" />
          Dark theme
          {theme === 'dark' ? <span className="ml-auto">✓</span> : null}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout}>
          <LogOut aria-hidden="true" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

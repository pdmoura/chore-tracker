import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/theme/useTheme';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        'grid grid-cols-2 rounded-lg border border-border bg-background p-1',
        className,
      )}
      aria-label="Color theme"
    >
      <button
        type="button"
        aria-pressed={theme === 'light'}
        className={cn(
          'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
          theme === 'light' &&
            'bg-card text-primary shadow-sm ring-1 ring-primary/30',
        )}
        onClick={() => setTheme('light')}
      >
        <Sun aria-hidden="true" />
        Light
      </button>
      <button
        type="button"
        aria-pressed={theme === 'dark'}
        className={cn(
          'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
          theme === 'dark' &&
            'bg-card text-primary shadow-sm ring-1 ring-primary/30',
        )}
        onClick={() => setTheme('dark')}
      >
        <Moon aria-hidden="true" />
        Dark
      </button>
    </div>
  );
}

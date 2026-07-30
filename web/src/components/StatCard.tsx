import type { LucideIcon } from 'lucide-react';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';

const tones = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  amber: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
  green: 'bg-green-500/10 text-green-600 dark:text-green-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
} as const;

export function StatCard({
  label,
  value,
  caption,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  caption: string;
  icon: LucideIcon;
  tone: keyof typeof tones;
}) {
  return (
    <Card className="flex min-h-36 items-center gap-5 p-5">
      <span
        className={cn(
          'grid size-16 shrink-0 place-items-center rounded-xl',
          tones[tone],
        )}
      >
        <Icon className="size-8" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-sm text-muted-foreground">{label}</span>
        <strong className="mt-1 block text-3xl font-bold leading-none">
          {value}
        </strong>
        <span className="mt-3 block text-sm text-muted-foreground">
          {caption}
        </span>
      </span>
    </Card>
  );
}

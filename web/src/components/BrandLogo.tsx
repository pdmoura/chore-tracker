import { Check, House } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BrandLogo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-3 text-foreground', className)}>
      <span className="relative grid size-10 shrink-0 place-items-center text-primary">
        <House className="size-9 stroke-[1.8]" aria-hidden="true" />
        <Check
          className="absolute top-[0.9rem] size-4 stroke-[2.5]"
          aria-hidden="true"
        />
      </span>
      {compact ? null : (
        <span className="text-xl font-bold tracking-tight">Chore Tracker</span>
      )}
    </div>
  );
}

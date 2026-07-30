import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between',
        className,
      )}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      {actions ? (
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

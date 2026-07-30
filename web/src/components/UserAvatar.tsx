import { cn } from '@/lib/utils';

const avatarStyles = [
  'bg-violet-500 text-white',
  'bg-teal-500 text-white',
  'bg-pink-500 text-white',
  'bg-blue-500 text-white',
  'bg-amber-400 text-amber-950',
] as const;

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function getAvatarStyle(value: string): string {
  const hash = Array.from(value).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  return avatarStyles[hash % avatarStyles.length];
}

export function UserAvatar({
  name,
  seed = name,
  className,
}: {
  name: string;
  seed?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold',
        getAvatarStyle(seed),
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}

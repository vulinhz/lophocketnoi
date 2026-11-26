import type { AvatarPalette } from '../types/domain';

interface StudentAvatarProps {
  fullName: string;
  palette?: AvatarPalette;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0] ?? '';
  const last = parts[parts.length - 1][0] ?? '';
  return `${first}${last}`.toUpperCase();
}

const SIZE_MAP = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
};

export function StudentAvatar({
  fullName,
  palette,
  avatarUrl,
  size = 'md',
}: StudentAvatarProps) {
  const sizeClass = SIZE_MAP[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName}
        referrerPolicy="no-referrer"
        className={`${sizeClass} shrink-0 rounded-full border border-slate-200 object-cover`}
      />
    );
  }

  const bg = palette?.bg ?? '#CCFBF1';
  const fg = palette?.fg ?? '#0F766E';
  const initials = getInitials(fullName);

  return (
    <div
      aria-label={fullName}
      style={{ backgroundColor: bg, color: fg }}
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full border border-slate-200/80 font-display font-semibold select-none`}
    >
      {initials}
    </div>
  );
}

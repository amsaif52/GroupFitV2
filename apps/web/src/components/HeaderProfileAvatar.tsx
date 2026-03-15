'use client';

import Link from 'next/link';

type HeaderProfileAvatarProps = {
  name: string | null | undefined;
  avatarUrl: string | null | undefined;
  profileLink: string;
  className?: string;
  /** When true, style for use on dark header (e.g. blue): light text/background */
  onDark?: boolean;
};

/**
 * Renders a circular profile avatar for the header: image if avatarUrl is set,
 * otherwise the first letter of the name (uppercase). Links to profile edit.
 */
export function HeaderProfileAvatar({
  name,
  avatarUrl,
  profileLink,
  className,
  onDark = false,
}: HeaderProfileAvatarProps) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? '?';
  const size = 36;
  const fallbackBg = onDark ? 'rgba(255,255,255,0.25)' : 'var(--groupfit-border-light, #e0e0e0)';
  const fallbackColor = onDark ? 'var(--groupfit-white, #fff)' : 'var(--groupfit-primary, #1a1a2e)';

  return (
    <Link
      href={profileLink}
      className={className}
      aria-label="Profile"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        background: avatarUrl ? 'transparent' : fallbackBg,
        color: avatarUrl ? 'transparent' : fallbackColor,
        fontSize: 16,
        fontWeight: 700,
        textDecoration: 'none',
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          width={size}
          height={size}
          style={{ objectFit: 'cover', width: size, height: size }}
        />
      ) : (
        <span aria-hidden>{initial}</span>
      )}
    </Link>
  );
}

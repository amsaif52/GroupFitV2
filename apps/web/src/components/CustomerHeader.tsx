'use client';

import Link from 'next/link';
import { ROLES } from '@groupfit/shared';
import { useStoredUser } from '@/lib/auth';
import { LocationDropdown } from './LocationDropdown';
import { ROUTES } from '@/app/routes';

type CustomerHeaderProps = {
  title: string;
  backLink?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Blue header (gf-home__header) with title, optional location dropdown (customers only), and notifications.
 */
export function CustomerHeader({
  title,
  backLink,
  rightContent,
  className,
  style,
}: CustomerHeaderProps) {
  const { user } = useStoredUser();
  const isCustomer = user?.role !== ROLES.TRAINER && user?.role !== ROLES.ADMIN;

  return (
    <header
      className={className ? `gf-home__header ${className}` : 'gf-home__header'}
      style={{ marginBottom: 16, ...style }}
      role="banner"
    >
      {backLink}
      <span className="gf-home__logo">{title}</span>
      <div className="gf-home__header-actions">
        {isCustomer && <LocationDropdown />}
        <Link
          href={ROUTES.notifications}
          className="gf-home__header-link"
          aria-label="Notifications"
        >
          🔔
        </Link>
        {rightContent}
      </div>
    </header>
  );
}

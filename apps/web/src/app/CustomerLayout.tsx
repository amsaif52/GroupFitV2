'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from './routes';

const NAV = [
  { href: ROUTES.dashboard, label: 'Home' },
  { href: ROUTES.sessions, label: 'My Sessions' },
  { href: ROUTES.activities, label: 'Activities' },
  { href: ROUTES.trainers, label: 'My Trainers' },
  { href: ROUTES.account, label: 'Account' },
] as const;

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="gf-customer-layout">
      <aside className="gf-customer-sidebar">
        <span className="gf-customer-sidebar__logo">GroupFit</span>
        <nav className="gf-customer-sidebar__nav" aria-label="Customer navigation">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`gf-customer-sidebar__link ${pathname === href ? 'gf-customer-sidebar__link--active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="gf-customer-main">{children}</main>
    </div>
  );
}

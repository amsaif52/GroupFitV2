'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from './routes';

const TRAINER_NAV = [
  { href: ROUTES.dashboard, label: 'Home' },
  { href: ROUTES.sessions, label: 'My Sessions' },
  { href: ROUTES.availability, label: 'Availability' },
  { href: ROUTES.activityArea, label: 'Service areas' },
  { href: ROUTES.myActivities, label: 'My activities' },
  { href: ROUTES.certificates, label: 'Certificates' },
  { href: ROUTES.bankDetails, label: 'Bank Details' },
  { href: ROUTES.refer, label: 'Refer' },
  { href: ROUTES.earning, label: 'My Earnings' },
  { href: ROUTES.reviews, label: 'Reviews' },
  { href: ROUTES.help, label: 'Help' },
  { href: ROUTES.account, label: 'Account' },
] as const;

export function TrainerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="gf-customer-layout">
      <aside className="gf-customer-sidebar" style={{ backgroundColor: 'var(--groupfit-primary-dark)' }}>
        <span className="gf-customer-sidebar__logo">GroupFit</span>
        <nav className="gf-customer-sidebar__nav" aria-label="Trainer navigation">
          {TRAINER_NAV.map(({ href, label }) => (
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

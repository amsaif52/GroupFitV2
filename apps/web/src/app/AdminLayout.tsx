'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from './routes';

const ADMIN_NAV = [
  { href: ROUTES.adminDashboard, label: 'Dashboard' },
  { href: ROUTES.adminMasterData, label: 'Master data' },
  { href: ROUTES.adminActivity, label: 'Activity' },
  { href: ROUTES.adminFaq, label: 'FAQ' },
  { href: ROUTES.adminContactUs, label: 'Contact' },
  { href: ROUTES.adminCustomizeDashboard, label: 'Customize dashboard' },
  { href: ROUTES.adminDiscount, label: 'Discount' },
  { href: ROUTES.adminTrainers, label: 'Trainers' },
  { href: ROUTES.adminCustomers, label: 'Customers' },
  { href: ROUTES.adminSessions, label: 'Sessions' },
  { href: ROUTES.adminEarning, label: 'Earning' },
  { href: ROUTES.adminSupport, label: 'Support' },
  { href: ROUTES.adminUsers, label: 'Users' },
  { href: ROUTES.adminUserRoles, label: 'User Roles' },
] as const;

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="gf-customer-layout">
      <aside
        className="gf-customer-sidebar"
        style={{ backgroundColor: 'var(--groupfit-primary-dark)', minWidth: 200 }}
      >
        <span className="gf-customer-sidebar__logo">GroupFit Admin</span>
        <nav className="gf-customer-sidebar__nav" aria-label="Admin navigation">
          {ADMIN_NAV.map(({ href, label }) => (
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

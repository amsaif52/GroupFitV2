'use client';

import Link from 'next/link';
import { ROUTES } from '../../routes';

export default function AdminUserRolesPage() {
  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link href={ROUTES.adminDashboard} style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}>← Dashboard</Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>User Roles</h1>
      </header>
      <div className="gf-home__empty gf-home__empty--tall">
        <p>User roles management. (Stub page; add API when ready.)</p>
      </div>
    </>
  );
}

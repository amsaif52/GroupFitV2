'use client';

import Link from 'next/link';
import { ROUTES } from '../../routes';

const SECTIONS = [
  {
    title: 'Activity types',
    description: 'Manage activity types (Yoga, HIIT, etc.) used for sessions and listings.',
    href: ROUTES.adminActivity,
    label: 'Manage activity types',
  },
  {
    title: 'Country / State / City',
    description:
      'Reference data for addresses and locations. Currently served from static reference data in the API.',
    href: null,
    label: 'Coming soon',
  },
  {
    title: 'Language / Locale',
    description: 'Supported languages and locales for the app.',
    href: null,
    label: 'Coming soon',
  },
  {
    title: 'FAQ',
    description: 'FAQ entries shown on help pages. Add, edit, reorder, and delete.',
    href: ROUTES.adminFaq,
    label: 'Manage FAQ',
  },
  {
    title: 'Contact Us',
    description: 'Contact email shown when users tap “Contact support”.',
    href: ROUTES.adminContactUs,
    label: 'Edit contact email',
  },
  {
    title: 'Customize dashboard',
    description: 'Optional JSON config for admin dashboard layout or widget visibility.',
    href: ROUTES.adminCustomizeDashboard,
    label: 'Edit dashboard config',
  },
];

export default function AdminMasterDataPage() {
  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link
          href={ROUTES.adminDashboard}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Dashboard
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Master data</h1>
        <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginTop: 8 }}>
          Reference data and content used across the platform. Activity types are managed here;
          country/state/city and other master data can be added later.
        </p>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            style={{
              padding: 20,
              border: '1px solid var(--groupfit-border-light)',
              borderRadius: 8,
              maxWidth: 560,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{section.title}</h2>
            <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 12 }}>
              {section.description}
            </p>
            {section.href ? (
              <Link
                href={section.href}
                style={{ fontSize: 14, fontWeight: 600, color: 'var(--groupfit-secondary)' }}
              >
                {section.label} →
              </Link>
            ) : (
              <span style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>{section.label}</span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

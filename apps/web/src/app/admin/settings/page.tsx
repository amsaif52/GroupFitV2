'use client';

import Link from 'next/link';
import { ROUTES } from '../../routes';

const SECTIONS = [
  {
    title: 'Country',
    description: 'Define countries used for addresses, locations, and user profiles.',
    href: ROUTES.adminSettingsCountry,
    label: 'Manage countries',
  },
  {
    title: 'States / Province',
    description: 'Define states or provinces per country for addresses and regions.',
    href: ROUTES.adminSettingsStates,
    label: 'Manage states & provinces',
  },
  {
    title: 'Activity category',
    description: 'Define activity categories or groups used to organize specializations.',
    href: ROUTES.adminSettingsActivityCategory,
    label: 'Manage activity categories',
  },
  {
    title: 'FAQ',
    description: 'FAQ entries shown on help pages. Add, edit, reorder, and delete.',
    href: ROUTES.adminSettingsFaq,
    label: 'Manage FAQ',
  },
  {
    title: 'Language',
    description: 'Supported languages and locales for the app.',
    href: ROUTES.adminSettingsLanguage,
    label: 'Manage languages',
  },
  {
    title: 'Contact Us',
    description:
      'Contact methods (Customer Service, Facebook, Instagram, etc.). Add, edit, or delete entries with link and optional icon.',
    href: ROUTES.adminSettingsContactUs,
    label: 'Manage contact us',
  },
] as const;

export default function AdminSettingsPage() {
  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link
          href={ROUTES.adminDashboard}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Dashboard
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginTop: 8 }}>
          Define reference data: country, states/provinces, activity categories, FAQ, and language.
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
            <Link
              href={section.href}
              style={{ fontSize: 14, fontWeight: 600, color: 'var(--groupfit-secondary)' }}
            >
              {section.label} →
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}

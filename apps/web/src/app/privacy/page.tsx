'use client';

import Link from 'next/link';
import { ROUTES } from '../routes';

export default function PrivacyPolicyPage() {
  return (
    <main className="gf-legal">
      <div className="gf-legal__topbar">
        <Link href={ROUTES.dashboard} className="gf-legal__back">
          ← Dashboard
        </Link>
        <h1 className="gf-legal__title">Privacy Policy</h1>
      </div>
      <div className="gf-legal__content">
        <p className="gf-legal__updated">Last updated: March 2025</p>
        <section aria-labelledby="privacy-intro">
          <h2 id="privacy-intro">Introduction</h2>
          <p>
            GroupFit is committed to protecting your privacy. This Privacy Policy explains how we collect,
            use, and safeguard your information when you use our app and services.
          </p>
        </section>
        <section aria-labelledby="privacy-data">
          <h2 id="privacy-data">Information we collect</h2>
          <p>
            We may collect information you provide directly (e.g. name, email, profile details), usage data,
            and device information necessary to deliver and improve our services.
          </p>
        </section>
        <section aria-labelledby="privacy-use">
          <h2 id="privacy-use">How we use your information</h2>
          <p>
            We use your information to provide, maintain, and improve GroupFit; to communicate with you;
            and to comply with legal obligations.
          </p>
        </section>
        <p className="gf-legal__contact">
          For questions, contact us via the <Link href={ROUTES.help}>Help Centre</Link>.
        </p>
      </div>
    </main>
  );
}

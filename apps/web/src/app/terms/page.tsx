'use client';

import Link from 'next/link';
import { ROUTES } from '../routes';

export default function TermsAndConditionsPage() {
  return (
    <main className="gf-legal">
      <div className="gf-legal__topbar">
        <Link href={ROUTES.dashboard} className="gf-legal__back">
          ← Dashboard
        </Link>
        <h1 className="gf-legal__title">Terms and Conditions</h1>
      </div>
      <div className="gf-legal__content">
        <p className="gf-legal__updated">Last updated: March 2025</p>
        <section aria-labelledby="terms-intro">
          <h2 id="terms-intro">Agreement to terms</h2>
          <p>
            By accessing or using GroupFit, you agree to be bound by these Terms and Conditions. If
            you do not agree, please do not use our services.
          </p>
        </section>
        <section aria-labelledby="terms-use">
          <h2 id="terms-use">Use of the service</h2>
          <p>
            You must use GroupFit in accordance with these terms and applicable law. You are
            responsible for keeping your account credentials secure and for all activity under your
            account.
          </p>
        </section>
        <section aria-labelledby="terms-bookings">
          <h2 id="terms-bookings">Bookings and payments</h2>
          <p>
            Session bookings and payments are subject to our booking and cancellation policies and
            any additional terms communicated at the time of booking.
          </p>
        </section>
        <p className="gf-legal__contact">
          For questions, contact us via the <Link href={ROUTES.help}>Help Centre</Link>.
        </p>
      </div>
    </main>
  );
}

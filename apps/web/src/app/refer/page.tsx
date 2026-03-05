'use client';

import { getStoredUser } from '@/lib/auth';
import { ROLES } from '@groupfit/shared';
import { CustomerLayout } from '../CustomerLayout';
import { TrainerLayout } from '../TrainerLayout';
const REFERRAL_MESSAGE = 'Join GroupFit – your fitness community. Get started with GroupFit today. https://groupfit.app';

export default function ReferPage() {
  const user = getStoredUser();
  const isTrainer = user?.role === ROLES.TRAINER || user?.role === ROLES.ADMIN;
  const Layout = isTrainer ? TrainerLayout : CustomerLayout;

  function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Refer a friend – GroupFit',
        text: REFERRAL_MESSAGE,
      }).catch(() => {});
    }
  }

  return (
    <Layout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <span className="gf-home__logo">Refer</span>
      </header>
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Refer a friend</h2>
        <p style={{ color: 'var(--groupfit-grey)', marginBottom: 24 }}>
          Share the love. Get a reward for you and your training buddy.
        </p>
        {typeof navigator !== 'undefined' && navigator.share ? (
          <button
            type="button"
            onClick={handleShare}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--groupfit-secondary)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Share
          </button>
        ) : (
          <p style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>Use the share option in your device or app.</p>
        )}
      </div>
    </Layout>
  );
}

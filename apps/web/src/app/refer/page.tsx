'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStoredUser } from '@/lib/auth';
import { ROLES } from '@groupfit/shared';
import { CustomerLayout } from '../CustomerLayout';
import { TrainerLayout } from '../TrainerLayout';
import { customerApi } from '@/lib/api';
import { ROUTES } from '../routes';

const REFERRAL_MESSAGE = 'Join GroupFit – your fitness community. Get started with GroupFit today. https://groupfit.app';

type ReferralItem = { id: string; referredUserId: string; referredUserName?: string; referredUserEmail?: string; referredUserJoinedAt?: string; createdAt: string };

export default function ReferPage() {
  const user = getStoredUser();
  const isTrainer = user?.role === ROLES.TRAINER || user?.role === ROLES.ADMIN;
  const Layout = isTrainer ? TrainerLayout : CustomerLayout;

  const [referralList, setReferralList] = useState<ReferralItem[]>([]);
  const [referralLoading, setReferralLoading] = useState(false);

  useEffect(() => {
    if (isTrainer) return;
    setReferralLoading(true);
    customerApi
      .ReferralList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        const list = (data?.ReferralList ?? data?.list) as ReferralItem[] | undefined;
        setReferralList(list ?? []);
      })
      .catch(() => setReferralList([]))
      .finally(() => setReferralLoading(false));
  }, [isTrainer]);

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
        {!isTrainer && (
          <div className="gf-home__header-actions">
            <Link href={ROUTES.notifications} className="gf-home__header-link" aria-label="Notifications">
              🔔
            </Link>
          </div>
        )}
      </header>
      <div style={{ padding: '0 24px 24px' }}>
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

        {!isTrainer && (
          <section style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>People you&apos;ve referred</h3>
            {referralLoading ? (
              <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
            ) : referralList.length === 0 ? (
              <p style={{ color: 'var(--groupfit-grey)', fontSize: 14 }}>No referrals yet. Share your link above.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {referralList.map((r) => (
                  <li
                    key={r.id}
                    style={{
                      padding: 12,
                      marginBottom: 8,
                      border: '1px solid var(--groupfit-border-light)',
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{r.referredUserName || r.referredUserEmail || r.referredUserId}</div>
                    {r.referredUserEmail && r.referredUserName !== r.referredUserEmail && (
                      <div style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>{r.referredUserEmail}</div>
                    )}
                    {r.referredUserJoinedAt && (
                      <div style={{ fontSize: 12, color: 'var(--groupfit-grey)', marginTop: 4 }}>
                        Joined {new Date(r.referredUserJoinedAt).toLocaleDateString()}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
}

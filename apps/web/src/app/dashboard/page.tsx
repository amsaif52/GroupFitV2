'use client';

import { getTranslations } from '@groupfit/shared';
import { getStoredUser, clearStoredToken } from '@/lib/auth';
import { ROLES } from '@groupfit/shared';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROUTES, getProfileLink } from '../routes';

export default function DashboardPage() {
  const router = useRouter();
  const t = getTranslations('en');
  const user = getStoredUser();
  const isTrainer = user?.role === ROLES.TRAINER || user?.role === ROLES.ADMIN;

  function handleLogout() {
    clearStoredToken();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="gf-home">
      <header className="gf-home__header">
        <span className="gf-home__logo">GroupFit</span>
        <div className="gf-home__header-actions">
          <Link href={getProfileLink('/notifications')} className="gf-home__header-link" aria-label="Notifications">
            🔔
          </Link>
          <Link href={ROUTES.profile} className="gf-home__avatar" aria-label="Profile" />
        </div>
      </header>

      <div className="gf-home__body">
        {user && (
          <p style={{ marginBottom: 16, color: 'var(--groupfit-grey)', fontSize: 14 }}>
            {user.name ?? user.email ?? user.sub} {user.role && `(${user.role})`}
          </p>
        )}

        {isTrainer ? (
          <>
            <section className="gf-home__section">
              <div className="gf-home__section-head">
                <h2 className="gf-home__section-title">Today&apos;s Sessions</h2>
                <Link href={getProfileLink('/sessions')} className="gf-home__see-all">See all</Link>
              </div>
              <div className="gf-home__empty gf-home__empty--tall">
                There are no sessions scheduled for today
              </div>
            </section>
            <section className="gf-home__section">
              <div className="gf-home__section-head">
                <h2 className="gf-home__section-title">New Sessions</h2>
                <Link href={getProfileLink('/sessions')} className="gf-home__see-all">See all</Link>
              </div>
              <div className="gf-home__empty gf-home__empty--tall">
                No new sessions
              </div>
            </section>
            <section className="gf-home__section">
              <div className="gf-home__section-head">
                <h2 className="gf-home__section-title">Earning</h2>
                <Link href={getProfileLink('/earning')} className="gf-home__see-all">See all</Link>
              </div>
              <div className="gf-home__earning">
                <p className="gf-home__earning-label">Current month</p>
                <p className="gf-home__earning-value">£0.00</p>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="gf-home__section">
              <div className="gf-home__section-head">
                <h2 className="gf-home__section-title">Upcoming Sessions</h2>
                <Link href={getProfileLink('/sessions')} className="gf-home__see-all">See all</Link>
              </div>
              <div className="gf-home__empty gf-home__empty--tall">
                There are no sessions scheduled for today
              </div>
            </section>
            <section className="gf-home__section">
              <div className="gf-home__section-head">
                <h2 className="gf-home__section-title">Activities</h2>
                <Link href={getProfileLink('/activities')} className="gf-home__see-all">See all</Link>
              </div>
              <div className="gf-home__empty">
                There are no activities available
              </div>
            </section>
            <section className="gf-home__section">
              <div className="gf-home__section-head">
                <h2 className="gf-home__section-title">Favourites</h2>
                <Link href={getProfileLink('/activities')} className="gf-home__see-all">See all</Link>
              </div>
              <div className="gf-home__empty gf-home__empty--tall">
                There are no favourited activities
              </div>
            </section>
            <section className="gf-home__section">
              <div className="gf-home__section-head">
                <h2 className="gf-home__section-title">Trending</h2>
                <Link href={getProfileLink('/activities')} className="gf-home__see-all">See all</Link>
              </div>
              <div className="gf-home__empty gf-home__empty--tall">
                There are no trending activities
              </div>
            </section>
            <section className="gf-home__section">
              <div className="gf-home__section-head">
                <h2 className="gf-home__section-title">My Trainers</h2>
                <Link href={getProfileLink('/trainers')} className="gf-home__see-all">See all</Link>
              </div>
              <div className="gf-home__empty">
                There are no favorited trainers
              </div>
            </section>
          </>
        )}

        <div className="gf-home__nav-links">
          <Link href={ROUTES.profile}>{t.nav.profile}</Link>
          <Link href={ROUTES.account}>Account</Link>
          <button type="button" onClick={handleLogout} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'var(--groupfit-secondary)', cursor: 'pointer', fontWeight: 600 }}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

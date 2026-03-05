'use client';

import { useEffect, useState } from 'react';
import { getTranslations } from '@groupfit/shared';
import { getStoredUser, clearStoredToken } from '@/lib/auth';
import { ROLES } from '@groupfit/shared';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROUTES, getProfileLink } from '../routes';
import { CustomerLayout } from '../CustomerLayout';
import { TrainerLayout } from '../TrainerLayout';
import { customerApi, trainerApi } from '@/lib/api';

function CustomerDashboardContent() {
  const [loading, setLoading] = useState(true);
  const [todaySessions, setTodaySessions] = useState<unknown[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<unknown[]>([]);
  const [activities, setActivities] = useState<unknown[]>([]);
  const [favouriteActivities, setFavouriteActivities] = useState<unknown[]>([]);
  const [trending, setTrending] = useState<unknown[]>([]);
  const [favouriteTrainers, setFavouriteTrainers] = useState<unknown[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [todayRes, upcomingRes, allActRes, favActRes, trendRes, favTrainRes] = await Promise.all([
          customerApi.todaysessionlist(),
          customerApi.customerSessionList({ status: 'Upcoming' }),
          customerApi.fetchAllActivity(),
          customerApi.fetchFavouriteActivities(),
          customerApi.GetTrendingActivities(),
          customerApi.fetchFavouriteTrainers(),
        ]);
        if (cancelled) return;
        const getData = (r: { data?: unknown }) => (r?.data as Record<string, unknown>) ?? {};
        setTodaySessions((getData(todayRes).todaysessionlist as unknown[]) ?? []);
        setUpcomingSessions((getData(upcomingRes).customerSessionList as unknown[]) ?? []);
        setActivities((getData(allActRes).activityList as unknown[]) ?? []);
        setFavouriteActivities((getData(favActRes).favouriteActivities as unknown[]) ?? []);
        setTrending((getData(trendRes).trendingActivities as unknown[]) ?? []);
        setFavouriteTrainers((getData(favTrainRes).favouriteTrainersList as unknown[]) ?? []);
      } catch {
        if (!cancelled) {
          setTodaySessions([]);
          setUpcomingSessions([]);
          setActivities([]);
          setFavouriteActivities([]);
          setTrending([]);
          setFavouriteTrainers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const section = (
    title: string,
    seeAll: string,
    items: unknown[],
    emptyMsg: string,
    tall?: boolean
  ) => (
    <section className="gf-home__section">
      <div className="gf-home__section-head">
        <h2 className="gf-home__section-title">{title}</h2>
        <Link href={seeAll} className="gf-home__see-all">See all</Link>
      </div>
      <div className={`gf-home__empty ${tall ? 'gf-home__empty--tall' : ''}`}>
        {loading ? 'Loading…' : (items.length === 0 ? emptyMsg : `${items.length} item(s)`)}
      </div>
    </section>
  );

  return (
    <div className="gf-home__body">
      {section('Upcoming Sessions', ROUTES.sessions, todaySessions.length > 0 ? todaySessions : upcomingSessions, 'There are no sessions scheduled for today', true)}
      {section('Activities', ROUTES.activities, activities, 'There are no activities available')}
      {section('Favourites', ROUTES.activities, favouriteActivities, 'There are no favourited activities', true)}
      {section('Trending', ROUTES.activities, trending, 'There are no trending activities', true)}
      {section('My Trainers', ROUTES.trainers, favouriteTrainers, 'There are no favorited trainers')}
    </div>
  );
}

function TrainerDashboardContent() {
  const [loading, setLoading] = useState(true);
  const [todaySessions, setTodaySessions] = useState<unknown[]>([]);
  const [newSessions, setNewSessions] = useState<unknown[]>([]);
  const [earning, setEarning] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [todayRes, newRes, earnRes] = await Promise.all([
          trainerApi.todaySession(),
          trainerApi.trainerSessionNewList(),
          trainerApi.currentEarning(),
        ]);
        if (cancelled) return;
        const getData = (r: { data?: unknown }) => (r?.data as Record<string, unknown>) ?? {};
        setTodaySessions((getData(todayRes).todaySession as unknown[]) ?? []);
        setNewSessions((getData(newRes).trainerSessionNewList as unknown[]) ?? []);
        setEarning(getData(earnRes).currentEarning ?? null);
      } catch {
        if (!cancelled) setTodaySessions([]); setNewSessions([]); setEarning(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const amountStr = earning != null && typeof earning === 'object' && 'amount' in (earning as object)
    ? String((earning as Record<string, unknown>).amount)
    : earning != null ? String(earning) : '£0.00';

  return (
    <div className="gf-home__body">
      <section className="gf-home__section">
        <div className="gf-home__section-head">
          <h2 className="gf-home__section-title">Today&apos;s Sessions</h2>
          <Link href={ROUTES.sessions} className="gf-home__see-all">See all</Link>
        </div>
        <div className="gf-home__empty gf-home__empty--tall">
          {loading ? 'Loading…' : (todaySessions.length === 0 ? 'There are no sessions scheduled for today' : `${todaySessions.length} item(s)`)}
        </div>
      </section>
      <section className="gf-home__section">
        <div className="gf-home__section-head">
          <h2 className="gf-home__section-title">New Sessions</h2>
          <Link href={ROUTES.sessions} className="gf-home__see-all">See all</Link>
        </div>
        <div className="gf-home__empty gf-home__empty--tall">
          {loading ? 'Loading…' : (newSessions.length === 0 ? 'No new sessions' : `${newSessions.length} item(s)`)}
        </div>
      </section>
      <section className="gf-home__section">
        <div className="gf-home__section-head">
          <h2 className="gf-home__section-title">Earning</h2>
          <Link href={ROUTES.earning} className="gf-home__see-all">See all</Link>
        </div>
        <div className="gf-home__earning">
          <p className="gf-home__earning-label">Current month</p>
          <p className="gf-home__earning-value">{amountStr}</p>
        </div>
      </section>
    </div>
  );
}

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

  if (isTrainer) {
    return (
      <TrainerLayout>
        <header className="gf-home__header" style={{ marginBottom: 16 }}>
          <span className="gf-home__logo">GroupFit</span>
          <div className="gf-home__header-actions">
            <Link href={getProfileLink('/notifications')} className="gf-home__header-link" aria-label="Notifications">🔔</Link>
            <Link href={ROUTES.account} className="gf-home__avatar" aria-label="Account" />
          </div>
        </header>
        {user && (
          <p style={{ marginBottom: 16, color: 'var(--groupfit-grey)', fontSize: 14 }}>
            {user.name ?? user.email ?? user.sub} {user.role && `(${user.role})`}
          </p>
        )}
        <TrainerDashboardContent />
        <div className="gf-home__nav-links" style={{ marginTop: 16 }}>
          <Link href={ROUTES.profile}>{t.nav.profile}</Link>
          <Link href={ROUTES.account}>Account</Link>
          <button type="button" onClick={handleLogout} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'var(--groupfit-secondary)', cursor: 'pointer', fontWeight: 600 }}>Log out</button>
        </div>
      </TrainerLayout>
    );
  }

  return (
    <CustomerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <span className="gf-home__logo">GroupFit</span>
        <div className="gf-home__header-actions">
          <Link href={ROUTES.notifications} className="gf-home__header-link" aria-label="Notifications">🔔</Link>
          <Link href={ROUTES.account} className="gf-home__avatar" aria-label="Account" />
        </div>
      </header>
      {user && (
        <p style={{ marginBottom: 16, color: 'var(--groupfit-grey)', fontSize: 14 }}>
          {user.name ?? user.email ?? user.sub} {user.role && `(${user.role})`}
        </p>
      )}
      <CustomerDashboardContent />
      <div className="gf-home__nav-links" style={{ marginTop: 16 }}>
        <Link href={ROUTES.profile}>{t.nav.profile}</Link>
        <Link href={ROUTES.account}>Account</Link>
        <button type="button" onClick={handleLogout} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'var(--groupfit-secondary)', cursor: 'pointer', fontWeight: 600 }}>Log out</button>
      </div>
    </CustomerLayout>
  );
}

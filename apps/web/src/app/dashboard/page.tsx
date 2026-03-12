'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppLocale } from '@/hooks/useAppLocale';
import { useStoredUser, useStoredViewAs, clearStoredToken } from '@/lib/auth';
import { ROLES } from '@groupfit/shared';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROUTES, getProfileLink } from '../routes';
import { CustomerLayout } from '../CustomerLayout';
import { CustomerHeader } from '@/components/CustomerHeader';
import { TrainerLayout } from '../TrainerLayout';
import { api, customerApi, trainerApi } from '@/lib/api';
import { formatZero } from '@/lib/currency';

type ActivityItem = {
  id?: string;
  code?: string;
  name?: string;
  activityName?: string;
  logoUrl?: string | null;
};

type SessionItem = {
  id?: string;
  sessionId?: string;
  sessionName?: string;
  trainerName?: string;
  scheduledAt?: string;
};

type TrainerItem = {
  id?: string;
  trainerId?: string;
  name?: string;
  trainerName?: string;
};

function formatSessionDate(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = new Date();
    const isToday =
      d.getUTCDate() === now.getUTCDate() &&
      d.getUTCMonth() === now.getUTCMonth() &&
      d.getUTCFullYear() === now.getUTCFullYear();
    const dateStr = isToday
      ? 'Today'
      : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    const timeStr = d.toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr}, ${timeStr}`;
  } catch {
    return iso;
  }
}

const CARDS_PER_SLIDE = 2;
const CARD_WIDTH = 160;
const CARD_GAP = 14;
const SLIDE_WIDTH = CARD_WIDTH * CARDS_PER_SLIDE + CARD_GAP * (CARDS_PER_SLIDE - 1);

function ActivityCarouselSection({
  title,
  seeAllHref,
  items,
  loading,
  emptyMessage,
  detailHref,
  isCarousel,
}: {
  title: string;
  seeAllHref: string;
  items: ActivityItem[];
  loading: boolean;
  emptyMessage: string;
  /** When set, used for each item link instead of activity detail (e.g. category page). */
  detailHref?: (id: string) => string;
  /** When true, show dot navigation and full-width cards (one per slide). */
  isCarousel?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalSlides = isCarousel
    ? items.length
    : items.length > 0
      ? Math.ceil(items.length / CARDS_PER_SLIDE)
      : 0;

  const scrollToSlide = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const target = Math.max(0, Math.min(index, totalSlides - 1));
      const w = isCarousel ? el.clientWidth : SLIDE_WIDTH;
      el.scrollTo({ left: target * w, behavior: 'smooth' });
      setCurrentIndex(target);
    },
    [totalSlides, isCarousel]
  );

  useEffect(() => {
    if (!isCarousel || totalSlides <= 1) return;
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.clientWidth;
      const index = w > 0 ? Math.round(el.scrollLeft / w) : 0;
      const clamped = Math.max(0, Math.min(index, totalSlides - 1));
      setCurrentIndex(clamped);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [isCarousel, totalSlides]);

  if (loading) {
    return (
      <section className="gf-home__section">
        <div className="gf-home__section-head">
          <h2 className="gf-home__section-title">{title}</h2>
          <Link href={seeAllHref} className="gf-home__see-all">
            See all
          </Link>
        </div>
        <div className="gf-home__carousel gf-home__carousel--loading">
          <div className="gf-home__carousel-inner">
            {[1, 2, 3].map((i) => (
              <div key={i} className="gf-home__activity-card gf-home__activity-card--skeleton" />
            ))}
          </div>
        </div>
      </section>
    );
  }
  if (items.length === 0) {
    return (
      <section className="gf-home__section">
        <div className="gf-home__section-head">
          <h2 className="gf-home__section-title">{title}</h2>
          <Link href={seeAllHref} className="gf-home__see-all">
            See all
          </Link>
        </div>
        <div className="gf-home__empty gf-home__empty--with-cta">
          <p className="gf-home__empty-text">{emptyMessage}</p>
          <Link href={seeAllHref} className="gf-home__empty-cta">
            Explore activities
          </Link>
        </div>
      </section>
    );
  }
  return (
    <section className="gf-home__section">
      <div className="gf-home__section-head">
        <h2 className="gf-home__section-title">{title}</h2>
        <Link href={seeAllHref} className="gf-home__see-all">
          See all
        </Link>
      </div>
      <div
        ref={isCarousel ? scrollRef : undefined}
        className={`gf-home__carousel${isCarousel ? ' gf-home__carousel--with-dots gf-home__carousel--full-width' : ''}`}
      >
        <div className="gf-home__carousel-inner">
          {items.map((item, index) => {
            const id = item.id ?? item.code ?? String(index);
            const label = item.activityName ?? item.name ?? item.code ?? 'Activity';
            const href = detailHref ? detailHref(id) : ROUTES.activityDetail(id);
            const bgImage = item.logoUrl ? `url(${item.logoUrl})` : undefined;
            const placeholderGradient = `linear-gradient(135deg, var(--groupfit-blue-soft, #3b82f6) 0%, var(--groupfit-blue, #1d4ed8) 100%)`;
            return (
              <Link
                key={id}
                href={href}
                className="gf-home__activity-card"
                style={{
                  backgroundImage: bgImage ?? placeholderGradient,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <span className="gf-home__activity-card-label">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      {isCarousel && totalSlides > 1 && (
        <div className="gf-home__carousel-dots" role="tablist" aria-label={`${title} slides`}>
          {Array.from({ length: totalSlides }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={currentIndex === i}
              aria-label={`Go to slide ${i + 1} of ${totalSlides}`}
              className={`gf-home__carousel-dot${currentIndex === i ? ' gf-home__carousel-dot--active' : ''}`}
              onClick={() => scrollToSlide(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function UpcomingSessionsSection({
  sessions,
  loading,
  seeAllHref,
}: {
  sessions: SessionItem[];
  loading: boolean;
  seeAllHref: string;
}) {
  const displayList = sessions.slice(0, 3);
  if (loading) {
    return (
      <section className="gf-home__section">
        <div className="gf-home__section-head">
          <h2 className="gf-home__section-title">Upcoming</h2>
          <Link href={seeAllHref} className="gf-home__see-all">
            See all
          </Link>
        </div>
        <div className="gf-home__session-list">
          {[1, 2].map((i) => (
            <div key={i} className="gf-home__session-card gf-home__session-card--skeleton" />
          ))}
        </div>
      </section>
    );
  }
  if (sessions.length === 0) {
    return (
      <section className="gf-home__section">
        <div className="gf-home__section-head">
          <h2 className="gf-home__section-title">Upcoming</h2>
          <Link href={seeAllHref} className="gf-home__see-all">
            See all
          </Link>
        </div>
        <div className="gf-home__empty gf-home__empty--with-cta">
          <p className="gf-home__empty-text">No sessions booked yet</p>
          <p className="gf-home__empty-sub">
            Book a session with your favourite trainer or activity.
          </p>
          <Link href={seeAllHref} className="gf-home__empty-cta">
            View sessions
          </Link>
        </div>
      </section>
    );
  }
  return (
    <section className="gf-home__section">
      <div className="gf-home__section-head">
        <h2 className="gf-home__section-title">Upcoming</h2>
        <Link href={seeAllHref} className="gf-home__see-all">
          See all
        </Link>
      </div>
      <ul className="gf-home__session-list" aria-label="Upcoming sessions">
        {displayList.map((s) => {
          const id = s.id ?? s.sessionId;
          const href = id ? ROUTES.sessionDetail(id) : seeAllHref;
          return (
            <li key={id ?? Math.random()}>
              <Link href={href} className="gf-home__session-card">
                <span className="gf-home__session-card-title">{s.sessionName ?? 'Session'}</span>
                <span className="gf-home__session-card-meta">
                  {s.trainerName ? `${s.trainerName} · ` : ''}
                  {formatSessionDate(s.scheduledAt)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function MyTrainersSection({
  trainers,
  loading,
  seeAllHref,
}: {
  trainers: TrainerItem[];
  loading: boolean;
  seeAllHref: string;
}) {
  if (loading) {
    return (
      <section className="gf-home__section">
        <div className="gf-home__section-head">
          <h2 className="gf-home__section-title">My Trainers</h2>
          <Link href={seeAllHref} className="gf-home__see-all">
            See all
          </Link>
        </div>
        <div className="gf-home__empty gf-home__empty--tall">
          <p className="gf-home__empty-text">Loading…</p>
        </div>
      </section>
    );
  }
  if (trainers.length === 0) {
    return (
      <section className="gf-home__section">
        <div className="gf-home__section-head">
          <h2 className="gf-home__section-title">My Trainers</h2>
          <Link href={seeAllHref} className="gf-home__see-all">
            See all
          </Link>
        </div>
        <div className="gf-home__empty gf-home__empty--with-cta">
          <p className="gf-home__empty-text">No trainers yet</p>
          <p className="gf-home__empty-sub">Find and favourite trainers to book sessions with.</p>
          <Link href={seeAllHref} className="gf-home__empty-cta">
            Find trainers
          </Link>
        </div>
      </section>
    );
  }
  return (
    <section className="gf-home__section">
      <div className="gf-home__section-head">
        <h2 className="gf-home__section-title">My Trainers</h2>
        <Link href={seeAllHref} className="gf-home__see-all">
          See all
        </Link>
      </div>
      <ul className="gf-home__trainer-list" aria-label="Favourite trainers">
        {trainers.slice(0, 5).map((t) => {
          const id = t.id ?? t.trainerId;
          const name = t.trainerName ?? t.name ?? 'Trainer';
          const href = id ? ROUTES.trainerDetail(id) : seeAllHref;
          return (
            <li key={id ?? Math.random()}>
              <Link href={href} className="gf-home__trainer-card">
                <span className="gf-home__trainer-card-avatar" aria-hidden />
                <span className="gf-home__trainer-card-name">{name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CustomerDashboardContent({
  user,
}: {
  user: { name?: string | null; email?: string | null; sub?: string } | null;
}) {
  const [loading, setLoading] = useState(true);
  const [todaySessions, setTodaySessions] = useState<SessionItem[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<SessionItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [favouriteActivities, setFavouriteActivities] = useState<ActivityItem[]>([]);
  const [trending, setTrending] = useState<ActivityItem[]>([]);
  const [favouriteTrainers, setFavouriteTrainers] = useState<TrainerItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [todayRes, upcomingRes, allActRes, favActRes, trendRes, favTrainRes] =
          await Promise.all([
            customerApi.todaysessionlist(),
            customerApi.customerSessionList({ status: 'Upcoming' }),
            customerApi.fetchAllCategoryActivities(),
            customerApi.fetchFavouriteActivities(),
            customerApi.GetTrendingActivities(),
            customerApi.fetchFavouriteTrainers(),
          ]);
        if (cancelled) return;
        const getData = (r: { data?: unknown }) => (r?.data as Record<string, unknown>) ?? {};
        setTodaySessions((getData(todayRes).todaysessionlist as SessionItem[]) ?? []);
        setUpcomingSessions((getData(upcomingRes).customerSessionList as SessionItem[]) ?? []);
        setActivities((getData(allActRes).activityList as ActivityItem[]) ?? []);
        setFavouriteActivities((getData(favActRes).favouriteActivities as ActivityItem[]) ?? []);
        setTrending((getData(trendRes).trendingActivities as ActivityItem[]) ?? []);
        setFavouriteTrainers((getData(favTrainRes).favouriteTrainersList as TrainerItem[]) ?? []);
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
    return () => {
      cancelled = true;
    };
  }, []);

  const upcoming = todaySessions.length > 0 ? todaySessions : upcomingSessions;
  const firstName = user?.name?.split(/\s+/)[0] ?? user?.email ?? null;

  return (
    <div className="gf-home__body">
      <div className="gf-home__welcome">
        <h1 className="gf-home__welcome-title">
          {firstName ? `Hi, ${firstName}` : 'Welcome back'}
        </h1>
        <p className="gf-home__welcome-sub">Here’s what’s coming up.</p>
      </div>
      <UpcomingSessionsSection sessions={upcoming} loading={loading} seeAllHref={ROUTES.sessions} />
      <ActivityCarouselSection
        title="Activities"
        seeAllHref={ROUTES.activityCategories}
        items={activities}
        loading={loading}
        emptyMessage="No activities yet. Explore and add favourites."
        detailHref={ROUTES.activityCategoryDetail}
      />
      <ActivityCarouselSection
        title="Favourites"
        seeAllHref={ROUTES.activities}
        items={favouriteActivities}
        loading={loading}
        emptyMessage="No favourited activities. Add some from Activities."
      />
      <ActivityCarouselSection
        title="Trending"
        seeAllHref={ROUTES.activities}
        items={trending}
        loading={loading}
        emptyMessage="No trending activities right now."
        isCarousel
      />
      <MyTrainersSection
        trainers={favouriteTrainers}
        loading={loading}
        seeAllHref={ROUTES.trainers}
      />
    </div>
  );
}

function TrainerDashboardContent({
  user,
}: {
  user: { name?: string | null; email?: string | null; sub?: string } | null;
}) {
  const [loading, setLoading] = useState(true);
  const [todaySessions, setTodaySessions] = useState<SessionItem[]>([]);
  const [newSessions, setNewSessions] = useState<SessionItem[]>([]);
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
        setTodaySessions((getData(todayRes).todaySession as SessionItem[]) ?? []);
        setNewSessions((getData(newRes).trainerSessionNewList as SessionItem[]) ?? []);
        setEarning(getData(earnRes).currentEarning ?? null);
      } catch {
        if (!cancelled) setTodaySessions([]);
        setNewSessions([]);
        setEarning(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const amountStr =
    earning != null && typeof earning === 'object' && 'amount' in (earning as object)
      ? String((earning as Record<string, unknown>).amount)
      : earning != null
        ? String(earning)
        : formatZero((user as { countryCode?: string } | null)?.countryCode);

  const firstName = user?.name?.split(/\s+/)[0] ?? user?.email ?? null;
  const todayDisplay = todaySessions.slice(0, 3);
  const newDisplay = newSessions.slice(0, 3);

  return (
    <div className="gf-home__body">
      <div className="gf-home__welcome">
        <h1 className="gf-home__welcome-title">
          {firstName ? `Hi, ${firstName}` : 'Welcome back'}
        </h1>
        <p className="gf-home__welcome-sub">Here’s your day at a glance.</p>
      </div>
      <section className="gf-home__section">
        <div className="gf-home__section-head">
          <h2 className="gf-home__section-title">Today&apos;s Sessions</h2>
          <Link href={ROUTES.sessions} className="gf-home__see-all">
            See all
          </Link>
        </div>
        {loading ? (
          <div className="gf-home__session-list">
            {[1, 2].map((i) => (
              <div key={i} className="gf-home__session-card gf-home__session-card--skeleton" />
            ))}
          </div>
        ) : todaySessions.length === 0 ? (
          <div className="gf-home__empty gf-home__empty--with-cta">
            <p className="gf-home__empty-text">No sessions today</p>
            <p className="gf-home__empty-sub">New bookings will appear here.</p>
            <Link href={ROUTES.sessions} className="gf-home__empty-cta">
              View sessions
            </Link>
          </div>
        ) : (
          <ul className="gf-home__session-list" aria-label="Today's sessions">
            {todayDisplay.map((s) => {
              const id = s.id ?? s.sessionId;
              const href = id ? ROUTES.sessionDetail(id) : ROUTES.sessions;
              return (
                <li key={id ?? Math.random()}>
                  <Link href={href} className="gf-home__session-card">
                    <span className="gf-home__session-card-title">
                      {s.sessionName ?? 'Session'}
                    </span>
                    <span className="gf-home__session-card-meta">
                      {s.trainerName ? `${s.trainerName} · ` : ''}
                      {formatSessionDate(s.scheduledAt)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section className="gf-home__section">
        <div className="gf-home__section-head">
          <h2 className="gf-home__section-title">New Sessions</h2>
          <Link href={ROUTES.sessions} className="gf-home__see-all">
            See all
          </Link>
        </div>
        {loading ? (
          <div className="gf-home__session-list">
            {[1, 2].map((i) => (
              <div key={i} className="gf-home__session-card gf-home__session-card--skeleton" />
            ))}
          </div>
        ) : newSessions.length === 0 ? (
          <div className="gf-home__empty gf-home__empty--with-cta">
            <p className="gf-home__empty-text">No new sessions</p>
            <p className="gf-home__empty-sub">New requests will show up here.</p>
            <Link href={ROUTES.sessions} className="gf-home__empty-cta">
              View sessions
            </Link>
          </div>
        ) : (
          <ul className="gf-home__session-list" aria-label="New sessions">
            {newDisplay.map((s) => {
              const id = s.id ?? s.sessionId;
              const href = id ? ROUTES.sessionDetail(id) : ROUTES.sessions;
              return (
                <li key={id ?? Math.random()}>
                  <Link href={href} className="gf-home__session-card">
                    <span className="gf-home__session-card-title">
                      {s.sessionName ?? 'Session'}
                    </span>
                    <span className="gf-home__session-card-meta">
                      {s.trainerName ? `${s.trainerName} · ` : ''}
                      {formatSessionDate(s.scheduledAt)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section className="gf-home__section">
        <div className="gf-home__section-head">
          <h2 className="gf-home__section-title">Earning</h2>
          <Link href={ROUTES.earning} className="gf-home__see-all">
            See all
          </Link>
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
  const { user, mounted } = useStoredUser();
  const viewAs = useStoredViewAs();
  const { t } = useAppLocale(user?.locale ?? undefined);
  const isAdmin = user?.role === ROLES.ADMIN;

  // Admin without a chosen experience must choose first
  useEffect(() => {
    if (!mounted || !user) return;
    if (user.role === ROLES.ADMIN && !viewAs) {
      router.replace(ROUTES.chooseExperience);
    }
  }, [mounted, user, viewAs, router]);

  // When logged-in user hits dashboard, ensure API is reachable; else show server-unavailable
  useEffect(() => {
    if (!mounted || !user) return;
    let cancelled = false;
    api.get('/health').catch(() => {
      if (!cancelled) router.replace(ROUTES.serverUnavailable);
    });
    return () => {
      cancelled = true;
    };
  }, [mounted, user, router]);

  function handleLogout() {
    clearStoredToken();
    router.push('/login');
    router.refresh();
  }

  if (!mounted) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>Loading…</p>
      </div>
    );
  }
  if (!user) {
    return null;
  }
  // Admin must have chosen an experience; redirect is in useEffect
  if (user.role === ROLES.ADMIN && !viewAs) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>Loading…</p>
      </div>
    );
  }

  // Effective view: admin uses viewAs (customer/trainer); others use role
  const effectiveView =
    viewAs ?? (user?.role === ROLES.TRAINER || user?.role === ROLES.ADMIN ? 'trainer' : 'customer');
  const isTrainer = effectiveView === 'trainer';

  const switchExperienceLink = isAdmin ? (
    <Link
      href={ROUTES.chooseExperience}
      style={{ marginRight: 12, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
    >
      Switch experience
    </Link>
  ) : null;

  if (isTrainer) {
    return (
      <TrainerLayout>
        <header className="gf-home__header" style={{ marginBottom: 16 }}>
          <span className="gf-home__logo">GroupFit</span>
          <div className="gf-home__header-actions">
            <Link
              href={getProfileLink('/notifications')}
              className="gf-home__header-link"
              aria-label="Notifications"
            >
              🔔
            </Link>
          </div>
        </header>
        <TrainerDashboardContent user={user} />
      </TrainerLayout>
    );
  }

  return (
    <CustomerLayout>
      <CustomerHeader title="GroupFit" />
      <CustomerDashboardContent user={user} />
    </CustomerLayout>
  );
}

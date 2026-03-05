'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CustomerLayout } from '../CustomerLayout';
import { customerApi } from '@/lib/api';
import { ROUTES } from '../routes';

type ActivityItem = Record<string, unknown>;

export default function ActivitiesPage() {
  const [loading, setLoading] = useState(true);
  const [allActivities, setAllActivities] = useState<ActivityItem[]>([]);
  const [favourites, setFavourites] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [allRes, favRes] = await Promise.all([
          customerApi.fetchAllActivity(),
          customerApi.fetchFavouriteActivities(),
        ]);
        if (cancelled) return;
        const allData = (allRes?.data as Record<string, unknown>) ?? {};
        const favData = (favRes?.data as Record<string, unknown>) ?? {};
        setAllActivities((allData.activityList as ActivityItem[]) ?? []);
        setFavourites((favData.favouriteActivities as ActivityItem[]) ?? []);
      } catch {
        if (!cancelled) setAllActivities([]); setFavourites([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <CustomerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <span className="gf-home__logo">Activities</span>
        <div className="gf-home__header-actions">
          <Link href={ROUTES.notifications} className="gf-home__header-link" aria-label="Notifications">🔔</Link>
        </div>
      </header>
      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : (
        <>
          <section className="gf-home__section" style={{ marginBottom: 24 }}>
            <h2 className="gf-home__section-title">All activities</h2>
            {allActivities.length === 0 ? (
              <div className="gf-home__empty">No activities available.</div>
            ) : (
              <ul style={{ listStyle: 'none' }}>
                {allActivities.map((item, i) => {
                  const row = item as Record<string, unknown>;
                  const activityId = row.id ?? String(i);
                  return (
                    <li key={String(activityId)} className="gf-home__empty" style={{ marginBottom: 12 }}>
                      <Link href={ROUTES.activityDetail(String(activityId))} style={{ fontWeight: 600, color: 'inherit', textDecoration: 'none' }}>
                        {String(row.activityName ?? row.name ?? 'Activity')}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          <section className="gf-home__section">
            <h2 className="gf-home__section-title">Favourites</h2>
            {favourites.length === 0 ? (
              <div className="gf-home__empty">No favourite activities.</div>
            ) : (
              <ul style={{ listStyle: 'none' }}>
                {favourites.map((item, i) => {
                  const row = item as Record<string, unknown>;
                  const activityId = row.id ?? String(i);
                  return (
                    <li key={String(activityId)} className="gf-home__empty" style={{ marginBottom: 12 }}>
                      <Link href={ROUTES.activityDetail(String(activityId))} style={{ fontWeight: 600, color: 'inherit', textDecoration: 'none' }}>
                        {String(row.activityName ?? row.name ?? 'Activity')}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </CustomerLayout>
  );
}

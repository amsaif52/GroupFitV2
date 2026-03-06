'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CustomerLayout } from '../CustomerLayout';
import { customerApi } from '@/lib/api';
import { ROUTES } from '../routes';
import { useDefaultLocation } from '@/contexts/DefaultLocationContext';

type TrainerItem = Record<string, unknown>;

export default function TrainersPage() {
  const { defaultLocation } = useDefaultLocation();
  const [loading, setLoading] = useState(true);
  const [favourites, setFavourites] = useState<TrainerItem[]>([]);
  const [topRated, setTopRated] = useState<TrainerItem[]>([]);

  const hasLocationCoords =
    defaultLocation &&
    typeof defaultLocation.latitude === 'number' &&
    typeof defaultLocation.longitude === 'number';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const topBody = hasLocationCoords
          ? { latitude: defaultLocation!.latitude!, longitude: defaultLocation!.longitude! }
          : undefined;
        const [favRes, topRes] = await Promise.all([
          customerApi.favouriteTrainersList(),
          customerApi.topratedTrainersList(topBody),
        ]);
        if (cancelled) return;
        const favData = (favRes?.data as Record<string, unknown>) ?? {};
        const topData = (topRes?.data as Record<string, unknown>) ?? {};
        setFavourites((favData.favouriteTrainersList as TrainerItem[]) ?? []);
        setTopRated((topData.topratedTrainersList as TrainerItem[]) ?? []);
      } catch {
        if (!cancelled) {
          setFavourites([]);
          setTopRated([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    hasLocationCoords,
    defaultLocation?.id,
    defaultLocation?.latitude,
    defaultLocation?.longitude,
  ]);

  return (
    <CustomerLayout>
      <header
        className="gf-home__header"
        style={{
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span className="gf-home__logo">My Trainers</span>
        {defaultLocation ? (
          <Link
            href={ROUTES.locations}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--groupfit-secondary)',
              padding: '4px 10px',
              background: 'var(--groupfit-border-light)',
              borderRadius: 8,
            }}
          >
            📍 {defaultLocation.label}
          </Link>
        ) : null}
      </header>
      {defaultLocation && hasLocationCoords ? (
        <p style={{ fontSize: 13, color: 'var(--groupfit-grey)', marginBottom: 12 }}>
          Showing trainers at your default address
        </p>
      ) : null}
      {!defaultLocation ? (
        <p style={{ marginBottom: 12 }}>
          <Link
            href={ROUTES.locations}
            style={{ fontSize: 13, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
          >
            Set a default address
          </Link>{' '}
          to see trainers near you.
        </p>
      ) : null}

      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : (
        <>
          <section className="gf-home__section" style={{ marginBottom: 24 }}>
            <h2 className="gf-home__section-title">Favourite trainers</h2>
            {favourites.length === 0 ? (
              <div className="gf-home__empty">No favourite trainers.</div>
            ) : (
              <ul style={{ listStyle: 'none' }}>
                {favourites.map((item, i) => {
                  const row = item as Record<string, unknown>;
                  const trainerId = row.id ?? row.trainerId;
                  return (
                    <li
                      key={String(trainerId ?? i)}
                      className="gf-home__empty"
                      style={{ marginBottom: 12 }}
                    >
                      <Link
                        href={trainerId ? ROUTES.trainerDetail(String(trainerId)) : ROUTES.trainers}
                        style={{ fontWeight: 600, color: 'inherit', textDecoration: 'none' }}
                      >
                        {String(row.trainerName ?? row.name ?? 'Trainer')}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          <section className="gf-home__section">
            <h2 className="gf-home__section-title">
              {hasLocationCoords ? 'Trainers at your location' : 'Top rated'}
            </h2>
            {topRated.length === 0 ? (
              <div className="gf-home__empty">No trainers listed.</div>
            ) : (
              <ul style={{ listStyle: 'none' }}>
                {topRated.map((item, i) => {
                  const row = item as Record<string, unknown>;
                  const trainerId = row.id ?? row.trainerId;
                  return (
                    <li
                      key={String(trainerId ?? i)}
                      className="gf-home__empty"
                      style={{ marginBottom: 12 }}
                    >
                      <Link
                        href={trainerId ? ROUTES.trainerDetail(String(trainerId)) : ROUTES.trainers}
                        style={{ fontWeight: 600, color: 'inherit', textDecoration: 'none' }}
                      >
                        {String(row.trainerName ?? row.name ?? 'Trainer')}
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

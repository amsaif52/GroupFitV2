'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { CustomerLayout } from '../CustomerLayout';
import { CustomerHeader } from '@/components/CustomerHeader';
import { customerApi } from '@/lib/api';
import { ROUTES } from '../routes';
import { useDefaultLocation } from '@/contexts/DefaultLocationContext';

type ActivityItem = Record<string, unknown>;

const ACTIVITIES_DISCLAIMER_TEXT =
  'Activities shown here are types of training (e.g. Yoga, HIIT) offered by trainers. ' +
  'Setting a default address helps show activities and trainers near you. ' +
  'Favourite activities to quickly find trainers who offer them.';

function getActivityLabel(item: ActivityItem): string {
  return String(item.activityName ?? item.name ?? 'Activity');
}

function getActivityImageUrl(item: ActivityItem): string | null {
  const url = item.logoUrl ?? item.imageUrl ?? item.iconUrl;
  return typeof url === 'string' && url ? url : null;
}

function filterBySearch(items: ActivityItem[], query: string): ActivityItem[] {
  if (!query.trim()) return items;
  const q = query.trim().toLowerCase();
  return items.filter((item) => getActivityLabel(item).toLowerCase().includes(q));
}

export default function ActivitiesPage() {
  const { defaultLocation } = useDefaultLocation();
  const [loading, setLoading] = useState(true);
  const [allActivities, setAllActivities] = useState<ActivityItem[]>([]);
  const [favourites, setFavourites] = useState<ActivityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [disclaimerSeen, setDisclaimerSeen] = useState<boolean | null>(null);

  const hasLocationCoords =
    defaultLocation &&
    typeof defaultLocation.latitude === 'number' &&
    typeof defaultLocation.longitude === 'number';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const allPromise = hasLocationCoords
          ? customerApi.activitiesAtLocation({
              latitude: defaultLocation!.latitude!,
              longitude: defaultLocation!.longitude!,
            })
          : customerApi.fetchAllActivity();
        const [allRes, favRes] = await Promise.all([
          allPromise,
          customerApi.fetchFavouriteActivities(),
        ]);
        if (cancelled) return;
        const allData = (allRes?.data as Record<string, unknown>) ?? {};
        const favData = (favRes?.data as Record<string, unknown>) ?? {};
        setAllActivities((allData.customerActivityList as ActivityItem[]) ?? []);
        setFavourites((favData.favouriteActivities as ActivityItem[]) ?? []);
      } catch {
        if (!cancelled) setAllActivities([]);
        setFavourites([]);
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await customerApi.getToastActivitiesDisclaimer();
        if (cancelled) return;
        const data = res?.data as { seen?: boolean } | undefined;
        setDisclaimerSeen(data?.seen ?? false);
        if (!data?.seen) setModalOpen(true);
      } catch {
        if (!cancelled) setDisclaimerSeen(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredFavourites = useMemo(
    () => filterBySearch(favourites, searchQuery),
    [favourites, searchQuery]
  );
  const filteredAll = useMemo(
    () => filterBySearch(allActivities, searchQuery),
    [allActivities, searchQuery]
  );

  async function handleDismissModal() {
    try {
      await customerApi.setToastActivitiesDisclaimer();
      setDisclaimerSeen(true);
      setModalOpen(false);
    } catch {
      setModalOpen(false);
    }
  }

  return (
    <CustomerLayout>
      <CustomerHeader title="Activities" />
      {defaultLocation && hasLocationCoords ? (
        <p style={{ fontSize: 13, color: 'var(--groupfit-grey)', marginBottom: 12 }}>
          Showing activities at your selected location
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
          to see activities near you.
        </p>
      ) : null}

      {!loading && (
        <div className="gf-activities__search-row">
          <input
            type="search"
            placeholder="Search activities…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="gf-activities__search-input"
            aria-label="Search activities"
          />
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="gf-activities__info-btn"
            aria-label="Show activities disclaimer"
            title="About this page"
          >
            ℹ️
          </button>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : (
        <>
          <section className="gf-home__section" style={{ marginBottom: 24 }}>
            <h2 className="gf-home__section-title">Favourites</h2>
            {filteredFavourites.length === 0 ? (
              <div className="gf-home__empty">
                {searchQuery.trim()
                  ? 'No favourite activities match your search.'
                  : 'No favourite activities.'}
              </div>
            ) : (
              <ul className="gf-activities__thumb-list">
                {filteredFavourites.map((item, i) => {
                  const row = item as Record<string, unknown>;
                  const activityId = row.id ?? row.code ?? String(i);
                  const label = getActivityLabel(row);
                  const imageUrl = getActivityImageUrl(row);
                  const bgImage = imageUrl ? `url(${imageUrl})` : undefined;
                  const placeholderGradient =
                    'linear-gradient(135deg, var(--groupfit-blue-soft, #3b82f6) 0%, var(--groupfit-blue, #1d4ed8) 100%)';
                  return (
                    <li key={String(activityId)} className="gf-activities__thumb-item">
                      <Link
                        href={ROUTES.activityDetail(String(activityId))}
                        className="gf-activities__thumbnail"
                        style={{
                          backgroundImage: bgImage ?? placeholderGradient,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <span className="gf-activities__thumbnail-label">{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          <section className="gf-home__section">
            <h2 className="gf-home__section-title">
              {hasLocationCoords ? 'Activities at your location' : 'Pick The Right Fit'}
            </h2>
            {filteredAll.length === 0 ? (
              <div className="gf-home__empty">
                {searchQuery.trim()
                  ? 'No activities match your search.'
                  : 'No activities available.'}
              </div>
            ) : (
              <ul className="gf-activities__thumb-list">
                {filteredAll.map((item, i) => {
                  const row = item as Record<string, unknown>;
                  const activityId = row.id ?? row.code ?? String(i);
                  const label = getActivityLabel(row);
                  const imageUrl = getActivityImageUrl(row);
                  const bgImage = imageUrl ? `url(${imageUrl})` : undefined;
                  const placeholderGradient =
                    'linear-gradient(135deg, var(--groupfit-blue-soft, #3b82f6) 0%, var(--groupfit-blue, #1d4ed8) 100%)';
                  return (
                    <li key={String(activityId)} className="gf-activities__thumb-item">
                      <Link
                        href={ROUTES.activityDetail(String(activityId))}
                        className="gf-activities__thumbnail"
                        style={{
                          backgroundImage: bgImage ?? placeholderGradient,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <span className="gf-activities__thumbnail-label">{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}

      {modalOpen && (
        <div
          className="gf-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gf-activities-disclaimer-title"
        >
          <div className="gf-modal">
            <h2 id="gf-activities-disclaimer-title" className="gf-modal__title">
              About activities
            </h2>
            <p className="gf-modal__body">{ACTIVITIES_DISCLAIMER_TEXT}</p>
            <div className="gf-modal__actions">
              <button
                type="button"
                onClick={handleDismissModal}
                className="gf-button gf-button--primary gf-button--md"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}

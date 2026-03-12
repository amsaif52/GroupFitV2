'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CustomerLayout } from '../../CustomerLayout';
import { customerApi } from '@/lib/api';
import { formatPriceCents } from '@/lib/currency';
import { ROUTES } from '../../routes';

type ActivityDetail = Record<string, unknown>;

export default function ActivityDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ActivityDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [favouriteLoading, setFavouriteLoading] = useState(false);

  const activityCode =
    detail && typeof detail.code === 'string'
      ? detail.code
      : detail && typeof detail.id === 'string'
        ? detail.id
        : '';

  const loadActivity = useCallback(() => {
    if (id === undefined) return;
    let cancelled = false;
    customerApi
      .viewActivity(id)
      .then((res) => {
        if (cancelled) return;
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Not found'));
          setDetail(null);
        } else {
          setDetail(data ?? null);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load activity');
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (id === undefined) {
      setLoading(false);
      return;
    }
    loadActivity();
  }, [id, loadActivity]);

  useEffect(() => {
    if (!activityCode || loading) return;
    let cancelled = false;
    customerApi
      .fetchFavouriteActivities()
      .then((res) => {
        if (cancelled) return;
        const data = res?.data as
          | { favouriteActivities?: { code?: string; id?: string }[] }
          | undefined;
        const list = data?.favouriteActivities ?? [];
        const fav = list.some((a) => (a.code ?? a.id) === activityCode);
        setIsFavourite(fav);
      })
      .catch(() => {
        if (!cancelled) setIsFavourite(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activityCode, loading]);

  async function toggleFavourite() {
    if (!activityCode || favouriteLoading) return;
    setFavouriteLoading(true);
    const code = String(activityCode).toLowerCase();
    try {
      if (isFavourite) {
        await customerApi.removeFavouriteActivity(code);
        setIsFavourite(false);
      } else {
        await customerApi.addFavouriteActivity(code);
        setIsFavourite(true);
      }
    } finally {
      setFavouriteLoading(false);
    }
  }

  if (id === undefined) {
    return (
      <CustomerLayout>
        <p style={{ color: 'var(--groupfit-grey)' }}>Invalid activity.</p>
        <Link
          href={ROUTES.activities}
          style={{
            marginTop: 16,
            display: 'inline-block',
            color: 'var(--groupfit-secondary)',
            fontWeight: 600,
          }}
        >
          ← Back to activities
        </Link>
      </CustomerLayout>
    );
  }

  const name = detail ? String(detail.activityName ?? detail.name ?? 'Activity') : '';
  const description = detail ? String(detail.description ?? '') : '';
  const logoUrl = detail && typeof detail.logoUrl === 'string' ? detail.logoUrl : null;
  const defaultPriceCents =
    detail && typeof detail.defaultPriceCents === 'number' ? detail.defaultPriceCents : undefined;
  const priceStr = formatPriceCents(defaultPriceCents ?? null);
  const bookingHref = activityCode
    ? `${ROUTES.trainers}?activity=${encodeURIComponent(activityCode)}`
    : ROUTES.trainers;

  return (
    <CustomerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <Link
          href={ROUTES.activities}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Activities
        </Link>
      </header>

      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : error ? (
        <div className="gf-home__empty">
          <p>{error}</p>
          <Link
            href={ROUTES.activities}
            style={{
              marginTop: 16,
              display: 'inline-block',
              color: 'var(--groupfit-secondary)',
              fontWeight: 600,
            }}
          >
            ← Back to activities
          </Link>
        </div>
      ) : detail ? (
        <div className="gf-activity-detail">
          <div
            className="gf-activity-detail__hero"
            style={{
              backgroundImage: logoUrl
                ? `url(${logoUrl})`
                : 'linear-gradient(135deg, var(--groupfit-blue-soft, #3b82f6) 0%, var(--groupfit-blue, #1d4ed8) 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <button
              type="button"
              onClick={toggleFavourite}
              disabled={favouriteLoading}
              className="gf-activity-detail__favourite"
              aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
              title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
            >
              {isFavourite ? '❤️' : '🤍'}
            </button>
          </div>

          <h1 className="gf-activity-detail__name">{name}</h1>
          <p className="gf-activity-detail__price">{priceStr}</p>
          {description ? <p className="gf-activity-detail__description">{description}</p> : null}

          <div className="gf-activity-detail__actions">
            <Link
              href={bookingHref}
              className="gf-button gf-button--primary gf-button--md gf-button--full"
            >
              Create booking
            </Link>
          </div>

          <Link href={ROUTES.activities} className="gf-activity-detail__back">
            ← Back to activities
          </Link>
        </div>
      ) : null}
    </CustomerLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CustomerLayout } from '../../CustomerLayout';
import { customerApi } from '@/lib/api';
import { ROUTES } from '../../routes';

type ActivityItem = Record<string, unknown>;

function getActivityLabel(item: ActivityItem): string {
  return String(item.activityName ?? item.name ?? 'Activity');
}

function getActivityImageUrl(item: ActivityItem): string | null {
  const url = item.logoUrl ?? item.imageUrl ?? item.iconUrl;
  return typeof url === 'string' && url ? url : null;
}

export default function ActivityCategoryDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>('');
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    customerApi
      .fetchActivitiesByCategory({ categoryId: id })
      .then((res) => {
        if (cancelled) return;
        const data = (res?.data as Record<string, unknown>) ?? {};
        setCategoryName(String(data.categoryName ?? 'Category'));
        setActivities((data.activityList as ActivityItem[]) ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setCategoryName('');
          setActivities([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) {
    return (
      <CustomerLayout>
        <p style={{ color: 'var(--groupfit-grey)' }}>Invalid category.</p>
        <Link
          href={ROUTES.activityCategories}
          style={{
            marginTop: 16,
            display: 'inline-block',
            color: 'var(--groupfit-secondary)',
            fontWeight: 600,
          }}
        >
          ← Activity categories
        </Link>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <Link
          href={ROUTES.activityCategories}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Activity categories
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>
          {loading ? 'Loading…' : categoryName || 'Category'}
        </h1>
      </header>

      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : activities.length === 0 ? (
        <div className="gf-home__empty">
          <p>No activities in this category yet.</p>
          <Link
            href={ROUTES.activityCategories}
            className="gf-home__empty-cta"
            style={{ marginTop: 12 }}
          >
            View all categories
          </Link>
        </div>
      ) : (
        <ul className="gf-activities__thumb-list">
          {activities.map((item, i) => {
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
    </CustomerLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CustomerLayout } from '../CustomerLayout';
import { customerApi } from '@/lib/api';
import { ROUTES } from '../routes';

type CategoryItem = Record<string, unknown>;

function getCategoryLabel(item: CategoryItem): string {
  return String(item.activityName ?? item.name ?? 'Category');
}

function getCategoryImageUrl(item: CategoryItem): string | null {
  const url = item.logoUrl ?? item.iconUrl;
  return typeof url === 'string' && url ? url : null;
}

export default function ActivityCategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    customerApi
      .fetchActivityCategories()
      .then((res) => {
        if (cancelled) return;
        const data = (res?.data as Record<string, unknown>) ?? {};
        setCategories((data.activityCategories as CategoryItem[]) ?? []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CustomerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <Link
          href={ROUTES.dashboard}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Dashboard
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>Activity categories</h1>
        <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginTop: 4 }}>
          Choose a category to see all activities in it.
        </p>
      </header>

      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : categories.length === 0 ? (
        <div className="gf-home__empty">
          <p>No activity categories available.</p>
          <Link href={ROUTES.activities} className="gf-home__empty-cta" style={{ marginTop: 12 }}>
            Browse all activities
          </Link>
        </div>
      ) : (
        <ul className="gf-activities__thumb-list">
          {categories.map((item, i) => {
            const row = item as Record<string, unknown>;
            const categoryId = row.id ?? String(i);
            const label = getCategoryLabel(row);
            const imageUrl = getCategoryImageUrl(row);
            const bgImage = imageUrl ? `url(${imageUrl})` : undefined;
            const placeholderGradient =
              'linear-gradient(135deg, var(--groupfit-blue-soft, #3b82f6) 0%, var(--groupfit-blue, #1d4ed8) 100%)';
            return (
              <li key={String(categoryId)} className="gf-activities__thumb-item">
                <Link
                  href={ROUTES.activityCategoryDetail(String(categoryId))}
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

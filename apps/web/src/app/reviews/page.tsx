'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrainerLayout } from '../TrainerLayout';
import { trainerApi } from '@/lib/api';
import { ROUTES } from '../routes';

type ReviewItem = {
  id: string;
  trainerId: string;
  customerId: string;
  customerName?: string;
  sessionId?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
};

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<ReviewItem[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([trainerApi.FetchReviews(), trainerApi.getTrainerAvgRating()])
      .then(([reviewsRes, ratingRes]) => {
        if (cancelled) return;
        const revData = reviewsRes?.data as Record<string, unknown> | undefined;
        const ratData = ratingRes?.data as Record<string, unknown> | undefined;
        if (revData?.mtype === 'error') {
          setError(String(revData.message ?? 'Failed to load reviews'));
          setList([]);
        } else {
          const revList = (revData?.FetchReviews ?? revData?.list) as ReviewItem[] | undefined;
          setList(revList ?? []);
          setError(null);
        }
        if (ratData?.mtype === 'success') {
          setAvgRating(typeof ratData.rating === 'number' ? ratData.rating : 0);
          setReviewCount(typeof ratData.reviewCount === 'number' ? ratData.reviewCount : 0);
        } else {
          setAvgRating(0);
          setReviewCount(0);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load reviews');
          setList([]);
          setAvgRating(0);
          setReviewCount(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <TrainerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <span className="gf-home__logo">Reviews</span>
      </header>

      <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 16 }}>
        Reviews from customers after sessions. You cannot reply or delete them here.
      </p>

      <Link href={ROUTES.dashboard} style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600, marginBottom: 16, display: 'inline-block' }}>
        ← Dashboard
      </Link>

      {error && <p style={{ color: '#c00', marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : (
        <>
          {(avgRating != null || reviewCount > 0) && (
            <div style={{ marginBottom: 24, padding: 20, border: '1px solid var(--groupfit-border-light)', borderRadius: 8, background: 'var(--groupfit-bg-subtle, #f8f9fa)' }}>
              <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
                {avgRating != null ? avgRating.toFixed(1) : '—'}
              </div>
              <div style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </div>
            </div>
          )}

          {list.length === 0 ? (
            <div className="gf-home__empty">No reviews yet. They appear here after customers rate completed sessions.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {list.map((row) => (
                <li
                  key={row.id}
                  style={{
                    padding: 16,
                    marginBottom: 12,
                    border: '1px solid var(--groupfit-border-light)',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{row.customerName ?? 'Customer'}</div>
                      <div style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 6 }}>
                        {'★'.repeat(Math.min(5, Math.round(row.rating)))}{'☆'.repeat(5 - Math.min(5, Math.round(row.rating)))} {row.rating}
                      </div>
                      {row.comment && <p style={{ fontSize: 14, margin: 0 }}>{row.comment}</p>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--groupfit-grey)' }}>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </TrainerLayout>
  );
}

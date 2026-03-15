'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CustomerLayout } from '../../CustomerLayout';
import { CustomerHeader } from '@/components/CustomerHeader';
import { customerApi } from '@/lib/api';
import { ROUTES } from '../../routes';
import { useDefaultLocation } from '@/contexts/DefaultLocationContext';

type TrainerDetail = {
  trainerName?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string | null;
  about?: string | null;
  yearsExperience?: number | null;
  languageSpoken?: string | null;
  socialLinks?: {
    facebookId?: string | null;
    instagramId?: string | null;
    tiktokId?: string | null;
    twitterId?: string | null;
    youtubeId?: string | null;
  } | null;
  additionalImages?: { id: string; imageUrl: string }[];
  specializations?: string[];
  sessionsCompleted?: number;
  rating?: number;
  reviewCount?: number;
  [key: string]: unknown;
};

const FALLBACK_ACTIVITIES = ['Yoga', 'HIIT', 'Strength', 'Cardio', 'General Fitness'];

function StarRating({ rating, reviewCount }: { rating?: number; reviewCount?: number }) {
  const value = rating ?? 0;
  const count = reviewCount ?? 0;
  const full = Math.floor(value);
  const half = value - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {[...Array(full)].map((_, i) => (
        <span key={`f-${i}`} aria-hidden style={{ color: '#f5a623' }}>
          ★
        </span>
      ))}
      {half ? (
        <span aria-hidden style={{ color: '#f5a623' }}>
          ★
        </span>
      ) : null}
      {[...Array(empty)].map((_, i) => (
        <span key={`e-${i}`} aria-hidden style={{ color: '#ddd' }}>
          ★
        </span>
      ))}
      <span style={{ fontSize: 13, color: 'var(--groupfit-grey)', marginLeft: 4 }}>
        {count > 0 ? `(${count} ${count === 1 ? 'review' : 'reviews'})` : 'No reviews'}
      </span>
    </span>
  );
}

function SocialLinks({ socialLinks }: { socialLinks: TrainerDetail['socialLinks'] }) {
  if (!socialLinks) return null;
  const links: { key: string; label: string; url: string | null }[] = [
    {
      key: 'facebook',
      label: 'Facebook',
      url: socialLinks.facebookId ? `https://facebook.com/${socialLinks.facebookId}` : null,
    },
    {
      key: 'instagram',
      label: 'Instagram',
      url: socialLinks.instagramId ? `https://instagram.com/${socialLinks.instagramId}` : null,
    },
    {
      key: 'tiktok',
      label: 'TikTok',
      url: socialLinks.tiktokId ? `https://tiktok.com/@${socialLinks.tiktokId}` : null,
    },
    {
      key: 'twitter',
      label: 'X',
      url: socialLinks.twitterId ? `https://twitter.com/${socialLinks.twitterId}` : null,
    },
    {
      key: 'youtube',
      label: 'YouTube',
      url: socialLinks.youtubeId ? `https://youtube.com/${socialLinks.youtubeId}` : null,
    },
  ].filter((l) => l.url);
  if (links.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {links.map((l) => (
        <a
          key={l.key}
          href={l.url!}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--groupfit-secondary)',
            textDecoration: 'none',
          }}
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}

export default function TrainerDetailPage() {
  const params = useParams();
  const { defaultLocation } = useDefaultLocation();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<TrainerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showBook, setShowBook] = useState(false);
  const [bookDate, setBookDate] = useState('');
  const [bookActivity, setBookActivity] = useState('');
  const [bookLoading, setBookLoading] = useState(false);
  const [bookSuccess, setBookSuccess] = useState<string | null>(null);

  const carouselImages = useMemo(() => {
    if (!detail) return [];
    const list: string[] = [];
    if (detail.avatarUrl) list.push(detail.avatarUrl);
    (detail.additionalImages ?? []).forEach((img) => list.push(img.imageUrl));
    return list;
  }, [detail]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Missing trainer ID');
      return;
    }
    let cancelled = false;
    customerApi
      .viewTrainer(id)
      .then((res) => {
        if (cancelled) return;
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Not found'));
          setDetail(null);
        } else {
          setDetail(data as TrainerDetail);
          setError(null);
          setCarouselIndex(0);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load trainer');
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

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !bookDate.trim()) return;
    setBookLoading(true);
    setBookSuccess(null);
    const scheduledAt = new Date(bookDate).toISOString();
    customerApi
      .addSession(id, scheduledAt, bookActivity.trim() || undefined)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success' && data?.sessionId) {
          setBookSuccess(String(data.sessionId));
          setShowBook(false);
          setBookDate('');
          setBookActivity('');
        } else {
          setError(String(data?.message ?? 'Failed to book session'));
        }
      })
      .catch(() => setError('Failed to book session'))
      .finally(() => setBookLoading(false));
  };

  const activityOptions = (
    detail?.specializations?.length ? detail.specializations : FALLBACK_ACTIVITIES
  ) as string[];

  if (!id) {
    return (
      <CustomerLayout>
        <p style={{ color: 'var(--groupfit-grey)' }}>Invalid trainer.</p>
        <Link
          href={ROUTES.account}
          style={{
            marginTop: 16,
            display: 'inline-block',
            color: 'var(--groupfit-secondary)',
            fontWeight: 600,
          }}
        >
          ← My Public Profile
        </Link>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <CustomerHeader
        title="Trainer"
        backLink={
          <Link
            href={ROUTES.account}
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.95)',
              fontWeight: 600,
              marginRight: 12,
            }}
          >
            ← My Public Profile
          </Link>
        }
      />
      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : error && !bookSuccess ? (
        <div className="gf-home__empty">
          <p>{error}</p>
          <Link
            href={ROUTES.account}
            style={{
              marginTop: 16,
              display: 'inline-block',
              color: 'var(--groupfit-secondary)',
              fontWeight: 600,
            }}
          >
            ← My Public Profile
          </Link>
        </div>
      ) : detail ? (
        <div style={{ textAlign: 'left', paddingBottom: 24 }}>
          {/* Carousel */}
          {carouselImages.length > 0 ? (
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 600,
                margin: '0 auto 20px',
                aspectRatio: '4/3',
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: 'var(--groupfit-border-light)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  height: '100%',
                  transform: `translateX(-${carouselIndex * 100}%)`,
                  transition: 'transform 0.25s ease',
                }}
              >
                {carouselImages.map((src, i) => (
                  <div
                    key={i}
                    style={{
                      flex: '0 0 100%',
                      height: '100%',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={src}
                      alt={i === 0 ? 'Trainer photo' : `Gallery ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
              {carouselImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setCarouselIndex((p) => (p === 0 ? carouselImages.length - 1 : p - 1))
                    }
                    aria-label="Previous image"
                    style={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      border: 'none',
                      background: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 18,
                    }}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCarouselIndex((p) => (p === carouselImages.length - 1 ? 0 : p + 1))
                    }
                    aria-label="Next image"
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      border: 'none',
                      background: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 18,
                    }}
                  >
                    ›
                  </button>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      left: 0,
                      right: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    {carouselImages.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Go to image ${i + 1}`}
                        onClick={() => setCarouselIndex(i)}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          border: 'none',
                          background: i === carouselIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                maxWidth: 600,
                margin: '0 auto 20px',
                aspectRatio: '4/3',
                borderRadius: 12,
                backgroundColor: 'var(--groupfit-border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--groupfit-grey)',
                fontSize: 14,
              }}
            >
              No photo
            </div>
          )}

          <div style={{ padding: '0 16px' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              {String(detail.trainerName ?? detail.name ?? 'Trainer')}
            </h1>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                marginBottom: 16,
                fontSize: 14,
                color: 'var(--groupfit-grey)',
              }}
            >
              {detail.yearsExperience != null ? (
                <span>
                  {detail.yearsExperience} {detail.yearsExperience === 1 ? 'year' : 'years'}{' '}
                  experience
                </span>
              ) : (
                <span>Years experience: No data</span>
              )}
              {(detail.sessionsCompleted ?? 0) > 0 ? (
                <span>{detail.sessionsCompleted} sessions completed</span>
              ) : (
                <span>Sessions completed: No data</span>
              )}
              <StarRating rating={detail.rating} reviewCount={detail.reviewCount} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Link
                href={ROUTES.trainers}
                style={{ fontSize: 14, fontWeight: 600, color: 'var(--groupfit-secondary)' }}
              >
                ← Read all trainers
              </Link>
            </div>

            <section style={{ marginBottom: 20 }}>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: 'var(--groupfit-grey)',
                }}
              >
                Social
              </h2>
              {detail.socialLinks &&
              (detail.socialLinks.facebookId ||
                detail.socialLinks.instagramId ||
                detail.socialLinks.tiktokId ||
                detail.socialLinks.twitterId ||
                detail.socialLinks.youtubeId) ? (
                <SocialLinks socialLinks={detail.socialLinks} />
              ) : (
                <p style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>No data</p>
              )}
            </section>

            <section style={{ marginBottom: 20 }}>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: 'var(--groupfit-grey)',
                }}
              >
                About
              </h2>
              {detail.about ? (
                <p style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {detail.about}
                </p>
              ) : (
                <p style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>No data</p>
              )}
            </section>

            <section style={{ marginBottom: 20 }}>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: 'var(--groupfit-grey)',
                }}
              >
                Specializations
              </h2>
              {detail.specializations && detail.specializations.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {detail.specializations.map((s) => (
                    <span
                      key={s}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 20,
                        background: 'var(--groupfit-border-light)',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>No data</p>
              )}
            </section>

            <section style={{ marginBottom: 20 }}>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: 'var(--groupfit-grey)',
                }}
              >
                Language
              </h2>
              {detail.languageSpoken ? (
                <p style={{ fontSize: 14 }}>{detail.languageSpoken}</p>
              ) : (
                <p style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>No data</p>
              )}
            </section>

            {bookSuccess && (
              <div
                style={{
                  marginBottom: 20,
                  padding: 12,
                  background: 'var(--groupfit-border-light)',
                  borderRadius: 8,
                }}
              >
                <p style={{ fontWeight: 600, color: 'var(--groupfit-secondary)' }}>
                  Session booked!
                </p>
                <Link
                  href={ROUTES.sessionDetail(bookSuccess)}
                  style={{ fontSize: 14, fontWeight: 600, color: 'var(--groupfit-secondary)' }}
                >
                  View session →
                </Link>
                {' · '}
                <Link
                  href={ROUTES.sessions}
                  style={{ fontSize: 14, fontWeight: 600, color: 'var(--groupfit-secondary)' }}
                >
                  My sessions
                </Link>
              </div>
            )}

            {!showBook ? (
              <button
                type="button"
                onClick={() => setShowBook(true)}
                style={{
                  marginTop: 8,
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--groupfit-secondary)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Book a session
              </button>
            ) : (
              <form
                onSubmit={handleBookSubmit}
                style={{
                  marginTop: 16,
                  padding: 16,
                  border: '1px solid var(--groupfit-border-light)',
                  borderRadius: 8,
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Book a session</h3>
                {defaultLocation && (
                  <div
                    style={{
                      marginBottom: 12,
                      padding: 10,
                      background: 'var(--groupfit-border-light)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>
                      📍 Using default address: {defaultLocation.label}
                    </span>
                    <Link
                      href={ROUTES.locations}
                      style={{ fontSize: 13, fontWeight: 600, color: 'var(--groupfit-secondary)' }}
                    >
                      Change location
                    </Link>
                  </div>
                )}
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                  Date & time
                </label>
                <input
                  type="datetime-local"
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                  required
                  style={{
                    padding: 8,
                    width: '100%',
                    maxWidth: 280,
                    marginBottom: 12,
                    borderRadius: 6,
                    border: '1px solid var(--groupfit-border-light)',
                  }}
                />
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                  Activity (optional)
                </label>
                <select
                  value={bookActivity}
                  onChange={(e) => setBookActivity(e.target.value)}
                  style={{
                    padding: 8,
                    width: '100%',
                    maxWidth: 280,
                    marginBottom: 16,
                    borderRadius: 6,
                    border: '1px solid var(--groupfit-border-light)',
                  }}
                >
                  <option value="">—</option>
                  {activityOptions.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="submit"
                    disabled={bookLoading}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'var(--groupfit-secondary)',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: bookLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {bookLoading ? 'Booking…' : 'Book session'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBook(false);
                      setBookDate('');
                      setBookActivity('');
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: '1px solid var(--groupfit-grey)',
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </CustomerLayout>
  );
}

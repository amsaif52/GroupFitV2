'use client';

import Link from 'next/link';
import { getTranslations } from '@groupfit/shared';
import { getProfileLink } from '../routes';

const PRIVACY_URL = 'https://groupfitapp.com/app-privacy-policy/';
const TERMS_URL = 'https://groupfitapp.com/app-user-terms-and-condition/';

export function ProfileLink({
  href,
  external,
  children,
  onClick,
}: {
  href?: string;
  external?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const content = children;
  if (onClick) {
    return (
      <button type="button" className="gf-profile__row" onClick={onClick}>
        {content}
      </button>
    );
  }
  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="gf-profile__row">
        {content}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className="gf-profile__row">
        {content}
      </Link>
    );
  }
  return <div className="gf-profile__row">{content}</div>;
}

export function CustomerProfileContent({
  user,
  onLogout,
  t,
}: {
  user: { name?: string; email?: string; sub?: string };
  onLogout: () => void;
  t: ReturnType<typeof getTranslations>;
}) {
  const displayName = user.name || user.email || user.sub || '';

  return (
    <div className="gf-profile">
      <div className="gf-profile__header-row">
        <h1 className="gf-profile__name">{displayName}</h1>
      </div>

      <div className="gf-profile__cards">
        <Link href={getProfileLink('/profile/edit')} className="gf-profile__card">
          <span className="gf-profile__card-icon" aria-hidden>
            👤
          </span>
          <span className="gf-profile__card-label">{t.nav.profile}</span>
        </Link>
        <Link href={getProfileLink('/groups')} className="gf-profile__card">
          <span className="gf-profile__card-icon" aria-hidden>
            👥
          </span>
          <span className="gf-profile__card-label">Groups</span>
        </Link>
        <Link href={getProfileLink('/payment-history')} className="gf-profile__card">
          <span className="gf-profile__card-icon" aria-hidden>
            💳
          </span>
          <span className="gf-profile__card-label">Payment History</span>
        </Link>
      </div>

      <div className="gf-profile__list">
        <ProfileLink href={getProfileLink('/refer')}>
          <span className="gf-profile__row-icon" aria-hidden>
            ➕
          </span>
          <span>Refer a Friend</span>
          <span className="gf-profile__row-chevron" aria-hidden>
            ›
          </span>
        </ProfileLink>
        <ProfileLink href={getProfileLink('/locations')}>
          <span className="gf-profile__row-icon" aria-hidden>
            📍
          </span>
          <span>My Locations</span>
          <span className="gf-profile__row-chevron" aria-hidden>
            ›
          </span>
        </ProfileLink>
        <ProfileLink href={getProfileLink('/notifications')}>
          <span className="gf-profile__row-icon" aria-hidden>
            🔔
          </span>
          <span>Notifications</span>
          <span className="gf-profile__row-chevron" aria-hidden>
            ›
          </span>
        </ProfileLink>
        <ProfileLink href={PRIVACY_URL} external>
          <span className="gf-profile__row-icon" aria-hidden>
            🔒
          </span>
          <span>Privacy Policy</span>
          <span className="gf-profile__row-chevron" aria-hidden>
            ›
          </span>
        </ProfileLink>
        <ProfileLink href={TERMS_URL} external>
          <span className="gf-profile__row-icon" aria-hidden>
            📄
          </span>
          <span>Terms and Conditions</span>
          <span className="gf-profile__row-chevron" aria-hidden>
            ›
          </span>
        </ProfileLink>
        <ProfileLink href={getProfileLink('/help')}>
          <span className="gf-profile__row-icon" aria-hidden>
            ❓
          </span>
          <span>Help Centre</span>
          <span className="gf-profile__row-chevron" aria-hidden>
            ›
          </span>
        </ProfileLink>
        <ProfileLink onClick={onLogout}>
          <span className="gf-profile__row-icon gf-profile__row-icon--logout" aria-hidden>
            ⎋
          </span>
          <span className="gf-profile__signout">Sign Out</span>
        </ProfileLink>
      </div>
    </div>
  );
}

function TrainerRatingStars({ rating }: { rating: number }) {
  const value = Math.max(0, Math.min(5, rating));
  const full = Math.floor(value);
  const empty = 5 - full;
  return (
    <div className="gf-profile__stars" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {'★'.repeat(full)}
      <span className="gf-profile__stars-empty">{'★'.repeat(empty)}</span>
    </div>
  );
}

export function TrainerProfileContent({
  user,
  onLogout,
  t,
  rating,
  reviewCount,
}: {
  user: { name?: string; email?: string; sub?: string };
  onLogout: () => void;
  t: ReturnType<typeof getTranslations>;
  rating?: number;
  reviewCount?: number;
}) {
  const displayName = user.name || user.email || user.sub || '';
  const ratingValue = rating ?? 0;
  const count = reviewCount ?? 0;
  const ratingLoaded = rating !== undefined;

  return (
    <div className="gf-profile gf-profile--trainer">
      <div className="gf-profile__hero">
        <div className="gf-profile__avatar gf-profile__avatar--large" aria-hidden />
        <h1 className="gf-profile__name gf-profile__name--center">{displayName}</h1>
      </div>

      <div className="gf-profile__rating">
        <p className="gf-profile__rating-label">Overall Rating</p>
        <p className="gf-profile__rating-value">{ratingLoaded ? ratingValue.toFixed(1) : '—'}</p>
        {ratingLoaded ? (
          <TrainerRatingStars rating={ratingValue} />
        ) : (
          <div className="gf-profile__stars" aria-hidden>
            <span className="gf-profile__stars-empty">{'★'.repeat(5)}</span>
          </div>
        )}
        {ratingLoaded && (
          <p className="gf-profile__rating-count">
            {count === 0 ? 'No reviews' : `${count} ${count === 1 ? 'review' : 'reviews'}`}
          </p>
        )}
      </div>

      <div className="gf-profile__list">
        <ProfileLink href={getProfileLink('/profile/edit')}>
          <span className="gf-profile__row-icon" aria-hidden>
            👤
          </span>
          <span>Edit Profile</span>
          <span className="gf-profile__row-chevron" aria-hidden>
            ›
          </span>
        </ProfileLink>
        <ProfileLink href={PRIVACY_URL} external>
          <span className="gf-profile__row-icon" aria-hidden>
            🔒
          </span>
          <span>Privacy Policy</span>
          <span className="gf-profile__row-chevron" aria-hidden>
            ›
          </span>
        </ProfileLink>
        <ProfileLink href={TERMS_URL} external>
          <span className="gf-profile__row-icon" aria-hidden>
            📄
          </span>
          <span>Terms and Conditions</span>
          <span className="gf-profile__row-chevron" aria-hidden>
            ›
          </span>
        </ProfileLink>
        <ProfileLink href={getProfileLink('/help')}>
          <span className="gf-profile__row-icon" aria-hidden>
            ❓
          </span>
          <span>Help</span>
          <span className="gf-profile__row-chevron" aria-hidden>
            ›
          </span>
        </ProfileLink>
        <ProfileLink onClick={onLogout}>
          <span className="gf-profile__row-icon gf-profile__row-icon--logout" aria-hidden>
            ⎋
          </span>
          <span className="gf-profile__signout">Logout</span>
        </ProfileLink>
      </div>
    </div>
  );
}

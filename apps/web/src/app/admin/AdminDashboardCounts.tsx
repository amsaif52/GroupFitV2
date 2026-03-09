'use client';

export type DashboardCountsData = {
  userCount?: number;
  trainerCount?: number;
  customerCount?: number;
  sessionCount?: number;
  earningTotal?: number;
};

type Props = {
  data: DashboardCountsData | null;
};

/** Presentational count cards for admin dashboard. */
export function AdminDashboardCounts({ data }: Props) {
  if (!data || typeof data.userCount !== 'number') {
    return null;
  }
  return (
    <div className="gf-admin-cards-grid">
      <div className="gf-admin-card">
        <div className="gf-admin-card__value">{data.userCount}</div>
        <div className="gf-admin-card__label">Users</div>
      </div>
      <div className="gf-admin-card">
        <div className="gf-admin-card__value">{data.trainerCount}</div>
        <div className="gf-admin-card__label">Trainers</div>
      </div>
      <div className="gf-admin-card">
        <div className="gf-admin-card__value">{data.customerCount}</div>
        <div className="gf-admin-card__label">Customers</div>
      </div>
      <div className="gf-admin-card gf-admin-card--muted">
        <div className="gf-admin-card__value">{data.sessionCount ?? 0}</div>
        <div className="gf-admin-card__label">Sessions</div>
      </div>
    </div>
  );
}

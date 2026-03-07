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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 16,
      }}
    >
      <div className="gf-home__empty" style={{ padding: 16 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--groupfit-secondary)' }}>
          {data.userCount}
        </div>
        <div style={{ fontSize: 12, color: 'var(--groupfit-grey)', marginTop: 4 }}>Users</div>
      </div>
      <div className="gf-home__empty" style={{ padding: 16 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--groupfit-secondary)' }}>
          {data.trainerCount}
        </div>
        <div style={{ fontSize: 12, color: 'var(--groupfit-grey)', marginTop: 4 }}>Trainers</div>
      </div>
      <div className="gf-home__empty" style={{ padding: 16 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--groupfit-secondary)' }}>
          {data.customerCount}
        </div>
        <div style={{ fontSize: 12, color: 'var(--groupfit-grey)', marginTop: 4 }}>Customers</div>
      </div>
      <div className="gf-home__empty" style={{ padding: 16 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--groupfit-grey)' }}>
          {data.sessionCount ?? 0}
        </div>
        <div style={{ fontSize: 12, color: 'var(--groupfit-grey)', marginTop: 4 }}>Sessions</div>
      </div>
    </div>
  );
}

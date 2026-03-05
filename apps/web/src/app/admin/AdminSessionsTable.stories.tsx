import type { Meta, StoryObj } from '@storybook/react';

const sampleSessions: Record<string, unknown>[] = [
  {
    id: 's1',
    scheduledAt: '2025-03-15T10:00:00.000Z',
    activityName: 'Yoga',
    customerName: 'Alice',
    trainerName: 'Bob',
    status: 'scheduled',
    amountCents: 5000,
  },
  {
    id: 's2',
    scheduledAt: '2025-03-16T14:30:00.000Z',
    activityName: 'HIIT',
    customerName: 'Carol',
    trainerName: 'Dave',
    status: 'completed',
    amountCents: 7500,
  },
];

function SessionsTable({ list }: { list: Record<string, unknown>[] }) {
  return (
    <div className="gf-home__empty" style={{ padding: 0, overflow: 'auto', minWidth: 520 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--groupfit-border-light)', textAlign: 'left' }}>
            <th style={{ padding: '12px 16px' }}>Date / Time</th>
            <th style={{ padding: '12px 16px' }}>Activity</th>
            <th style={{ padding: '12px 16px' }}>Customer</th>
            <th style={{ padding: '12px 16px' }}>Trainer</th>
            <th style={{ padding: '12px 16px' }}>Status</th>
            <th style={{ padding: '12px 16px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {list.map((row, i) => (
            <tr key={(row.id as string) ?? i} style={{ borderBottom: '1px solid var(--groupfit-border-light)' }}>
              <td style={{ padding: '12px 16px' }}>{row.scheduledAt ? new Date(String(row.scheduledAt)).toLocaleString() : ''}</td>
              <td style={{ padding: '12px 16px' }}>{String(row.activityName ?? '—')}</td>
              <td style={{ padding: '12px 16px' }}>{String(row.customerName ?? '')}</td>
              <td style={{ padding: '12px 16px' }}>{String(row.trainerName ?? '')}</td>
              <td style={{ padding: '12px 16px' }}>{String(row.status ?? '')}</td>
              <td style={{ padding: '12px 16px' }}>{row.amountCents != null ? `$${(Number(row.amountCents) / 100).toFixed(2)}` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const meta: Meta<typeof SessionsTable> = {
  title: 'Admin/SessionsTable',
  component: SessionsTable,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Sessions list table used on the admin Sessions page.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof SessionsTable>;

export const WithSessions: Story = {
  args: { list: sampleSessions },
};

export const Empty: Story = {
  args: { list: [] },
};

export const SingleRow: Story = {
  args: { list: [sampleSessions[0]] },
};

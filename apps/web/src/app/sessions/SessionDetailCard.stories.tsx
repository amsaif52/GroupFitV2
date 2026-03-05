import type { Meta, StoryObj } from '@storybook/react';

type SessionDetail = {
  sessionName?: string;
  scheduledAt?: string;
  status?: string;
  trainerName?: string;
  customerName?: string;
  amountCents?: number;
};

function SessionDetailCard({
  detail,
  isTrainer = false,
}: {
  detail: SessionDetail;
  isTrainer?: boolean;
}) {
  return (
    <div className="gf-home__empty" style={{ textAlign: 'left', padding: 20, maxWidth: 400 }}>
      <p><strong>Session:</strong> {String(detail.sessionName ?? 'Session')}</p>
      <p><strong>Date & time:</strong> {detail.scheduledAt ? new Date(detail.scheduledAt).toLocaleString() : '—'}</p>
      <p><strong>Status:</strong> {String(detail.status ?? '')}</p>
      {!isTrainer && <p><strong>Trainer:</strong> {String(detail.trainerName ?? '')}</p>}
      {isTrainer && <p><strong>Customer:</strong> {String(detail.customerName ?? '')}</p>}
      {detail.amountCents != null && (
        <p><strong>Amount:</strong> ${(Number(detail.amountCents) / 100).toFixed(2)}</p>
      )}
    </div>
  );
}

const meta: Meta<typeof SessionDetailCard> = {
  title: 'App/SessionDetailCard',
  component: SessionDetailCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Session detail content shown on the session detail page (customer or trainer view).',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof SessionDetailCard>;

const customerSession = {
  sessionName: 'Yoga',
  scheduledAt: '2025-03-15T10:00:00.000Z',
  status: 'scheduled',
  trainerName: 'Jane Smith',
  amountCents: 5000,
};

export const CustomerView: Story = {
  args: {
    detail: customerSession,
    isTrainer: false,
  },
};

export const TrainerView: Story = {
  args: {
    detail: {
      ...customerSession,
      customerName: 'Alice Jones',
      trainerName: undefined,
    },
    isTrainer: true,
  },
};

export const Completed: Story = {
  args: {
    detail: {
      sessionName: 'HIIT',
      scheduledAt: '2025-03-10T14:00:00.000Z',
      status: 'completed',
      trainerName: 'Bob Lee',
      amountCents: 7500,
    },
    isTrainer: false,
  },
};

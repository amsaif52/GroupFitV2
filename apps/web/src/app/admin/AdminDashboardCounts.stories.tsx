import type { Meta, StoryObj } from '@storybook/react';
import { AdminDashboardCounts } from './AdminDashboardCounts';

const meta: Meta<typeof AdminDashboardCounts> = {
  title: 'Admin/DashboardCounts',
  component: AdminDashboardCounts,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Count cards for the admin dashboard (Users, Trainers, Customers, Sessions).',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof AdminDashboardCounts>;

export const Default: Story = {
  args: {
    data: {
      userCount: 42,
      trainerCount: 12,
      customerCount: 28,
      sessionCount: 156,
      earningTotal: 125000,
    },
  },
};

export const Empty: Story = {
  args: {
    data: {
      userCount: 0,
      trainerCount: 0,
      customerCount: 0,
      sessionCount: 0,
      earningTotal: 0,
    },
  },
};

export const NoData: Story = {
  args: { data: null },
};

export const SingleDigit: Story = {
  args: {
    data: {
      userCount: 3,
      trainerCount: 1,
      customerCount: 2,
      sessionCount: 0,
    },
  },
};

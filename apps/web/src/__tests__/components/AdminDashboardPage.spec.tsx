import { render, screen, waitFor } from '@testing-library/react';
import AdminDashboardPage from '@/app/admin/dashboard/page';
import { adminApi } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  adminApi: {
    dashboard: jest.fn(),
  },
}));

jest.mock('@/lib/auth', () => ({
  getStoredUser: jest.fn(() => ({ email: 'admin@test.com', name: 'Admin', role: 'admin' })),
  clearStoredToken: jest.fn(),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockDashboard = adminApi.dashboard as jest.Mock;

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    mockDashboard.mockReset();
  });

  it('renders header with title Admin Dashboard', () => {
    mockDashboard.mockResolvedValue({ data: {} });
    render(<AdminDashboardPage />);
    expect(screen.getByRole('heading', { name: 'Admin Dashboard' })).toBeInTheDocument();
  });

  it('shows loading initially', () => {
    mockDashboard.mockImplementation(() => new Promise(() => {}));
    render(<AdminDashboardPage />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows count cards when dashboard data is returned', async () => {
    mockDashboard.mockResolvedValue({
      data: {
        data: {
          userCount: 10,
          trainerCount: 3,
          customerCount: 6,
          sessionCount: 5,
          earningTotal: 0,
        },
      },
    });
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Trainers')).toBeInTheDocument();
      expect(screen.getByText('Customers')).toBeInTheDocument();
      expect(screen.getByText('Sessions')).toBeInTheDocument();
    });
  });

  it('shows welcome message when loaded', async () => {
    mockDashboard.mockResolvedValue({
      data: {
        data: {
          userCount: 0,
          trainerCount: 0,
          customerCount: 0,
          sessionCount: 0,
          earningTotal: 0,
        },
      },
    });
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/Welcome to GroupFit Admin/)).toBeInTheDocument();
    });
  });
});

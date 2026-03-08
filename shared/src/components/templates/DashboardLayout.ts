import type { ReactNode } from 'react';

export interface DashboardLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  header?: ReactNode;
}

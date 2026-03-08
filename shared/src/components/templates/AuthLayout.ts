import type { ReactNode } from 'react';

export interface AuthLayoutProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

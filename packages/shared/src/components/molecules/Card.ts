import type { ReactNode } from 'react';

export interface CardProps {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  'data-testid'?: string;
}

import type { ReactNode } from 'react';

export interface TextProps {
  children: ReactNode;
  variant?: 'heading1' | 'heading2' | 'body' | 'caption' | 'label';
  color?: string;
  'data-testid'?: string;
}

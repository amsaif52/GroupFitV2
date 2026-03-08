import type { ReactNode } from 'react';

export interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  /** Shown when loading is true (default: "Loading...") */
  loadingLabel?: string;
  onPress?: () => void;
  type?: 'button' | 'submit';
  'data-testid'?: string;
  /** Optional extra class names (e.g. gf-button--full gf-button--mt) */
  className?: string;
  /** Optional icon (e.g. SVG) shown before the label */
  icon?: ReactNode;
}

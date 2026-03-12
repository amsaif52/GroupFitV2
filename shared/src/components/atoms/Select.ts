import type { ChangeEvent } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  /** Options for the dropdown */
  options: SelectOption[];
  /** Current value (controlled) */
  value?: string;
  /** Called with the new value when selection changes (does not conflict with react-hook-form onChange) */
  onValueChange?: (value: string) => void;
  /** Placeholder for empty/first option (optional) */
  placeholder?: string;
  /** 'compact' = narrow width for phone prefix; 'default' = full width */
  variant?: 'default' | 'compact';
  className?: string;
  /** Accessibility */
  'aria-label'?: string;
  'aria-invalid'?: boolean;
  id?: string;
  disabled?: boolean;
}

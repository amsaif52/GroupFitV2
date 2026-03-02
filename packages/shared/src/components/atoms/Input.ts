export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  disabled?: boolean;
  error?: string;
  required?: boolean;
  'data-testid'?: string;
}

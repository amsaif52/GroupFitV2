import type { InputProps } from '../atoms/Input';

export interface FormFieldProps extends InputProps {
  hint?: string;
  id: string;
}

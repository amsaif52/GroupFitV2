import React from 'react';
import type { SelectProps } from './Select';

export default function SelectWeb({
  options,
  value,
  onValueChange,
  placeholder,
  variant = 'default',
  className: classNameProp,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  ...rest
}: SelectProps & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onValueChange'>) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChange?.(e.target.value);
    rest.onChange?.(e);
  };

  const className = [
    'gf-select',
    variant === 'compact' ? 'gf-select--compact' : '',
    classNameProp ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <select
      {...rest}
      className={className}
      value={value}
      onChange={handleChange}
      aria-label={ariaLabel}
      aria-invalid={ariaInvalid}
    >
      {placeholder != null && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

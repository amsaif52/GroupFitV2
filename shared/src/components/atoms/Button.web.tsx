import React from 'react';
import type { ButtonProps } from './Button';

const sizeClass = { sm: 'gf-button--sm', md: 'gf-button--md', lg: 'gf-button--lg' } as const;
const variantClass = {
  primary: 'gf-button--primary',
  secondary: 'gf-button--secondary',
  outline: 'gf-button--outline',
  ghost: 'gf-button--ghost',
} as const;

export default function ButtonWeb({
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  loadingLabel = 'Loading...',
  onPress,
  type = 'button',
  'data-testid': dataTestId,
  className: classNameProp,
  icon,
}: ButtonProps) {
  const className = ['gf-button', variantClass[variant], sizeClass[size], classNameProp]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={className}
      disabled={disabled || loading}
      onClick={type === 'button' ? onPress : undefined}
      data-testid={dataTestId}
    >
      {loading ? (
        loadingLabel
      ) : (
        <>
          {icon != null && (
            <span className="gf-button__icon" aria-hidden>
              {icon}
            </span>
          )}
          {label}
        </>
      )}
    </button>
  );
}

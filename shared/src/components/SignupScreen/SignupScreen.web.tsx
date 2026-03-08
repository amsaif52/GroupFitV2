'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SignupFormInput } from '../../utils/auth-schemas';
import { signupFormSchema } from '../../utils/auth-schemas';
import Button from '../atoms/Button.web';

export interface SignupScreenWebProps {
  onSubmit: (data: { name: string; email: string; password: string }) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
  onLoginClick?: () => void;
  /** Override title (default: "Set Up Your Account") */
  title?: string;
  /** Override subtitle */
  subtitle?: string;
  nameLabel?: string;
  emailLabel?: string;
  passwordLabel?: string;
  confirmPasswordLabel?: string;
  submitLabel?: string;
  loadingLabel?: string;
  footerPrompt?: string;
  footerLinkText?: string;
  /** Terms checkbox label (e.g. "I agree to the"); if not provided, checkbox is hidden */
  termsLabel?: string;
  /** Link text after termsLabel (e.g. "Terms and Conditions"); shown when onTermsClick is set */
  termsLinkText?: string;
  onTermsClick?: () => void;
  /** 'admin' = split layout like admin API (image left, dark form right) */
  variant?: 'default' | 'admin';
  /** Left panel background image URL (admin variant only) */
  leftPanelImageUrl?: string;
  /** Social signup: "Continue with Google" */
  onGooglePress?: () => void | Promise<void>;
  /** Social signup: "Continue with Apple" */
  onApplePress?: () => void | Promise<void>;
  continueWithGoogleLabel?: string;
  continueWithAppleLabel?: string;
  orLabel?: string;
  googleButton?: React.ReactNode;
  appleButton?: React.ReactNode;
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden focusable="false">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden focusable="false">
    <path
      fill="#FFFFFF"
      d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
    />
  </svg>
);

export function SignupScreenWeb({
  onSubmit,
  loading = false,
  error = null,
  onLoginClick,
  title,
  subtitle,
  nameLabel: _nameLabel = 'Name',
  emailLabel: _emailLabel = 'Email',
  passwordLabel: _passwordLabel = 'Password',
  confirmPasswordLabel: _confirmPasswordLabel = 'Confirm password',
  submitLabel = 'Create account',
  loadingLabel = 'Loading...',
  footerPrompt = 'Already a member?',
  footerLinkText = 'Log in',
  termsLabel,
  termsLinkText = 'Terms and Conditions',
  onTermsClick,
  variant: _variant = 'default',
  leftPanelImageUrl,
  onGooglePress,
  onApplePress,
  continueWithGoogleLabel = 'Continue with Google',
  continueWithAppleLabel = 'Continue with Apple',
  orLabel = 'or',
  googleButton,
  appleButton,
}: SignupScreenWebProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
  } = useForm<SignupFormInput>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const resolvedTitle = title;
  const resolvedSubtitle = subtitle;
  const showSocial = Boolean(onGooglePress || onApplePress || googleButton || appleButton);

  async function handleSubmit(data: SignupFormInput) {
    setTermsError(null);
    if (termsLabel && !termsAccepted) {
      setTermsError('Please accept the terms to continue');
      return;
    }
    await onSubmit({ name: data.name, email: data.email, password: data.password });
  }

  const displayError = error ?? termsError;
  const showSubtitle = resolvedSubtitle != null;

  const formContent = (
    <div className="gf-auth gf-auth--admin">
      <div className="gf-auth__header">
        <h1 className="gf-auth__title">{resolvedTitle}</h1>
        {showSubtitle && <p className="gf-auth__subtitle">{resolvedSubtitle}</p>}
      </div>

      {showSocial && (
        <div className="gf-auth__social">
          {googleButton != null ? (
            <div className="gf-button--full gf-button--social">{googleButton}</div>
          ) : onGooglePress ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              label={continueWithGoogleLabel}
              onPress={onGooglePress}
              className="gf-button--full gf-button--social"
              icon={<GoogleIcon />}
            />
          ) : null}
          {appleButton != null ? (
            <div className="gf-button--full gf-button--social">{appleButton}</div>
          ) : onApplePress ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              label={continueWithAppleLabel}
              onPress={onApplePress}
              className="gf-button--full gf-button--social"
              icon={<AppleIcon />}
            />
          ) : null}
          <p className="gf-auth__or" aria-hidden>
            {orLabel}
          </p>
        </div>
      )}

      <form onSubmit={rhfHandleSubmit(handleSubmit)} noValidate className="gf-auth__form">
        {displayError && <p className="gf-auth__error">{displayError}</p>}

        <label className="gf-auth__label">
          <input
            type="text"
            {...register('name')}
            placeholder="Full name"
            className="gf-auth__input"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <span className="gf-auth__field-error" role="alert">
              {errors.name.message}
            </span>
          )}
        </label>

        <label className="gf-auth__label">
          <input
            type="email"
            {...register('email')}
            placeholder={'Enter your email here'}
            className="gf-auth__input"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && (
            <span className="gf-auth__field-error" role="alert">
              {errors.email.message}
            </span>
          )}
        </label>

        <label className="gf-auth__label">
          <input
            type="password"
            {...register('password')}
            placeholder={'Enter your password here'}
            className="gf-auth__input"
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password && (
            <span className="gf-auth__field-error" role="alert">
              {errors.password.message}
            </span>
          )}
        </label>

        <label className="gf-auth__label">
          <input
            type="password"
            {...register('confirmPassword')}
            placeholder={'Confirm your password'}
            className="gf-auth__input"
            aria-invalid={Boolean(errors.confirmPassword)}
          />
          {errors.confirmPassword && (
            <span className="gf-auth__field-error" role="alert">
              {errors.confirmPassword.message}
            </span>
          )}
        </label>

        {termsLabel && (
          <label className="gf-auth__terms">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="gf-auth__terms-checkbox"
            />
            <span className="gf-auth__terms-text">
              {termsLabel}
              {onTermsClick && termsLinkText && (
                <>
                  {' '}
                  <button type="button" onClick={onTermsClick} className="gf-auth__terms-link">
                    {termsLinkText}
                  </button>
                </>
              )}
            </span>
          </label>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          loading={loading}
          loadingLabel={loadingLabel}
          label={submitLabel}
          className="gf-button--full gf-button--mt"
        />
      </form>

      {onLoginClick && (
        <p className="gf-auth__footer">
          <span className="gf-auth__footer-text">{footerPrompt}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            label={footerLinkText}
            onPress={onLoginClick}
          />
        </p>
      )}
    </div>
  );

  return (
    <main className="gf-auth-main gf-auth-main--split">
      <div
        className="gf-auth-panel gf-auth-panel--left"
        style={
          leftPanelImageUrl
            ? ({
                ['--gf-auth-left-bg' as string]: `url(${leftPanelImageUrl})`,
              } as React.CSSProperties)
            : undefined
        }
      />
      <div className="gf-auth-panel gf-auth-panel--right">{formContent}</div>
    </main>
  );
}

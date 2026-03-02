import React, { useState } from 'react';
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

const defaultTitle = 'Set Up Your Account';
const adminTitle = 'Sign Up';
const adminSubtitle = 'Enter your details to create your account';

export function SignupScreenWeb({
  onSubmit,
  loading = false,
  error = null,
  onLoginClick,
  title,
  subtitle,
  nameLabel = 'Name',
  emailLabel = 'Email',
  passwordLabel = 'Password',
  confirmPasswordLabel = 'Confirm password',
  submitLabel = 'Create account',
  loadingLabel = 'Loading...',
  footerPrompt = 'Already a member?',
  footerLinkText = 'Log in',
  termsLabel,
  termsLinkText = 'Terms and Conditions',
  onTermsClick,
  variant = 'default',
  leftPanelImageUrl,
  onGooglePress,
  onApplePress,
  continueWithGoogleLabel = 'Continue with Google',
  continueWithAppleLabel = 'Continue with Apple',
  orLabel = 'or',
  googleButton,
  appleButton,
}: SignupScreenWebProps) {
  const isAdmin = variant === 'admin';
  const resolvedTitle = title ?? (isAdmin ? adminTitle : defaultTitle);
  const resolvedSubtitle = subtitle ?? (isAdmin ? adminSubtitle : undefined);
  const showSocial = Boolean(onGooglePress || onApplePress || googleButton || appleButton);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldError(null);
    if (password !== confirmPassword) {
      setFieldError('Passwords do not match');
      return;
    }
    if (termsLabel && !termsAccepted) {
      setFieldError('Please accept the terms to continue');
      return;
    }
    await onSubmit({ name, email, password });
  }

  const displayError = error ?? fieldError;
  const showSubtitle = resolvedSubtitle != null;

  const formContent = (
    <div className={isAdmin ? 'gf-auth gf-auth--admin' : 'gf-auth'}>
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
            />
          ) : null}
          <p className="gf-auth__or" aria-hidden>
            {orLabel}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="gf-auth__form">
        {displayError && <p className="gf-auth__error">{displayError}</p>}

        <label className="gf-auth__label">
          {!isAdmin && <span className="gf-auth__label-text">{nameLabel}</span>}
          {isAdmin && (
            <span className="gf-auth__input-icon" aria-hidden>
              👤
            </span>
          )}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={isAdmin ? 'Full name' : nameLabel}
            className="gf-auth__input"
          />
        </label>

        <label className="gf-auth__label">
          {!isAdmin && <span className="gf-auth__label-text">{emailLabel}</span>}
          {isAdmin && (
            <span className="gf-auth__input-icon" aria-hidden>
              ✉
            </span>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={isAdmin ? 'Enter your email here' : emailLabel}
            className="gf-auth__input"
          />
        </label>

        <label className="gf-auth__label">
          {!isAdmin && <span className="gf-auth__label-text">{passwordLabel}</span>}
          {isAdmin && (
            <span className="gf-auth__input-icon" aria-hidden>
              🔒
            </span>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={isAdmin ? 'Enter your password here' : passwordLabel}
            className="gf-auth__input"
          />
        </label>

        <label className="gf-auth__label">
          {!isAdmin && <span className="gf-auth__label-text">{confirmPasswordLabel}</span>}
          {isAdmin && (
            <span className="gf-auth__input-icon" aria-hidden>
              🔒
            </span>
          )}
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder={isAdmin ? 'Confirm your password' : confirmPasswordLabel}
            className="gf-auth__input"
          />
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
                  <button
                    type="button"
                    onClick={onTermsClick}
                    className="gf-auth__terms-link"
                  >
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
          size={isAdmin ? 'md' : 'lg'}
          disabled={loading}
          loading={loading}
          loadingLabel={loadingLabel}
          label={submitLabel}
          className={isAdmin ? 'gf-button--full gf-button--mt gf-button--pill' : 'gf-button--full gf-button--mt'}
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

  if (isAdmin) {
    return (
      <main className="gf-auth-main gf-auth-main--split">
        <div
          className="gf-auth-panel gf-auth-panel--left"
          style={
            leftPanelImageUrl
              ? ({ ['--gf-auth-left-bg' as string]: `url(${leftPanelImageUrl})` } as React.CSSProperties)
              : undefined
          }
        />
        <div className="gf-auth-panel gf-auth-panel--right">{formContent}</div>
      </main>
    );
  }

  return <main className="gf-auth-main">{formContent}</main>;
}

import React, { useState } from 'react';
import Button from '../atoms/Button.web';

export interface LoginScreenWebProps {
  onSubmit: (email: string, password: string) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
  onSignUpClick?: () => void;
  /** Override title (default: "Get Together. Get Fit.") */
  title?: string;
  /** Override subtitle (default: "Login to your account") */
  subtitle?: string;
  /** Email label */
  emailLabel?: string;
  /** Password label */
  passwordLabel?: string;
  /** Submit button label */
  submitLabel?: string;
  /** Loading button label */
  loadingLabel?: string;
  /** Footer line e.g. "New here?" */
  footerPrompt?: string;
  /** Footer link text e.g. "Sign up now" */
  footerLinkText?: string;
  /** 'admin' = split layout like admin API (image left, dark form right) */
  variant?: 'default' | 'admin';
  /** Left panel background image URL (admin variant only) */
  leftPanelImageUrl?: string;
  /** Social login: called when user taps "Continue with Google". If set, social buttons are shown. */
  onGooglePress?: () => void | Promise<void>;
  /** Social login: called when user taps "Continue with Apple". If set, social buttons are shown. */
  onApplePress?: () => void | Promise<void>;
  /** Label for Google button (e.g. "Continue with Google") */
  continueWithGoogleLabel?: string;
  /** Label for Apple button (e.g. "Continue with Apple") */
  continueWithAppleLabel?: string;
  /** Divider text between social and email form (e.g. "or") */
  orLabel?: string;
  /** Optional custom Google button (e.g. GoogleLogin from @react-oauth/google). When set, replaces the default Google button. */
  googleButton?: React.ReactNode;
  /** Optional custom Apple button. When set, replaces the default Apple button. */
  appleButton?: React.ReactNode;
}

const defaultTitle = 'Get Together.\nGet Fit.';
const defaultSubtitle = 'Login to your account';
const adminTitle = 'Sign In';
const adminSubtitle = 'Enter your email and password';

export function LoginScreenWeb({
  onSubmit,
  loading = false,
  error = null,
  onSignUpClick,
  title,
  subtitle,
  emailLabel = 'Email',
  passwordLabel = 'Password',
  submitLabel = 'Sign In',
  loadingLabel = 'Loading...',
  footerPrompt = 'New here?',
  footerLinkText = 'Sign up now',
  variant = 'default',
  leftPanelImageUrl,
  onGooglePress,
  onApplePress,
  continueWithGoogleLabel = 'Continue with Google',
  continueWithAppleLabel = 'Continue with Apple',
  orLabel = 'or',
  googleButton,
  appleButton,
}: LoginScreenWebProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isAdmin = variant === 'admin';
  const resolvedTitle = title ?? (isAdmin ? adminTitle : defaultTitle);
  const resolvedSubtitle = subtitle ?? (isAdmin ? adminSubtitle : defaultSubtitle);
  const showSocial = Boolean(onGooglePress || onApplePress || googleButton || appleButton);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await onSubmit(email, password);
  }

  const formContent = (
    <div className={isAdmin ? 'gf-auth gf-auth--admin' : 'gf-auth'}>
      <div className="gf-auth__header">
        <h1 className="gf-auth__title">{resolvedTitle}</h1>
        <p className="gf-auth__subtitle">{resolvedSubtitle}</p>
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
        {error && <p className="gf-auth__error">{error}</p>}

        <label className="gf-auth__label">
          {!isAdmin && <span className="gf-auth__label-text">{emailLabel}</span>}
          {isAdmin && (
            <span className="gf-auth__input-icon" aria-hidden>
              👤
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

        <Button
          type="submit"
          variant="primary"
          size={isAdmin ? 'md' : 'lg'}
          disabled={loading}
          loading={loading}
          loadingLabel={loadingLabel}
          label={submitLabel}
          className={
            isAdmin
              ? 'gf-button--full gf-button--mt gf-button--pill'
              : 'gf-button--full gf-button--mt'
          }
        />
      </form>

      {onSignUpClick && (
        <p className="gf-auth__footer">
          <span className="gf-auth__footer-text">{footerPrompt}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            label={footerLinkText}
            onPress={onSignUpClick}
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

  return <main className="gf-auth-main">{formContent}</main>;
}

'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LoginInput, LoginPhoneInput, VerifyOtpInput } from '../../utils/auth-schemas';
import { loginSchema, loginPhoneSchema, verifyOtpSchema } from '../../utils/auth-schemas';
import { COUNTRY_CODES } from '../../utils';
import Button from '../atoms/Button.web';

export type LoginMethod = 'phone' | 'email';

export interface LoginScreenWebProps {
  /** Email/password submit (password login may be disabled on API). */
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
  /** Phone number label */
  phoneLabel?: string;
  /** Send OTP button label */
  sendCodeLabel?: string;
  /** OTP input placeholder */
  otpPlaceholder?: string;
  /** Verify OTP button label */
  verifyLabel?: string;
  /** Resend code link text */
  resendCodeLabel?: string;
  /** Tab label for phone login */
  phoneTabLabel?: string;
  /** Tab label for email login */
  emailTabLabel?: string;
  /** Submit button label (email form) */
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
  /** When provided, phone OTP login is shown. Called with phone; returns userCode for verify step. */
  onSendOtp?: (phone: string, type: 'phone' | 'email') => Promise<{ userCode: string }>;
  /** When provided with onSendOtp, verify step is available. Called with OTP and userCode from onSendOtp. */
  onVerifyOtp?: (otp: string, userCode: string) => Promise<void>;
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

export function LoginScreenWeb({
  onSubmit,
  loading = false,
  error = null,
  onSignUpClick,
  title,
  subtitle,
  emailLabel = 'Email',
  passwordLabel = 'Password',
  phoneLabel = 'Phone number',
  sendCodeLabel = 'Send code',
  otpPlaceholder = 'Enter 4-digit code',
  verifyLabel = 'Verify',
  resendCodeLabel = 'Resend code',
  phoneTabLabel = 'Phone',
  emailTabLabel = 'Email',
  submitLabel = 'Sign In',
  loadingLabel = 'Loading...',
  footerPrompt = 'New here?',
  footerLinkText = 'Sign up now',
  variant: _variant = 'default',
  leftPanelImageUrl,
  onGooglePress,
  onApplePress,
  continueWithGoogleLabel = 'Continue with Google',
  continueWithAppleLabel = 'Continue with Apple',
  orLabel = 'or',
  googleButton,
  appleButton,
  onSendOtp,
  onVerifyOtp,
}: LoginScreenWebProps) {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [otpStep, setOtpStep] = useState<{ userCode: string; phone: string } | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [countryDial, setCountryDial] = useState('+1');

  const emailForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '' },
  });
  const phoneForm = useForm<LoginPhoneInput>({
    resolver: zodResolver(loginPhoneSchema),
    defaultValues: { phone: '' },
  });
  const otpForm = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: '', userCode: '' },
  });

  const resolvedTitle = title;
  const resolvedSubtitle = subtitle;
  const showSocial = Boolean(onGooglePress || onApplePress || googleButton || appleButton);
  const showPhoneLogin = Boolean(onSendOtp && onVerifyOtp);

  // async function handleEmailSubmit(data: LoginInput) {
  //   await onSubmit(data.email);
  // }

  async function handleSendOtp(data: LoginInput | LoginPhoneInput) {
    if (!onSendOtp) return;
    setSendOtpLoading(true);
    try {
      const payload =
        typeof data === 'object' && 'phone' in data
          ? `${countryDial}${data.phone.trim().replace(/^\++/, '')}`
          : data.email.trim();
      const { userCode } = await onSendOtp(payload, 'phone' in data ? 'phone' : 'email');
      setOtpStep({ userCode, phone: payload });
      otpForm.setValue('userCode', userCode);
    } finally {
      setSendOtpLoading(false);
    }
  }

  async function handleVerifyOtp(data: VerifyOtpInput) {
    if (!onVerifyOtp) return;
    setOtpLoading(true);
    try {
      await onVerifyOtp(data.otp, data.userCode);
    } finally {
      setOtpLoading(false);
    }
  }

  function handleBackFromOtp() {
    setOtpStep(null);
    otpForm.reset({ otp: '', userCode: '' });
  }

  async function handleResendOtp() {
    if (!otpStep || !onSendOtp) return;
    setSendOtpLoading(true);
    try {
      const { userCode } = await onSendOtp(otpStep.phone, 'phone');
      setOtpStep((prev) => (prev ? { ...prev, userCode } : null));
      otpForm.setValue('userCode', userCode);
    } finally {
      setSendOtpLoading(false);
    }
  }

  const formContent = (
    <div className={'gf-auth gf-auth--admin'}>
      {!otpStep && (
        <div className="gf-auth__header">
          <h1 className="gf-auth__title">{resolvedTitle}</h1>
          <p className="gf-auth__subtitle">{resolvedSubtitle}</p>
        </div>
      )}

      {!otpStep && (
        <p className="gf-auth__or" aria-hidden>
          {orLabel}
        </p>
      )}

      {showSocial && !otpStep && (
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

      {!otpStep ? (
        <>
          <div className="gf-auth__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={loginMethod === 'phone'}
              className={'gf-auth__tab' + (loginMethod === 'phone' ? ' gf-auth__tab--active' : '')}
              onClick={() => setLoginMethod('phone')}
            >
              {phoneTabLabel}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={loginMethod === 'email'}
              className={'gf-auth__tab' + (loginMethod === 'email' ? ' gf-auth__tab--active' : '')}
              onClick={() => setLoginMethod('email')}
            >
              {emailTabLabel}
            </button>
          </div>

          {loginMethod === 'phone' && (
            <form
              onSubmit={phoneForm.handleSubmit(handleSendOtp)}
              noValidate
              className="gf-auth__form"
            >
              {error && <p className="gf-auth__error">{error}</p>}
              <label className="gf-auth__label">
                <div className="gf-auth__phone-row">
                  <select
                    value={countryDial}
                    onChange={(e) => setCountryDial(e.target.value)}
                    className="gf-auth__country-select"
                    aria-label="Country code"
                  >
                    {COUNTRY_CODES.map(({ code, dial, name }) => (
                      <option key={code} value={dial}>
                        {dial} {name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    {...phoneForm.register('phone')}
                    placeholder={phoneLabel}
                    className="gf-auth__input gf-auth__input--phone"
                    aria-invalid={Boolean(phoneForm.formState.errors.phone)}
                  />
                </div>
                {phoneForm.formState.errors.phone && (
                  <span className="gf-auth__field-error" role="alert">
                    {phoneForm.formState.errors.phone.message}
                  </span>
                )}
              </label>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={sendOtpLoading}
                loading={sendOtpLoading}
                loadingLabel={loadingLabel}
                label={sendCodeLabel}
                className="gf-button--full gf-button--mt"
              />
            </form>
          )}

          {loginMethod === 'email' && (
            <form
              onSubmit={emailForm.handleSubmit(handleSendOtp)}
              noValidate
              className="gf-auth__form"
            >
              {error && <p className="gf-auth__error">{error}</p>}
              <label className="gf-auth__label">
                <input
                  type="email"
                  {...emailForm.register('email')}
                  placeholder={emailLabel}
                  className="gf-auth__input"
                  aria-invalid={Boolean(emailForm.formState.errors.email)}
                />
                {emailForm.formState.errors.email && (
                  <span className="gf-auth__field-error" role="alert">
                    {emailForm.formState.errors.email.message}
                  </span>
                )}
              </label>
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
          )}
        </>
      ) : (
        <form
          onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
          noValidate
          className="gf-auth__form gf-auth__form--otp"
        >
          {error && <p className="gf-auth__error">{error}</p>}
          <p className="gf-auth__otp-hint">Code sent to {otpStep.phone}</p>
          <input type="hidden" {...otpForm.register('userCode')} />
          <label className="gf-auth__label">
            <span className="gf-auth__label-text">{otpPlaceholder}</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              placeholder=""
              className="gf-auth__input gf-auth__input--otp"
              aria-invalid={Boolean(otpForm.formState.errors.otp)}
              {...otpForm.register('otp')}
            />
            {otpForm.formState.errors.otp && (
              <span className="gf-auth__field-error" role="alert">
                {otpForm.formState.errors.otp.message}
              </span>
            )}
          </label>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={otpLoading}
            loading={otpLoading}
            loadingLabel={loadingLabel}
            label={verifyLabel}
            className="gf-button--full gf-button--mt"
          />
          <div className="gf-auth__resend-row">
            <button
              type="button"
              className="gf-auth__resend-link"
              onClick={handleResendOtp}
              disabled={sendOtpLoading}
            >
              {resendCodeLabel}
            </button>
            <button type="button" className="gf-auth__change-number" onClick={handleBackFromOtp}>
              Change number
            </button>
          </div>
        </form>
      )}

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

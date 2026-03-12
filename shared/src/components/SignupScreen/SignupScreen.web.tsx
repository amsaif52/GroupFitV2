'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SignupFormInput } from '../../utils/auth-schemas';
import { signupFormSchema, SIGNUP_ROLES } from '../../utils/auth-schemas';
import { COUNTRY_CODES, getSubdivisionsForCountry } from '../../utils';
import Button from '../atoms/Button.web';
import Select from '../atoms/Select.web';

const OTP_LENGTH = 4;

export interface SignupScreenWebProps {
  /** When set with onVerifySignupOtp, form submit sends OTP first; then user verifies to create account. */
  onSendSignupOtp?: (data: SignupFormInput) => void | Promise<void>;
  /** Called with OTP and form data after user enters code. Create account and redirect. */
  onVerifySignupOtp?: (otp: string, data: SignupFormInput) => void | Promise<void>;
  /** Legacy: single-step signup (no OTP). Used when onSendSignupOtp/onVerifySignupOtp not provided. */
  onSubmit?: (data: SignupFormInput) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
  onLoginClick?: () => void;
  /** Override title (default: "Set Up Your Account") */
  title?: string;
  /** Override subtitle */
  subtitle?: string;
  nameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  countryLabel?: string;
  stateLabel?: string;
  /** Label for role select (e.g. "I am a") */
  roleLabel?: string;
  referralCodeLabel?: string;
  submitLabel?: string;
  loadingLabel?: string;
  footerPrompt?: string;
  footerLinkText?: string;
  /** Privacy checkbox label (e.g. "I accept the "); required */
  privacyLabel?: string;
  /** Link text for privacy policy (e.g. "Privacy Policy"); shown when onPrivacyClick is set */
  privacyLinkText?: string;
  onPrivacyClick?: () => void;
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
  /** OTP step: placeholder for code input */
  otpPlaceholder?: string;
  /** OTP step: verify button label */
  verifyLabel?: string;
  /** OTP step: resend code link text */
  resendCodeLabel?: string;
  /** OTP step: change number button text */
  changeNumberLabel?: string;
  /** When provided, used for the phone prefix dropdown instead of static COUNTRY_CODES (e.g. from API). */
  countryOptions?: { code: string; dial: string; name: string }[];
}

const RESEND_COOLDOWN_SECONDS = 60;

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
  onSendSignupOtp,
  onVerifySignupOtp,
  onSubmit,
  loading = false,
  error = null,
  onLoginClick,
  title,
  subtitle,
  nameLabel = 'Full name',
  emailLabel = 'Email address',
  phoneLabel = 'Phone number',
  countryLabel = 'Country',
  stateLabel = 'State / Province / Region',
  roleLabel = 'I am a',
  referralCodeLabel = 'Referral code (optional)',
  submitLabel = 'Create account',
  loadingLabel = 'Loading...',
  footerPrompt = 'Already a member?',
  footerLinkText = 'Log in',
  privacyLabel = 'I accept the ',
  privacyLinkText = 'Privacy Policy',
  onPrivacyClick,
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
  otpPlaceholder = 'Enter 4-digit code',
  verifyLabel = 'Verify and create account',
  resendCodeLabel = 'Resend code',
  changeNumberLabel = 'Change number',
  countryOptions,
}: SignupScreenWebProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const countryListForPhone =
    countryOptions && countryOptions.length > 0 ? countryOptions : COUNTRY_CODES;
  const [phoneDialCode, setPhoneDialCode] = useState(countryListForPhone[0]?.dial ?? '+1');
  useEffect(() => {
    if (countryOptions?.length) {
      const list = countryOptions;
      setPhoneDialCode((prev) => (list.some((c) => c.dial === prev) ? prev : list[0].dial));
    }
  }, [countryOptions]);
  const [signupStep, setSignupStep] = useState<'form' | 'otp'>('form');
  const [pendingSignupData, setPendingSignupData] = useState<SignupFormInput | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);
  const useOtpFlow = Boolean(onSendSignupOtp && onVerifySignupOtp);

  const setOtpDigit = useCallback((index: number, char: string) => {
    const num = char.replace(/\D/g, '').slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = num;
      return next;
    });
    if (num && index < OTP_LENGTH - 1) otpInputRefs.current[index + 1]?.focus();
  }, []);

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
        setOtpDigits((prev) => {
          const next = [...prev];
          next[index - 1] = '';
          return next;
        });
      }
    },
    [otpDigits]
  );

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const arr = pasted.split('');
    setOtpDigits((prev) => {
      const next = [...prev];
      arr.forEach((c, i) => (next[i] = c));
      return next;
    });
    const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1);
    otpInputRefs.current[nextFocus]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldownSeconds <= 0) return;
    const id = setInterval(() => setResendCooldownSeconds((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendCooldownSeconds]);

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignupFormInput>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      country: '',
      state: '',
      role: 'customer',
      referralCode: '',
    },
  });
  const selectedCountry = watch('country');
  const stateOptions = selectedCountry ? getSubdivisionsForCountry(selectedCountry) : undefined;

  const resolvedTitle = title;
  const resolvedSubtitle = subtitle;
  const showSocial = Boolean(onGooglePress || onApplePress || googleButton || appleButton);

  const { onChange: countryOnChange, ...countryRegister } = register('country');
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    countryOnChange(e);
    setValue('state', '');
  };

  async function handleSubmit(data: SignupFormInput) {
    setTermsError(null);
    if (termsLabel && !termsAccepted) {
      setTermsError('Please accept the terms to continue');
      return;
    }
    const phoneDigits = (data.phone ?? '').replace(/\D/g, '');
    const fullPhone = phoneDigits ? `${phoneDialCode}${phoneDigits}` : '';
    const dataWithPhone = { ...data, phone: fullPhone };

    if (useOtpFlow && onSendSignupOtp) {
      await onSendSignupOtp(dataWithPhone);
      setPendingSignupData(dataWithPhone);
      setSignupStep('otp');
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setOtpError(null);
      setResendCooldownSeconds(RESEND_COOLDOWN_SECONDS);
    } else if (onSubmit) {
      await onSubmit(dataWithPhone);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingSignupData || !onVerifySignupOtp) return;
    setOtpError(null);
    const code = otpDigits.join('').trim();
    if (!code) {
      setOtpError('Please enter the code');
      return;
    }
    try {
      await onVerifySignupOtp(code, pendingSignupData);
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : 'Invalid or expired code');
    }
  }

  async function handleResendOtp() {
    if (!pendingSignupData || !onSendSignupOtp || resendCooldownSeconds > 0) return;
    setOtpError(null);
    try {
      await onSendSignupOtp(pendingSignupData);
      setResendCooldownSeconds(RESEND_COOLDOWN_SECONDS);
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : 'Failed to resend');
    }
  }

  const displayError = error ?? termsError;
  const showSubtitle = resolvedSubtitle != null;

  const formContent = (
    <div className="gf-auth gf-auth--admin">
      {signupStep !== 'otp' && (
        <div className="gf-auth__header">
          <h1 className="gf-auth__title">{resolvedTitle}</h1>
          {showSubtitle && <p className="gf-auth__subtitle">{resolvedSubtitle}</p>}
        </div>
      )}

      {signupStep !== 'otp' && (
        <p className="gf-auth__or" aria-hidden>
          {orLabel}
        </p>
      )}

      {signupStep === 'otp' ? (
        <form onSubmit={handleVerifyOtp} noValidate className="gf-auth__form gf-auth__form--otp">
          {(displayError || otpError) && (
            <p className="gf-auth__error">{otpError ?? displayError}</p>
          )}
          <p className="gf-auth__otp-hint">Code sent to {pendingSignupData?.phone ?? ''}</p>
          <label className="gf-auth__label">
            <span className="gf-auth__label-text">{otpPlaceholder}</span>
            <div className="gf-auth__otp-cells" onPaste={handleOtpPaste}>
              {otpDigits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpInputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  autoComplete="one-time-code"
                  className="gf-auth__otp-cell"
                  value={d}
                  onChange={(e) => setOtpDigit(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  disabled={loading}
                  aria-invalid={Boolean(otpError)}
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>
          </label>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            loading={loading}
            loadingLabel={loadingLabel}
            label={verifyLabel}
            className="gf-button--full gf-button--mt"
          />
          <div className="gf-auth__resend-row">
            <button
              type="button"
              className="gf-auth__resend-link"
              onClick={handleResendOtp}
              disabled={loading || resendCooldownSeconds > 0}
            >
              {resendCooldownSeconds > 0
                ? `${resendCodeLabel} (${resendCooldownSeconds}s)`
                : resendCodeLabel}
            </button>
            <button
              type="button"
              className="gf-auth__change-number"
              onClick={() => {
                setSignupStep('form');
                setPendingSignupData(null);
                setOtpDigits(Array(OTP_LENGTH).fill(''));
                setOtpError(null);
                setResendCooldownSeconds(0);
              }}
            >
              {changeNumberLabel}
            </button>
          </div>
        </form>
      ) : (
        <>
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
                placeholder={nameLabel}
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
                placeholder={emailLabel}
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
              <div className="gf-auth__phone-row">
                <Select
                  options={countryListForPhone.map(({ code, dial, name }) => ({
                    value: dial,
                    label: `${dial} ${name}`,
                  }))}
                  value={phoneDialCode}
                  onValueChange={setPhoneDialCode}
                  variant="compact"
                  aria-label="Country code"
                />
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder={phoneLabel}
                  className="gf-auth__input gf-auth__input--phone"
                  aria-invalid={Boolean(errors.phone)}
                />
              </div>
              {errors.phone && (
                <span className="gf-auth__field-error" role="alert">
                  {errors.phone.message}
                </span>
              )}
            </label>

            <label className="gf-auth__label">
              <Select
                options={COUNTRY_CODES.map(({ code, name }) => ({ value: code, label: name }))}
                placeholder={countryLabel}
                variant="default"
                className="gf-auth__input"
                aria-invalid={Boolean(errors.country)}
                {...countryRegister}
                onValueChange={() => setValue('state', '')}
              />
              {errors.country && (
                <span className="gf-auth__field-error" role="alert">
                  {errors.country.message}
                </span>
              )}
            </label>

            <label className="gf-auth__label">
              {stateOptions ? (
                <Select
                  options={stateOptions.map(({ code, name }) => ({ value: code, label: name }))}
                  placeholder={stateLabel}
                  variant="default"
                  className="gf-auth__input"
                  aria-invalid={Boolean(errors.state)}
                  {...register('state')}
                />
              ) : (
                <input
                  type="text"
                  {...register('state')}
                  placeholder={stateLabel}
                  className="gf-auth__input"
                  aria-invalid={Boolean(errors.state)}
                />
              )}
              {errors.state && (
                <span className="gf-auth__field-error" role="alert">
                  {errors.state.message}
                </span>
              )}
            </label>

            <label className="gf-auth__label">
              <span className="gf-auth__label-text">{roleLabel}</span>
              <Select
                options={SIGNUP_ROLES.map((r) => ({
                  value: r,
                  label: r.charAt(0).toUpperCase() + r.slice(1),
                }))}
                variant="default"
                className="gf-auth__input"
                aria-invalid={Boolean(errors.role)}
                {...register('role')}
              />
              {errors.role && (
                <span className="gf-auth__field-error" role="alert">
                  {errors.role.message}
                </span>
              )}
            </label>

            <label className="gf-auth__label">
              <input
                type="text"
                {...register('referralCode')}
                placeholder={referralCodeLabel}
                className="gf-auth__input"
                aria-invalid={Boolean(errors.referralCode)}
              />
              {errors.referralCode && (
                <span className="gf-auth__field-error" role="alert">
                  {errors.referralCode.message}
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
        </>
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

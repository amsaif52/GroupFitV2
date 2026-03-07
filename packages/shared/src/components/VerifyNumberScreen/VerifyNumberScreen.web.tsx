import React, { useState, useRef, useCallback } from 'react';
import Button from '../atoms/Button.web';

const CELL_COUNT = 4;

export interface VerifyNumberScreenWebProps {
  /** Phone number to display (e.g. "+44 7xxx") */
  phoneNumber: string;
  /** Called with the 4-digit OTP when user submits */
  onVerify: (otp: string) => void | Promise<void>;
  /** Called when user requests a new code */
  onResend: () => void | Promise<void>;
  /** Navigate back (e.g. to login/signup) */
  onBack?: () => void;
  loading?: boolean;
  error?: string | null;
  /** Resend available again after this many seconds (0 = available) */
  resendCooldownSeconds?: number;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  loadingLabel?: string;
  resendLabel?: string;
  resendPrompt?: string;
  requestNewCodeInLabel?: string;
  backLabel?: string;
}

export function VerifyNumberScreenWeb({
  phoneNumber,
  onVerify,
  onResend,
  onBack,
  loading = false,
  error = null,
  resendCooldownSeconds = 0,
  title = 'Verify Your\nPhone Number',
  subtitle,
  submitLabel = 'Verify',
  loadingLabel = 'Loading...',
  resendLabel = 'Resend',
  resendPrompt = "Didn't receive any code?",
  requestNewCodeInLabel = 'Request new code in',
  backLabel = 'Back',
}: VerifyNumberScreenWebProps) {
  const [digits, setDigits] = useState<string[]>(Array(CELL_COUNT).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const value = digits.join('');
  const canSubmit = value.length === CELL_COUNT && !loading;

  const setDigit = useCallback((index: number, char: string) => {
    const num = char.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = num;
      return next;
    });
    if (num && index < CELL_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setDigits((prev) => {
          const next = [...prev];
          next[index - 1] = '';
          return next;
        });
      }
    },
    [digits]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CELL_COUNT);
    const arr = pasted.split('');
    setDigits((prev) => {
      const next = [...prev];
      arr.forEach((c, i) => (next[i] = c));
      return next;
    });
    const nextFocus = Math.min(pasted.length, CELL_COUNT - 1);
    inputRefs.current[nextFocus]?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await onVerify(value);
  }

  const defaultSubtitle =
    subtitle ?? `Please enter the code sent to ${phoneNumber} for verification.`;

  return (
    <main className="gf-auth-main">
      <div className="gf-auth gf-auth--verify">
        {onBack && (
          <button type="button" className="gf-verify__back" onClick={onBack} aria-label={backLabel}>
            ← {backLabel}
          </button>
        )}
        <div className="gf-auth__header">
          <h1 className="gf-auth__title" style={{ whiteSpace: 'pre-line' }}>
            {title}
          </h1>
          <p className="gf-auth__subtitle">{defaultSubtitle}</p>
        </div>

        <form className="gf-auth__form" onSubmit={handleSubmit}>
          <div className="gf-verify__cells" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                autoComplete="one-time-code"
                className="gf-verify__cell"
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={loading}
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          {error && (
            <p className="gf-auth__error" role="alert">
              {error}
            </p>
          )}

          <div className="gf-verify__resend">
            <span className="gf-verify__resend-prompt">{resendPrompt}</span>
            {resendCooldownSeconds > 0 ? (
              <span className="gf-verify__resend-timer">
                {requestNewCodeInLabel} ({resendCooldownSeconds}s)
              </span>
            ) : (
              <button
                type="button"
                className="gf-verify__resend-btn"
                onClick={() => onResend()}
                disabled={loading}
              >
                {resendLabel}
              </button>
            )}
          </div>

          <Button
            label={submitLabel}
            variant="primary"
            size="lg"
            loading={loading}
            loadingLabel={loadingLabel}
            onPress={undefined}
            type="submit"
            disabled={!canSubmit}
            className="gf-button--full gf-button--mt"
          />
        </form>
      </div>
    </main>
  );
}

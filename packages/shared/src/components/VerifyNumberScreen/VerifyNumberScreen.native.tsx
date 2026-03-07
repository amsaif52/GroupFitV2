import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../theme';

const CELL_COUNT = 4;

export interface VerifyNumberScreenNativeProps {
  phoneNumber: string;
  onVerify: (otp: string) => void | Promise<void>;
  onResend: () => void | Promise<void>;
  onBack?: () => void;
  loading?: boolean;
  error?: string | null;
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

export function VerifyNumberScreenNative({
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
}: VerifyNumberScreenNativeProps) {
  const [digits, setDigits] = useState<string[]>(Array(CELL_COUNT).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);

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

  const handleKeyPress = useCallback(
    (index: number, e: { nativeEvent: { key: string } }) => {
      if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
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

  async function handleSubmit() {
    if (!canSubmit) return;
    Keyboard.dismiss();
    await onVerify(value);
  }

  const defaultSubtitle =
    subtitle ?? `Please enter the code sent to ${phoneNumber} for verification.`;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.backText}>← {backLabel}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.title}>{title.replace(/\n/g, ' ')}</Text>
        <Text style={styles.subtitle}>{defaultSubtitle}</Text>

        <View style={styles.cells}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              style={[styles.cell, Platform.OS === 'ios' && styles.cellIos]}
              value={d}
              onChangeText={(char) => setDigit(i, char)}
              onKeyPress={(e) => handleKeyPress(i, e)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!loading}
              selectTextOnFocus
              accessibilityLabel={`Digit ${i + 1}`}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.resendRow}>
          <Text style={styles.resendPrompt}>{resendPrompt}</Text>
          {resendCooldownSeconds > 0 ? (
            <Text style={styles.resendTimer}>
              {requestNewCodeInLabel} ({resendCooldownSeconds}s)
            </Text>
          ) : (
            <TouchableOpacity onPress={() => onResend()} disabled={loading} activeOpacity={0.7}>
              <Text style={styles.resendBtn}>{resendLabel}</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, (!canSubmit || loading) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.submitBtnText}>{loading ? loadingLabel : submitLabel}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
  scrollContent: {
    paddingHorizontal: spacing.paddingHorizontal,
    paddingVertical: spacing.paddingVertical,
    paddingTop: 50,
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.gap,
    paddingVertical: 8,
    paddingRight: spacing.inputPadding,
  },
  backText: {
    fontSize: fontSizes.font16,
    fontWeight: '600',
    color: colors.secondary,
  },
  title: {
    fontSize: fontSizes.font25,
    fontWeight: '700',
    color: colors.black,
    textAlign: 'center',
    marginBottom: spacing.marginTopSubtitle,
  },
  subtitle: {
    fontSize: fontSizes.font16,
    color: colors.grey,
    textAlign: 'center',
    marginBottom: spacing.marginTopForm,
    lineHeight: 22,
  },
  cells: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: spacing.gap,
  },
  cell: {
    width: 50,
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: colors.borderLight,
    fontSize: 24,
    fontWeight: '600',
    color: colors.black,
    textAlign: 'center',
    paddingVertical: 0,
  },
  cellIos: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderBottomWidth: 1,
    borderRadius: borderRadius.input,
    borderColor: colors.borderLight,
  },
  error: {
    fontSize: fontSizes.font14,
    color: colors.error,
    marginBottom: spacing.gap,
    textAlign: 'center',
  },
  resendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.marginTopButton,
    gap: 4,
  },
  resendPrompt: {
    fontSize: fontSizes.font14,
    color: colors.grey,
  },
  resendTimer: {
    fontSize: fontSizes.font14,
    color: colors.grey,
  },
  resendBtn: {
    fontSize: fontSizes.font14,
    fontWeight: '700',
    color: colors.secondary,
  },
  submitBtn: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.secondary,
    paddingVertical: spacing.buttonPaddingVertical,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: colors.grey,
    opacity: 0.8,
  },
  submitBtnText: {
    fontSize: fontSizes.font18,
    fontWeight: '700',
    color: colors.white,
  },
});

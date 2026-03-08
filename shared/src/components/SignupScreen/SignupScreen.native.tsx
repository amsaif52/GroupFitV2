import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../theme';

export interface SignupScreenNativeProps {
  onSubmit: (data: { name: string; email: string; password: string }) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
  onLoginClick?: () => void;
  title?: string;
  subtitle?: string;
  nameLabel?: string;
  emailLabel?: string;
  passwordLabel?: string;
  confirmPasswordLabel?: string;
  submitLabel?: string;
  loadingLabel?: string;
  footerPrompt?: string;
  footerLinkText?: string;
  termsLabel?: string;
  termsLinkText?: string;
  onTermsClick?: () => void;
  onGooglePress?: () => void | Promise<void>;
  onApplePress?: () => void | Promise<void>;
  continueWithGoogleLabel?: string;
  continueWithAppleLabel?: string;
  orLabel?: string;
}

const defaultTitle = 'Set Up Your Account';

export function SignupScreenNative({
  onSubmit,
  loading = false,
  error = null,
  onLoginClick,
  title = defaultTitle,
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
  onGooglePress,
  onApplePress,
  continueWithGoogleLabel = 'Continue with Google',
  continueWithAppleLabel = 'Continue with Apple',
  orLabel = 'or',
}: SignupScreenNativeProps) {
  const showSocial = Boolean(onGooglePress || onApplePress);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function handleSubmit() {
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        {showSocial && (
          <View style={styles.social}>
            {onGooglePress && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={onGooglePress}
                activeOpacity={0.8}
              >
                <Text style={styles.socialButtonText}>{continueWithGoogleLabel}</Text>
              </TouchableOpacity>
            )}
            {onApplePress && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={onApplePress}
                activeOpacity={0.8}
              >
                <Text style={styles.socialButtonText}>{continueWithAppleLabel}</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.orText}>{orLabel}</Text>
          </View>
        )}

        <View style={styles.form}>
          {displayError ? <Text style={styles.errorText}>{displayError}</Text> : null}

          <Text style={styles.label}>{nameLabel}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={nameLabel}
            placeholderTextColor={colors.placeholder}
            autoCapitalize="words"
            autoComplete="name"
            editable={!loading}
          />

          <Text style={styles.label}>{emailLabel}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={emailLabel}
            placeholderTextColor={colors.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />

          <Text style={styles.label}>{passwordLabel}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={passwordLabel}
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            autoComplete="password-new"
            editable={!loading}
          />

          <Text style={styles.label}>{confirmPasswordLabel}</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={confirmPasswordLabel}
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            autoComplete="password-new"
            editable={!loading}
          />

          {termsLabel ? (
            <View style={styles.termsRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setTermsAccepted((a) => !a)}
                style={styles.termsCheckWrap}
              >
                <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                  {termsAccepted ? <Text style={styles.checkmark}>✓</Text> : null}
                </View>
                <Text style={styles.termsText}>
                  {termsLabel}
                  {onTermsClick && termsLinkText ? ` ` : ''}
                </Text>
              </TouchableOpacity>
              {onTermsClick && termsLinkText ? (
                <TouchableOpacity
                  onPress={onTermsClick}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.termsLink}>{termsLinkText}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{loading ? loadingLabel : submitLabel}</Text>
          </TouchableOpacity>
        </View>

        {onLoginClick ? (
          <View style={styles.footer}>
            <Text style={styles.footerPrompt}>{footerPrompt}</Text>
            <TouchableOpacity
              onPress={onLoginClick}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.footerLink}>{footerLinkText}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
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
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.paddingHorizontal,
    paddingVertical: spacing.paddingVertical,
    paddingBottom: 40,
  },
  header: {
    marginTop: spacing.marginTopTitle,
  },
  title: {
    fontSize: fontSizes.font25,
    fontWeight: '700',
    color: colors.black,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.marginTopSubtitle,
    marginBottom: spacing.marginTopForm,
    fontSize: fontSizes.font16,
    fontWeight: '500',
    color: colors.grey,
    textAlign: 'center',
  },
  social: {
    width: '100%',
    maxWidth: 360,
    marginBottom: spacing.gap,
  },
  socialButton: {
    width: '100%',
    paddingVertical: spacing.buttonPaddingVertical,
    paddingHorizontal: spacing.buttonPaddingHorizontal,
    marginBottom: spacing.gap,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    fontSize: fontSizes.font16,
    fontWeight: '600',
    color: colors.black,
  },
  orText: {
    fontSize: fontSizes.font14,
    color: colors.grey,
    textAlign: 'center',
    marginVertical: spacing.gap,
  },
  form: {
    width: '100%',
    maxWidth: 360,
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    marginBottom: 8,
    fontSize: fontSizes.font14,
    color: colors.error,
  },
  label: {
    fontSize: fontSizes.font14,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 4,
  },
  input: {
    width: '100%',
    padding: spacing.inputPadding,
    fontSize: fontSizes.font16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.input,
    color: colors.black,
    marginBottom: spacing.gap,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.gap,
    gap: 8,
    flexWrap: 'wrap',
  },
  termsCheckWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  termsText: {
    flex: 1,
    fontSize: fontSizes.font14,
    color: colors.black,
  },
  termsLink: {
    color: colors.secondary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  button: {
    width: '100%',
    paddingVertical: spacing.buttonPaddingVertical,
    paddingHorizontal: spacing.buttonPaddingHorizontal,
    marginTop: spacing.marginTopButton,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: 'rgba(0,0,0,0.2)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 2,
        }
      : { elevation: 5 }),
  },
  buttonDisabled: {
    backgroundColor: '#565656',
  },
  buttonText: {
    fontSize: fontSizes.font18,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.marginTopFooter,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  footerPrompt: {
    fontSize: fontSizes.font14,
    color: colors.black,
  },
  footerLink: {
    fontSize: fontSizes.font14,
    fontWeight: '600',
    color: colors.secondary,
    padding: 4,
    textDecorationLine: 'underline',
  },
});

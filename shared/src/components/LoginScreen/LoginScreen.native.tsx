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

export interface LoginScreenNativeProps {
  onSubmit: (email: string, password: string) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
  onSignUpClick?: () => void;
  title?: string;
  subtitle?: string;
  emailLabel?: string;
  passwordLabel?: string;
  submitLabel?: string;
  loadingLabel?: string;
  footerPrompt?: string;
  footerLinkText?: string;
  /** Social login: "Continue with Google" */
  onGooglePress?: () => void | Promise<void>;
  /** Social login: "Continue with Apple" */
  onApplePress?: () => void | Promise<void>;
  continueWithGoogleLabel?: string;
  continueWithAppleLabel?: string;
  orLabel?: string;
}

const defaultTitle = 'Get Together.\nGet Fit.';
const defaultSubtitle = 'Login to your account';

export function LoginScreenNative({
  onSubmit,
  loading = false,
  error = null,
  onSignUpClick,
  title = defaultTitle,
  subtitle = defaultSubtitle,
  emailLabel = 'Email',
  passwordLabel = 'Password',
  submitLabel = 'Login',
  loadingLabel = 'Loading...',
  footerPrompt = 'New here?',
  footerLinkText = 'Sign up now',
  onGooglePress,
  onApplePress,
  continueWithGoogleLabel = 'Continue with Google',
  continueWithAppleLabel = 'Continue with Apple',
  orLabel = 'or',
}: LoginScreenNativeProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const showSocial = Boolean(onGooglePress || onApplePress);

  async function handleSubmit() {
    await onSubmit(email, password);
  }

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
        <Text style={styles.subtitle}>{subtitle}</Text>

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
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
            autoComplete="password"
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{loading ? loadingLabel : submitLabel}</Text>
          </TouchableOpacity>
        </View>

        {onSignUpClick ? (
          <View style={styles.footer}>
            <Text style={styles.footerPrompt}>{footerPrompt}</Text>
            <TouchableOpacity
              onPress={onSignUpClick}
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
    lineHeight: 34,
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

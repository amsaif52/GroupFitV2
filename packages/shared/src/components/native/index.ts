/**
 * Native (React Native) component exports.
 * Import from '@groupfit/shared/components/native' in customer-app and trainer-app.
 */
export { colors, fontSizes, spacing, borderRadius } from '../../theme';
export type { ThemeColors } from '../../theme';
export { LoginScreenNative as LoginScreen } from '../LoginScreen/LoginScreen.native';
export type { LoginScreenNativeProps as LoginScreenProps } from '../LoginScreen/LoginScreen.native';
export { SignupScreenNative as SignupScreen } from '../SignupScreen/SignupScreen.native';
export type { SignupScreenNativeProps as SignupScreenProps } from '../SignupScreen/SignupScreen.native';
export { OnboardingScreenNative as OnboardingScreen } from '../OnboardingScreen/OnboardingScreen.native';
export type { OnboardingScreenNativeProps as OnboardingScreenProps, OnboardingSlide } from '../OnboardingScreen/OnboardingScreen.native';
export { ONBOARDING_SLIDES_CUSTOMER, ONBOARDING_SLIDES_TRAINER } from '../OnboardingScreen/onboardingSlides';
export { ProfileScreenNative } from '../ProfileScreen/ProfileScreen.native';
export type { ProfileScreenNativeProps, ProfileVariant } from '../ProfileScreen/ProfileScreen.native';
export { HelpChatNative as HelpChat } from '../HelpChat/HelpChat.native';
export type { HelpChatProps } from '../HelpChat';
export { ErrorBoundaryNative } from '../ErrorBoundary/ErrorBoundary.native';

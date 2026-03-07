/**
 * Atomic design exports.
 * Use atoms for smallest building blocks, molecules for simple combinations,
 * organisms for sections, templates for page structure.
 */
export * from './atoms';
export { default as Button } from './atoms/Button.web';
export * from './molecules';
export * from './organisms';
export * from './templates';
export { LoginScreenWeb as LoginScreen } from './LoginScreen';
export type { LoginScreenWebProps as LoginScreenProps } from './LoginScreen';
export { SignupScreenWeb as SignupScreen } from './SignupScreen';
export type { SignupScreenWebProps as SignupScreenProps } from './SignupScreen';
export { OnboardingScreenWeb as OnboardingScreen } from './OnboardingScreen/OnboardingScreen.web';
export type { OnboardingScreenWebProps as OnboardingScreenProps } from './OnboardingScreen/OnboardingScreen.web';
export {
  ONBOARDING_SLIDES_CUSTOMER,
  ONBOARDING_SLIDES_TRAINER,
} from './OnboardingScreen/onboardingSlides';
export { VerifyNumberScreenWeb as VerifyNumberScreen } from './VerifyNumberScreen';
export type { VerifyNumberScreenWebProps as VerifyNumberScreenProps } from './VerifyNumberScreen';
export { SplashScreenWeb as SplashScreen } from './SplashScreen';
export type { SplashScreenWebProps as SplashScreenProps } from './SplashScreen';
export { HelpChatWeb as HelpChat } from './HelpChat';
export type { HelpChatProps } from './HelpChat';

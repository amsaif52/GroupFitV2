/**
 * Import from @groupfit/shared-src (aliased to shared/src in next.config).
 * This never resolves to node_modules, so edits in shared show up after save + refresh.
 */
export { SignupScreenWeb as SignupScreen } from '@groupfit/shared/components/SignupScreen/SignupScreen.web';
export type { SignupScreenWebProps as SignupScreenProps } from '@groupfit/shared/components/SignupScreen/SignupScreen.web';
export { default as Button } from '@groupfit/shared/components/atoms/Button.web';

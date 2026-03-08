/**
 * Import from @groupfit/shared-src (aliased to shared/src in next.config).
 * This never resolves to node_modules, so edits in shared show up after save + refresh.
 */
export { LoginScreenWeb as LoginScreen } from '@groupfit/shared/components/LoginScreen/LoginScreen.web';
export type { LoginScreenWebProps as LoginScreenProps } from '@groupfit/shared/components/LoginScreen/LoginScreen.web';
export { default as Button } from '@groupfit/shared/components/atoms/Button.web';

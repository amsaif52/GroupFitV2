/**
 * Re-export auth schemas from shared for use in the web app.
 * Login and signup forms use React Hook Form + Zod inside the shared components.
 */
export {
  loginSchema,
  signupSchema,
  signupFormSchema,
  type LoginInput,
  type SignupInput,
  type SignupFormInput,
} from '@groupfit/shared';

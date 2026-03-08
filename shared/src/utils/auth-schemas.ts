import { z } from 'zod';

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

const passwordLoginSchema = z.string().min(1, 'Password is required');

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordLoginSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

const passwordSignupSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password must contain at least one letter and one number');

const signupFormSchemaBase = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  email: emailSchema,
  password: passwordSignupSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
});

/** Sign-up form schema (includes confirmPassword for UI). */
export const signupFormSchema = signupFormSchemaBase.refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
);

export type SignupFormInput = z.infer<typeof signupFormSchema>;

/** API sign-up payload (name, email, password only). */
export const signupSchema = signupFormSchemaBase.pick({
  name: true,
  email: true,
  password: true,
});

export type SignupInput = z.infer<typeof signupSchema>;

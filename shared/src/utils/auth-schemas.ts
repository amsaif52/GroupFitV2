import { z } from 'zod';

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const loginSchema = z.object({
  email: emailSchema,
});

export const loginPhoneSchema = z.object({
  phone: z.string().min(1, 'Phone is required'),
});

export const verifyOtpSchema = z.object({
  otp: z.string().min(1, 'OTP is required'),
  userCode: z.string().min(1, 'User code is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type LoginPhoneInput = z.infer<typeof loginPhoneSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const SIGNUP_ROLES = ['customer', 'trainer'] as const;
export type SignupRole = (typeof SIGNUP_ROLES)[number];

const signupFormSchemaObject = z.object({
  name: z.string().min(1, 'Full name is required').max(200, 'Name is too long'),
  email: emailSchema,
  phone: z.string().min(1, 'Phone number is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  role: z.enum(SIGNUP_ROLES, { required_error: 'Please select customer or trainer' }),
  referralCode: z.string().optional(),
});

/** Sign-up form schema (includes confirmPassword and optional referral for UI). */
export const signupFormSchema = signupFormSchemaObject;

export type SignupFormInput = z.infer<typeof signupFormSchema>;

/** API sign-up payload (name, email, phone, country, state, role, referralCode). */
export const signupSchema = signupFormSchemaObject.pick({
  name: true,
  email: true,
  phone: true,
  country: true,
  state: true,
  role: true,
  referralCode: true,
});

export type SignupInput = z.infer<typeof signupSchema>;

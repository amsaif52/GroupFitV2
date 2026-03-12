'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getStoredUser } from '@/lib/auth';
import { customerApi, trainerApi } from '@/lib/api';
import { COUNTRY_CODES, CountryCode, getSubdivisionsForCountry, ROLES } from '@groupfit/shared';
import { getApiErrorMessage } from '@groupfit/shared';
import { CloudinaryUploadButton } from '@/components/CloudinaryUploadButton';

const GENDER_OPTIONS = [
  { value: '', label: 'Select…' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const customerProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  heightCm: z
    .union([z.number(), z.nan()])
    .optional()
    .transform((v) =>
      v === undefined || (typeof v === 'number' && Number.isNaN(v)) ? undefined : v
    ),
  weightKg: z
    .union([z.number(), z.nan()])
    .optional()
    .transform((v) =>
      v === undefined || (typeof v === 'number' && Number.isNaN(v)) ? undefined : v
    ),
  preExistingConditions: z.string().optional(),
});

const trainerProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  locale: z.string().optional(),
  countryCode: z.string().optional(),
  state: z.string().optional(),
});

type CustomerProfileFormValues = z.infer<typeof customerProfileSchema>;
type TrainerProfileFormValues = z.infer<typeof trainerProfileSchema>;

const customerDefaultValues: CustomerProfileFormValues = {
  name: '',
  email: '',
  phone: '',
  avatarUrl: '',
  gender: '',
  dateOfBirth: '',
  heightCm: undefined,
  weightKg: undefined,
  preExistingConditions: '',
};

const trainerDefaultValues: TrainerProfileFormValues = {
  name: '',
  email: '',
  phone: '',
  locale: 'en',
  countryCode: '',
  state: '',
};

export default function ProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>(ROLES.CUSTOMER);

  const customerForm = useForm<CustomerProfileFormValues>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: customerDefaultValues,
  });

  const trainerForm = useForm<TrainerProfileFormValues>({
    resolver: zodResolver(trainerProfileSchema),
    defaultValues: trainerDefaultValues,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const countryCode = trainerForm.watch('countryCode');
  const stateOptions = countryCode ? getSubdivisionsForCountry(countryCode) : undefined;

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    const isTrainer = user.role === ROLES.TRAINER || user.role === ROLES.ADMIN;
    setRole(isTrainer ? ROLES.TRAINER : ROLES.CUSTOMER);
    const api = isTrainer ? trainerApi : customerApi;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.viewProfile();
        const data = res.data as Record<string, unknown> & {
          mtype?: string;
          name?: string;
          emailid?: string;
          phone?: string;
          locale?: string;
          countryCode?: string;
          state?: string;
          avatarUrl?: string;
          gender?: string;
          dateOfBirth?: string;
          heightCm?: number;
          weightKg?: number;
          preExistingConditions?: string;
        };
        if (!cancelled && data?.mtype === 'success') {
          if (isTrainer) {
            trainerForm.reset({
              name: (data.name as string) ?? '',
              email: (data.emailid as string) ?? '',
              phone: (data.phone as string) ?? '',
              locale: (data.locale as string) ?? 'en',
              countryCode: (data.countryCode as string) ?? '',
              state: (data.state as string) ?? '',
            });
          } else {
            customerForm.reset({
              name: (data.name as string) ?? '',
              email: (data.emailid as string) ?? '',
              phone: (data.phone as string) ?? '',
              avatarUrl: (data.avatarUrl as string) ?? '',
              gender: (data.gender as string) ?? '',
              dateOfBirth: (data.dateOfBirth as string) ?? '',
              heightCm: data.heightCm ?? undefined,
              weightKg: data.weightKg ?? undefined,
              preExistingConditions: (data.preExistingConditions as string) ?? '',
            });
          }
        }
      } catch (e) {
        if (!cancelled) setSubmitError(getApiErrorMessage(e, 'Failed to load profile'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, customerForm.reset, trainerForm.reset]);

  const { onChange: countryOnChange, ...countryRegister } = trainerForm.register('countryCode');
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    countryOnChange(e);
    trainerForm.setValue('state', '');
  };

  async function onCustomerSubmit(values: CustomerProfileFormValues) {
    setSubmitError(null);
    try {
      const body = {
        name: values.name?.trim() || undefined,
        avatarUrl: values.avatarUrl?.trim() || undefined,
        gender: values.gender?.trim() || undefined,
        dateOfBirth: values.dateOfBirth?.trim() || undefined,
        heightCm:
          values.heightCm != null && !Number.isNaN(Number(values.heightCm))
            ? Number(values.heightCm)
            : undefined,
        weightKg:
          values.weightKg != null && !Number.isNaN(Number(values.weightKg))
            ? Number(values.weightKg)
            : undefined,
        preExistingConditions: values.preExistingConditions?.trim() || undefined,
      };
      const res = await customerApi.editProfile(body);
      const data = res.data as { mtype?: string; message?: string };
      if (data?.mtype === 'success') {
        router.push('/profile');
        router.refresh();
      } else {
        setSubmitError('Update failed');
      }
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Failed to save'));
    }
  }

  async function onTrainerSubmit(values: TrainerProfileFormValues) {
    setSubmitError(null);
    try {
      const body = {
        name: values.name?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        locale: values.locale?.trim() || undefined,
        countryCode: values.countryCode?.trim().toUpperCase() || undefined,
        state: role === ROLES.TRAINER && values.state?.trim() ? values.state.trim() : undefined,
      };
      const res = await trainerApi.editProfile(body);
      const data = res.data as { mtype?: string; message?: string };
      if (data?.mtype === 'success') {
        router.push('/profile');
        router.refresh();
      } else {
        setSubmitError('Update failed');
      }
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Failed to save'));
    }
  }

  if (loading) {
    return (
      <main className="gf-profile-main" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </main>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--groupfit-border-light, #ccc)',
    borderRadius: 8,
    fontSize: 14,
  };
  const labelStyle = { display: 'block' as const, fontWeight: 600, marginBottom: 4, fontSize: 14 };
  const fieldStyle = { marginBottom: '1rem' };
  const readOnlyInputStyle = {
    ...inputStyle,
    backgroundColor: 'var(--groupfit-border-light, #eee)',
    cursor: 'not-allowed',
  };

  return (
    <main className="gf-profile-main" style={{ margin: '0 auto', padding: '2rem', maxWidth: 480 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/profile" style={{ color: 'var(--groupfit-secondary)', fontWeight: 600 }}>
          ← Back to Profile
        </Link>
      </div>
      <h1 style={{ marginBottom: '1rem' }}>Edit Profile</h1>
      {submitError && (
        <p style={{ color: 'var(--groupfit-secondary)', marginBottom: '1rem' }}>{submitError}</p>
      )}

      {role === ROLES.CUSTOMER ? (
        <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
              flexDirection: 'column',
            }}
          >
            <label style={labelStyle}>Profile picture</label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {(() => {
                const avatarUrl = customerForm.watch('avatarUrl');
                if (avatarUrl) {
                  return (
                    <div
                      style={{
                        position: 'relative',
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <Image
                        src={avatarUrl}
                        alt="Profile"
                        fill
                        style={{ objectFit: 'cover' }}
                        unoptimized
                      />
                    </div>
                  );
                }
                return (
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'var(--groupfit-border-light, #eee)',
                      flexShrink: 0,
                    }}
                    aria-hidden
                  />
                );
              })()}
              <div>
                <CloudinaryUploadButton
                  onUpload={(url) => customerForm.setValue('avatarUrl', url)}
                  label="Upload photo"
                />
              </div>
            </div>
          </div>

          <div style={fieldStyle}>
            <label htmlFor="customer-name" style={labelStyle}>
              Name
            </label>
            <input
              id="customer-name"
              type="text"
              {...customerForm.register('name')}
              placeholder="Your name"
              style={inputStyle}
              aria-invalid={Boolean(customerForm.formState.errors.name)}
            />
            {customerForm.formState.errors.name && (
              <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                {customerForm.formState.errors.name.message}
              </span>
            )}
          </div>

          <div style={fieldStyle}>
            <label htmlFor="customer-email" style={labelStyle}>
              Email
            </label>
            <input
              id="customer-email"
              type="email"
              {...customerForm.register('email')}
              readOnly
              style={readOnlyInputStyle}
              title="Email cannot be changed"
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="customer-phone" style={labelStyle}>
              Phone number
            </label>
            <input
              id="customer-phone"
              type="tel"
              {...customerForm.register('phone')}
              readOnly
              style={readOnlyInputStyle}
              title="Phone cannot be changed"
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="customer-gender" style={labelStyle}>
              Gender
            </label>
            <select
              id="customer-gender"
              {...customerForm.register('gender')}
              style={inputStyle}
              aria-invalid={Boolean(customerForm.formState.errors.gender)}
            >
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt.value || 'empty'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label htmlFor="customer-dob" style={labelStyle}>
              Date of birth
            </label>
            <input
              id="customer-dob"
              type="date"
              {...customerForm.register('dateOfBirth')}
              style={inputStyle}
              aria-invalid={Boolean(customerForm.formState.errors.dateOfBirth)}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: '1rem',
            }}
          >
            <div>
              <label htmlFor="customer-height" style={labelStyle}>
                Height (cm)
              </label>
              <input
                id="customer-height"
                type="number"
                min={50}
                max={300}
                step={1}
                placeholder="170"
                {...customerForm.register('heightCm', { valueAsNumber: true })}
                style={inputStyle}
                aria-invalid={Boolean(customerForm.formState.errors.heightCm)}
              />
              {customerForm.formState.errors.heightCm && (
                <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                  {customerForm.formState.errors.heightCm.message}
                </span>
              )}
            </div>
            <div>
              <label htmlFor="customer-weight" style={labelStyle}>
                Weight (kg)
              </label>
              <input
                id="customer-weight"
                type="number"
                min={20}
                max={500}
                step={0.1}
                placeholder="70"
                {...customerForm.register('weightKg', { valueAsNumber: true })}
                style={inputStyle}
                aria-invalid={Boolean(customerForm.formState.errors.weightKg)}
              />
              {customerForm.formState.errors.weightKg && (
                <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                  {customerForm.formState.errors.weightKg.message}
                </span>
              )}
            </div>
          </div>

          <div style={fieldStyle}>
            <label htmlFor="customer-conditions" style={labelStyle}>
              Pre-existing conditions
            </label>
            <textarea
              id="customer-conditions"
              {...customerForm.register('preExistingConditions')}
              placeholder="Any medical or health conditions we should know about (optional)"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              aria-invalid={Boolean(customerForm.formState.errors.preExistingConditions)}
            />
            {customerForm.formState.errors.preExistingConditions && (
              <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                {customerForm.formState.errors.preExistingConditions.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={customerForm.formState.isSubmitting}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'var(--groupfit-secondary)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: customerForm.formState.isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {customerForm.formState.isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </form>
      ) : (
        <form onSubmit={trainerForm.handleSubmit(onTrainerSubmit)}>
          <div style={fieldStyle}>
            <label htmlFor="name" style={labelStyle}>
              Name
            </label>
            <input
              id="name"
              type="text"
              {...trainerForm.register('name')}
              placeholder="Your name"
              style={inputStyle}
              aria-invalid={Boolean(trainerForm.formState.errors.name)}
            />
            {trainerForm.formState.errors.name && (
              <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                {trainerForm.formState.errors.name.message}
              </span>
            )}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="email" style={labelStyle}>
              Email
            </label>
            <input
              id="email"
              type="email"
              {...trainerForm.register('email')}
              readOnly
              style={readOnlyInputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="phone" style={labelStyle}>
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              {...trainerForm.register('phone')}
              placeholder="+44 7700 900000"
              style={inputStyle}
              aria-invalid={Boolean(trainerForm.formState.errors.phone)}
            />
            {trainerForm.formState.errors.phone && (
              <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                {trainerForm.formState.errors.phone.message}
              </span>
            )}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="countryCode" style={labelStyle}>
              Country
            </label>
            <select
              id="countryCode"
              {...countryRegister}
              onChange={handleCountryChange}
              style={inputStyle}
              aria-invalid={Boolean(trainerForm.formState.errors.countryCode)}
            >
              {COUNTRY_CODES.map((country: CountryCode) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            {trainerForm.formState.errors.countryCode && (
              <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                {trainerForm.formState.errors.countryCode.message}
              </span>
            )}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="state" style={labelStyle}>
              State
            </label>
            {stateOptions ? (
              <select
                id="state"
                {...trainerForm.register('state')}
                style={inputStyle}
                aria-invalid={Boolean(trainerForm.formState.errors.state)}
              >
                {stateOptions.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="state"
                type="text"
                {...trainerForm.register('state')}
                placeholder="State / Province"
                style={inputStyle}
                aria-invalid={Boolean(trainerForm.formState.errors.state)}
              />
            )}
            {trainerForm.formState.errors.state && (
              <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                {trainerForm.formState.errors.state.message}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={trainerForm.formState.isSubmitting}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'var(--groupfit-secondary)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: trainerForm.formState.isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {trainerForm.formState.isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}
    </main>
  );
}

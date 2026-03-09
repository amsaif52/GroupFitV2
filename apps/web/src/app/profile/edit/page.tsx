'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getStoredUser } from '@/lib/auth';
import { customerApi, trainerApi } from '@/lib/api';
import { COUNTRY_CODES, CountryCode, getSubdivisionsForCountry, ROLES } from '@groupfit/shared';
import { getApiErrorMessage } from '@groupfit/shared';

const profileEditSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  locale: z.string().optional(),
  countryCode: z.string().optional(),
  state: z.string().optional(),
});

type ProfileEditFormValues = z.infer<typeof profileEditSchema>;

const defaultValues: ProfileEditFormValues = {
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const countryCode = watch('countryCode');
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
        const data = res.data as {
          mtype?: string;
          name?: string;
          emailid?: string;
          phone?: string;
          locale?: string;
          countryCode?: string;
          state?: string;
        };
        if (!cancelled && data?.mtype === 'success') {
          reset({
            name: data.name ?? '',
            email: data.emailid ?? '',
            phone: data.phone ?? '',
            locale: data.locale ?? 'en',
            countryCode: data.countryCode ?? '',
            state: data.state ?? '',
          });
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
  }, [router, reset]);

  const { onChange: countryOnChange, ...countryRegister } = register('countryCode');
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    countryOnChange(e);
    setValue('state', '');
  };

  async function onSubmit(values: ProfileEditFormValues) {
    setSubmitError(null);
    const api = role === ROLES.TRAINER ? trainerApi : customerApi;
    try {
      const body: {
        name?: string;
        phone?: string;
        locale?: string;
        countryCode?: string;
        state?: string;
      } = {
        name: values.name?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        locale: values.locale?.trim() || undefined,
        countryCode: values.countryCode?.trim().toUpperCase() || undefined,
      };
      if (role === ROLES.TRAINER && values.state?.trim()) {
        body.state = values.state.trim();
      }
      const res = await api.editProfile(body);
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
    border: '1px solid #ccc',
    borderRadius: 8,
  };
  const labelStyle = { display: 'block', fontWeight: 600, marginBottom: 4 };

  return (
    <main className="gf-profile-main" style={{ margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/profile" style={{ color: 'var(--groupfit-secondary)', fontWeight: 600 }}>
          ← Back to Profile
        </Link>
      </div>
      <h1 style={{ marginBottom: '1rem' }}>Edit Profile</h1>
      {submitError && (
        <p style={{ color: 'var(--groupfit-secondary)', marginBottom: '1rem' }}>{submitError}</p>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={labelStyle}>
            Name
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            placeholder="Your name"
            style={inputStyle}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
              {errors.name.message}
            </span>
          )}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={labelStyle}>
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            readOnly
            style={{ ...inputStyle, backgroundColor: '#eee' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="phone" style={labelStyle}>
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+44 7700 900000"
            style={inputStyle}
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone && (
            <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
              {errors.phone.message}
            </span>
          )}
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="countryCode" style={labelStyle}>
            Country
          </label>
          <select
            id="countryCode"
            {...countryRegister}
            onChange={handleCountryChange}
            style={inputStyle}
            aria-invalid={Boolean(errors.countryCode)}
          >
            {COUNTRY_CODES.map((country: CountryCode) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.countryCode && (
            <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
              {errors.countryCode.message}
            </span>
          )}
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="state" style={labelStyle}>
            State
          </label>
          {stateOptions ? (
            <select
              id="state"
              {...register('state')}
              style={inputStyle}
              aria-invalid={Boolean(errors.state)}
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
              {...register('state')}
              placeholder="State / Province"
              style={inputStyle}
              aria-invalid={Boolean(errors.state)}
            />
          )}
          {errors.state && (
            <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
              {errors.state.message}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '0.5rem 1.5rem',
            background: 'var(--groupfit-secondary)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    </main>
  );
}

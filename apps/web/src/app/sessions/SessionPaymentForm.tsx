'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { customerApi } from '@/lib/api';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type SessionPaymentFormInnerProps = {
  clientSecret: string;
  sessionId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

function SessionPaymentFormInner({
  clientSecret,
  sessionId,
  onSuccess,
  onCancel,
}: SessionPaymentFormInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: { return_url: typeof window !== 'undefined' ? window.location.href : '' },
        redirect: 'if_required',
      });
      if (confirmError) {
        setError(confirmError.message ?? 'Payment failed');
        setLoading(false);
        return;
      }
      if (paymentIntent?.id) {
        const res = await customerApi.sessionPayment({
          sessionId,
          paymentIntentId: paymentIntent.id,
        });
        const data = res?.data as { paid?: boolean } | undefined;
        if (data?.paid) {
          onSuccess();
          return;
        }
      }
      setError('Payment could not be linked to this session.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <p style={{ color: '#c00', fontSize: 14, marginTop: 12 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button
          type="submit"
          disabled={!stripe || loading}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--groupfit-secondary)',
            color: '#fff',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Processing…' : 'Pay now'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid var(--groupfit-grey)',
            background: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

type SessionPaymentFormProps = {
  clientSecret: string;
  sessionId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export function SessionPaymentForm({
  clientSecret,
  sessionId,
  onSuccess,
  onCancel,
}: SessionPaymentFormProps) {
  if (!stripePromise) {
    return (
      <p style={{ color: 'var(--groupfit-grey)', marginTop: 16 }}>
        Payment is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
      </p>
    );
  }
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
      <SessionPaymentFormInner
        clientSecret={clientSecret}
        sessionId={sessionId}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}

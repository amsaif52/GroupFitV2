'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrainerLayout } from '../TrainerLayout';
import { trainerApi } from '@/lib/api';
import { ROUTES } from '../routes';
import { getApiErrorMessage } from '@groupfit/shared';

type BankDetails = {
  id: string;
  accountHolderName: string;
  bankName?: string | null;
  last4: string;
  routingLast4?: string | null;
  createdAt?: string;
};

export default function BankDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<BankDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formAccountHolder, setFormAccountHolder] = useState('');
  const [formBankName, setFormBankName] = useState('');
  const [formLast4, setFormLast4] = useState('');
  const [formRoutingLast4, setFormRoutingLast4] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchDetails = () => {
    setLoading(true);
    trainerApi
      .viewTrainerBankDetails()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error' || data?.accountHolderName == null) {
          setDetails(null);
          setError(null);
        } else {
          setDetails({
            id: String(data?.id ?? ''),
            accountHolderName: String(data.accountHolderName),
            bankName: (data?.bankName as string | null) ?? null,
            last4: String(data?.last4 ?? ''),
            routingLast4: (data?.routingLast4 as string | null) ?? null,
            createdAt: data?.createdAt as string | undefined,
          });
          setError(null);
        }
      })
      .catch((err) => {
        setDetails(null);
        setError(getApiErrorMessage(err, 'Failed to load bank details'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const openForm = () => {
    setFormAccountHolder(details?.accountHolderName ?? '');
    setFormBankName(details?.bankName ?? '');
    setFormLast4(details?.last4 ?? '');
    setFormRoutingLast4(details?.routingLast4 ?? '');
    setShowForm(true);
    setError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormAccountHolder('');
    setFormBankName('');
    setFormLast4('');
    setFormRoutingLast4('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = formAccountHolder.trim();
    const last4 = formLast4.replace(/\D/g, '').slice(-4);
    if (!name) {
      setError('Account holder name is required');
      return;
    }
    if (last4.length !== 4) {
      setError('Last 4 digits of account number are required');
      return;
    }
    setSubmitLoading(true);
    setError(null);
    trainerApi
      .addTrainerBankDetails({
        accountHolderName: name,
        bankName: formBankName.trim() || null,
        last4,
        routingLast4: formRoutingLast4.replace(/\D/g, '').slice(-4) || null,
      })
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          closeForm();
          fetchDetails();
        } else {
          setError(String(data?.message ?? 'Save failed'));
        }
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Save failed')))
      .finally(() => setSubmitLoading(false));
  };

  return (
    <TrainerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <span className="gf-home__logo">Bank Details</span>
      </header>

      <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 16 }}>
        Add or update your bank account for receiving payments. Only the last 4 digits of account
        and routing numbers are stored.
      </p>

      <Link
        href={ROUTES.dashboard}
        style={{
          fontSize: 14,
          color: 'var(--groupfit-secondary)',
          fontWeight: 600,
          marginBottom: 16,
          display: 'inline-block',
        }}
      >
        ← Dashboard
      </Link>

      {error && <p style={{ color: '#c00', marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : showForm ? (
        <div
          style={{
            marginBottom: 24,
            padding: 20,
            border: '1px solid var(--groupfit-border-light)',
            borderRadius: 8,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
            {details ? 'Update bank details' : 'Add bank details'}
          </h2>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Account holder name *
            </label>
            <input
              type="text"
              value={formAccountHolder}
              onChange={(e) => setFormAccountHolder(e.target.value)}
              placeholder="Full name on account"
              required
              style={{
                padding: 8,
                width: '100%',
                maxWidth: 280,
                marginBottom: 12,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            />
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Bank name (optional)
            </label>
            <input
              type="text"
              value={formBankName}
              onChange={(e) => setFormBankName(e.target.value)}
              placeholder="e.g. Chase, Bank of America"
              style={{
                padding: 8,
                width: '100%',
                maxWidth: 280,
                marginBottom: 12,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            />
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Last 4 digits of account number *
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={formLast4}
              onChange={(e) => setFormLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              style={{
                padding: 8,
                width: 80,
                marginBottom: 12,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            />
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Last 4 digits of routing number (optional)
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={formRoutingLast4}
              onChange={(e) => setFormRoutingLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="5678"
              style={{
                padding: 8,
                width: 80,
                marginBottom: 16,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                disabled={submitLoading}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--groupfit-secondary)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: submitLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {submitLoading ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid #666',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : details ? (
        <div
          style={{
            padding: 20,
            border: '1px solid var(--groupfit-border-light)',
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{details.accountHolderName}</div>
          {details.bankName && (
            <div style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 4 }}>
              {details.bankName}
            </div>
          )}
          <div style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>
            Account ending in ••••{details.last4}
          </div>
          {details.routingLast4 && (
            <div style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginTop: 4 }}>
              Routing ••••{details.routingLast4}
            </div>
          )}
          <button
            type="button"
            onClick={openForm}
            style={{
              marginTop: 16,
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid var(--groupfit-secondary)',
              background: '#fff',
              color: 'var(--groupfit-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Update bank details
          </button>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--groupfit-grey)', marginBottom: 16 }}>
            No bank details on file. Add them to receive payments.
          </p>
          <button
            type="button"
            onClick={openForm}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--groupfit-secondary)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Add bank details
          </button>
        </>
      )}
    </TrainerLayout>
  );
}

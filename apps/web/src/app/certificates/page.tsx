'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrainerLayout } from '../TrainerLayout';
import { trainerApi } from '@/lib/api';
import { ROUTES } from '../routes';
import { getApiErrorMessage } from '@groupfit/shared';

type CertItem = {
  id: string;
  name: string;
  issuingOrganization?: string | null;
  issuedAt?: string | null;
  credentialId?: string | null;
  documentUrl?: string | null;
  createdAt: string;
};

export default function CertificatesPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<CertItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CertItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formIssuingOrg, setFormIssuingOrg] = useState('');
  const [formIssuedAt, setFormIssuedAt] = useState('');
  const [formCredentialId, setFormCredentialId] = useState('');
  const [formDocumentUrl, setFormDocumentUrl] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchList = () => {
    trainerApi
      .trainerCertificateList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Failed to load'));
          setList([]);
        } else {
          const certList = (data?.trainerCertificateList ?? data?.list) as CertItem[] | undefined;
          setList(certList ?? []);
          setError(null);
        }
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, 'Failed to load certificates'));
        setList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setFormName('');
    setFormIssuingOrg('');
    setFormIssuedAt('');
    setFormCredentialId('');
    setFormDocumentUrl('');
    setShowForm(true);
  };

  const openEdit = (row: CertItem) => {
    setEditing(row);
    setFormName(row.name);
    setFormIssuingOrg(row.issuingOrganization ?? '');
    setFormIssuedAt(row.issuedAt ? row.issuedAt.slice(0, 10) : '');
    setFormCredentialId(row.credentialId ?? '');
    setFormDocumentUrl(row.documentUrl ?? '');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormName('');
    setFormIssuingOrg('');
    setFormIssuedAt('');
    setFormCredentialId('');
    setFormDocumentUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = formName.trim();
    if (!name) return;
    setSubmitLoading(true);
    setError(null);
    if (editing) {
      trainerApi
        .editTrainerCertificate({
          id: editing.id,
          name,
          issuingOrganization: formIssuingOrg.trim() || null,
          issuedAt: formIssuedAt.trim() || null,
          credentialId: formCredentialId.trim() || null,
          documentUrl: formDocumentUrl.trim() || null,
        })
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeForm();
            fetchList();
          } else {
            setError(String(data?.message ?? 'Update failed'));
          }
        })
        .catch((err) => setError(getApiErrorMessage(err, 'Update failed')))
        .finally(() => setSubmitLoading(false));
    } else {
      trainerApi
        .addTrainerCertificate({
          name,
          issuingOrganization: formIssuingOrg.trim() || null,
          issuedAt: formIssuedAt.trim() || null,
          credentialId: formCredentialId.trim() || null,
          documentUrl: formDocumentUrl.trim() || null,
        })
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeForm();
            fetchList();
          } else {
            setError(String(data?.message ?? 'Add failed'));
          }
        })
        .catch((err) => setError(getApiErrorMessage(err, 'Add failed')))
        .finally(() => setSubmitLoading(false));
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Remove this certificate?')) return;
    setActionId(id);
    trainerApi
      .deleteCertification(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchList();
        else setError(String(data?.message ?? 'Delete failed'));
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Delete failed')))
      .finally(() => setActionId(null));
  };

  return (
    <TrainerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <span className="gf-home__logo">Certificates</span>
      </header>

      <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 16 }}>
        Add and manage your certifications (e.g. CPR, NASM, ACE).
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

      <button
        type="button"
        onClick={openAdd}
        style={{
          marginBottom: 20,
          padding: '10px 16px',
          borderRadius: 8,
          border: 'none',
          background: 'var(--groupfit-secondary)',
          color: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Add certificate
      </button>

      {showForm && (
        <div
          style={{
            marginBottom: 24,
            padding: 20,
            border: '1px solid var(--groupfit-border-light)',
            borderRadius: 8,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
            {editing ? 'Edit certificate' : 'New certificate'}
          </h2>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Name *
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. CPR, NASM-CPT"
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
              Issuing organization (optional)
            </label>
            <input
              type="text"
              value={formIssuingOrg}
              onChange={(e) => setFormIssuingOrg(e.target.value)}
              placeholder="e.g. American Red Cross"
              style={{
                padding: 8,
                width: '100%',
                maxWidth: 320,
                marginBottom: 12,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            />
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Issue date (optional)
            </label>
            <input
              type="date"
              value={formIssuedAt}
              onChange={(e) => setFormIssuedAt(e.target.value)}
              style={{
                padding: 8,
                width: '100%',
                maxWidth: 180,
                marginBottom: 12,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            />
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Credential ID (optional)
            </label>
            <input
              type="text"
              value={formCredentialId}
              onChange={(e) => setFormCredentialId(e.target.value)}
              placeholder="License or credential number"
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
              Document URL (optional)
            </label>
            <input
              type="url"
              value={formDocumentUrl}
              onChange={(e) => setFormDocumentUrl(e.target.value)}
              placeholder="https://..."
              style={{
                padding: 8,
                width: '100%',
                maxWidth: 400,
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
                {submitLoading ? 'Saving…' : editing ? 'Update' : 'Add'}
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
      )}

      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : list.length === 0 ? (
        <div className="gf-home__empty">No certificates yet. Add one above.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {list.map((row) => (
            <li
              key={row.id}
              style={{
                padding: 16,
                marginBottom: 12,
                border: '1px solid var(--groupfit-border-light)',
                borderRadius: 8,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{row.name}</div>
              {row.issuingOrganization && (
                <div style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 4 }}>
                  {row.issuingOrganization}
                </div>
              )}
              {row.issuedAt && (
                <div style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 4 }}>
                  Issued {new Date(row.issuedAt).toLocaleDateString()}
                </div>
              )}
              {row.credentialId && (
                <div style={{ fontSize: 13, color: 'var(--groupfit-grey)' }}>
                  ID: {row.credentialId}
                </div>
              )}
              {row.documentUrl && (
                <a
                  href={row.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 14,
                    color: 'var(--groupfit-secondary)',
                    marginTop: 4,
                    display: 'inline-block',
                  }}
                >
                  View document
                </a>
              )}
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  style={{
                    padding: '6px 12px',
                    fontSize: 13,
                    borderRadius: 6,
                    border: '1px solid var(--groupfit-secondary)',
                    background: '#fff',
                    color: 'var(--groupfit-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(row.id)}
                  disabled={actionId === row.id}
                  style={{
                    padding: '6px 12px',
                    fontSize: 13,
                    borderRadius: 6,
                    border: '1px solid #c00',
                    background: '#fff',
                    color: '#c00',
                    cursor: actionId === row.id ? 'not-allowed' : 'pointer',
                  }}
                >
                  {actionId === row.id ? '…' : 'Remove'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </TrainerLayout>
  );
}

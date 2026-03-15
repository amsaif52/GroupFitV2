'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrainerLayout } from '../TrainerLayout';
import { trainerApi } from '@/lib/api';
import { ROUTES } from '../routes';
import { getApiErrorMessage } from '@groupfit/shared';
import { CloudinaryUploadButton } from '@/components/CloudinaryUploadButton';

type CertItem = {
  id: string;
  name: string;
  issuingOrganization?: string | null;
  issuedAt?: string | null;
  credentialId?: string | null;
  documentUrl?: string | null;
  createdAt: string;
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalPanelStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: '1.5rem',
  width: '100%',
  maxWidth: 480,
  maxHeight: '90vh',
  overflow: 'auto',
};

export default function CertificatesPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<CertItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CertItem | null>(null);
  const [formName, setFormName] = useState('');
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
    setFormDocumentUrl('');
    setModalOpen(true);
  };

  const openEdit = (row: CertItem) => {
    setEditing(row);
    setFormName(row.name);
    setFormDocumentUrl(row.documentUrl ?? '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setFormName('');
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
          documentUrl: formDocumentUrl.trim() || null,
        })
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeModal();
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
          documentUrl: formDocumentUrl.trim() || null,
        })
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeModal();
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
        if (data?.mtype === 'success') {
          fetchList();
          if (editing?.id === id) closeModal();
        } else {
          setError(String(data?.message ?? 'Delete failed'));
        }
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Delete failed')))
      .finally(() => setActionId(null));
  };

  return (
    <TrainerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <span className="gf-home__logo">Certifications / Resume</span>
      </header>

      <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 16 }}>
        Add and manage your certifications and resume. Upload an image for each item.
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
        Add certificate or resume
      </button>

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cert-modal-title"
          style={modalOverlayStyle}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div style={modalPanelStyle} onClick={(e) => e.stopPropagation()}>
            <h2 id="cert-modal-title" style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              {editing ? 'Edit certificate / resume' : 'Add certificate or resume'}
            </h2>
            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Label *
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. CPR, NASM-CPT, Resume"
                required
                style={{
                  padding: 8,
                  width: '100%',
                  marginBottom: 12,
                  borderRadius: 6,
                  border: '1px solid var(--groupfit-border-light)',
                }}
              />
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Document (image)
              </label>
              <div style={{ marginBottom: 8 }}>
                <CloudinaryUploadButton
                  onUpload={(url) => setFormDocumentUrl(url)}
                  label="Upload image or PDF"
                  allowPdf
                />
              </div>
              {formDocumentUrl && (
                <div style={{ marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={() => setFormDocumentUrl('')}
                    style={{
                      fontSize: 13,
                      color: 'var(--groupfit-secondary)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Remove document
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
                {editing && (
                  <button
                    type="button"
                    onClick={() => handleDelete(editing.id)}
                    disabled={actionId === editing.id}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: '1px solid #c00',
                      background: '#fff',
                      color: '#c00',
                      cursor: actionId === editing.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {actionId === editing.id ? '…' : 'Remove'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--groupfit-border-light)',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : list.length === 0 ? (
        <div className="gf-home__empty">No certificates or resume yet. Add one above.</div>
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

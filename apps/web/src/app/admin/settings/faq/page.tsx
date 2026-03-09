'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/app/routes';
import { adminApi } from '@/lib/api';

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  sortOrder?: number;
  role?: string | null;
  updatedAt?: string;
};

const PAGE_SIZES = [10, 20, 50];
const ROLE_OPTIONS = ['all', 'customer', 'trainer'];

export default function AdminSettingsFaqPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<FaqRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FaqRow | null>(null);
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formRole, setFormRole] = useState('all');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchList = useCallback(() => {
    setLoading(true);
    adminApi
      .faqList()
      .then((res) => {
        const data = res?.data as { mtype?: string; list?: FaqRow[] };
        if (data?.mtype === 'error') {
          setError(String((data as { message?: string }).message ?? 'Failed to load'));
          setList([]);
        } else {
          setList(data?.list ?? []);
          setError(null);
        }
      })
      .catch(() => {
        setError('Failed to load FAQ');
        setList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (row) =>
        row.question.toLowerCase().includes(q) ||
        (row.answer ?? '').toLowerCase().includes(q) ||
        (row.role ?? '').toLowerCase().includes(q)
    );
  }, [list, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const rows = useMemo(() => filtered.slice(start, start + pageSize), [filtered, start, pageSize]);

  const openAdd = () => {
    setEditing(null);
    setFormQuestion('');
    setFormAnswer('');
    setFormSortOrder(list.length);
    setFormRole('all');
    setShowModal(true);
  };

  const openEdit = (row: FaqRow) => {
    setEditing(row);
    setFormQuestion(row.question);
    setFormAnswer(row.answer);
    setFormSortOrder(row.sortOrder ?? 0);
    setFormRole(row.role && ROLE_OPTIONS.includes(row.role) ? row.role : 'all');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormQuestion('');
    setFormAnswer('');
    setFormSortOrder(0);
    setFormRole('all');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    const roleVal = formRole === 'all' ? undefined : formRole;
    if (editing) {
      adminApi
        .updateFaq(editing.id, formQuestion.trim(), formAnswer.trim(), formSortOrder, roleVal)
        .then((res) => {
          const data = res?.data as { mtype?: string; message?: string };
          if (data?.mtype === 'success') {
            closeModal();
            fetchList();
          } else {
            setError(String(data?.message ?? 'Update failed'));
          }
        })
        .catch(() => setError('Update failed'))
        .finally(() => setSubmitLoading(false));
    } else {
      adminApi
        .createFaq(formQuestion.trim(), formAnswer.trim(), formSortOrder, roleVal)
        .then((res) => {
          const data = res?.data as { mtype?: string; message?: string };
          if (data?.mtype === 'success') {
            closeModal();
            fetchList();
          } else {
            setError(String(data?.message ?? 'Create failed'));
          }
        })
        .catch(() => setError('Create failed'))
        .finally(() => setSubmitLoading(false));
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this FAQ entry?')) return;
    setActionId(id);
    adminApi
      .deleteFaq(id)
      .then((res) => {
        const data = res?.data as { mtype?: string; message?: string };
        if (data?.mtype === 'success') fetchList();
        else setError(String(data?.message ?? 'Delete failed'));
      })
      .catch(() => setError('Delete failed'))
      .finally(() => setActionId(null));
  };

  const formatDate = (d: string | undefined) =>
    d
      ? new Date(d).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '—';

  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link
          href={ROUTES.adminSettings}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Settings
        </Link>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 8,
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>FAQ</h1>
          <button type="button" onClick={openAdd} className="gf-admin-btn gf-admin-btn--primary">
            + Add
          </button>
        </div>
      </header>

      {error && (
        <p className="gf-admin-error" style={{ marginBottom: 16 }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>
          Show{' '}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="gf-admin-input"
            style={{ width: 70, padding: '6px 8px', marginLeft: 4 }}
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </span>
        <span style={{ marginLeft: 16 }}>
          <label htmlFor="faq-search" style={{ marginRight: 8, fontSize: 14 }}>
            Search:
          </label>
          <input
            id="faq-search"
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="gf-admin-input"
            style={{ width: 200 }}
          />
        </span>
      </div>

      {loading ? (
        <div className="gf-admin-empty">Loading…</div>
      ) : (
        <>
          <div className="gf-admin-table-wrap" style={{ overflow: 'auto' }}>
            <table className="gf-admin-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Role</th>
                  <th>Updated On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td style={{ maxWidth: 320 }}>
                      {row.question.length > 60 ? `${row.question.slice(0, 60)}…` : row.question}
                    </td>
                    <td>{row.role ?? 'all'}</td>
                    <td
                      style={{
                        color: 'var(--groupfit-grey)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatDate(row.updatedAt)}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="gf-admin-btn gf-admin-btn--ghost"
                        style={{
                          marginRight: 8,
                          padding: '4px 8px',
                          fontSize: 13,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        disabled={actionId === row.id}
                        style={{
                          padding: '4px 8px',
                          fontSize: 13,
                          border: '1px solid var(--groupfit-error)',
                          background: 'transparent',
                          color: 'var(--groupfit-error)',
                          cursor: actionId === row.id ? 'not-allowed' : 'pointer',
                          borderRadius: 6,
                        }}
                      >
                        {actionId === row.id ? '…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <p
              style={{
                fontSize: 14,
                color: 'var(--groupfit-grey)',
                margin: 0,
              }}
            >
              Showing {total === 0 ? 0 : start + 1} to {Math.min(start + pageSize, total)} of{' '}
              {total} records
            </p>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="gf-admin-btn gf-admin-btn--secondary"
                style={{ padding: '6px 12px' }}
              >
                Prev
              </button>
              <span
                className="gf-admin-btn"
                style={{
                  padding: '6px 12px',
                  background: 'var(--groupfit-secondary)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'default',
                }}
              >
                {currentPage}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="gf-admin-btn gf-admin-btn--secondary"
                style={{ padding: '6px 12px' }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="faq-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            boxSizing: 'border-box',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              maxWidth: 480,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '20px 20px 16px',
                borderBottom: '1px solid var(--groupfit-border-light)',
              }}
            >
              <h2 id="faq-modal-title" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                {editing ? 'Edit FAQ' : 'Add FAQ'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 20 }}>
              <div className="gf-admin-field" style={{ marginBottom: 16 }}>
                <label className="gf-admin-field__label" htmlFor="faq-question">
                  Question
                </label>
                <input
                  id="faq-question"
                  type="text"
                  required
                  className="gf-admin-field__input"
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="e.g. How do I book a session?"
                />
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 16 }}>
                <label className="gf-admin-field__label" htmlFor="faq-answer">
                  Answer
                </label>
                <textarea
                  id="faq-answer"
                  required
                  rows={3}
                  className="gf-admin-field__input"
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="Answer text"
                />
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 16 }}>
                <label className="gf-admin-field__label" htmlFor="faq-role">
                  Role
                </label>
                <select
                  id="faq-role"
                  className="gf-admin-field__input"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  style={{ padding: '10px 14px' }}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--groupfit-grey)',
                    display: 'block',
                    marginTop: 4,
                  }}
                >
                  Audience that sees this FAQ (all = everyone).
                </span>
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 20 }}>
                <label className="gf-admin-field__label" htmlFor="faq-sort">
                  Sort order
                </label>
                <input
                  id="faq-sort"
                  type="number"
                  min={0}
                  className="gf-admin-field__input"
                  style={{ width: 80 }}
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value) || 0)}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="gf-admin-btn gf-admin-btn--primary"
                >
                  {submitLoading ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="gf-admin-btn gf-admin-btn--secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

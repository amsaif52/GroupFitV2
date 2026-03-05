'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '../../routes';
import { adminApi } from '@/lib/api';

type FaqItem = { id: string; question: string; answer: string; sortOrder?: number };

export default function AdminFaqPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<FaqItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchList = () => {
    adminApi
      .faqList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Failed to load'));
          setList([]);
        } else {
          setList((data?.list as FaqItem[]) ?? []);
          setError(null);
        }
      })
      .catch(() => {
        setError('Failed to load FAQ');
        setList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setFormQuestion('');
    setFormAnswer('');
    setFormSortOrder(list.length);
    setShowForm(true);
  };

  const openEdit = (row: FaqItem) => {
    setEditing(row);
    setFormQuestion(row.question);
    setFormAnswer(row.answer);
    setFormSortOrder(row.sortOrder ?? 0);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormQuestion('');
    setFormAnswer('');
    setFormSortOrder(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    if (editing) {
      adminApi
        .updateFaq(editing.id, formQuestion.trim(), formAnswer.trim(), formSortOrder)
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeForm();
            fetchList();
          } else {
            setError(String(data?.message ?? 'Update failed'));
          }
        })
        .catch(() => setError('Update failed'))
        .finally(() => setSubmitLoading(false));
    } else {
      adminApi
        .createFaq(formQuestion.trim(), formAnswer.trim(), formSortOrder)
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeForm();
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
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchList();
        else setError(String(data?.message ?? 'Delete failed'));
      })
      .catch(() => setError('Delete failed'))
      .finally(() => setActionId(null));
  };

  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link href={ROUTES.adminMasterData} style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}>← Master data</Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>FAQ</h1>
        <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginTop: 8 }}>
          FAQ entries shown on help pages. Order by sort order.
        </p>
        <button
          type="button"
          onClick={openAdd}
          style={{ marginTop: 12, padding: '10px 16px', borderRadius: 8, border: 'none', background: 'var(--groupfit-secondary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
        >
          Add FAQ
        </button>
      </header>

      {error && <p style={{ color: '#c00', marginBottom: 16 }}>{error}</p>}

      {showForm && (
        <div style={{ marginBottom: 24, padding: 20, border: '1px solid var(--groupfit-border-light)', borderRadius: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{editing ? 'Edit FAQ' : 'New FAQ'}</h2>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>Question</label>
            <input
              type="text"
              value={formQuestion}
              onChange={(e) => setFormQuestion(e.target.value)}
              placeholder="e.g. How do I book a session?"
              required
              style={{ padding: 8, width: '100%', maxWidth: 480, marginBottom: 12, borderRadius: 6, border: '1px solid var(--groupfit-border-light)' }}
            />
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>Answer</label>
            <textarea
              value={formAnswer}
              onChange={(e) => setFormAnswer(e.target.value)}
              placeholder="Answer text"
              required
              rows={3}
              style={{ padding: 8, width: '100%', maxWidth: 480, marginBottom: 12, borderRadius: 6, border: '1px solid var(--groupfit-border-light)' }}
            />
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>Sort order</label>
            <input
              type="number"
              value={formSortOrder}
              onChange={(e) => setFormSortOrder(Number(e.target.value) || 0)}
              min={0}
              style={{ padding: 8, width: 80, marginBottom: 16, borderRadius: 6, border: '1px solid var(--groupfit-border-light)' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={submitLoading} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: 'var(--groupfit-secondary)', color: '#fff', fontWeight: 600, cursor: submitLoading ? 'not-allowed' : 'pointer' }}>
                {submitLoading ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={closeForm} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #666', background: '#fff', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : list.length === 0 ? (
        <div className="gf-home__empty">No FAQ entries. Add one above.</div>
      ) : (
        <div className="gf-home__empty" style={{ padding: 0, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--groupfit-border-light)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', width: 60 }}>Order</th>
                <th style={{ padding: '12px 16px' }}>Question</th>
                <th style={{ padding: '12px 16px', maxWidth: 320 }}>Answer</th>
                <th style={{ padding: '12px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--groupfit-border-light)' }}>
                  <td style={{ padding: '12px 16px' }}>{row.sortOrder ?? 0}</td>
                  <td style={{ padding: '12px 16px' }}>{row.question}</td>
                  <td style={{ padding: '12px 16px', maxWidth: 320 }}>{row.answer.length > 80 ? `${row.answer.slice(0, 80)}…` : row.answer}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button type="button" onClick={() => openEdit(row)} style={{ marginRight: 8, padding: '6px 10px', fontSize: 12, borderRadius: 6, border: '1px solid var(--groupfit-secondary)', background: '#fff', color: 'var(--groupfit-secondary)', cursor: 'pointer' }}>Edit</button>
                    <button type="button" onClick={() => handleDelete(row.id)} disabled={actionId === row.id} style={{ padding: '6px 10px', fontSize: 12, borderRadius: 6, border: '1px solid #c00', background: '#fff', color: '#c00', cursor: actionId === row.id ? 'not-allowed' : 'pointer' }}>{actionId === row.id ? '…' : 'Delete'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '../routes';
import { customerApi, trainerApi } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { ROLES } from '@groupfit/shared';

const DEFAULT_FAQS = [
  { id: '1', question: 'How do I book a session?', description: 'Go to Activities or find a trainer, choose a time slot, and confirm your booking. You can also join existing groups from the Groups section.' },
  { id: '2', question: 'How do I cancel or reschedule?', description: 'Open your session from Upcoming Sessions or My Sessions and use the cancel or reschedule option. Please check the cancellation policy for your booking.' },
  { id: '3', question: 'Where can I see my payment history?', description: 'Go to Account or Profile and tap Payment History to see all your past payments and invoices.' },
];

const FALLBACK_CONTACT_LINKS = [
  { heading: 'Customer service', link: 'https://groupfit.edifybiz.com' },
  { heading: 'Facebook', link: 'https://www.facebook.com' },
  { heading: 'Instagram', link: 'https://www.instagram.com' },
  { heading: 'Twitter', link: 'https://twitter.com' },
];

type FaqDisplay = { id: string; question: string; description: string };
type ContactItem = { heading: string; link: string };

export default function HelpPage() {
  const user = getStoredUser();
  const isTrainer = user?.role === ROLES.TRAINER || user?.role === ROLES.ADMIN;
  const [tab, setTab] = useState<'FAQs' | 'Contactus' | 'Support'>('FAQs');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FaqDisplay[]>(DEFAULT_FAQS);
  const [contactLinks, setContactLinks] = useState<ContactItem[]>(FALLBACK_CONTACT_LINKS);
  const [loading, setLoading] = useState(true);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([customerApi.faqlist(), customerApi.fetchContactLink()])
      .then(([faqRes, contactRes]) => {
        if (cancelled) return;
        const faqData = faqRes?.data as Record<string, unknown> | undefined;
        const contactData = contactRes?.data as Record<string, unknown> | undefined;
        const faqList = (faqData?.faqlist ?? faqData?.list) as { id: string; question: string; answer: string }[] | undefined;
        if (faqList && faqList.length > 0) {
          setFaqs(faqList.map((f) => ({ id: f.id, question: f.question, description: f.answer })));
        }
        const email = contactData?.contactEmail as string | undefined;
        if (email) {
          setContactLinks([{ heading: 'Email support', link: `mailto:${email}` }, ...FALLBACK_CONTACT_LINKS]);
        } else {
          setContactLinks(FALLBACK_CONTACT_LINKS);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="gf-help">
      <div className="gf-help__topbar">
        <Link href={ROUTES.dashboard} className="gf-help__back">← Dashboard</Link>
        <h1 className="gf-help__title">Help Centre</h1>
      </div>

      <div className="gf-help__tabs">
        <button
          type="button"
          className={`gf-help__tab ${tab === 'FAQs' ? 'gf-help__tab--active' : ''}`}
          onClick={() => setTab('FAQs')}
        >
          FAQs
        </button>
        <button
          type="button"
          className={`gf-help__tab ${tab === 'Contactus' ? 'gf-help__tab--active' : ''}`}
          onClick={() => setTab('Contactus')}
        >
          Contact us
        </button>
        {user && (
          <button
            type="button"
            className={`gf-help__tab ${tab === 'Support' ? 'gf-help__tab--active' : ''}`}
            onClick={() => { setTab('Support'); setSupportSuccess(false); setSupportError(null); }}
          >
            Contact support
          </button>
        )}
      </div>

      {tab === 'FAQs' && (
        <div className="gf-help__faq-list">
          {loading ? (
            <p className="gf-help__empty">Loading…</p>
          ) : faqs.length === 0 ? (
            <p className="gf-help__empty">Currently unavailable!</p>
          ) : (
            faqs.map((faq) => (
              <div key={faq.id} className="gf-help__faq-item">
                <button
                  type="button"
                  className="gf-help__faq-question"
                  aria-expanded={openFaqId === faq.id}
                  onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                >
                  {faq.question}
                  <span aria-hidden>{openFaqId === faq.id ? '−' : '+'}</span>
                </button>
                <div className="gf-help__faq-answer" style={{ display: openFaqId === faq.id ? 'block' : 'none' }}>
                  {faq.description}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'Contactus' && (
        <div className="gf-help__contact-list">
          {contactLinks.length === 0 ? (
            <p className="gf-help__empty">Currently unavailable!</p>
          ) : (
            contactLinks.map((item) => (
              <a
                key={item.heading}
                href={item.link}
                target={item.link.startsWith('mailto:') ? undefined : '_blank'}
                rel={item.link.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                className="gf-help__contact-item"
              >
                <span>{item.heading}</span>
                <span aria-hidden>›</span>
              </a>
            ))
          )}
        </div>
      )}

      {tab === 'Support' && user && (
        <div className="gf-help__contact-list" style={{ maxWidth: 480 }}>
          {supportSuccess ? (
            <p className="gf-help__empty" style={{ color: 'var(--groupfit-secondary)', fontWeight: 600 }}>
              Your message has been sent. We&apos;ll get back to you soon.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const message = supportMessage.trim();
                if (!message) return;
                setSupportSubmitting(true);
                setSupportError(null);
                const submit = isTrainer ? trainerApi.raiseSupport : customerApi.raiseSupport;
                submit({ subject: supportSubject.trim() || undefined, message })
                  .then((res) => {
                    const data = res?.data as Record<string, unknown>;
                    if (data?.mtype === 'success') {
                      setSupportSuccess(true);
                      setSupportSubject('');
                      setSupportMessage('');
                    } else {
                      setSupportError(String(data?.message ?? 'Something went wrong'));
                    }
                  })
                  .catch(() => setSupportError('Failed to send. Please try again.'))
                  .finally(() => setSupportSubmitting(false));
              }}
            >
              <label htmlFor="support-subject" style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>Subject (optional)</label>
              <input
                id="support-subject"
                type="text"
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                placeholder="e.g. Billing question"
                style={{ padding: 8, width: '100%', marginBottom: 12, borderRadius: 6, border: '1px solid var(--groupfit-border-light)' }}
              />
              <label htmlFor="support-message" style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>Message *</label>
              <textarea
                id="support-message"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Describe your issue or question…"
                required
                rows={4}
                style={{ padding: 8, width: '100%', marginBottom: 12, borderRadius: 6, border: '1px solid var(--groupfit-border-light)' }}
              />
              {supportError && <p style={{ color: '#c00', marginBottom: 12, fontSize: 14 }}>{supportError}</p>}
              <button
                type="submit"
                disabled={supportSubmitting}
                style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--groupfit-secondary)', color: '#fff', fontWeight: 600, cursor: supportSubmitting ? 'not-allowed' : 'pointer' }}
              >
                {supportSubmitting ? 'Sending…' : 'Send'}
              </button>
            </form>
          )}
        </div>
      )}
    </main>
  );
}

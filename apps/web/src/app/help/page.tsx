'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '../routes';
import { customerApi, trainerApi } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { ROLES, getApiErrorMessage } from '@groupfit/shared';
import type { FaqDisplay, ContactItem } from '@groupfit/shared';
import {
  DEFAULT_FAQS_CUSTOMER,
  FALLBACK_CONTACT_CUSTOMER,
  HELP_CHAT_HINT_CUSTOMER,
  HELP_CHAT_HINT_TRAINER,
} from '@groupfit/shared';
import { HelpChat } from '@groupfit/shared/components';

export default function HelpPage() {
  const user = getStoredUser();
  const isTrainer = user?.role === ROLES.TRAINER || user?.role === ROLES.ADMIN;
  const [tab, setTab] = useState<'FAQs' | 'Contactus' | 'Support' | 'Assistant'>('FAQs');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FaqDisplay[]>(DEFAULT_FAQS_CUSTOMER);
  const [contactLinks, setContactLinks] = useState<ContactItem[]>(FALLBACK_CONTACT_CUSTOMER);
  const [loading, setLoading] = useState(true);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);
  const [chatConversationId, setChatConversationId] = useState<string | undefined>();
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([customerApi.faqlist(), customerApi.fetchContactLink()])
      .then(([faqRes, contactRes]) => {
        if (cancelled) return;
        const faqData = faqRes?.data as Record<string, unknown> | undefined;
        const contactData = contactRes?.data as Record<string, unknown> | undefined;
        const faqList = (faqData?.faqlist ?? faqData?.list) as
          | { id: string; question: string; answer: string }[]
          | undefined;
        if (faqList && faqList.length > 0) {
          setFaqs(faqList.map((f) => ({ id: f.id, question: f.question, description: f.answer })));
        }
        const email = contactData?.contactEmail as string | undefined;
        if (email) {
          setContactLinks([
            { heading: 'Email support', link: `mailto:${email}` },
            ...FALLBACK_CONTACT_CUSTOMER,
          ]);
        } else {
          setContactLinks(FALLBACK_CONTACT_CUSTOMER);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="gf-help">
      <div className="gf-help__topbar">
        <Link href={ROUTES.dashboard} className="gf-help__back">
          ← Dashboard
        </Link>
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
            onClick={() => {
              setTab('Support');
              setSupportSuccess(false);
              setSupportError(null);
            }}
          >
            Contact support
          </button>
        )}
        {user && (
          <button
            type="button"
            className={`gf-help__tab ${tab === 'Assistant' ? 'gf-help__tab--active' : ''}`}
            onClick={() => {
              setTab('Assistant');
              setChatError(null);
            }}
          >
            Assistant
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
                <div
                  className="gf-help__faq-answer"
                  style={{ display: openFaqId === faq.id ? 'block' : 'none' }}
                >
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
            <p
              className="gf-help__empty"
              style={{ color: 'var(--groupfit-secondary)', fontWeight: 600 }}
            >
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
              <label
                htmlFor="support-subject"
                style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}
              >
                Subject (optional)
              </label>
              <input
                id="support-subject"
                type="text"
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                placeholder="e.g. Billing question"
                style={{
                  padding: 8,
                  width: '100%',
                  marginBottom: 12,
                  borderRadius: 6,
                  border: '1px solid var(--groupfit-border-light)',
                }}
              />
              <label
                htmlFor="support-message"
                style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}
              >
                Message *
              </label>
              <textarea
                id="support-message"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Describe your issue or question…"
                required
                rows={4}
                style={{
                  padding: 8,
                  width: '100%',
                  marginBottom: 12,
                  borderRadius: 6,
                  border: '1px solid var(--groupfit-border-light)',
                }}
              />
              {supportError && (
                <p style={{ color: '#c00', marginBottom: 12, fontSize: 14 }}>{supportError}</p>
              )}
              <button
                type="submit"
                disabled={supportSubmitting}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--groupfit-secondary)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: supportSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {supportSubmitting ? 'Sending…' : 'Send'}
              </button>
            </form>
          )}
        </div>
      )}

      {tab === 'Assistant' && user && (
        <div
          className="gf-help__contact-list"
          style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', height: 360 }}
        >
          <HelpChat
            messages={chatMessages}
            onSend={(text) => {
              setChatSending(true);
              setChatError(null);
              setChatMessages((prev) => [...prev, { role: 'user', content: text }]);
              (isTrainer ? trainerApi.chat : customerApi.chat)({
                message: text,
                conversationId: chatConversationId,
              })
                .then((res) => {
                  setChatConversationId(res?.data?.conversationId);
                  setChatMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: res?.data?.message ?? 'No reply.' },
                  ]);
                })
                .catch((err: unknown) => {
                  setChatError(
                    getApiErrorMessage(err, 'Failed to send. Check your connection or try again.')
                  );
                  setChatMessages((prev) => prev.slice(0, -1));
                })
                .finally(() => setChatSending(false));
            }}
            sending={chatSending}
            error={chatError}
            hintText={isTrainer ? HELP_CHAT_HINT_TRAINER : HELP_CHAT_HINT_CUSTOMER}
          />
        </div>
      )}
    </main>
  );
}

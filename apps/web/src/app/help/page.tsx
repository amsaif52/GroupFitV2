'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '../routes';
import { customerApi, trainerApi } from '@/lib/api';
import { useStoredUser } from '@/lib/auth';
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
  const { user, mounted } = useStoredUser();
  const isTrainer = mounted && (user?.role === ROLES.TRAINER || user?.role === ROLES.ADMIN);
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
        console.log(contactData);
        const faqList = (faqData?.faqlist ?? faqData?.list) as
          | { id: string; question: string; answer: string }[]
          | undefined;
        if (faqList && faqList.length > 0) {
          setFaqs(faqList.map((f) => ({ id: f.id, question: f.question, description: f.answer })));
        }
        const contactList = contactData?.data as ContactItem[] | undefined;
        if (contactList && contactList.length > 0) {
          setContactLinks(
            contactList.map((c) => ({ name: c.name, link: c.link, iconUrl: c.iconUrl }))
          );
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
            contactLinks.map((item) => {
              const isMailto = item.link.startsWith('mailto:');
              return (
                <a
                  key={item.name}
                  href={item.link}
                  target={isMailto ? undefined : '_blank'}
                  rel={isMailto ? undefined : 'noopener noreferrer'}
                  className="gf-help__contact-item"
                >
                  <span className="gf-help__contact-item-icon">
                    {item.iconUrl ? (
                      <img src={item.iconUrl} alt="" className="gf-help__contact-icon" />
                    ) : (
                      <span className="gf-help__contact-item-emoji" aria-hidden>
                        {isMailto ? '✉' : '↗'}
                      </span>
                    )}
                  </span>
                  <span className="gf-help__contact-item-label">{item.name}</span>
                  <span className="gf-help__contact-item-arrow" aria-hidden>
                    {isMailto ? '›' : '↗'}
                  </span>
                </a>
              );
            })
          )}
        </div>
      )}

      {tab === 'Assistant' && user && (
        <div
          className="gf-help__contact-list"
          style={{ display: 'flex', flexDirection: 'column', height: 360 }}
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

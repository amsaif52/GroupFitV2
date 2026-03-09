'use client';

import { useState } from 'react';

export type FaqItem = { id: string; question: string; answer: string; sortOrder?: number };
export type ContactItem = { heading: string; link: string };

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: '1',
    question: 'How do I book a session?',
    answer: 'Go to Activities or find a trainer, choose a time slot, and confirm your booking.',
    sortOrder: 1,
  },
  {
    id: '2',
    question: 'How do I cancel or reschedule?',
    answer: 'Open your session from Upcoming Sessions and use the cancel or reschedule option.',
    sortOrder: 2,
  },
  {
    id: '3',
    question: 'Where can I see my payment history?',
    answer: 'Go to Account or Profile and tap Payment History.',
    sortOrder: 3,
  },
];

const DEFAULT_CONTACT: ContactItem[] = [
  { heading: 'Customer service', link: 'https://groupfit.edifybiz.com' },
  { heading: 'Facebook', link: 'https://www.facebook.com' },
  { heading: 'Instagram', link: 'https://www.instagram.com' },
  { heading: 'Twitter', link: 'https://twitter.com' },
];

export interface HelpCentreContentProps {
  title?: string;
  faqs?: FaqItem[];
  contactList?: ContactItem[];
  backLink: React.ReactNode;
}

export function HelpCentreContent(props: HelpCentreContentProps) {
  const {
    title = 'Help Centre',
    faqs = DEFAULT_FAQS,
    contactList = DEFAULT_CONTACT,
    backLink,
  } = props;
  const [tab, setTab] = useState<'FAQs' | 'Contactus'>('FAQs');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  return (
    <main className="gf-help">
      <div className="gf-help__topbar">
        <div className="gf-help__back">{backLink}</div>
        <h1 className="gf-help__title">{title}</h1>
      </div>
      <div className="gf-help__tabs">
        <button
          type="button"
          className={'gf-help__tab' + (tab === 'FAQs' ? ' gf-help__tab--active' : '')}
          onClick={() => setTab('FAQs')}
        >
          FAQs
        </button>
        <button
          type="button"
          className={'gf-help__tab' + (tab === 'Contactus' ? ' gf-help__tab--active' : '')}
          onClick={() => setTab('Contactus')}
        >
          Contact us
        </button>
      </div>
      {tab === 'FAQs' && (
        <div className="gf-help__faq-list">
          {faqs.length === 0 ? (
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
          {contactList.length === 0 ? (
            <p className="gf-help__empty">Currently unavailable!</p>
          ) : (
            contactList.map((item) => (
              <a
                key={item.heading}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="gf-help__contact-item"
              >
                <span>{item.heading}</span>
                <span aria-hidden>›</span>
              </a>
            ))
          )}
        </div>
      )}
    </main>
  );
}

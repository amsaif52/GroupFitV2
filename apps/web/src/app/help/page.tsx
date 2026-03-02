'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getStoredUser } from '@/lib/auth';
import { ROLES } from '@groupfit/shared';
import { ROUTES } from '../routes';

const DEFAULT_FAQS = [
  { id: '1', question: 'How do I book a session?', description: 'Go to Activities or find a trainer, choose a time slot, and confirm your booking. You can also join existing groups from the Groups section.' },
  { id: '2', question: 'How do I cancel or reschedule?', description: 'Open your session from Upcoming Sessions or My Sessions and use the cancel or reschedule option. Please check the cancellation policy for your booking.' },
  { id: '3', question: 'Where can I see my payment history?', description: 'Go to Account or Profile and tap Payment History to see all your past payments and invoices.' },
];

const CONTACT_CUSTOMER = [
  { heading: 'Customer service', link: 'https://groupfit.edifybiz.com' },
  { heading: 'Facebook', link: 'https://www.facebook.com' },
  { heading: 'Instagram', link: 'https://www.instagram.com' },
  { heading: 'Twitter', link: 'https://twitter.com' },
];

const CONTACT_TRAINER = [
  { heading: 'Customer service', link: 'https://trainer.groupfitapp.com' },
  { heading: 'Facebook', link: 'https://www.facebook.com' },
  { heading: 'Instagram', link: 'https://www.instagram.com' },
  { heading: 'Twitter', link: 'https://twitter.com' },
];

export default function HelpPage() {
  const [tab, setTab] = useState<'FAQs' | 'Contactus'>('FAQs');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const user = getStoredUser();
  const isTrainer = user?.role === ROLES.TRAINER || user?.role === ROLES.ADMIN;
  const contactList = isTrainer ? CONTACT_TRAINER : CONTACT_CUSTOMER;

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
      </div>

      {tab === 'FAQs' && (
        <div className="gf-help__faq-list">
          {DEFAULT_FAQS.length === 0 ? (
            <p className="gf-help__empty">Currently unavailable!</p>
          ) : (
            DEFAULT_FAQS.map((faq) => (
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

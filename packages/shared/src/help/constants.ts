/**
 * Default FAQ and contact content for Help Centre.
 * Apps can replace these via API (faqlist, fetchContactLink).
 */
import type { FaqDisplay, ContactItem } from './types';

export const DEFAULT_FAQS_CUSTOMER: FaqDisplay[] = [
  { id: '1', question: 'How do I book a session?', description: 'Go to Activities or find a trainer, choose a time slot, and confirm your booking.' },
  { id: '2', question: 'How do I cancel or reschedule?', description: 'Open your session from My Sessions and use the cancel or reschedule option.' },
  { id: '3', question: 'Where can I see my payment history?', description: 'Go to Account or Profile and tap Payment History.' },
];

export const DEFAULT_FAQS_TRAINER: FaqDisplay[] = [
  { id: '1', question: 'How do I create a session?', description: 'Go to Sessions and tap Create. Choose activity, date, time, and location.' },
  { id: '2', question: 'How do I get paid?', description: 'Add your bank details in Account → Bank Details to receive payments.' },
  { id: '3', question: 'Where can I see my reviews?', description: 'Go to Account or Profile and open Reviews to see feedback from customers.' },
];

export const FALLBACK_CONTACT_CUSTOMER: ContactItem[] = [
  { heading: 'Customer service', link: 'https://groupfit.app' },
];

export const FALLBACK_CONTACT_TRAINER: ContactItem[] = [
  { heading: 'Customer service', link: 'https://trainer.groupfitapp.com' },
];

/** Hint text when chat has no messages (customer). */
export const HELP_CHAT_HINT_CUSTOMER =
  'Ask about your sessions, trainers, availability, or booking. Example: "What are my upcoming sessions?"';

/** Hint text when chat has no messages (trainer). */
export const HELP_CHAT_HINT_TRAINER =
  'Ask about your sessions today, availability, or earnings. Example: "What are my sessions today?"';

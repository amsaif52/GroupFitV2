/**
 * Shared types for Help Centre (FAQs, contact, support, assistant chat).
 * Used by web, customer-app, and trainer-app.
 */
export type FaqDisplay = { id: string; question: string; description: string };

export type ContactItem = { name: string; link: string; iconUrl: string };

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

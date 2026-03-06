import type { ChatCompletionTool } from 'openai/resources/chat/completions';

/**
 * OpenAI function definitions for the trainer chatbot.
 * Trainer-only: sessions, today's sessions, availability, earnings. No customer/booking tools.
 */
export const TRAINER_CHAT_TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_my_upcoming_sessions',
      description: 'Get the current trainer’s upcoming (scheduled) sessions.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_today_sessions',
      description: 'Get the trainer’s sessions scheduled for today.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_my_availability',
      description: 'Get the trainer’s weekly availability slots (day of week and time ranges).',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_earnings',
      description: 'Get the trainer’s earnings summary (this month, last month, total).',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
];

export type TrainerChatToolName =
  | 'get_my_upcoming_sessions'
  | 'get_today_sessions'
  | 'get_my_availability'
  | 'get_earnings';

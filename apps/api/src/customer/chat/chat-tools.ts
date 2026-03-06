import type { ChatCompletionTool } from 'openai/resources/chat/completions';

/**
 * OpenAI function definitions for the customer chatbot.
 * Replace stub implementations in ChatService with real service calls when ready.
 */
export const CHAT_TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_upcoming_sessions',
      description: 'Get the current user’s upcoming sessions.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_trainers_near_me',
      description: 'Get trainers and activities near the user. Optionally filter by location or activity type.',
      parameters: {
        type: 'object',
        properties: {
          latitude: { type: 'number', description: 'Latitude' },
          longitude: { type: 'number', description: 'Longitude' },
          radiusKm: { type: 'number', description: 'Radius in km (optional)' },
          activityType: { type: 'string', description: 'Filter by activity type (optional)' },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_availability',
      description: 'Get available time slots for a trainer on a given date.',
      parameters: {
        type: 'object',
        properties: {
          trainerId: { type: 'string', description: 'Trainer id' },
          date: { type: 'string', description: 'Date in YYYY-MM-DD' },
        },
        required: ['trainerId', 'date'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'book_session',
      description: 'Book a session with a trainer at a specific slot. slotId must be the full datetime from get_availability (e.g. 2025-03-02T10:00:00).',
      parameters: {
        type: 'object',
        properties: {
          trainerId: { type: 'string', description: 'Trainer id' },
          slotId: { type: 'string', description: 'Full datetime from get_availability, e.g. 2025-03-02T10:00:00' },
        },
        required: ['trainerId', 'slotId'],
        additionalProperties: false,
      },
    },
  },
];

export type ChatToolName = 'get_upcoming_sessions' | 'get_trainers_near_me' | 'get_availability' | 'book_session';

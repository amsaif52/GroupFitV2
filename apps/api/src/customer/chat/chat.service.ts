import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { JwtPayload } from '../../auth/jwt.strategy';
import { ConversationService } from './conversation.service';
import { CHAT_TOOLS, type ChatToolName } from './chat-tools';

const SYSTEM_PROMPT = `You are the GroupFit assistant. You help customers with:
- Viewing their upcoming sessions (use get_upcoming_sessions when they ask)
- Discovering activities and trainers near their location (use get_trainers_near_me)
- Choosing a trainer and checking availability (use get_availability)
- Booking sessions via the chat (use book_session)

Use the tools when the user asks for sessions, trainers, availability, or booking. Be concise and friendly.`;

/**
 * Customer chatbot: conversation history, JWT user context, and OpenAI tools (stubbed).
 * Replace runTool implementations with real services when sessions/trainers/booking exist.
 */
@Injectable()
export class ChatService {
  private openai: OpenAI | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly conversation: ConversationService,
  ) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey) this.openai = new OpenAI({ apiKey });
  }

  async sendMessage(
    userId: string,
    message: string,
    conversationId?: string,
  ): Promise<{ message: string; conversationId: string }> {
    const cid = await this.conversation.getOrCreateConversation(userId, conversationId);
    await this.conversation.addUserMessage(cid, message);

    if (!this.openai) {
      await this.conversation.addAssistantMessage(
        cid,
        'Chat is not configured. Set OPENAI_API_KEY to enable the assistant.',
      );
      return { message: 'Chat is not configured. Set OPENAI_API_KEY to enable the assistant.', conversationId: cid };
    }

    const history = await this.conversation.getRecentMessages(cid);
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((m) => ({ role: m.role, content: m.content })),
    ];

    const model = this.config.get('OPENAI_CHAT_MODEL') ?? 'gpt-4o-mini';
    let completion = await this.openai.chat.completions.create({
      model,
      messages,
      tools: CHAT_TOOLS.length > 0 ? CHAT_TOOLS : undefined,
      max_tokens: 500,
    });

    let assistantMessage = completion.choices[0]?.message;

    while (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults: OpenAI.Chat.ChatCompletionToolMessageParam[] = [];
      for (const tc of assistantMessage.tool_calls) {
        const name = tc.function.name as ChatToolName;
        const args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
        const result = await this.runTool(userId, name, args);
        toolResults.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: typeof result === 'string' ? result : JSON.stringify(result),
        });
      }
      messages.push(assistantMessage as OpenAI.Chat.ChatCompletionMessageParam);
      messages.push(...toolResults);
      completion = await this.openai.chat.completions.create({
        model,
        messages,
        tools: CHAT_TOOLS,
        max_tokens: 500,
      });
      assistantMessage = completion.choices[0]?.message;
    }

    const content = assistantMessage?.content?.trim() ?? "I couldn't generate a reply. Please try again.";
    await this.conversation.addAssistantMessage(cid, content);

    return { message: content, conversationId: cid };
  }

  /**
   * Stub implementations. Replace with real service calls when you have:
   * - SessionService.getUpcomingForUser(userId)
   * - TrainerService.getNearby(userId, lat?, lon?, radiusKm?, activityType?)
   * - AvailabilityService.getSlots(trainerId, date)
   * - BookingService.book(userId, trainerId, slotId)
   */
  private async runTool(
    userId: string,
    name: ChatToolName,
    args: Record<string, unknown>,
  ): Promise<string | Record<string, unknown>> {
    switch (name) {
      case 'get_upcoming_sessions':
        return { message: 'No upcoming sessions yet.', sessions: [] };
      case 'get_trainers_near_me':
        return { message: 'Trainer search not available yet.', trainers: [] };
      case 'get_availability':
        return { message: 'Availability not available yet.', slots: [] };
      case 'book_session':
        return { message: 'Booking not available yet. Please use the app to book.' };
      default:
        return { error: 'Unknown tool' };
    }
  }
}

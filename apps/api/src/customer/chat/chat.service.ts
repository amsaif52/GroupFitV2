import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ConversationService } from './conversation.service';
import { CHAT_TOOLS, type ChatToolName } from './chat-tools';
import { CustomerService } from '../customer.service';

const SYSTEM_PROMPT = `You are the GroupFit assistant. You help customers with:
- Viewing their upcoming sessions (use get_upcoming_sessions when they ask)
- Listing trainers (use get_trainers_near_me; location filter is not yet supported, so return all trainers)
- Checking a trainer's available time slots for a date (use get_availability; then tell the user to pass the slotId to book)
- Booking a session (use book_session with trainerId and slotId; slotId must be the full datetime from get_availability, e.g. 2025-03-02T10:00:00)

You can also suggest: viewing payment history in the app, updating their profile, or contacting support via Help. Be concise and friendly.`;

/**
 * Customer chatbot: conversation history, JWT user context, and OpenAI tools (wired to CustomerService).
 */
@Injectable()
export class ChatService {
  private openai: OpenAI | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly conversation: ConversationService,
    @Inject(forwardRef(() => CustomerService)) private readonly customerService: CustomerService
  ) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey) this.openai = new OpenAI({ apiKey });
  }

  async sendMessage(
    userId: string,
    message: string,
    conversationId?: string
  ): Promise<{ message: string; conversationId: string }> {
    const cid = await this.conversation.getOrCreateConversation(userId, conversationId);
    await this.conversation.addUserMessage(cid, message);

    if (!this.openai) {
      await this.conversation.addAssistantMessage(
        cid,
        'Chat is not configured. Set OPENAI_API_KEY to enable the assistant.'
      );
      return {
        message: 'Chat is not configured. Set OPENAI_API_KEY to enable the assistant.',
        conversationId: cid,
      };
    }

    const history = await this.conversation.getRecentMessages(cid);
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((m: { role: 'user' | 'assistant' | 'system'; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
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

    const content =
      assistantMessage?.content?.trim() ?? "I couldn't generate a reply. Please try again.";
    await this.conversation.addAssistantMessage(cid, content);

    return { message: content, conversationId: cid };
  }

  /** Calls CustomerService for sessions, trainers, availability, and booking. */
  private async runTool(
    userId: string,
    name: ChatToolName,
    args: Record<string, unknown>
  ): Promise<string | Record<string, unknown>> {
    try {
      switch (name) {
        case 'get_upcoming_sessions': {
          const res = await this.customerService.customerSessionList(userId);
          const list = (res.customerSessionList ?? []) as {
            sessionName?: string;
            trainerName?: string;
            scheduledAt?: string;
            id?: string;
          }[];
          const sessions = list.map((s) => ({
            id: s.id,
            activity: s.sessionName,
            trainerName: s.trainerName,
            scheduledAt: s.scheduledAt,
          }));
          return {
            message: sessions.length
              ? `You have ${sessions.length} upcoming session(s).`
              : 'You have no upcoming sessions.',
            sessions,
          };
        }
        case 'get_trainers_near_me': {
          const res = await this.customerService.SessionTrainersList();
          const list = (res.SessionTrainersList ?? res.list ?? []) as {
            id?: string;
            trainerName?: string;
            name?: string;
            email?: string;
          }[];
          const activityType =
            typeof args.activityType === 'string' ? args.activityType : undefined;
          let trainers = list.map((t) => ({ id: t.id, name: t.trainerName ?? t.name ?? t.email }));
          if (activityType) {
            const lower = activityType.toLowerCase();
            trainers = trainers.filter((t) => (t.name ?? '').toLowerCase().includes(lower));
          }
          return {
            message: trainers.length
              ? `Found ${trainers.length} trainer(s).`
              : 'No trainers found.',
            trainers,
          };
        }
        case 'get_availability': {
          const trainerId = String(args.trainerId ?? '').trim();
          const dateStr = String(args.date ?? '').trim();
          if (!trainerId || !dateStr)
            return { message: 'Trainer ID and date (YYYY-MM-DD) are required.', slots: [] };
          const res = await this.customerService.SessionAvailabilityTimeList(trainerId, dateStr);
          const list = (res.SessionAvailabilityTimeList ?? res.list ?? []) as string[];
          const slots = list.map((time) => ({ slotId: `${dateStr}T${time}:00`, time }));
          return {
            message: slots.length
              ? `Available slots on ${dateStr}: ${list.join(', ')}. Use slotId (e.g. ${dateStr}T${list[0]}:00) to book.`
              : `No available slots on ${dateStr}.`,
            slots,
          };
        }
        case 'book_session': {
          const trainerId = String(args.trainerId ?? '').trim();
          const slotId = String(args.slotId ?? '').trim();
          if (!trainerId || !slotId)
            return { message: 'Trainer ID and slotId (from get_availability) are required.' };
          const res = await this.customerService.addSession(userId, trainerId, slotId, undefined);
          if (res.mtype === 'error') return { message: res.message ?? 'Booking failed.' };
          return {
            message: res.message ?? 'Session booked successfully!',
            sessionId: (res as { sessionId?: string }).sessionId,
          };
        }
        default:
          return { error: 'Unknown tool' };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      return { message: msg, error: true };
    }
  }
}

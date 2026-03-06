import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { TrainerConversationService } from './conversation.service';
import { TRAINER_CHAT_TOOLS, type TrainerChatToolName } from './trainer-chat-tools';
import { TrainerService } from '../trainer.service';

const SYSTEM_PROMPT = `You are the GroupFit assistant for trainers. You help trainers with:
- Viewing their upcoming sessions (use get_my_upcoming_sessions)
- Seeing today's sessions (use get_today_sessions)
- Checking their weekly availability (use get_my_availability)
- Viewing earnings summary (use get_earnings)

You do NOT help with customer tasks like booking sessions or finding trainers. If the user asks about customer features, suggest they use the customer app or help centre. Be concise and friendly.`;

@Injectable()
export class TrainerChatService {
  private openai: OpenAI | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly conversation: TrainerConversationService,
    @Inject(forwardRef(() => TrainerService)) private readonly trainerService: TrainerService,
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
      ...history.map((m: { role: 'user' | 'assistant' | 'system'; content: string }) => ({ role: m.role, content: m.content })),
    ];

    const model = this.config.get('OPENAI_CHAT_MODEL') ?? 'gpt-4o-mini';
    let completion = await this.openai.chat.completions.create({
      model,
      messages,
      tools: TRAINER_CHAT_TOOLS.length > 0 ? TRAINER_CHAT_TOOLS : undefined,
      max_tokens: 500,
    });

    let assistantMessage = completion.choices[0]?.message;

    while (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults: OpenAI.Chat.ChatCompletionToolMessageParam[] = [];
      for (const tc of assistantMessage.tool_calls) {
        const name = tc.function.name as TrainerChatToolName;
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
        tools: TRAINER_CHAT_TOOLS,
        max_tokens: 500,
      });
      assistantMessage = completion.choices[0]?.message;
    }

    const content = assistantMessage?.content?.trim() ?? "I couldn't generate a reply. Please try again.";
    await this.conversation.addAssistantMessage(cid, content);

    return { message: content, conversationId: cid };
  }

  private async runTool(
    userId: string,
    name: TrainerChatToolName,
    _args: Record<string, unknown>,
  ): Promise<string | Record<string, unknown>> {
    try {
      switch (name) {
        case 'get_my_upcoming_sessions': {
          const res = await this.trainerService.trainerSessionList(userId);
          const list = (res.trainerSessionList ?? []) as { id?: string; sessionName?: string; customerName?: string; scheduledAt?: string }[];
          const sessions = list.map((s) => ({
            id: s.id,
            activity: s.sessionName,
            customerName: s.customerName,
            scheduledAt: s.scheduledAt,
          }));
          return {
            message: sessions.length ? `You have ${sessions.length} upcoming session(s).` : 'You have no upcoming sessions.',
            sessions,
          };
        }
        case 'get_today_sessions': {
          const res = await this.trainerService.todaySession(userId);
          const list = (res.todaySession ?? []) as { id?: string; sessionName?: string; customerName?: string; scheduledAt?: string }[];
          const sessions = list.map((s) => ({
            id: s.id,
            activity: s.sessionName,
            customerName: s.customerName,
            scheduledAt: s.scheduledAt,
          }));
          return {
            message: sessions.length ? `You have ${sessions.length} session(s) today.` : 'You have no sessions today.',
            sessions,
          };
        }
        case 'get_my_availability': {
          const res = await this.trainerService.trainerAvailabilityList(userId);
          const list = (res.availabilityList ?? []) as { dayOfWeek?: number; startTime?: string; endTime?: string }[];
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const slots = list.map((s) => ({
            day: dayNames[s.dayOfWeek ?? 0],
            startTime: s.startTime,
            endTime: s.endTime,
          }));
          return {
            message: slots.length ? `You have ${slots.length} availability slot(s).` : 'You have no availability set.',
            slots,
          };
        }
        case 'get_earnings': {
          const res = await this.trainerService.earningStats(userId);
          const stats = (res as { earningStats?: { thisMonthCents?: number; lastMonthCents?: number; totalCents?: number; thisMonthCount?: number; totalSessionCount?: number } }).earningStats;
          if (!stats) return { message: 'Earnings data not available.', error: true };
          const format = (c: number) => `£${(c / 100).toFixed(2)}`;
          return {
            message: `This month: ${format(stats.thisMonthCents ?? 0)} (${stats.thisMonthCount ?? 0} sessions). Total: ${format(stats.totalCents ?? 0)} (${stats.totalSessionCount ?? 0} sessions).`,
            thisMonthCents: stats.thisMonthCents,
            totalCents: stats.totalCents,
            totalSessionCount: stats.totalSessionCount,
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

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

const MAX_HISTORY_MESSAGES = 20;

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  /** Get or create a conversation for the user. Returns conversation id. */
  async getOrCreateConversation(userId: string, conversationId?: string): Promise<string> {
    if (conversationId) {
      const existing = await this.prisma.conversation.findFirst({
        where: { id: conversationId, userId },
      });
      if (existing) return existing.id;
    }
    const conv = await this.prisma.conversation.create({
      data: { userId },
    });
    return conv.id;
  }

  /** Load last N messages for context (role + content only). */
  async getRecentMessages(conversationId: string, limit = MAX_HISTORY_MESSAGES) {
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: { role: true, content: true },
    });
    return messages.map((m) => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }));
  }

  /** Append a user message. */
  async addUserMessage(conversationId: string, content: string): Promise<void> {
    await this.prisma.message.create({
      data: { conversationId, role: 'user', content },
    });
  }

  /** Append an assistant message. */
  async addAssistantMessage(conversationId: string, content: string): Promise<void> {
    await this.prisma.message.create({
      data: { conversationId, role: 'assistant', content },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const MAX_HISTORY_MESSAGES = 20;

@Injectable()
export class TrainerConversationService {
  constructor(private readonly prisma: PrismaService) {}

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

  async getRecentMessages(conversationId: string, limit = MAX_HISTORY_MESSAGES) {
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: { role: true, content: true },
    });
    return messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));
  }

  async addUserMessage(conversationId: string, content: string): Promise<void> {
    await this.prisma.message.create({
      data: { conversationId, role: 'user', content },
    });
  }

  async addAssistantMessage(conversationId: string, content: string): Promise<void> {
    await this.prisma.message.create({
      data: { conversationId, role: 'assistant', content },
    });
  }
}

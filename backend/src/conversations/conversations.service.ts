import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Sender, Channel } from '@prisma/client';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateConversation(channel: Channel, externalId: string) {
    let conv = await this.prisma.conversation.findFirst({
      where: { channel, externalId },
    });
    if (!conv) {
      conv = await this.prisma.conversation.create({
        data: { channel, externalId },
      });
    }
    return conv;
  }

  async addMessage(conversationId: string, sender: Sender, content: string, aiConfidence?: number) {
    return this.prisma.message.create({
      data: { conversationId, sender, content, aiConfidence },
    });
  }

  async listConversations() {
    return this.prisma.conversation.findMany({
      include: { messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getConversation(id: string) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }
}

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService implements OnModuleDestroy {
  public aiReplyQueue = new Queue('ai-reply', {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  });

  async enqueueAiReply(conversationId: string, userMessage: string) {
    await this.aiReplyQueue.add('generate-reply', { conversationId, userMessage });
  }

  async onModuleDestroy() {
    await this.aiReplyQueue.close();
  }
}

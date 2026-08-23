import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Inject, forwardRef } from '@nestjs/common';
import { Worker } from 'bullmq';
import { AiService } from '../ai/ai.service';
import { ConversationsService } from '../conversations/conversations.service';
import { EventsGateway } from '../gateway/events.gateway';
import { TelegramService } from '../telegram/telegram.service';
import { Sender, Channel } from '@prisma/client';

@Injectable()
export class AiReplyProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiReplyProcessor.name);
  private worker: Worker;

  constructor(
    private aiService: AiService,
    private conversationsService: ConversationsService,
    private gateway: EventsGateway,
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      'ai-reply',
      async (job) => {
        const { conversationId, userMessage } = job.data;
        const result = await this.aiService.generateReply(userMessage);

        const message = await this.conversationsService.addMessage(
          conversationId,
          Sender.AI,
          result.reply,
          result.confidence,
        );

        this.gateway.emitNewMessage(conversationId, message);

        const conversation = await this.conversationsService.getConversation(conversationId);
        if (conversation?.channel === Channel.TELEGRAM) {
          await this.telegramService.sendMessage(conversation.externalId, result.reply);
        }
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
        },
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(`AI reply job ${job?.id} failed: ${err.message}`, err.stack);
    });
  }

  async onModuleDestroy() {
    await this.worker.close();
  }
}
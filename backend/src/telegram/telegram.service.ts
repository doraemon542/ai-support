import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import { ConversationsService } from '../conversations/conversations.service';
import { QueueService } from '../queue/queue.service';
import { Channel, Sender } from '@prisma/client';

// Uses long-polling (getUpdates) so you don't need a public HTTPS domain
// for local development. Switch to setWebHook() once you deploy.
@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot;

  constructor(
    private conversationsService: ConversationsService,
    private queueService: QueueService,
  ) {}

  onModuleInit() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not set, Telegram channel disabled.');
      return;
    }

    this.bot = new TelegramBot(token, { polling: true });

    this.bot.on('message', async (msg) => {
      const chatId = String(msg.chat.id);
      const text = msg.text || '';
      if (!text) return;

      const conv = await this.conversationsService.findOrCreateConversation(
        Channel.TELEGRAM,
        chatId,
      );
      await this.conversationsService.addMessage(conv.id, Sender.USER, text);

      // Hand off to BullMQ instead of calling the AI inline -> keeps the
      // Telegram webhook/poll handler fast and non-blocking.
      await this.queueService.enqueueAiReply(conv.id, text);
    });

    this.logger.log('Telegram bot started (long polling).');
  }

  async sendMessage(chatId: string, text: string) {
    if (!this.bot) return;
    await this.bot.sendMessage(chatId, text);
  }
}

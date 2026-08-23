import { Controller, Get, Post, Body, Param, Inject, forwardRef } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { TelegramService } from '../telegram/telegram.service';
import { Sender, Channel } from '@prisma/client';

@ApiTags('conversations')
@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramService: TelegramService,
  ) {}

  @Get()
  list() {
    return this.conversationsService.listConversations();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.conversationsService.getConversation(id);
  }

  @Post(':id/reply')
  async reply(@Param('id') id: string, @Body() body: { content: string }) {
    const message = await this.conversationsService.addMessage(id, Sender.AGENT, body.content);

    const conversation = await this.conversationsService.getConversation(id);
    if (conversation?.channel === Channel.TELEGRAM) {
      await this.telegramService.sendMessage(conversation.externalId, body.content);
    }

    return message;
  }

  @Post('ingest')
  async ingest(@Body() dto: CreateMessageDto) {
    const conv = await this.conversationsService.findOrCreateConversation(
      dto.channel as any,
      dto.externalId,
    );
    return this.conversationsService.addMessage(conv.id, Sender.USER, dto.content);
  }
}
import { Module, forwardRef } from '@nestjs/common';
import { QueueService } from './queue.service';
import { AiReplyProcessor } from './ai-reply.processor';
import { AiModule } from '../ai/ai.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { GatewayModule } from '../gateway/gateway.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [
    AiModule,
    forwardRef(() => ConversationsModule),
    GatewayModule,
    forwardRef(() => TelegramModule),
  ],
  providers: [QueueService, AiReplyProcessor],
  exports: [QueueService],
})
export class QueueModule {}
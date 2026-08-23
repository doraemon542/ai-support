import { Module, forwardRef } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ConversationsModule } from '../conversations/conversations.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [forwardRef(() => ConversationsModule), forwardRef(() => QueueModule)],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
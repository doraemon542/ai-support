import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConversationsModule } from './conversations/conversations.module';
import { TelegramModule } from './telegram/telegram.module';
import { QueueModule } from './queue/queue.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [ConversationsModule, TelegramModule, QueueModule, GatewayModule],
  controllers: [AppController],
})
export class AppModule {}
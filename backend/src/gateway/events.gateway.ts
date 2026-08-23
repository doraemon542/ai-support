import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

// Real-time layer: dashboard clients subscribe to conversation updates.
@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-conversation')
  handleJoin(client: any, conversationId: string) {
    client.join(conversationId);
  }

  emitNewMessage(conversationId: string, message: any) {
    this.server.to(conversationId).emit('new-message', message);
    // also emit globally so the conversation list can update its preview
    this.server.emit('conversation-updated', { conversationId, message });
  }
}

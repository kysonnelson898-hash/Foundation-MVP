import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation:${conversationId}`);

    return {
      success: true,
      conversationId,
    };
  }

  sendMessageToConversation(
    conversationId: string,
    message: unknown,
  ) {
    this.server
      .to(`conversation:${conversationId}`)
      .emit('newMessage', message);
  }
}

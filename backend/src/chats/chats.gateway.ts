import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { ChatsService } from './chats.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatsGateway');
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(private readonly chatsService: ChatsService) {}

  afterInit(server: Server) {
    this.logger.log('Socket.IO Chat Gateway initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      this.userSockets.set(userId, client.id);
      client.join(`user:${userId}`);
      this.server.emit('user_online', { userId });
      this.logger.log(`Client connected: ${client.id} (user: ${userId})`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.userSockets.entries()]
      .find(([, socketId]) => socketId === client.id)?.[0];

    if (userId) {
      this.userSockets.delete(userId);
      this.server.emit('user_offline', { userId });
      this.logger.log(`Client disconnected: ${client.id} (user: ${userId})`);
    }
  }

  @SubscribeMessage('join_ride_room')
  joinRideRoom(@MessageBody() data: { rideId: string }, @ConnectedSocket() client: Socket) {
    client.join(`ride:${data.rideId}`);
    return { event: 'joined', data: { rideId: data.rideId } };
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody()
    data: {
      rideId: string;
      senderId: string;
      receiverId: string;
      message: string;
      messageType?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const savedMessage = await this.chatsService.saveMessage(data);

      // Emit to ride room (both rider and passenger)
      this.server.to(`ride:${data.rideId}`).emit('receive_message', savedMessage);

      // Also emit to receiver's personal room if not in ride room
      this.server.to(`user:${data.receiverId}`).emit('receive_message', savedMessage);

      return savedMessage;
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { rideId: string; userId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(`ride:${data.rideId}`).emit('typing', {
      userId: data.userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('mark_read')
  async markRead(
    @MessageBody() data: { messageIds: string[]; userId: string },
  ) {
    await this.chatsService.markMessagesRead(data.messageIds, data.userId);
  }

  // Emit booking events
  emitBookingRequest(riderId: string, bookingData: any) {
    this.server.to(`user:${riderId}`).emit('booking_request', bookingData);
  }

  emitBookingAccepted(passengerId: string, bookingData: any) {
    this.server.to(`user:${passengerId}`).emit('booking_accepted', bookingData);
  }

  emitBookingRejected(passengerId: string, bookingData: any) {
    this.server.to(`user:${passengerId}`).emit('booking_rejected', bookingData);
  }
}

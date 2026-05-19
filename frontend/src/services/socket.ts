import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private url: string;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
  }

  connect(userId: string) {
    if (this.socket?.connected) return;

    this.socket = io(`${this.url}/chat`, {
      auth: { userId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => console.log('🔌 Socket connected:', this.socket?.id));
    this.socket.on('disconnect', () => console.log('🔌 Socket disconnected'));
    this.socket.on('connect_error', (err) => console.error('Socket error:', err));
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  joinRideRoom(rideId: string) {
    this.socket?.emit('join_ride_room', { rideId });
  }

  sendMessage(data: {
    rideId: string;
    senderId: string;
    receiverId: string;
    message: string;
    messageType?: string;
  }) {
    this.socket?.emit('send_message', data);
  }

  onReceiveMessage(callback: (message: any) => void) {
    this.socket?.on('receive_message', callback);
    return () => this.socket?.off('receive_message', callback);
  }

  emitTyping(rideId: string, userId: string, isTyping: boolean) {
    this.socket?.emit('typing', { rideId, userId, isTyping });
  }

  onTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
    this.socket?.on('typing', callback);
    return () => this.socket?.off('typing', callback);
  }

  onBookingRequest(callback: (data: any) => void) {
    this.socket?.on('booking_request', callback);
    return () => this.socket?.off('booking_request', callback);
  }

  onBookingAccepted(callback: (data: any) => void) {
    this.socket?.on('booking_accepted', callback);
    return () => this.socket?.off('booking_accepted', callback);
  }

  onUserOnline(callback: (data: { userId: string }) => void) {
    this.socket?.on('user_online', callback);
    return () => this.socket?.off('user_online', callback);
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();

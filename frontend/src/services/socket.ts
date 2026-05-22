// Socket.IO is disabled on Vercel — serverless functions don't support
// persistent WebSocket connections. Chat uses HTTP polling fallback instead.
// To enable real-time chat, deploy the backend on a persistent server
// (Railway, Render, EC2) and set NEXT_PUBLIC_SOCKET_URL.

class SocketService {
  private enabled: boolean;

  constructor() {
    // Only attempt socket if explicitly configured AND running in browser
    this.enabled = false;
  }

  connect(_userId: string) {
    // no-op on Vercel — WebSockets not supported on serverless
  }

  disconnect() {
    // no-op
  }

  joinRideRoom(_rideId: string) {}

  sendMessage(_data: {
    rideId: string;
    senderId: string;
    receiverId: string;
    message: string;
    messageType?: string;
  }) {}

  onReceiveMessage(_callback: (message: any) => void) {
    return () => {}; // return no-op unsubscribe
  }

  emitTyping(_rideId: string, _userId: string, _isTyping: boolean) {}

  onTyping(_callback: (data: { userId: string; isTyping: boolean }) => void) {
    return () => {};
  }

  onBookingRequest(_callback: (data: any) => void) {
    return () => {};
  }

  onBookingAccepted(_callback: (data: any) => void) {
    return () => {};
  }

  onUserOnline(_callback: (data: { userId: string }) => void) {
    return () => {};
  }

  isConnected() {
    return false;
  }
}

export const socketService = new SocketService();

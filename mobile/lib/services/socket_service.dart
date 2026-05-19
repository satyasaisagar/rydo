import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? _socket;
  static const String _url = 'http://10.0.2.2:4000/chat';

  void connect(String userId) {
    if (_socket != null && _socket!.connected) return;

    _socket = IO.io(_url, IO.OptionBuilder()
      .setTransports(['websocket'])
      .setAuth({'userId': userId})
      .enableReconnection()
      .setReconnectionAttempts(5)
      .build());

    _socket!.onConnect((_) => print('🔌 Socket connected: ${_socket!.id}'));
    _socket!.onDisconnect((_) => print('🔌 Socket disconnected'));
    _socket!.onConnectError((e) => print('Socket error: $e'));
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }

  void joinRideRoom(String rideId) {
    _socket?.emit('join_ride_room', {'rideId': rideId});
  }

  void sendMessage({
    required String rideId,
    required String senderId,
    required String receiverId,
    required String message,
    String messageType = 'text',
  }) {
    _socket?.emit('send_message', {
      'rideId': rideId,
      'senderId': senderId,
      'receiverId': receiverId,
      'message': message,
      'messageType': messageType,
    });
  }

  void onReceiveMessage(void Function(dynamic) callback) {
    _socket?.on('receive_message', callback);
  }

  void offReceiveMessage() {
    _socket?.off('receive_message');
  }

  void emitTyping(String rideId, String userId, bool isTyping) {
    _socket?.emit('typing', {'rideId': rideId, 'userId': userId, 'isTyping': isTyping});
  }

  void onTyping(void Function(dynamic) callback) {
    _socket?.on('typing', callback);
  }

  void onBookingRequest(void Function(dynamic) callback) {
    _socket?.on('booking_request', callback);
  }

  void onBookingAccepted(void Function(dynamic) callback) {
    _socket?.on('booking_accepted', callback);
  }

  bool get isConnected => _socket?.connected ?? false;
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class ChatListScreen extends ConsumerStatefulWidget {
  const ChatListScreen({super.key});
  @override
  ConsumerState<ChatListScreen> createState() => _ChatListScreenState();
}
class _ChatListScreenState extends ConsumerState<ChatListScreen> {
  List<Map<String,dynamic>> _bookings = [];
  bool _loading = true;
  @override void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    try { final api = ApiService(storage: ref.read(secureStorageProvider)); final res = await api.getMyBookings(); setState(() { _bookings = res.where((b) => (b as Map)['status'] == 'accepted').cast<Map<String,dynamic>>().toList(); _loading = false; }); } catch (_) { if (mounted) setState(() => _loading = false); }
  }
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Messages')),
    body: _loading ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryGreen)) : _bookings.isEmpty
      ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Text('💬', style: TextStyle(fontSize: 44)), const SizedBox(height: 12),
          Text('No conversations yet', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 15)),
          const SizedBox(height: 4), Text('Accepted bookings appear here', style: TextStyle(color: Colors.white.withOpacity(0.2), fontSize: 13)),
        ]))
      : ListView.builder(padding: const EdgeInsets.all(16), itemCount: _bookings.length, itemBuilder: (c, i) {
          final b = _bookings[i]; final ride = b['ride'] as Map<String,dynamic>?; final rider = ride?['rider'] as Map<String,dynamic>?;
          return ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            leading: CircleAvatar(backgroundColor: AppTheme.primaryGreen.withOpacity(0.15), child: Text((rider?['name'] as String? ?? '?')[0].toUpperCase(), style: const TextStyle(color: AppTheme.primaryGreen, fontWeight: FontWeight.bold))),
            title: Text(rider?['name'] as String? ?? 'Driver', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
            subtitle: Text('${ride?['pickupLocation'] ?? ''} → ${ride?['dropLocation'] ?? ''}', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12), overflow: TextOverflow.ellipsis),
            trailing: const Icon(Icons.chevron_right, color: Colors.white24),
            onTap: () => context.push('/chats/${b['rideId']}?receiverId=${ride?['riderId'] ?? ''}&receiverName=${Uri.encodeComponent(rider?['name'] as String? ?? 'Driver')}'),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          );
        }),
  );
}
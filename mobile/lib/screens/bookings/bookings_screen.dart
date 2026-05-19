import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../models/user_model.dart';
import '../../theme/app_theme.dart';

class BookingsScreen extends ConsumerStatefulWidget {
  const BookingsScreen({super.key});
  @override
  ConsumerState<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends ConsumerState<BookingsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabs;
  List<BookingModel> _bookings = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _tabs = TabController(length: 2, vsync: this); _loadBookings(); }
  @override
  void dispose() { _tabs.dispose(); super.dispose(); }

  Future<void> _loadBookings() async {
    setState(() => _loading = true);
    try {
      final api = ApiService(storage: ref.read(secureStorageProvider));
      final res = await api.getMyBookings();
      setState(() => _bookings = res.map((b) => BookingModel.fromJson(b as Map<String,dynamic>)).toList());
    } catch (_) {} finally { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _update(String id, String status) async {
    try {
      await ApiService(storage: ref.read(secureStorageProvider)).updateBookingStatus(id, status);
      await _loadBookings();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Done'), backgroundColor: AppTheme.primaryGreen));
    } catch (e) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error'), backgroundColor: Colors.red.shade800)); }
  }

  @override
  Widget build(BuildContext context) {
    final active = _bookings.where((b) => b.status == 'accepted' || b.status == 'pending').toList();
    final past   = _bookings.where((b) => b.status == 'completed' || b.status == 'cancelled' || b.status == 'rejected').toList();
    return Scaffold(body: SafeArea(child: Column(children: [
      Padding(padding: const EdgeInsets.fromLTRB(20,16,20,0),
        child: Row(children: [
          const Text('My Trips', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
          const Spacer(),
          IconButton(onPressed: _loadBookings, icon: const Icon(Icons.refresh_outlined, color: Colors.white54, size: 20)),
        ])),
      TabBar(controller: _tabs, labelColor: AppTheme.primaryGreen, unselectedLabelColor: Colors.white38,
        indicatorColor: AppTheme.primaryGreen, dividerColor: Colors.white12,
        tabs: const [Tab(text: 'Active'), Tab(text: 'History')]),
      Expanded(child: _loading
        ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryGreen))
        : TabBarView(controller: _tabs, children: [
          _list(active, isActive: true),
          _list(past,   isActive: false),
        ])),
    ])));
  }

  Widget _list(List<BookingModel> list, {required bool isActive}) {
    if (list.isEmpty) return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
      const Text('🗓️', style: TextStyle(fontSize: 44)), const SizedBox(height: 12),
      Text('No ${isActive ? 'active' : 'past'} trips', style: const TextStyle(color: Colors.white70, fontSize: 16)),
      if (isActive) ...[const SizedBox(height: 16), ElevatedButton(onPressed: () => context.go('/search'), child: const Text('Find a Ride'))],
    ]));
    return RefreshIndicator(onRefresh: _loadBookings, color: AppTheme.primaryGreen,
      child: ListView.builder(padding: const EdgeInsets.all(16), itemCount: list.length,
        itemBuilder: (c, i) => _Tile(booking: list[i], isActive: isActive, onUpdate: _update)));
  }
}

class _Tile extends StatelessWidget {
  final BookingModel b;
  final bool isActive;
  final void Function(String, String) onUpdate;
  const _Tile({required BookingModel booking, required this.isActive, required this.onUpdate}) : b = booking;

  Color get col { switch (b.status) { case 'accepted': return AppTheme.primaryGreen; case 'pending': return Colors.amber; case 'completed': return Colors.blue; default: return Colors.red; } }

  @override
  Widget build(BuildContext ctx) => Container(
    margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: const Color(0xFF111111), borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.white.withOpacity(0.06))),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Expanded(child: Text('\${b.ride?.pickupLocation ?? '?'} → \${b.ride?.dropLocation ?? '?'}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14))),
        Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(color: col.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: col.withOpacity(0.2))),
          child: Text(b.status.toUpperCase(), style: TextStyle(color: col, fontSize: 9, fontWeight: FontWeight.w700))),
      ]),
      const SizedBox(height: 8),
      if (b.ride?.rideDate != null) Text(b.ride!.rideDate, style: TextStyle(color: Colors.white.withOpacity(0.35), fontSize: 12)),
      const SizedBox(height: 8),
      Row(children: [
        Text('\${b.seatsBooked} seat\${b.seatsBooked > 1 ? 's' : ''}', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12)),
        const SizedBox(width: 12),
        Text('₹\${b.totalAmount.toStringAsFixed(0)}', style: const TextStyle(color: AppTheme.primaryGreen, fontWeight: FontWeight.w700, fontSize: 14)),
      ]),
      if (isActive && b.status == 'accepted') ...[const SizedBox(height: 10), Row(children: [
        Expanded(child: OutlinedButton(onPressed: () => onUpdate(b.id, 'cancelled'),
          style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.red), foregroundColor: Colors.red, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)), padding: const EdgeInsets.symmetric(vertical: 6)),
          child: const Text('Cancel', style: TextStyle(fontSize: 12)))),
        const SizedBox(width: 8),
        Expanded(child: ElevatedButton(onPressed: () => ctx.push('/chats/\${b.rideId}?receiverId=\${b.ride?.riderId ?? ''}'),
          style: ElevatedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)), padding: const EdgeInsets.symmetric(vertical: 6)),
          child: const Text('Message', style: TextStyle(fontSize: 12)))),
      ])],
    ]),
  );
}

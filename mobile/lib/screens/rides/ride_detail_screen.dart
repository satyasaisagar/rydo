import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../models/user_model.dart';
import '../../theme/app_theme.dart';

class RideDetailScreen extends ConsumerStatefulWidget {
  final String rideId;
  const RideDetailScreen({super.key, required this.rideId});
  @override
  ConsumerState<RideDetailScreen> createState() => _RideDetailScreenState();
}
class _RideDetailScreenState extends ConsumerState<RideDetailScreen> {
  RideModel? _ride; bool _loading = true; bool _booking = false; int _seats = 1;
  @override void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    try { final api = ApiService(storage: ref.read(secureStorageProvider)); final r = await api.getRide(widget.rideId); setState(() { _ride = RideModel.fromJson(r); _loading = false; }); } catch (_) { if (mounted) setState(() => _loading = false); }
  }
  Future<void> _book() async {
    final user = ref.read(authStateProvider).user;
    if (user == null) { context.push('/auth/login'); return; }
    setState(() => _booking = true);
    try {
      final api = ApiService(storage: ref.read(secureStorageProvider));
      await api.createBooking(widget.rideId, _seats);
      if (mounted) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Booking request sent!'), backgroundColor: AppTheme.primaryGreen)); context.go('/bookings'); }
    } catch (e) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: \$e'), backgroundColor: Colors.red.shade800)); }
    finally { if (mounted) setState(() => _booking = false); }
  }
  @override
  Widget build(BuildContext context) {
    if (_loading) return Scaffold(appBar: AppBar(title: const Text('Ride Details')), body: const Center(child: CircularProgressIndicator(color: AppTheme.primaryGreen)));
    if (_ride == null) return Scaffold(appBar: AppBar(), body: const Center(child: Text('Ride not found', style: TextStyle(color: Colors.white))));
    final r = _ride!;
    return Scaffold(
      appBar: AppBar(title: const Text('Ride Details')),
      body: SingleChildScrollView(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _card([
          Row(children: [
            Column(children: [const Icon(Icons.circle, color: AppTheme.primaryGreen, size: 10), Container(width: 1, height: 32, color: Colors.white.withOpacity(0.1)), Icon(Icons.circle_outlined, color: Colors.white.withOpacity(0.3), size: 10)]),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(r.pickupLocation, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16)),
              const SizedBox(height: 14),
              Text(r.dropLocation, style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 15)),
            ])),
          ]),
          const SizedBox(height: 14),
          Row(children: [
            Icon(Icons.calendar_today_outlined, color: Colors.white.withOpacity(0.4), size: 14), const SizedBox(width: 6),
            Text('${r.rideDate}  ${r.rideTime.length >= 5 ? r.rideTime.substring(0,5) : r.rideTime}', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
            const Spacer(),
            Icon(Icons.people_outline, color: Colors.white.withOpacity(0.4), size: 14), const SizedBox(width: 4),
            Text('${r.availableSeats} seats left', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
          ]),
        ]),
        const SizedBox(height: 12),
        if (r.rider != null) _card([
          const Text('Driver', style: TextStyle(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.w600)),
          const SizedBox(height: 10),
          Row(children: [
            CircleAvatar(radius: 22, backgroundColor: AppTheme.primaryGreen.withOpacity(0.15), child: Text(r.rider!.initials, style: const TextStyle(color: AppTheme.primaryGreen, fontWeight: FontWeight.w700))),
            const SizedBox(width: 12),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(r.rider!.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
              Row(children: [...List.generate(5, (i) => Icon(i < (r.rider!.rating?.round() ?? 0) ? Icons.star : Icons.star_border, color: AppTheme.primaryGreen, size: 14))]),
            ]),
          ]),
        ]),
        const SizedBox(height: 80),
      ])),
      bottomNavigationBar: Padding(padding: const EdgeInsets.fromLTRB(16,0,16,32), child: Row(children: [
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('₹${r.pricePerSeat.toStringAsFixed(0)}', style: const TextStyle(color: AppTheme.primaryGreen, fontWeight: FontWeight.w800, fontSize: 22)),
          Text('per seat', style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 11)),
        ]),
        const Spacer(),
        SizedBox(height: 50, width: 160, child: ElevatedButton(
          onPressed: _booking ? null : _book,
          child: _booking ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black)) : const Text('Book a Seat'),
        )),
      ])),
    );
  }
  Widget _card(List<Widget> children) => Container(margin: const EdgeInsets.only(bottom: 4), padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: const Color(0xFF111111), borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.white.withOpacity(0.06))),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children));
}
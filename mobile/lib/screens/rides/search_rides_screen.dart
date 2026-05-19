import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_service.dart';
import '../../models/user_model.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';

class SearchRidesScreen extends ConsumerStatefulWidget {
  const SearchRidesScreen({super.key});
  @override
  ConsumerState<SearchRidesScreen> createState() => _SearchRidesScreenState();
}

class _SearchRidesScreenState extends ConsumerState<SearchRidesScreen> {
  final _fromCtrl = TextEditingController();
  final _toCtrl   = TextEditingController();
  String _date    = DateTime.now().toIso8601String().split('T')[0];
  List<RideModel> _rides = [];
  bool _loading = false, _searched = false;

  Future<void> _search() async {
    if (_fromCtrl.text.isEmpty || _toCtrl.text.isEmpty) return;
    setState(() { _loading = true; _searched = true; });
    try {
      final api = ApiService(storage: ref.read(secureStorageProvider));
      final res = await api.searchRides({'pickup': _fromCtrl.text, 'drop': _toCtrl.text, 'date': _date});
      setState(() => _rides = (res['data'] as List).map((r) => RideModel.fromJson(r as Map<String,dynamic>)).toList());
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: \$e'), backgroundColor: Colors.red.shade800));
    } finally { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(body: SafeArea(child: Column(children: [
      Container(color: const Color(0xFF111111), padding: const EdgeInsets.all(16), child: Column(children: [
        Row(children: [
          Expanded(child: _searchInput(_fromCtrl, 'From city', AppTheme.primaryGreen)),
          const SizedBox(width: 8),
          Expanded(child: _searchInput(_toCtrl, 'To city', Colors.white30)),
        ]),
        const SizedBox(height: 10),
        Row(children: [
          Expanded(child: GestureDetector(
            onTap: () async {
              final p = await showDatePicker(context: context, initialDate: DateTime.parse(_date),
                firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 90)),
                builder: (c, child) => Theme(data: ThemeData.dark().copyWith(colorScheme: const ColorScheme.dark(primary: AppTheme.primaryGreen)), child: child!));
              if (p != null) setState(() => _date = p.toIso8601String().split('T')[0]);
            },
            child: Container(height: 46, padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white.withOpacity(0.08))),
              child: Row(children: [
                const Icon(Icons.calendar_today_outlined, color: Color(0xFF6B7280), size: 16),
                const SizedBox(width: 6), Text(_date, style: const TextStyle(color: Colors.white70, fontSize: 12)),
              ])),
          )),
          const SizedBox(width: 8),
          SizedBox(height: 46, child: ElevatedButton(
            onPressed: _search,
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryGreen, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), padding: const EdgeInsets.symmetric(horizontal: 20)),
            child: const Text('Search', style: TextStyle(color: Colors.black, fontWeight: FontWeight.w700)),
          )),
        ]),
      ])),
      Expanded(child: _loading
        ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryGreen))
        : !_searched ? _hint() : _rides.isEmpty ? _empty()
          : ListView.builder(padding: const EdgeInsets.all(16), itemCount: _rides.length,
              itemBuilder: (c, i) => _RideCard(ride: _rides[i]))),
    ])));
  }

  Widget _searchInput(TextEditingController c, String hint, Color iconColor) => TextField(
    controller: c, style: const TextStyle(color: Colors.white, fontSize: 13),
    decoration: InputDecoration(hintText: hint, contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      prefixIcon: Icon(Icons.location_on_outlined, color: iconColor, size: 16),
      filled: true, fillColor: Colors.white.withOpacity(0.05),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.08))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.08))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.primaryGreen))));

  Widget _hint() => Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
    Icon(Icons.search, size: 52, color: Colors.white.withOpacity(0.1)),
    const SizedBox(height: 12),
    Text('Search for rides', style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 15)),
  ]));

  Widget _empty() => Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
    const Text('🚗', style: TextStyle(fontSize: 40)),
    const SizedBox(height: 12),
    const Text('No rides found', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w600)),
    const SizedBox(height: 6),
    Text('Try different dates or routes', style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 13)),
  ]));
}

class _RideCard extends StatelessWidget {
  final RideModel ride;
  const _RideCard({required this.ride});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: () => context.push('/rides/\${ride.id}'),
    child: Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: const Color(0xFF111111), borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.white.withOpacity(0.06))),
      child: Row(children: [
        Column(children: [const Icon(Icons.circle, color: AppTheme.primaryGreen, size: 9), Container(width: 1, height: 28, color: Colors.white.withOpacity(0.1)), Icon(Icons.circle_outlined, color: Colors.white.withOpacity(0.3), size: 9)]),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(ride.pickupLocation, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
          const SizedBox(height: 10),
          Text(ride.dropLocation, style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
          if (ride.rider != null) ...[const SizedBox(height: 8), Row(children: [
            CircleAvatar(radius: 10, backgroundColor: const Color(0xFF00C853).withOpacity(0.2), child: Text(ride.rider!.initials, style: const TextStyle(color: AppTheme.primaryGreen, fontSize: 9, fontWeight: FontWeight.bold))),
            const SizedBox(width: 6), Text(ride.rider!.name, style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12)),
          ])],
        ])),
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text('₹\${ride.pricePerSeat.toStringAsFixed(0)}', style: const TextStyle(color: AppTheme.primaryGreen, fontWeight: FontWeight.w800, fontSize: 17)),
          Text('per seat', style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 10)),
          const SizedBox(height: 6),
          Row(children: [Icon(Icons.people_outline, color: Colors.white.withOpacity(0.3), size: 13), const SizedBox(width: 3), Text('\${ride.availableSeats}', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12))]),
        ]),
      ]),
    ),
  );
}
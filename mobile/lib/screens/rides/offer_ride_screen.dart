import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class OfferRideScreen extends ConsumerStatefulWidget {
  const OfferRideScreen({super.key});
  @override
  ConsumerState<OfferRideScreen> createState() => _OfferRideScreenState();
}
class _OfferRideScreenState extends ConsumerState<OfferRideScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fromCtrl = TextEditingController(), _toCtrl = TextEditingController(), _priceCtrl = TextEditingController(text: '200');
  String _date = DateTime.now().toIso8601String().split('T')[0]; String _time = '08:00';
  int _seats = 3; bool _loading = false;
  bool _ac = false, _music = false, _luggage = false;
  @override void dispose() { _fromCtrl.dispose(); _toCtrl.dispose(); _priceCtrl.dispose(); super.dispose(); }
  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      final api = ApiService(storage: ref.read(secureStorageProvider));
      await api.createRide({'pickupLocation': _fromCtrl.text, 'pickupLat': 0.0, 'pickupLng': 0.0, 'dropLocation': _toCtrl.text, 'dropLat': 0.0, 'dropLng': 0.0, 'rideDate': _date, 'rideTime': _time, 'availableSeats': _seats, 'pricePerSeat': double.tryParse(_priceCtrl.text) ?? 200, 'acAvailable': _ac, 'musicAllowed': _music, 'luggageAllowed': _luggage});
      if (mounted) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ride published!'), backgroundColor: AppTheme.primaryGreen)); context.go('/home'); }
    } catch (e) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: \$e'), backgroundColor: Colors.red.shade800)); }
    finally { if (mounted) setState(() => _loading = false); }
  }
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Offer a Ride')),
    body: SingleChildScrollView(padding: const EdgeInsets.all(16), child: Form(key: _formKey, child: Column(children: [
      _card([
        const Text('Route', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)), const SizedBox(height: 12),
        _tf(_fromCtrl, 'Pickup location', Icons.trip_origin, color: AppTheme.primaryGreen), const SizedBox(height: 12),
        _tf(_toCtrl, 'Drop location', Icons.location_on_outlined), const SizedBox(height: 12),
        GestureDetector(onTap: () async {
          final p = await showDatePicker(context: context, initialDate: DateTime.parse(_date), firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 90)), builder: (c, ch) => Theme(data: ThemeData.dark().copyWith(colorScheme: const ColorScheme.dark(primary: AppTheme.primaryGreen)), child: ch!));
          if (p != null) setState(() => _date = p.toIso8601String().split('T')[0]);
        }, child: _dateRow()),
      ]),
      const SizedBox(height: 12),
      _card([
        const Text('Seats & Price', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)), const SizedBox(height: 12),
        Row(children: [
          const Text('Seats:', style: TextStyle(color: Colors.white70, fontSize: 14)), const Spacer(),
          IconButton(onPressed: () => setState(() => _seats = (_seats-1).clamp(1,8)), icon: const Icon(Icons.remove_circle_outline, color: Colors.white54)),
          Text('$_seats', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 18)),
          IconButton(onPressed: () => setState(() => _seats = (_seats+1).clamp(1,8)), icon: const Icon(Icons.add_circle_outline, color: AppTheme.primaryGreen)),
        ]),
        _tf(_priceCtrl, 'Price per seat (₹)', Icons.currency_rupee, keyboardType: TextInputType.number),
      ]),
      const SizedBox(height: 12),
      _card([
        const Text('Preferences', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)), const SizedBox(height: 10),
        _toggle('AC Available', _ac, (v) => setState(() => _ac = v)),
        _toggle('Music Allowed', _music, (v) => setState(() => _music = v)),
        _toggle('Luggage OK', _luggage, (v) => setState(() => _luggage = v)),
      ]),
      const SizedBox(height: 20),
      SizedBox(width: double.infinity, height: 52, child: ElevatedButton(
        onPressed: _loading ? null : _submit,
        child: _loading ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black)) : const Text('Publish Ride'),
      )),
      const SizedBox(height: 24),
    ]))));
  Widget _card(List<Widget> ch) => Container(margin: const EdgeInsets.only(bottom: 4), padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: const Color(0xFF111111), borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.white.withOpacity(0.06))), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: ch));
  Widget _tf(TextEditingController c, String hint, IconData icon, {Color? color, TextInputType? keyboardType}) => TextFormField(controller: c, style: const TextStyle(color: Colors.white, fontSize: 14), keyboardType: keyboardType,
    decoration: InputDecoration(hintText: hint, prefixIcon: Icon(icon, size: 18, color: color ?? const Color(0xFF6B7280))),
    validator: (v) => (v?.isEmpty ?? true) ? 'Required' : null);
  Widget _dateRow() => Container(padding: const EdgeInsets.all(14), decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white.withOpacity(0.08))), child: Row(children: [const Icon(Icons.calendar_today_outlined, color: Color(0xFF6B7280), size: 16), const SizedBox(width: 8), Text(_date, style: const TextStyle(color: Colors.white70, fontSize: 14))]));
  Widget _toggle(String label, bool val, ValueChanged<bool> onChange) => Row(children: [Text(label, style: const TextStyle(color: Colors.white70, fontSize: 14)), const Spacer(), Switch.adaptive(value: val, onChanged: onChange, activeColor: AppTheme.primaryGreen)]);
}
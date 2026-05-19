import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});
  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}
class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  Map<String,dynamic>? _profile;
  bool _loading = true;
  @override void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    try { final api = ApiService(storage: ref.read(secureStorageProvider)); final r = await api.getProfile(); setState(() { _profile = r; _loading = false; }); } catch (_) { if (mounted) setState(() => _loading = false); }
  }
  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authStateProvider).user;
    return Scaffold(body: SafeArea(child: _loading ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryGreen)) : SingleChildScrollView(padding: const EdgeInsets.all(20), child: Column(children: [
      const SizedBox(height: 12),
      CircleAvatar(radius: 44, backgroundColor: AppTheme.primaryGreen.withOpacity(0.15), child: Text(user?.name.isNotEmpty == true ? user!.name[0].toUpperCase() : '?', style: const TextStyle(color: AppTheme.primaryGreen, fontSize: 32, fontWeight: FontWeight.w700))),
      const SizedBox(height: 12),
      Text(user?.name ?? '', style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
      const SizedBox(height: 4),
      Text(user?.email ?? '', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 13)),
      const SizedBox(height: 8),
      Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        ...List.generate(5, (i) => Icon(i < ((_profile?['rating'] as num?)?.round() ?? 0) ? Icons.star : Icons.star_border, color: AppTheme.primaryGreen, size: 16)),
        const SizedBox(width: 6),
        Text('${_profile?['rating'] ?? '-'}', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
      ]),
      const SizedBox(height: 28),
      _menu([
        _item(Icons.history_outlined, 'Trip History', () => context.go('/bookings')),
        _item(Icons.notifications_outlined, 'Notifications', () => context.push('/notifications')),
        _item(Icons.security_outlined, 'Privacy & Safety', () {}),
        _item(Icons.help_outline, 'Help', () {}),
      ]),
      const SizedBox(height: 12),
      _menu([_item(Icons.logout, 'Log Out', () async { await ref.read(authStateProvider.notifier).logout(); if (context.mounted) context.go('/auth/login'); }, color: Colors.red.shade400)]),
    ]))));
  }
  Widget _menu(List<Widget> items) => Container(decoration: BoxDecoration(color: const Color(0xFF111111), borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.white.withOpacity(0.06))), child: Column(children: items));
  Widget _item(IconData icon, String label, VoidCallback onTap, {Color? color}) => ListTile(
    leading: Icon(icon, color: color ?? Colors.white60, size: 20),
    title: Text(label, style: TextStyle(color: color ?? Colors.white, fontSize: 14)),
    trailing: color == null ? const Icon(Icons.chevron_right, color: Colors.white24, size: 18) : null,
    onTap: onTap, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)));
}
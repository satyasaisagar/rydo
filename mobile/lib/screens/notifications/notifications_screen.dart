import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});
  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}
class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  List<Map<String,dynamic>> _notifs = [];
  bool _loading = true;
  @override void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    try { final api = ApiService(storage: ref.read(secureStorageProvider)); final r = await api.getNotifications(); setState(() { _notifs = List<Map<String,dynamic>>.from(r['data']); _loading = false; }); } catch (_) { if (mounted) setState(() => _loading = false); }
  }
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Notifications'), actions: [
      TextButton(onPressed: _load, child: const Text('Refresh', style: TextStyle(color: AppTheme.primaryGreen, fontSize: 13))),
    ]),
    body: _loading ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryGreen)) : _notifs.isEmpty
      ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [const Text('🔔', style: TextStyle(fontSize: 44)), const SizedBox(height: 12), Text('All caught up!', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 15))]))
      : ListView.builder(padding: const EdgeInsets.all(16), itemCount: _notifs.length, itemBuilder: (c, i) {
          final n = _notifs[i]; final isRead = n['isRead'] as bool? ?? false;
          return Container(margin: const EdgeInsets.only(bottom: 10), padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: isRead ? Colors.transparent : const Color(0xFF111111), borderRadius: BorderRadius.circular(16), border: Border.all(color: isRead ? Colors.transparent : Colors.white.withOpacity(0.06))),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Container(width: 40, height: 40, decoration: BoxDecoration(color: Colors.white.withOpacity(0.06), borderRadius: BorderRadius.circular(12)), child: const Center(child: Text('🔔', style: TextStyle(fontSize: 18)))),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(n['title'] ?? '', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                const SizedBox(height: 3),
                Text(n['message'] ?? '', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
              ])),
              if (!isRead) Container(width: 8, height: 8, margin: const EdgeInsets.only(top: 4), decoration: const BoxDecoration(color: AppTheme.primaryGreen, shape: BoxShape.circle)),
            ]));
        }),
  );
}
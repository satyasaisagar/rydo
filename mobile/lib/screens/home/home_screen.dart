import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authStateProvider);
    final user = auth.user;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _getGreeting(),
                          style: const TextStyle(color: Color(0xFF6B7280), fontSize: 13),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user?.name.split(' ').first ?? 'Traveller',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: () => context.push('/notifications'),
                    child: Stack(
                      children: [
                        Container(
                          width: 44, height: 44,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: Colors.white.withOpacity(0.08)),
                          ),
                          child: const Icon(Icons.notifications_outlined, color: Colors.white, size: 22),
                        ),
                        Positioned(
                          top: 8, right: 8,
                          child: Container(
                            width: 8, height: 8,
                            decoration: const BoxDecoration(
                              color: AppTheme.primaryGreen,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 28),

              // Hero search card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF00C853), Color(0xFF00A846)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(22),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Where are you going?',
                      style: TextStyle(
                        color: Colors.black,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Find rides or offer your seat',
                      style: TextStyle(color: Colors.black.withOpacity(0.6), fontSize: 13),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () => context.push('/search'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.search, color: Colors.black, size: 18),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Search rides...',
                                    style: TextStyle(color: Colors.black.withOpacity(0.6), fontSize: 14),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        GestureDetector(
                          onTap: () => context.push('/offer'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            decoration: BoxDecoration(
                              color: Colors.black,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.add, color: Color(0xFF00C853), size: 18),
                                SizedBox(width: 6),
                                Text('Offer', style: TextStyle(color: Color(0xFF00C853), fontWeight: FontWeight.w600, fontSize: 14)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // Quick actions
              const Text('Quick Actions', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 16)),
              const SizedBox(height: 14),
              Row(
                children: [
                  _quickAction(context, Icons.directions_car_outlined, 'My Trips', '/bookings', const Color(0xFF3B82F6)),
                  const SizedBox(width: 12),
                  _quickAction(context, Icons.chat_bubble_outline, 'Messages', '/chats', const Color(0xFF8B5CF6)),
                  const SizedBox(width: 12),
                  _quickAction(context, Icons.star_outline, 'Reviews', '/profile', const Color(0xFFF59E0B)),
                  const SizedBox(width: 12),
                  _quickAction(context, Icons.person_outline, 'Profile', '/profile', AppTheme.primaryGreen),
                ],
              ),

              const SizedBox(height: 28),

              // Popular routes header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Popular Routes', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 16)),
                  GestureDetector(
                    onTap: () => context.push('/search'),
                    child: const Text('See all', style: TextStyle(color: AppTheme.primaryGreen, fontSize: 13)),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              ..._popularRoutes.map((r) => _routeCard(context, r)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _quickAction(BuildContext ctx, IconData icon, String label, String route, Color color) {
    return Expanded(
      child: GestureDetector(
        onTap: () => ctx.push(route),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: color.withOpacity(0.08),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: color.withOpacity(0.15)),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(height: 6),
              Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _routeCard(BuildContext ctx, Map<String, dynamic> route) {
    return GestureDetector(
      onTap: () => ctx.push('/search?pickup=${route['from']}&drop=${route['to']}'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF111111),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Row(
          children: [
            Column(
              children: [
                const Icon(Icons.circle, color: AppTheme.primaryGreen, size: 8),
                Container(width: 1, height: 24, color: Colors.white.withOpacity(0.1)),
                Icon(Icons.circle_outlined, color: Colors.white.withOpacity(0.3), size: 8),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(route['from']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                  const SizedBox(height: 8),
                  Text(route['to']!, style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('₹${route['price']}', style: const TextStyle(color: AppTheme.primaryGreen, fontWeight: FontWeight.w700, fontSize: 16)),
                const SizedBox(height: 2),
                Text('per seat', style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 11)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _getGreeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good morning,';
    if (h < 17) return 'Good afternoon,';
    return 'Good evening,';
  }

  static const _popularRoutes = [
    {'from': 'Mumbai', 'to': 'Pune',    'price': '350'},
    {'from': 'Delhi',  'to': 'Agra',    'price': '280'},
    {'from': 'Bangalore', 'to': 'Mysore', 'price': '200'},
  ];
}

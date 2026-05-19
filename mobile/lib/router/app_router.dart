import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../screens/splash/splash_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/auth/otp_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/rides/search_rides_screen.dart';
import '../screens/rides/ride_detail_screen.dart';
import '../screens/rides/offer_ride_screen.dart';
import '../screens/bookings/bookings_screen.dart';
import '../screens/chat/chat_list_screen.dart';
import '../screens/chat/chat_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/notifications/notifications_screen.dart';
import '../providers/auth_provider.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isAuthenticated = authState.user != null;
      final isAuthRoute = state.matchedLocation.startsWith('/auth');
      final isSplash    = state.matchedLocation == '/splash';

      if (isSplash) return null;
      if (!isAuthenticated && !isAuthRoute) return '/auth/login';
      if (isAuthenticated && isAuthRoute) return '/home';

      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (ctx, _) => const SplashScreen()),

      // Auth
      GoRoute(path: '/auth/login',    builder: (ctx, _) => const LoginScreen()),
      GoRoute(path: '/auth/register', builder: (ctx, _) => const RegisterScreen()),
      GoRoute(
        path: '/auth/otp/:userId',
        builder: (ctx, state) => OtpScreen(userId: state.pathParameters['userId']!),
      ),

      // Main shell with bottom nav
      ShellRoute(
        builder: (ctx, state, child) => MainShell(child: child),
        routes: [
          GoRoute(path: '/home',          builder: (ctx, _) => const HomeScreen()),
          GoRoute(path: '/search',        builder: (ctx, _) => const SearchRidesScreen()),
          GoRoute(path: '/offer',         builder: (ctx, _) => const OfferRideScreen()),
          GoRoute(path: '/bookings',      builder: (ctx, _) => const BookingsScreen()),
          GoRoute(path: '/chats',         builder: (ctx, _) => const ChatListScreen()),
          GoRoute(path: '/profile',       builder: (ctx, _) => const ProfileScreen()),
          GoRoute(path: '/notifications', builder: (ctx, _) => const NotificationsScreen()),
          GoRoute(
            path: '/rides/:id',
            builder: (ctx, state) => RideDetailScreen(rideId: state.pathParameters['id']!),
          ),
          GoRoute(
            path: '/chats/:rideId',
            builder: (ctx, state) => ChatScreen(
              rideId: state.pathParameters['rideId']!,
              receiverId: state.uri.queryParameters['receiverId'] ?? '',
              receiverName: state.uri.queryParameters['receiverName'] ?? '',
            ),
          ),
        ],
      ),
    ],
    errorBuilder: (ctx, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.error}', style: const TextStyle(color: Colors.white)),
      ),
    ),
  );
});

// Bottom Navigation Shell
class MainShell extends StatefulWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _selectedIndex = 0;

  final _routes = ['/home', '/search', '/offer', '/bookings', '/profile'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF111111),
          border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06))),
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          backgroundColor: Colors.transparent,
          elevation: 0,
          type: BottomNavigationBarType.fixed,
          selectedItemColor: const Color(0xFF00C853),
          unselectedItemColor: const Color(0xFF6B7280),
          selectedFontSize: 11,
          unselectedFontSize: 11,
          onTap: (index) {
            setState(() => _selectedIndex = index);
            context.go(_routes[index]);
          },
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home_outlined),      activeIcon: Icon(Icons.home),         label: 'Home'),
            BottomNavigationBarItem(icon: Icon(Icons.search_outlined),    activeIcon: Icon(Icons.search),       label: 'Find'),
            BottomNavigationBarItem(icon: Icon(Icons.add_circle_outline), activeIcon: Icon(Icons.add_circle),   label: 'Offer'),
            BottomNavigationBarItem(icon: Icon(Icons.book_outlined),      activeIcon: Icon(Icons.book),         label: 'Trips'),
            BottomNavigationBarItem(icon: Icon(Icons.person_outline),     activeIcon: Icon(Icons.person),       label: 'Profile'),
          ],
        ),
      ),
    );
  }
}

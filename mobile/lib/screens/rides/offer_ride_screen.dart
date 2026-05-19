import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class OfferRideScreen extends StatelessWidget {
  const OfferRideScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('OfferRide')),
      body: const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.construction, color: AppTheme.primaryGreen, size: 48),
            SizedBox(height: 16),
            Text('Coming Soon', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}

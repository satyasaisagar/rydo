import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';

class OtpScreen extends ConsumerStatefulWidget {
  final String userId;
  const OtpScreen({super.key, required this.userId});
  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _ctrls   = List.generate(6, (_) => TextEditingController());
  final _focuses  = List.generate(6, (_) => FocusNode());
  bool _loading   = false;

  @override
  void dispose() { for (final c in _ctrls) c.dispose(); for (final f in _focuses) f.dispose(); super.dispose(); }

  String get _otp => _ctrls.map((c) => c.text).join();

  Future<void> _verify() async {
    if (_otp.length != 6) return;
    setState(() => _loading = true);
    try {
      await ref.read(authStateProvider.notifier).verifyOtp(widget.userId, _otp);
      if (mounted) context.go('/home');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: Colors.red.shade800));
        for (final c in _ctrls) c.clear();
        _focuses[0].requestFocus();
      }
    } finally { if (mounted) setState(() => _loading = false); }
  }

  void _onChange(int i, String v) {
    if (v.length == 1 && i < 5) _focuses[i + 1].requestFocus();
    else if (v.isEmpty && i > 0) _focuses[i - 1].requestFocus();
    if (_otp.length == 6) _verify();
    setState(() {});
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    body: SafeArea(child: Padding(padding: const EdgeInsets.all(24), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const SizedBox(height: 16),
      GestureDetector(onTap: () => context.pop(), child: Row(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.arrow_back_ios, color: Colors.white54, size: 16),
        Text('Back', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 14)),
      ])),
      const SizedBox(height: 40),
      Container(width: 60, height: 60, decoration: BoxDecoration(color: AppTheme.primaryGreen.withOpacity(0.1), borderRadius: BorderRadius.circular(18)), child: const Icon(Icons.phone_android_outlined, color: AppTheme.primaryGreen, size: 28)),
      const SizedBox(height: 20),
      const Text('Verify your phone', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
      const SizedBox(height: 8),
      Text('Enter the 6-digit OTP sent to your phone', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 14)),
      const SizedBox(height: 36),
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: List.generate(6, (i) => SizedBox(width: 46, height: 54,
        child: TextFormField(
          controller: _ctrls[i], focusNode: _focuses[i],
          textAlign: TextAlign.center, keyboardType: TextInputType.number, maxLength: 1,
          style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700),
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          decoration: InputDecoration(counterText: '', filled: true, fillColor: Colors.white.withOpacity(0.05),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.primaryGreen, width: 2))),
          onChanged: (v) => _onChange(i, v),
        )))),
      const SizedBox(height: 32),
      SizedBox(width: double.infinity, height: 52, child: ElevatedButton(
        onPressed: _otp.length == 6 && !_loading ? _verify : null,
        child: _loading ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black)) : const Text('Verify OTP'),
      )),
      const SizedBox(height: 20),
      Center(child: GestureDetector(onTap: () {}, child: RichText(text: const TextSpan(children: [
        TextSpan(text: "Didn't receive it? ", style: TextStyle(color: Colors.white54, fontSize: 14)),
        TextSpan(text: 'Resend OTP', style: TextStyle(color: AppTheme.primaryGreen, fontWeight: FontWeight.w600, fontSize: 14)),
      ])))),
    ]))),
  );
}

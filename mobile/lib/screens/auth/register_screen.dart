import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});
  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey  = GlobalKey<FormState>();
  final _namCtrl  = TextEditingController();
  final _emCtrl   = TextEditingController();
  final _phCtrl   = TextEditingController();
  final _pwCtrl   = TextEditingController();
  bool  _showPw   = false;
  bool  _loading  = false;

  @override
  void dispose() { _namCtrl.dispose(); _emCtrl.dispose(); _phCtrl.dispose(); _pwCtrl.dispose(); super.dispose(); }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      final userId = await ref.read(authStateProvider.notifier).register({
        'name': _namCtrl.text.trim(), 'email': _emCtrl.text.trim(),
        'phone': _phCtrl.text.trim(), 'password': _pwCtrl.text,
      });
      if (mounted) context.push('/auth/otp/\$userId');
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: Colors.red.shade800));
    } finally { if (mounted) setState(() => _loading = false); }
  }

  Widget _f(TextEditingController c, String label, String hint, IconData icon, {bool obs = false, TextInputType? type, String? Function(String?)? val}) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 13, fontWeight: FontWeight.w500)),
      const SizedBox(height: 6),
      TextFormField(controller: c, obscureText: obs, keyboardType: type, style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(hintText: hint, prefixIcon: Icon(icon, size: 18, color: const Color(0xFF6B7280))),
        validator: val),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(body: SafeArea(child: SingleChildScrollView(padding: const EdgeInsets.all(24),
      child: Form(key: _formKey, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const SizedBox(height: 32),
        Center(child: Row(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 40, height: 40, decoration: BoxDecoration(color: AppTheme.primaryGreen, borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.directions_car, color: Colors.black, size: 22)),
          const SizedBox(width: 10),
          const Text('rydo', style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
        ])),
        const SizedBox(height: 40),
        const Text('Create account', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
        const SizedBox(height: 28),
        _f(_namCtrl, 'Full Name',    'John Doe',        Icons.person_outline, val: (v) => (v?.length ?? 0) < 2 ? 'Too short' : null),
        const SizedBox(height: 16),
        _f(_emCtrl,  'Email',        'you@example.com', Icons.email_outlined,  type: TextInputType.emailAddress, val: (v) => !(v ?? '').contains('@') ? 'Invalid email' : null),
        const SizedBox(height: 16),
        _f(_phCtrl,  'Phone',        '+91 98765 43210', Icons.phone_outlined,  type: TextInputType.phone, val: (v) => (v?.length ?? 0) < 10 ? 'Invalid phone' : null),
        const SizedBox(height: 16),
        _f(_pwCtrl,  'Password',     'Min 8 characters',Icons.lock_outline,    obs: !_showPw, val: (v) => (v?.length ?? 0) < 8 ? 'Too short' : null),
        const SizedBox(height: 28),
        SizedBox(width: double.infinity, height: 52, child: ElevatedButton(
          onPressed: _loading ? null : _submit,
          child: _loading ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black)) : const Text('Create Account'),
        )),
        const SizedBox(height: 20),
        Center(child: GestureDetector(onTap: () => context.go('/auth/login'),
          child: RichText(text: const TextSpan(children: [
            TextSpan(text: 'Already have an account? ', style: TextStyle(color: Colors.white54, fontSize: 14)),
            TextSpan(text: 'Log in', style: TextStyle(color: AppTheme.primaryGreen, fontWeight: FontWeight.w600, fontSize: 14)),
          ])))),
      ])))));
  }
}
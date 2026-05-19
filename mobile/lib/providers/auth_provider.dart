import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AuthState {
  final UserModel? user;
  final String? accessToken;
  final String? refreshToken;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.user,
    this.accessToken,
    this.refreshToken,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    UserModel? user,
    String? accessToken,
    String? refreshToken,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user:         user         ?? this.user,
      accessToken:  accessToken  ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
      isLoading:    isLoading    ?? this.isLoading,
      error:        error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiService _api;
  final FlutterSecureStorage _storage;

  AuthNotifier(this._api, this._storage) : super(const AuthState()) {
    _loadFromStorage();
  }

  Future<void> _loadFromStorage() async {
    final token       = await _storage.read(key: 'access_token');
    final refreshTok  = await _storage.read(key: 'refresh_token');
    final userJson    = await _storage.read(key: 'user');

    if (token != null && userJson != null) {
      state = state.copyWith(
        accessToken:  token,
        refreshToken: refreshTok,
        user:         UserModel.fromJsonString(userJson),
      );
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _api.login(email: email, password: password);
      await _saveAuth(res['accessToken'], res['refreshToken'], UserModel.fromJson(res['user']));
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      rethrow;
    }
  }

  Future<String> register(Map<String, dynamic> data) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _api.register(data);
      state = state.copyWith(isLoading: false);
      return res['userId'];
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      rethrow;
    }
  }

  Future<void> verifyOtp(String userId, String otp) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _api.verifyOtp(userId: userId, otp: otp);
      await _saveAuth(res['accessToken'], res['refreshToken'], UserModel.fromJson(res['user']));
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      rethrow;
    }
  }

  Future<void> _saveAuth(String accessToken, String refreshToken, UserModel user) async {
    await _storage.write(key: 'access_token',  value: accessToken);
    await _storage.write(key: 'refresh_token', value: refreshToken);
    await _storage.write(key: 'user',          value: user.toJsonString());
    state = state.copyWith(
      user: user, accessToken: accessToken, refreshToken: refreshToken, isLoading: false,
    );
  }

  Future<void> logout() async {
    try { await _api.logout(); } catch (_) {}
    await _storage.deleteAll();
    state = const AuthState();
  }
}

final secureStorageProvider = Provider((_) => const FlutterSecureStorage());

final apiServiceProvider = Provider((ref) {
  final storage = ref.watch(secureStorageProvider);
  return ApiService(storage: storage);
});

final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(apiServiceProvider),
    ref.watch(secureStorageProvider),
  );
});

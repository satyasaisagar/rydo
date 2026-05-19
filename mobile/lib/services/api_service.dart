import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const String baseUrl = 'http://10.0.2.2:4000/api'; // Android emulator
// const String baseUrl = 'http://localhost:4000/api'; // iOS simulator
// const String baseUrl = 'https://api.rydo.app/api'; // Production

class ApiService {
  late final Dio _dio;
  final FlutterSecureStorage storage;

  ApiService({required this.storage}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await storage.read(key: 'access_token');
        if (token != null) options.headers['Authorization'] = 'Bearer $token';
        return handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          try {
            final refreshToken = await storage.read(key: 'refresh_token');
            if (refreshToken != null) {
              final res = await _dio.post('/auth/refresh', data: {'refreshToken': refreshToken});
              final newToken = res.data['accessToken'];
              await storage.write(key: 'access_token', value: newToken);
              error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
              return handler.resolve(await _dio.fetch(error.requestOptions));
            }
          } catch (_) {}
        }
        return handler.next(error);
      },
    ));
  }

  // ─── Auth ───────────────────────────────────────────────
  Future<Map<String, dynamic>> login({required String email, required String password}) async {
    final res = await _dio.post('/auth/login', data: {'email': email, 'password': password});
    return res.data;
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    final res = await _dio.post('/auth/register', data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> verifyOtp({required String userId, required String otp}) async {
    final res = await _dio.post('/auth/verify-otp', data: {'userId': userId, 'otp': otp});
    return res.data;
  }

  Future<void> logout() async {
    await _dio.post('/auth/logout');
  }

  // ─── Rides ──────────────────────────────────────────────
  Future<Map<String, dynamic>> searchRides(Map<String, dynamic> params) async {
    final res = await _dio.get('/rides/search', queryParameters: params);
    return res.data;
  }

  Future<Map<String, dynamic>> getRide(String id) async {
    final res = await _dio.get('/rides/$id');
    return res.data;
  }

  Future<Map<String, dynamic>> createRide(Map<String, dynamic> data) async {
    final res = await _dio.post('/rides', data: data);
    return res.data;
  }

  Future<List<dynamic>> getMyRides() async {
    final res = await _dio.get('/rides/my');
    return res.data;
  }

  // ─── Bookings ───────────────────────────────────────────
  Future<Map<String, dynamic>> createBooking(String rideId, int seats) async {
    final res = await _dio.post('/bookings', data: {'rideId': rideId, 'seatsBooked': seats});
    return res.data;
  }

  Future<List<dynamic>> getMyBookings() async {
    final res = await _dio.get('/bookings/my');
    return res.data;
  }

  Future<Map<String, dynamic>> updateBookingStatus(String bookingId, String status) async {
    final res = await _dio.put('/bookings/$bookingId/status', data: {'status': status});
    return res.data;
  }

  // ─── Chat ───────────────────────────────────────────────
  Future<Map<String, dynamic>> getMessages(String rideId, {int page = 1}) async {
    final res = await _dio.get('/chats/$rideId', queryParameters: {'page': page});
    return res.data;
  }

  // ─── Notifications ──────────────────────────────────────
  Future<Map<String, dynamic>> getNotifications({int page = 1}) async {
    final res = await _dio.get('/notifications', queryParameters: {'page': page});
    return res.data;
  }

  Future<void> markNotificationRead(String id) async {
    await _dio.put('/notifications/$id/read');
  }

  // ─── Profile ────────────────────────────────────────────
  Future<Map<String, dynamic>> getProfile() async {
    final res = await _dio.get('/users/profile');
    return res.data;
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final res = await _dio.put('/users/profile', data: data);
    return res.data;
  }

  // ─── Ratings ────────────────────────────────────────────
  Future<Map<String, dynamic>> createRating(Map<String, dynamic> data) async {
    final res = await _dio.post('/ratings', data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> getUserRatings(String userId) async {
    final res = await _dio.get('/ratings/user/$userId');
    return res.data;
  }
}

import 'dart:convert';

class UserModel {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? profileImage;
  final String role;
  final double? rating;
  final bool isVerified;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.profileImage,
    required this.role,
    this.rating,
    this.isVerified = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id:           json['id']           as String,
      name:         json['name']         as String,
      email:        json['email']        as String,
      phone:        json['phone']        as String?,
      profileImage: json['profileImage'] as String?,
      role:         json['role']         as String? ?? 'passenger',
      rating:       (json['rating'] as num?)?.toDouble(),
      isVerified:   json['isVerified']   as bool? ?? false,
    );
  }

  factory UserModel.fromJsonString(String jsonStr) {
    return UserModel.fromJson(jsonDecode(jsonStr) as Map<String, dynamic>);
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id, 'name': name, 'email': email,
      'phone': phone, 'profileImage': profileImage,
      'role': role, 'rating': rating, 'isVerified': isVerified,
    };
  }

  String toJsonString() => jsonEncode(toJson());

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }
}

class RideModel {
  final String id;
  final String riderId;
  final String pickupLocation;
  final String dropLocation;
  final double pickupLat, pickupLng, dropLat, dropLng;
  final String rideDate;
  final String rideTime;
  final int availableSeats;
  final double pricePerSeat;
  final String status;
  final bool acAvailable, musicAllowed, petsAllowed, womenOnly, luggageAllowed;
  final UserModel? rider;

  const RideModel({
    required this.id,
    required this.riderId,
    required this.pickupLocation,
    required this.dropLocation,
    required this.pickupLat,
    required this.pickupLng,
    required this.dropLat,
    required this.dropLng,
    required this.rideDate,
    required this.rideTime,
    required this.availableSeats,
    required this.pricePerSeat,
    required this.status,
    this.acAvailable   = false,
    this.musicAllowed  = false,
    this.petsAllowed   = false,
    this.womenOnly     = false,
    this.luggageAllowed= false,
    this.rider,
  });

  factory RideModel.fromJson(Map<String, dynamic> json) {
    return RideModel(
      id:              json['id']              as String,
      riderId:         json['riderId']         as String,
      pickupLocation:  json['pickupLocation']  as String,
      dropLocation:    json['dropLocation']    as String,
      pickupLat:       (json['pickupLat']      as num).toDouble(),
      pickupLng:       (json['pickupLng']      as num).toDouble(),
      dropLat:         (json['dropLat']        as num).toDouble(),
      dropLng:         (json['dropLng']        as num).toDouble(),
      rideDate:        json['rideDate']        as String,
      rideTime:        json['rideTime']        as String,
      availableSeats:  json['availableSeats']  as int,
      pricePerSeat:    (json['pricePerSeat']   as num).toDouble(),
      status:          json['status']          as String,
      acAvailable:     json['acAvailable']     as bool? ?? false,
      musicAllowed:    json['musicAllowed']    as bool? ?? false,
      petsAllowed:     json['petsAllowed']     as bool? ?? false,
      womenOnly:       json['womenOnly']       as bool? ?? false,
      luggageAllowed:  json['luggageAllowed']  as bool? ?? false,
      rider: json['rider'] != null ? UserModel.fromJson(json['rider'] as Map<String, dynamic>) : null,
    );
  }
}

class BookingModel {
  final String id;
  final String rideId;
  final String passengerId;
  final int seatsBooked;
  final double totalAmount;
  final String status;
  final RideModel? ride;

  const BookingModel({
    required this.id,
    required this.rideId,
    required this.passengerId,
    required this.seatsBooked,
    required this.totalAmount,
    required this.status,
    this.ride,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    return BookingModel(
      id:           json['id']           as String,
      rideId:       json['rideId']       as String,
      passengerId:  json['passengerId']  as String,
      seatsBooked:  json['seatsBooked']  as int,
      totalAmount:  (json['totalAmount'] as num).toDouble(),
      status:       json['status']       as String,
      ride: json['ride'] != null ? RideModel.fromJson(json['ride'] as Map<String, dynamic>) : null,
    );
  }
}

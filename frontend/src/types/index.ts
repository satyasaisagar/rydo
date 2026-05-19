// ─── User ─────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  profileImage?: string;
  bio?: string;
  rating: number;
  totalRatings: number;
  role: 'passenger' | 'rider' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  isVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  type: 'car' | 'suv' | 'bike' | 'van' | 'auto';
  brand: string;
  model: string;
  color: string;
  registrationNumber: string;
  seatCapacity: number;
  isActive: boolean;
}

// ─── Ride ─────────────────────────────────────────────────
export interface Ride {
  id: string;
  riderId: string;
  vehicleId?: string;
  pickupLocation: string;
  pickupLat: number;
  pickupLng: number;
  dropLocation: string;
  dropLat: number;
  dropLng: number;
  rideDate: string;
  rideTime: string;
  availableSeats: number;
  pricePerSeat: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  // Preferences
  acAvailable: boolean;
  musicAllowed: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  womenOnly: boolean;
  luggageAllowed: boolean;
  description?: string;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  // Relations
  rider?: User;
  vehicle?: Vehicle;
  stops?: RideStop[];
  createdAt: string;
}

export interface RideStop {
  id: string;
  rideId: string;
  stopName: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
  arrivalTime?: string;
}

export interface SearchRideParams {
  pickup?: string;
  drop?: string;
  date?: string;
  seats?: number;
  minPrice?: number;
  maxPrice?: number;
  womenOnly?: boolean;
  page?: number;
  limit?: number;
}

// ─── Booking ──────────────────────────────────────────────
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  rideId: string;
  passengerId: string;
  seatsBooked: number;
  totalAmount: number;
  status: BookingStatus;
  cancellationReason?: string;
  cancelledBy?: string;
  ride?: Ride;
  passenger?: User;
  createdAt: string;
  updatedAt: string;
}

// ─── Chat ─────────────────────────────────────────────────
export type MessageType = 'text' | 'image' | 'location' | 'system';

export interface ChatMessage {
  id: string;
  rideId: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageType: MessageType;
  mediaUrl?: string;
  isRead: boolean;
  readAt?: string;
  sender?: User;
  receiver?: User;
  createdAt: string;
}

// ─── Rating ───────────────────────────────────────────────
export interface Rating {
  id: string;
  reviewerId: string;
  revieweeId: string;
  rideId: string;
  rating: number;
  review?: string;
  drivingRating?: number;
  safetyRating?: number;
  punctualityRating?: number;
  communicationRating?: number;
  behaviorRating?: number;
  cooperationRating?: number;
  reviewer?: User;
  createdAt: string;
}

// ─── Notification ─────────────────────────────────────────
export type NotificationType =
  | 'booking_request'
  | 'booking_accepted'
  | 'booking_rejected'
  | 'ride_reminder'
  | 'chat_message'
  | 'ride_cancelled'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// ─── API Responses ────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User, UserStatus } from '../users/entities/user.entity';
import { Ride, RideStatus } from '../rides/entities/ride.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Ride) private readonly rideRepository: Repository<Ride>,
    @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
  ) {}

  async getDashboardStats() {
    const [totalUsers, totalRides, totalBookings, activeRides] = await Promise.all([
      this.userRepository.count(),
      this.rideRepository.count(),
      this.bookingRepository.count(),
      this.rideRepository.count({ where: { status: RideStatus.ACTIVE } }),
    ]);

    const completedRides = await this.rideRepository.count({ where: { status: RideStatus.COMPLETED } });
    const completionRate = totalRides > 0 ? ((completedRides / totalRides) * 100).toFixed(1) : 0;

    // Revenue (sum of completed bookings)
    const { sum: revenue } = await this.bookingRepository
      .createQueryBuilder('b')
      .select('SUM(b.totalAmount)', 'sum')
      .where('b.status = :status', { status: BookingStatus.COMPLETED })
      .getRawOne();

    // Daily rides (last 7 days)
    const dailyRides = await this.rideRepository
      .createQueryBuilder('ride')
      .select("DATE_TRUNC('day', ride.createdAt)", 'day')
      .addSelect('COUNT(*)', 'count')
      .where("ride.createdAt >= NOW() - INTERVAL '7 days'")
      .groupBy("DATE_TRUNC('day', ride.createdAt)")
      .orderBy('day', 'ASC')
      .getRawMany();

    return {
      totalUsers,
      totalRides,
      totalBookings,
      activeRides,
      completedRides,
      completionRate: `${completionRate}%`,
      revenue: parseFloat(revenue || '0'),
      dailyRides,
    };
  }

  async getUsers(page = 1, limit = 20, search?: string, status?: UserStatus) {
    const query = this.userRepository.createQueryBuilder('user');

    if (search) {
      query.where('LOWER(user.name) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (status) query.andWhere('user.status = :status', { status });

    const [users, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return { data: users, total, page, limit };
  }

  async suspendUser(userId: string, reason?: string) {
    await this.userRepository.update(userId, { status: UserStatus.SUSPENDED });
    return { message: 'User suspended successfully' };
  }

  async activateUser(userId: string) {
    await this.userRepository.update(userId, { status: UserStatus.ACTIVE });
    return { message: 'User activated successfully' };
  }

  async verifyUser(userId: string) {
    await this.userRepository.update(userId, { isVerified: true });
    return { message: 'User verified successfully' };
  }

  async getRides(page = 1, limit = 20, status?: RideStatus) {
    const where: any = {};
    if (status) where.status = status;

    const [rides, total] = await this.rideRepository.findAndCount({
      where,
      relations: ['rider', 'vehicle'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data: rides, total, page, limit };
  }

  async cancelRide(rideId: string) {
    await this.rideRepository.update(rideId, { status: RideStatus.CANCELLED });
    return { message: 'Ride cancelled by admin' };
  }

  async getBookings(page = 1, limit = 20, status?: BookingStatus) {
    const where: any = {};
    if (status) where.status = status;

    const [bookings, total] = await this.bookingRepository.findAndCount({
      where,
      relations: ['ride', 'passenger', 'ride.rider'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data: bookings, total, page, limit };
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Ride, RideStatus } from '../rides/entities/ride.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Ride)
    private readonly rideRepository: Repository<Ride>,
  ) {}

  async create(passengerId: string, dto: CreateBookingDto) {
    const ride = await this.rideRepository.findOne({
      where: { id: dto.rideId },
    });

    if (!ride) throw new NotFoundException('Ride not found');
    if (ride.status !== RideStatus.SCHEDULED) {
      throw new BadRequestException('Ride is not available for booking');
    }
    if (ride.riderId === passengerId) {
      throw new BadRequestException('Cannot book your own ride');
    }
    if (ride.availableSeats < dto.seatsBooked) {
      throw new BadRequestException('Not enough seats available');
    }

    const existing = await this.bookingRepository.findOne({
      where: { rideId: dto.rideId, passengerId, status: BookingStatus.PENDING },
    });
    if (existing) throw new ConflictException('Booking already requested');

    const booking = this.bookingRepository.create({
      ...dto,
      passengerId,
      totalAmount: ride.pricePerSeat * dto.seatsBooked,
      status: BookingStatus.PENDING,
    });

    return this.bookingRepository.save(booking);
  }

  async getMyBookings(passengerId: string) {
    return this.bookingRepository.find({
      where: { passengerId },
      relations: ['ride', 'ride.rider', 'ride.vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRideBookings(rideId: string, riderId: string) {
    const ride = await this.rideRepository.findOne({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');
    if (ride.riderId !== riderId) throw new ForbiddenException();

    return this.bookingRepository.find({
      where: { rideId },
      relations: ['passenger'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    bookingId: string,
    userId: string,
    status: BookingStatus,
    reason?: string,
  ) {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['ride'],
    });

    if (!booking) throw new NotFoundException('Booking not found');

    const isRider = booking.ride.riderId === userId;
    const isPassenger = booking.passengerId === userId;

    if (!isRider && !isPassenger) throw new ForbiddenException();

    // Rider can accept/reject; Passenger can cancel
    if (status === BookingStatus.ACCEPTED || status === BookingStatus.REJECTED) {
      if (!isRider) throw new ForbiddenException('Only rider can accept/reject');
    }
    if (status === BookingStatus.CANCELLED) {
      if (!isPassenger && !isRider) throw new ForbiddenException();
    }

    if (status === BookingStatus.ACCEPTED) {
      // Decrement available seats
      await this.rideRepository.decrement(
        { id: booking.rideId },
        'availableSeats',
        booking.seatsBooked,
      );
    }

    await this.bookingRepository.update(bookingId, {
      status,
      cancellationReason: reason,
      cancelledBy: status === BookingStatus.CANCELLED ? userId : undefined,
    });

    return this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['ride', 'passenger'],
    });
  }

  async findOne(id: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['ride', 'passenger', 'ride.rider'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }
}

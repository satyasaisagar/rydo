import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating) private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(reviewerId: string, dto: CreateRatingDto) {
    // Verify ride was completed
    const booking = await this.bookingRepository.findOne({
      where: [
        { rideId: dto.rideId, passengerId: reviewerId, status: BookingStatus.COMPLETED },
      ],
      relations: ['ride'],
    });

    if (!booking) throw new BadRequestException('Can only rate after completed rides');

    const existing = await this.ratingRepository.findOne({
      where: { reviewerId, revieweeId: dto.revieweeId, rideId: dto.rideId },
    });
    if (existing) throw new ConflictException('Already rated this user for this ride');

    const rating = this.ratingRepository.create({ ...dto, reviewerId });
    await this.ratingRepository.save(rating);

    // Update user average rating
    const { avg } = await this.ratingRepository
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.revieweeId = :id', { id: dto.revieweeId })
      .getRawOne();

    await this.userRepository.update(dto.revieweeId, {
      rating: parseFloat(avg).toFixed(2) as any,
      totalRatings: parseInt(avg),
    });

    return rating;
  }

  async getUserRatings(userId: string, page = 1, limit = 10) {
    const [ratings, total] = await this.ratingRepository.findAndCount({
      where: { revieweeId: userId },
      relations: ['reviewer', 'ride'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: ratings, total, page, limit };
  }
}

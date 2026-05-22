import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Ride, RideStatus, RideStop } from './entities/ride.entity';
import { CreateRideDto } from './dto/create-ride.dto';
import { SearchRideDto } from './dto/search-ride.dto';
import { UpdateRideDto } from './dto/update-ride.dto';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride)
    private readonly rideRepository: Repository<Ride>,
    @InjectRepository(RideStop)
    private readonly stopRepository: Repository<RideStop>,
  ) {}

  async create(riderId: string, dto: CreateRideDto) {
    const ride = this.rideRepository.create({
      ...dto,
      riderId,
    });

    const savedRide = await this.rideRepository.save(ride);

    // Save stops if any
    if (dto.stops && dto.stops.length > 0) {
      const stops = dto.stops.map((stop, idx) =>
        this.stopRepository.create({
          ...stop,
          rideId: savedRide.id,
          stopOrder: idx + 1,
        }),
      );
      await this.stopRepository.save(stops);
    }

    return this.findOne(savedRide.id);
  }

  async search(dto: SearchRideDto) {
    const query = this.rideRepository
      .createQueryBuilder('ride')
      .leftJoinAndSelect('ride.rider', 'rider')
      .leftJoinAndSelect('ride.vehicle', 'vehicle')
      .where('ride.status = :status', { status: RideStatus.SCHEDULED })
      .andWhere('ride.availableSeats >= :seats', {
        seats: dto.seats || 1,
      });

    // Date filter is optional — when provided, match exact date; otherwise show all upcoming
    if (dto.date) {
      query.andWhere('ride.rideDate = :date', { date: dto.date });
    } else {
      // Default: only show today and future rides
      query.andWhere('ride.rideDate >= :today', {
        today: new Date().toISOString().split('T')[0],
      });
    }

    // Location matching: split comma-separated terms and match any term
    // e.g. "Banjara Hills, Hyderabad" → match "Banjara Hills" OR "Hyderabad"
    if (dto.pickup) {
      const pickupTerms = dto.pickup.split(',').map(t => t.trim()).filter(Boolean);
      if (pickupTerms.length > 1) {
        query.andWhere(
          `(${pickupTerms.map((_, i) => `LOWER(ride.pickupLocation) LIKE LOWER(:pickup${i})`).join(' OR ')})`,
          Object.fromEntries(pickupTerms.map((t, i) => [`pickup${i}`, `%${t}%`]))
        );
      } else {
        query.andWhere('LOWER(ride.pickupLocation) LIKE LOWER(:pickup)', {
          pickup: `%${pickupTerms[0]}%`,
        });
      }
    }

    if (dto.drop) {
      const dropTerms = dto.drop.split(',').map(t => t.trim()).filter(Boolean);
      if (dropTerms.length > 1) {
        query.andWhere(
          `(${dropTerms.map((_, i) => `LOWER(ride.dropLocation) LIKE LOWER(:drop${i})`).join(' OR ')})`,
          Object.fromEntries(dropTerms.map((t, i) => [`drop${i}`, `%${t}%`]))
        );
      } else {
        query.andWhere('LOWER(ride.dropLocation) LIKE LOWER(:drop)', {
          drop: `%${dropTerms[0]}%`,
        });
      }
    }

    if (dto.minPrice !== undefined) {
      query.andWhere('ride.pricePerSeat >= :minPrice', {
        minPrice: dto.minPrice,
      });
    }

    if (dto.maxPrice !== undefined) {
      query.andWhere('ride.pricePerSeat <= :maxPrice', {
        maxPrice: dto.maxPrice,
      });
    }

    if (dto.womenOnly) {
      query.andWhere('ride.womenOnly = true');
    }

    query.orderBy('ride.rideTime', 'ASC');

    const [rides, total] = await query
      .skip(((dto.page || 1) - 1) * (dto.limit || 10))
      .take(dto.limit || 10)
      .getManyAndCount();

    return {
      data: rides,
      total,
      page: dto.page || 1,
      limit: dto.limit || 10,
      pages: Math.ceil(total / (dto.limit || 10)),
    };
  }

  async findOne(id: string) {
    const ride = await this.rideRepository.findOne({
      where: { id },
      relations: ['rider', 'vehicle'],
    });

    if (!ride) throw new NotFoundException('Ride not found');

    const stops = await this.stopRepository.find({
      where: { rideId: id },
      order: { stopOrder: 'ASC' },
    });

    return { ...ride, stops };
  }

  async findMyRides(riderId: string) {
    return this.rideRepository.find({
      where: { riderId },
      relations: ['vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, riderId: string, dto: UpdateRideDto) {
    const ride = await this.findOne(id);

    if (ride.riderId !== riderId) {
      throw new ForbiddenException('Not authorized to update this ride');
    }

    if (ride.status === RideStatus.COMPLETED) {
      throw new BadRequestException('Cannot update a completed ride');
    }

    await this.rideRepository.update(id, dto);
    return this.findOne(id);
  }

  async cancel(id: string, riderId: string) {
    const ride = await this.findOne(id);

    if (ride.riderId !== riderId) {
      throw new ForbiddenException('Not authorized to cancel this ride');
    }

    await this.rideRepository.update(id, { status: RideStatus.CANCELLED });
    return { message: 'Ride cancelled successfully' };
  }

  async getPopularRoutes() {
    return this.rideRepository
      .createQueryBuilder('ride')
      .select(['ride.pickupLocation', 'ride.dropLocation'])
      .addSelect('COUNT(*)', 'count')
      .where('ride.status = :status', { status: RideStatus.COMPLETED })
      .groupBy('ride.pickupLocation, ride.dropLocation')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();
  }
}

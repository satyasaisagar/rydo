import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Vehicle } from './entities/vehicle.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Vehicle) private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getPublicProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'profileImage', 'bio', 'rating', 'totalRatings', 'gender', 'isVerified', 'createdAt'],
    });
    if (!user) throw new NotFoundException('User not found');
    const vehicles = await this.vehicleRepository.find({ where: { userId, isActive: true } });
    return { ...user, vehicles };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.userRepository.update(userId, dto);
    return this.getProfile(userId);
  }

  async updatePhoto(userId: string, photoUrl: string) {
    await this.userRepository.update(userId, { profileImage: photoUrl });
    return { profileImage: photoUrl };
  }

  async addVehicle(userId: string, dto: CreateVehicleDto) {
    const vehicle = this.vehicleRepository.create({ ...dto, userId });
    return this.vehicleRepository.save(vehicle);
  }

  async getVehicles(userId: string) {
    return this.vehicleRepository.find({ where: { userId, isActive: true } });
  }

  async updateFcmToken(userId: string, fcmToken: string) {
    await this.userRepository.update(userId, { fcmToken });
    return { message: 'FCM token updated' };
  }
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../users/entities/vehicle.entity';

export enum RideStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('rides')
export class Ride {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'rider_id' })
  rider: User;

  @Column()
  riderId: string;

  @ManyToOne(() => Vehicle, { nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ nullable: true })
  vehicleId: string;

  // Pickup
  @ApiProperty()
  @Column()
  pickupLocation: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 8 })
  pickupLat: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 11, scale: 8 })
  pickupLng: number;

  // Drop
  @ApiProperty()
  @Column()
  dropLocation: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 8 })
  dropLat: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 11, scale: 8 })
  dropLng: number;

  @ApiProperty()
  @Column({ type: 'date' })
  rideDate: string;

  @ApiProperty()
  @Column({ type: 'time' })
  rideTime: string;

  @ApiProperty()
  @Column({ default: 1 })
  availableSeats: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerSeat: number;

  // Preferences
  @Column({ default: false })
  acAvailable: boolean;

  @Column({ default: false })
  musicAllowed: boolean;

  @Column({ default: false })
  petsAllowed: boolean;

  @Column({ default: false })
  smokingAllowed: boolean;

  @Column({ default: false })
  womenOnly: boolean;

  @Column({ default: false })
  luggageAllowed: boolean;

  @ApiProperty()
  @Column({ nullable: true, length: 1000 })
  description: string;

  @ApiProperty({ enum: RideStatus })
  @Column({ type: 'enum', enum: RideStatus, default: RideStatus.SCHEDULED })
  status: RideStatus;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distanceKm: number;

  @ApiProperty()
  @Column({ nullable: true })
  estimatedDurationMinutes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('ride_stops')
export class RideStop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ride)
  @JoinColumn({ name: 'ride_id' })
  ride: Ride;

  @Column()
  rideId: string;

  @Column()
  stopName: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column()
  stopOrder: number;

  @Column({ nullable: true })
  arrivalTime: string;
}

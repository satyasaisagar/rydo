import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Ride } from '../../rides/entities/ride.entity';

@Entity('ratings')
@Unique(['reviewerId', 'revieweeId', 'rideId'])
export class Rating {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @Column()
  reviewerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewee_id' })
  reviewee: User;

  @Column()
  revieweeId: string;

  @ManyToOne(() => Ride)
  @JoinColumn({ name: 'ride_id' })
  ride: Ride;

  @Column()
  rideId: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: number;

  @ApiProperty()
  @Column({ nullable: true, length: 500 })
  review: string;

  // Sub-ratings for driver
  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  drivingRating: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  safetyRating: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  punctualityRating: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  communicationRating: number;

  // Sub-ratings for passenger
  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  behaviorRating: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  cooperationRating: number;

  @CreateDateColumn()
  createdAt: Date;
}

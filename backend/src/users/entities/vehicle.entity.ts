import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export enum VehicleType {
  CAR = 'car',
  SUV = 'suv',
  BIKE = 'bike',
  VAN = 'van',
  AUTO = 'auto',
}

@Entity('vehicles')
export class Vehicle {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @ApiProperty({ enum: VehicleType })
  @Column({ type: 'enum', enum: VehicleType, default: VehicleType.CAR })
  type: VehicleType;

  @ApiProperty()
  @Column()
  brand: string;

  @ApiProperty()
  @Column()
  model: string;

  @ApiProperty()
  @Column()
  color: string;

  @ApiProperty()
  @Column({ unique: true })
  registrationNumber: string;

  @ApiProperty()
  @Column({ default: 4 })
  seatCapacity: number;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

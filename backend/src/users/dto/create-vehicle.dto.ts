import { IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VehicleType } from '../entities/vehicle.entity';
export class CreateVehicleDto {
  @ApiProperty({ enum: VehicleType }) @IsEnum(VehicleType) type: VehicleType;
  @ApiProperty() @IsString() brand: string;
  @ApiProperty() @IsString() model: string;
  @ApiProperty() @IsString() color: string;
  @ApiProperty() @IsString() registrationNumber: string;
  @ApiProperty() @IsNumber() @Min(1) @Max(10) seatCapacity: number;
}

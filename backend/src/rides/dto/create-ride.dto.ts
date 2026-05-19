import {
  IsString,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class StopDto {
  @ApiProperty() @IsString() stopName: string;
  @ApiProperty() @IsNumber() latitude: number;
  @ApiProperty() @IsNumber() longitude: number;
  @ApiPropertyOptional() @IsOptional() @IsString() arrivalTime?: string;
}

export class CreateRideDto {
  @ApiProperty() @IsString() pickupLocation: string;
  @ApiProperty() @IsNumber() pickupLat: number;
  @ApiProperty() @IsNumber() pickupLng: number;
  @ApiProperty() @IsString() dropLocation: string;
  @ApiProperty() @IsNumber() dropLat: number;
  @ApiProperty() @IsNumber() dropLng: number;
  @ApiProperty() @IsDateString() rideDate: string;
  @ApiProperty() @IsString() rideTime: string;
  @ApiProperty() @IsNumber() @Min(1) @Max(8) availableSeats: number;
  @ApiProperty() @IsNumber() @Min(0) pricePerSeat: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() vehicleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() acAvailable?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() musicAllowed?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() petsAllowed?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() smokingAllowed?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() womenOnly?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() luggageAllowed?: boolean;
  @ApiPropertyOptional({ type: [StopDto] }) @IsOptional() @IsArray() @Type(() => StopDto) stops?: StopDto[];
}

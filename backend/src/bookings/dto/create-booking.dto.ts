import { IsUUID, IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateBookingDto {
  @ApiProperty() @IsUUID() rideId: string;
  @ApiProperty({ default: 1 }) @IsNumber() @Min(1) @Max(4) seatsBooked: number;
}

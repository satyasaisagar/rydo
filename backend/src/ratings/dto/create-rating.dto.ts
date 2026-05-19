import { IsUUID, IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateRatingDto {
  @ApiProperty() @IsUUID() revieweeId: string;
  @ApiProperty() @IsUUID() rideId: string;
  @ApiProperty() @IsNumber() @Min(1) @Max(5) rating: number;
  @ApiPropertyOptional() @IsOptional() @IsString() review?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Max(5) drivingRating?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Max(5) safetyRating?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Max(5) punctualityRating?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Max(5) communicationRating?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Max(5) behaviorRating?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Max(5) cooperationRating?: number;
}

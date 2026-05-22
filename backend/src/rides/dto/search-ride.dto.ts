import { IsString, IsOptional, IsDateString, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class SearchRideDto {
  @ApiPropertyOptional() @IsOptional() @IsString() pickup?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() drop?: string;

  // date: empty string must be treated as absent
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString({}, { message: 'date must be a valid ISO date string' })
  date?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() seats?: number;

  // minPrice / maxPrice: empty string "" must be treated as absent
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
  @IsNumber()
  maxPrice?: number;

  // womenOnly: query params arrive as string "true"/"false" — transform to boolean
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  womenOnly?: boolean;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() limit?: number;
}

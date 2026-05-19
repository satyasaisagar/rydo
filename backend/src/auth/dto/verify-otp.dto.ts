import { IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty() @IsUUID() userId: string;
  @ApiProperty() @IsString() @Length(6, 6) otp: string;
}

import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a booking request' })
  create(@CurrentUser() user: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my bookings (as passenger)' })
  myBookings(@CurrentUser() user: any) {
    return this.bookingsService.getMyBookings(user.id);
  }

  @Get('ride/:rideId')
  @ApiOperation({ summary: 'Get bookings for my ride' })
  rideBookings(@Param('rideId') rideId: string, @CurrentUser() user: any) {
    return this.bookingsService.getRideBookings(rideId, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Accept, reject or cancel booking' })
  updateStatus(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateBookingStatusDto) {
    return this.bookingsService.updateStatus(id, user.id, dto.status, dto.reason);
  }
}

import { Controller, Get, Put, Delete, Param, Query, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, UserStatus } from '../users/entities/user.entity';
import { RideStatus } from '../rides/entities/ride.entity';
import { BookingStatus } from '../bookings/entities/booking.entity';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard stats' })
  dashboard() { return this.adminService.getDashboardStats(); }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  getUsers(@Query('page') page = 1, @Query('limit') limit = 20, @Query('search') search?: string, @Query('status') status?: UserStatus) {
    return this.adminService.getUsers(+page, +limit, search, status);
  }

  @Put('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend user' })
  suspendUser(@Param('id') id: string) { return this.adminService.suspendUser(id); }

  @Put('users/:id/activate')
  @ApiOperation({ summary: 'Activate user' })
  activateUser(@Param('id') id: string) { return this.adminService.activateUser(id); }

  @Put('users/:id/verify')
  @ApiOperation({ summary: 'Verify user' })
  verifyUser(@Param('id') id: string) { return this.adminService.verifyUser(id); }

  @Get('rides')
  @ApiOperation({ summary: 'Get all rides' })
  getRides(@Query('page') page = 1, @Query('limit') limit = 20, @Query('status') status?: RideStatus) {
    return this.adminService.getRides(+page, +limit, status);
  }

  @Put('rides/:id/cancel')
  @ApiOperation({ summary: 'Cancel ride' })
  cancelRide(@Param('id') id: string) { return this.adminService.cancelRide(id); }

  @Get('bookings')
  @ApiOperation({ summary: 'Get all bookings' })
  getBookings(@Query('page') page = 1, @Query('limit') limit = 20, @Query('status') status?: BookingStatus) {
    return this.adminService.getBookings(+page, +limit, status);
  }
}

import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RidesService } from './rides.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideDto } from './dto/update-ride.dto';
import { SearchRideDto } from './dto/search-ride.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Rides')
@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create (offer) a new ride' })
  create(@CurrentUser() user: any, @Body() dto: CreateRideDto) {
    return this.ridesService.create(user.id, dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search rides' })
  search(@Query() dto: SearchRideDto) {
    return this.ridesService.search(dto);
  }

  @Get('popular-routes')
  @ApiOperation({ summary: 'Get popular routes' })
  popularRoutes() {
    return this.ridesService.getPopularRoutes();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my offered rides' })
  myRides(@CurrentUser() user: any) {
    return this.ridesService.findMyRides(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ride details' })
  findOne(@Param('id') id: string) {
    return this.ridesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update ride' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateRideDto) {
    return this.ridesService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel ride' })
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ridesService.cancel(id, user.id);
  }
}

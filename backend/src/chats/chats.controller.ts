import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Chats')
@Controller('chats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get(':rideId')
  @ApiOperation({ summary: 'Get chat messages for a ride' })
  getMessages(@Param('rideId') rideId: string, @CurrentUser() user: any, @Query('page') page = 1, @Query('limit') limit = 50) {
    return this.chatsService.getMessages(rideId, user.id, +page, +limit);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread messages count' })
  unreadCount(@CurrentUser() user: any) {
    return this.chatsService.getUnreadCount(user.id);
  }
}

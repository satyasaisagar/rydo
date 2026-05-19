import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat, MessageType } from './entities/chat.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async saveMessage(data: {
    rideId: string;
    senderId: string;
    receiverId: string;
    message: string;
    messageType?: string;
  }) {
    // Verify booking exists and is accepted
    const booking = await this.bookingRepository.findOne({
      where: [
        { rideId: data.rideId, passengerId: data.senderId, status: BookingStatus.ACCEPTED },
        { rideId: data.rideId, passengerId: data.receiverId, status: BookingStatus.ACCEPTED },
      ],
    });

    if (!booking) {
      throw new ForbiddenException('Chat not allowed. Booking must be accepted first.');
    }

    const chat = this.chatRepository.create({
      rideId: data.rideId,
      senderId: data.senderId,
      receiverId: data.receiverId,
      message: data.message,
      messageType: (data.messageType as MessageType) || MessageType.TEXT,
    });

    const saved = await this.chatRepository.save(chat);
    return this.chatRepository.findOne({
      where: { id: saved.id },
      relations: ['sender', 'receiver'],
    });
  }

  async getMessages(rideId: string, userId: string, page = 1, limit = 50) {
    // Verify access
    const booking = await this.bookingRepository.findOne({
      where: [
        { rideId, passengerId: userId, status: BookingStatus.ACCEPTED },
      ],
      relations: ['ride'],
    });

    const [messages, total] = await this.chatRepository.findAndCount({
      where: { rideId },
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: messages.reverse(),
      total,
      page,
      limit,
    };
  }

  async markMessagesRead(messageIds: string[], userId: string) {
    await this.chatRepository
      .createQueryBuilder()
      .update(Chat)
      .set({ isRead: true, readAt: new Date() })
      .where('id IN (:...ids)', { ids: messageIds })
      .andWhere('receiverId = :userId', { userId })
      .execute();
  }

  async getUnreadCount(userId: string) {
    return this.chatRepository.count({
      where: { receiverId: userId, isRead: false },
    });
  }
}

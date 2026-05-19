import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>) {}

  async create(userId: string, type: NotificationType, title: string, message: string, data?: any) {
    const notification = this.notificationRepository.create({ userId, type, title, message, data });
    return this.notificationRepository.save(notification);
  }

  async getMyNotifications(userId: string, page = 1, limit = 20) {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: notifications, total, page, limit };
  }

  async markRead(notificationId: string, userId: string) {
    await this.notificationRepository.update({ id: notificationId, userId }, { isRead: true, readAt: new Date() });
    return { message: 'Marked as read' };
  }

  async markAllRead(userId: string) {
    await this.notificationRepository.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
    return { message: 'All notifications marked as read' };
  }
}

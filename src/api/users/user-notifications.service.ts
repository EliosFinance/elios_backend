import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotifications } from './entities/user-notifications.entity';
@Injectable()
export class UserNotificationsService {
    constructor(
        @InjectRepository(UserNotifications)
        private readonly userNotificationsRepository: Repository<UserNotifications>,
    ) {}

    async findOne(userId: number): Promise<UserNotifications> {
        const notifications = await this.userNotificationsRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!notifications) {
            throw new NotFoundException('Notifications not found for this user');
        }

        return notifications;
    }

    async update(userId: number, updateData: Partial<UserNotifications>): Promise<UserNotifications> {
        const notifications = await this.findOne(userId);
        Object.assign(notifications, updateData);
        return this.userNotificationsRepository.save(notifications);
    }

    async triggerNotification(userId: number, type: keyof UserNotifications): Promise<string> {
        const notifications = await this.findOne(userId);

        if (notifications[type]) {
            return `Notification ${type} triggered for user ${userId}`;
        } else {
            return `User has disabled notifications for ${type}`;
        }
    }
}

import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UpdateUserNotificationsDto } from './dto/update-user-notifications.dto';
import { UserNotifications } from './entities/user-notifications.entity';
import { UserNotificationsService } from './user-notifications.service';

@Controller('users/:userId/notifications')
export class UserNotificationsController {
    constructor(private readonly userNotificationsService: UserNotificationsService) {}

    @Get()
    async getUserNotifications(@Param('userId') userId: number): Promise<UserNotifications> {
        return this.userNotificationsService.findOne(userId);
    }

    @Patch()
    async updateUserNotifications(
        @Param('userId') userId: number,
        @Body() updateData: UpdateUserNotificationsDto, // 🔹 Utilisation du DTO ici
    ): Promise<UserNotifications> {
        return this.userNotificationsService.update(userId, updateData);
    }

    @Post('trigger/:type')
    async triggerNotification(@Param('userId') userId: number, @Param('type') type: string): Promise<string> {
        return this.userNotificationsService.triggerNotification(userId, type as keyof UserNotifications);
    }
}

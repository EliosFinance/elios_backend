import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UpdateUserNotificationsDto } from './dto/update-user-notifications.dto';
import { UserNotifications } from './entities/user-notifications.entity';
import { UserNotificationsService } from './user-notifications.service';
import { User } from './user.decorator';

@Controller('users/notifications')
export class UserNotificationsController {
    constructor(private readonly userNotificationsService: UserNotificationsService) {}

    @Get()
    async getUserNotifications(@User() user: any): Promise<UserNotifications> {
        const userId = user.userId;
        return this.userNotificationsService.findOne(userId);
    }

    @Patch()
    async updateUserNotifications(
        @User() user: any,
        @Body() updateData: UpdateUserNotificationsDto,
    ): Promise<UserNotifications> {
        const userId = user.userId;
        return this.userNotificationsService.update(userId, updateData);
    }

    @Post('trigger/:type')
    async triggerNotification(@User() user: any, @Param('type') type: string): Promise<string> {
        const userId = user.userId;
        return this.userNotificationsService.triggerNotification(userId, type as keyof UserNotifications);
    }
}

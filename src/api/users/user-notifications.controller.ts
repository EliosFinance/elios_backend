import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserFromRequest } from '@src/helpers/jwt/user.decorator';
import { UpdateUserNotificationsDto } from './dto/update-user-notifications.dto';
import { UserNotifications } from './entities/user-notifications.entity';
import { UserNotificationsService } from './user-notifications.service';

@Controller('users/notifications')
export class UserNotificationsController {
    constructor(private readonly userNotificationsService: UserNotificationsService) {}

    @Get()
    async getUserNotifications(@UserFromRequest() user: any): Promise<UserNotifications> {
        const userId = user.userId;
        return this.userNotificationsService.findOne(userId);
    }

    @Patch()
    async updateUserNotifications(
        @UserFromRequest() user: any,
        @Body() updateData: UpdateUserNotificationsDto,
    ): Promise<UserNotifications> {
        const userId = user.userId;
        return this.userNotificationsService.update(userId, updateData);
    }

    @Post('trigger/:type')
    async triggerNotification(@UserFromRequest() user: any, @Param('type') type: string): Promise<string> {
        const userId = user.userId;
        return this.userNotificationsService.triggerNotification(userId, type as keyof UserNotifications);
    }
}

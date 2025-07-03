import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserFromRequest } from '@src/helpers/jwt/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserNotificationsDto } from './dto/update-user-notifications.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserNotifications } from './entities/user-notifications.entity';
import { UserNotificationsService } from './user-notifications.service';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly userNotificationsService: UserNotificationsService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get('notifications')
    async getUserNotifications(@UserFromRequest() user: any): Promise<UserNotifications> {
        if (!user || !user.id) {
            throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
        }
        const userId = user.id;

        return this.userNotificationsService.findOne(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Patch('notifications')
    async updateUserNotifications(
        @UserFromRequest() user: any,
        @Body() updateData: UpdateUserNotificationsDto,
    ): Promise<UserNotifications> {
        if (!user || !user.id) {
            throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
        }
        const userId = user.id;
        return this.userNotificationsService.update(userId, updateData);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.updateUser(+id, updateUserDto);
    }

    @Post('notifications/trigger/:type')
    async triggerNotification(@UserFromRequest() user: any, @Param('type') type: string): Promise<string> {
        const userId = user.id;
        return this.userNotificationsService.triggerNotification(userId, type as keyof UserNotifications);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}

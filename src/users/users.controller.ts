import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserNotificationsDto } from './dto/update-user-notifications.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.updateUser(+id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/notifications')
    updateNotifications(@Param('id') id: string, @Body() updateUserNotificationsDto: UpdateUserNotificationsDto) {
        return this.usersService.updateUserNotifications(+id, updateUserNotificationsDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/notifications/trigger')
    triggerNotification(@Param('id') id: string, @Body('type') type: string) {
        return this.usersService.triggerNotification(+id, type);
    }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserNotifications } from './entities/user-notifications.entity';
import { User } from './entities/user.entity';
import { UserNotificationsController } from './user-notifications.controller';
import { UserNotificationsService } from './user-notifications.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, UserNotifications])],
    controllers: [UsersController, UserNotificationsController],
    providers: [UsersService, UserNotificationsService],
    exports: [UsersService, UserNotificationsService, TypeOrmModule],
})
export class UsersModule {}

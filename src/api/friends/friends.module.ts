import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../api/users/entities/user.entity';
import { Friends } from './entities/friends.entity';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
    imports: [TypeOrmModule.forFeature([Friends, User])],
    providers: [FriendsService],
    controllers: [FriendsController],
})
export class FriendsModule {}

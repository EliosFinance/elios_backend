import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserToChallenge } from '@src/api/challenges/entities/usertochallenge.entity';
import { QuizzFinisher } from '../../api/quizz/entities/quizz-finisher';
import { User } from '../../api/users/entities/user.entity';
import { Friend } from './entities/friend.entity';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
    imports: [TypeOrmModule.forFeature([Friend, User, QuizzFinisher, UserToChallenge])],
    providers: [FriendsService],
    controllers: [FriendsController],
})
export class FriendsModule {}

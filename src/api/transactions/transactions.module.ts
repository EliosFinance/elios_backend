import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/entities/article.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Transaction } from './entities/transaction.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Transaction]),
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([Article]),
        HttpModule,
    ],
    controllers: [TransactionsController],
    providers: [TransactionsService, UsersService],
})
export class TransactionsModule {}

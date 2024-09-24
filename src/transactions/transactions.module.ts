import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Transaction]), TypeOrmModule.forFeature([User])],
    controllers: [TransactionsController],
    providers: [TransactionsService, UsersService],
})
export class TransactionsModule {}

import { Module } from '@nestjs/common';
import { PowensService } from './powens.service';
import { PowensController } from './powens.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionsService } from '../transactions/transactions.service';

@Module({
    imports: [HttpModule, TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Transaction])],
    controllers: [PowensController],
    providers: [PowensService, UsersService, TransactionsService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class PowensModule {}

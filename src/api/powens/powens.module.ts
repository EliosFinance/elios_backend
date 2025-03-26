import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StateService } from '../../state.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { Connector } from './entities/connector.entity';
import { PowensController } from './powens.controller';
import { PowensService } from './powens.service';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([User]),
        UsersModule,
        TypeOrmModule.forFeature([Transaction, Connector]),
    ],
    controllers: [PowensController],
    providers: [
        PowensService,
        UsersService,
        StateService,
        TransactionsService,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
    ],
})
export class PowensModule {}

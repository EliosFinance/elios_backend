import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Challenge } from '../challenges/entities/challenge.entity';
import { EnterprisesController } from './enterprises.controller';
import { EnterprisesService } from './enterprises.service';
import { Enterprise } from './entities/enterprise.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Enterprise, Challenge])],
    controllers: [EnterprisesController],
    providers: [
        EnterprisesService,
        //{ provide: APP_GUARD, useClass: JwtAuthGuard }
    ],
})
export class EnterprisesModule {}

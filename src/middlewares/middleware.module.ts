import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLogsModule } from '../api/request-logs/request-logs.module';
import { User } from '../api/users/entities/user.entity';
import { RequestLoggerMiddleware } from './request-logger.middleware';

@Module({
    imports: [TypeOrmModule.forFeature([User]), RequestLogsModule],
    providers: [RequestLoggerMiddleware],
    exports: [RequestLoggerMiddleware],
})
export class MiddlewareModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { RequestLog } from './entities/request-log.entity';
import { RequestLogsService } from './services/request-logs.service';

@Module({
    imports: [TypeOrmModule.forFeature([RequestLog, User])],
    // controllers: [RequestLogsController],
    providers: [RequestLogsService],
    exports: [RequestLogsService],
})
export class RequestLogsModule {}

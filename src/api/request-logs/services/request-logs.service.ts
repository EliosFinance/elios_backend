import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestLog } from '../entities/request-log.entity';

@Injectable()
export class RequestLogsService {
    private readonly logger = new Logger(RequestLogsService.name);

    constructor(@InjectRepository(RequestLog) private requestLogRepository: Repository<RequestLog>) {}

    async createLog(logData: Partial<RequestLog>): Promise<RequestLog> {
        try {
            const log = this.requestLogRepository.create(logData);
            return await this.requestLogRepository.save(log);
        } catch (error) {
            this.logger.error(`Failed to save request log: ${error.message}`, error.stack);
            return null;
        }
    }

    async findAll(limit = 100, offset = 0): Promise<RequestLog[]> {
        return this.requestLogRepository.find({
            take: limit,
            skip: offset,
            relations: ['user'],
            order: { timestamp: 'DESC' },
        });
    }

    async findByUserId(userId: number, limit = 100, offset = 0): Promise<RequestLog[]> {
        return this.requestLogRepository.find({
            where: { userId },
            take: limit,
            skip: offset,
            order: { timestamp: 'DESC' },
        });
    }
}

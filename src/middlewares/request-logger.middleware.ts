import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NextFunction, Request, Response } from 'express';
import { Repository } from 'typeorm';
import { RequestLogsService } from '../api/request-logs/services/request-logs.service';
import { User } from '../api/users/entities/user.entity';
import { extractJwt } from '../helpers/extractJwt';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger(RequestLoggerMiddleware.name);

    constructor(
        private readonly requestLogsService: RequestLogsService,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const startTime = Date.now();
        const originalUrl = req.originalUrl;

        if (originalUrl.includes('/health') || originalUrl.includes('/metrics')) {
            return next();
        }

        res.on('finish', async () => {
            const responseTime = Date.now() - startTime;

            try {
                const safeHeaders = { ...req.headers };
                delete safeHeaders.authorization;
                delete safeHeaders.cookie;

                let userId = null;
                let user = null;

                const authHeader = req.headers.authorization;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    try {
                        const decoded = extractJwt(authHeader);
                        if (decoded && decoded.sub) {
                            userId = Number(decoded.sub);
                            user = await this.userRepository.findOne({ where: { id: userId } });
                        }
                    } catch (error) {
                        this.logger.error(`Failed to extract user from JWT: ${error.message}`);
                    }
                }

                await this.requestLogsService.createLog({
                    method: req.method,
                    url: originalUrl,
                    ip: req.ip || req.socket.remoteAddress,
                    userAgent: req.headers['user-agent'] as string,
                    statusCode: res.statusCode,
                    responseTime,
                    userId,
                    user,
                    requestBody: this.sanitizeRequestBody(req.body),
                    requestQuery: req.query,
                    requestHeaders: safeHeaders,
                });
            } catch (error) {
                this.logger.error(`Error logging request: ${error.message}`, error.stack);
            }
        });

        next();
    }

    private sanitizeRequestBody(body: any): any {
        if (!body) return null;

        const sanitized = { ...body };

        if (sanitized.password) sanitized.password = '[REDACTED]';
        if (sanitized.passwordConfirmation) sanitized.passwordConfirmation = '[REDACTED]';
        if (sanitized.token) sanitized.token = '[REDACTED]';
        if (sanitized.refresh_token) sanitized.refresh_token = '[REDACTED]';

        return sanitized;
    }
}

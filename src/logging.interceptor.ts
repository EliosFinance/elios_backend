import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        if (context.getType() === 'http') {
            return this.logHttpCall(context, next);
        }
        return null;
    }

    private logHttpCall(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const { method, path: url } = request;

        const now = Date.now();
        return next.handle().pipe(
            tap(() => {
                const response = context.switchToHttp().getResponse();
                const { statusCode } = response;

                this.logger.verbose(`[${method}] ${url} ${statusCode}: ${Date.now() - now}ms`);
            }),
        );
    }
}

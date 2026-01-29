import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogMetadata, REFLECTOR_AUDIT_LOG_KEY } from './audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    constructor(
        private reflector: Reflector,
        private eventEmitter: EventEmitter2
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        console.log('AuditLogInterceptor: Intercepting...'); // Debug log
        return next.handle().pipe(
            tap((data) => {
                const metadata = this.reflector.get<AuditLogMetadata>(
                    REFLECTOR_AUDIT_LOG_KEY,
                    context.getHandler()
                );
                console.log('AuditLogInterceptor: Metadata retrieved:', metadata); // Debug log

                if (metadata) {
                    const request = context.switchToHttp().getRequest();
                    const user = request.user;
                    console.log('AuditLogInterceptor: User found:', user); // Debug log

                    const performedBy = user?.email || user?.userId || 'Unknown';
                    const ipAddress = request.ip;
                    const userAgent = request.headers['user-agent'];

                    let details = `${metadata.action} on ${metadata.module}`;

                    // Simple logic to extract ID from request body if available and relevant
                    if (request.body && request.body.id) {
                        details += ` (ID: ${request.body.id})`;
                    } else if (request.body && request.body.name) {
                        details += ` (Name: ${request.body.name})`;
                    }

                    const requestPayload = {
                        ...(request.body && Object.keys(request.body).length > 0 ? { body: request.body } : {}),
                        ...(request.query && Object.keys(request.query).length > 0 ? { query: request.query } : {}),
                        ...(request.params && Object.keys(request.params).length > 0 ? { params: request.params } : {}),
                    };

                    this.eventEmitter.emit('audit.log', {
                        action: metadata.action,
                        module: metadata.module,
                        performedBy,
                        details,
                        ipAddress,
                        userAgent,
                        requestPayload,
                        timestamp: new Date(),
                    });
                }
            })
        );
    }
}

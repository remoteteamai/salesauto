import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoggerService } from '../utils/logger.service';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private readonly logger: LoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      map((data) => {
        const responseTime = Date.now() - now;

        // Log API response
        this.logger.debug(
          `${method} ${url} - ${responseTime}ms`,
          'API Response'
        );

        // Handle paginated responses
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return {
            success: true,
            data: data.data,
            meta: data.meta,
            timestamp: new Date().toISOString(),
          };
        }

        // Handle standard responses
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
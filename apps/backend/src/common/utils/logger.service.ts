import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor(context?: string) {
    const logLevel = process.env.LOG_LEVEL || 'info';
    
    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'melioro-api' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, context, timestamp, ...meta }) => {
              const metaStr = Object.keys(meta).length > 1 
                ? ` ${JSON.stringify(meta)}` 
                : '';
              return `${timestamp} [${context || 'App'}] ${level}: ${message}${metaStr}`;
            })
          ),
        }),
      ],
    });

    // Add file transport in production
    if (process.env.NODE_ENV === 'production') {
      this.logger.add(
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        })
      );
      this.logger.add(
        new winston.transports.File({ 
          filename: 'logs/combined.log',
          maxsize: 5242880,
          maxFiles: 5,
        })
      );
    }
  }

  setContext(context: string) {
    this.context = context;
    return this;
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context: context || this.context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context: context || this.context });
  }

  // Structured logging for metrics
  metric(name: string, value: number, tags?: Record<string, string>) {
    this.logger.info(`[METRIC] ${name}: ${value}`, { tags });
  }

  // Audit logging
  audit(action: string, userId: string, details: Record<string, any>) {
    this.logger.info(`[AUDIT] ${action}`, { userId, ...details });
  }
}
import { Injectable, LoggerService as NestLoggerService, Optional } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  log(message: string, context?: string) {
    console.log(`[${context || 'App'}] ${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    console.error(`[${context || 'App'}] ERROR: ${message}`, trace);
  }

  warn(message: string, context?: string) {
    console.warn(`[${context || 'App'}] WARN: ${message}`);
  }

  debug(message: string, context?: string) {
    console.debug(`[${context || 'App'}] DEBUG: ${message}`);
  }

  verbose(message: string, context?: string) {
    console.log(`[${context || 'App'}] VERBOSE: ${message}`);
  }

  metric(name: string, value: number, tags?: Record<string, string>) {
    console.log(`[METRIC] ${name}: ${value}`, tags);
  }

  audit(action: string, userId: string, details: Record<string, any>) {
    console.log(`[AUDIT] ${action}`, { userId, ...details });
  }
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggerService } from './common/utils/logger.service';

async function bootstrap() {
  const logger = new LoggerService('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const loggerService = app.get(LoggerService);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter(loggerService));
  app.useGlobalInterceptors(new TransformInterceptor(loggerService));

  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  app.setGlobalPrefix('api');

  // Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Melioro AI API')
    .setDescription('AI-native revenue workforce platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('organizations', 'Organization management')
    .addTag('teams', 'Team management')
    .addTag('prospects', 'Prospect management')
    .addTag('companies', 'Company management')
    .addTag('contacts', 'Contact management')
    .addTag('campaigns', 'Campaign management')
    .addTag('sequences', 'Sequence management')
    .addTag('billing', 'Billing and subscriptions')
    .addTag('analytics', 'Analytics and reporting')
    .addTag('ai-sdr', 'AI SDR functionality')
    .addTag('admin', 'Admin operations')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get('PORT', 4000);
  await app.listen(port);
  
  logger.log(`🚀 Melioro AI API running on port ${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
import {
  INestApplication,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder } from '@nestjs/swagger';

export function configureApp(
  app: INestApplication,
  config: ConfigService,
): void {
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  const origins = config
    .getOrThrow<string>('CORS_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({ origin: origins });
}

export function createSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Chore Tracker API')
    .setDescription('REST API for parent-managed chores.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
}

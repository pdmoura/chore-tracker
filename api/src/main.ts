import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp, createSwaggerConfig } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  configureApp(app, config);
  const document = SwaggerModule.createDocument(app, createSwaggerConfig());
  SwaggerModule.setup('docs', app, document);

  await app.listen(config.getOrThrow<number>('PORT'));
}

void bootstrap();

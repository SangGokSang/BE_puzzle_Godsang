import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = 3000;
  app.enableCors();
  app.use(cookieParser());
  await app.listen(port);
  Logger.log(`application listening on port ${port}`);
}

bootstrap();

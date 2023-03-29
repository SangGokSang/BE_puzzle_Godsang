import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = 3000;
  app.enableCors({
    origin: ['http://localhost:3000', 'https://dearmy2023.click'],
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(port);
  Logger.log(`application listening on port ${port}`);
}

bootstrap();

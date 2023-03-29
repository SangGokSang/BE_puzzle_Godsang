import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PuzzleModule } from './puzzle/puzzle.module';
import * as Joi from 'joi';
import { User } from './auth/entity/user.entity';
import { Puzzle } from './puzzle/entity/puzzle.entity';
import { Message } from './puzzle/entity/message.entity';
import { UserModule } from './user/user.module';
import { APP_FILTER } from '@nestjs/core';
import { CustomExceptionFilter } from './exception/custom.exception-filter';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_CALLBACK_URL: Joi.string().required(),
        KAKAO_CLIENT_ID: Joi.string().required(),
        KAKAO_CALLBACK_URL: Joi.string().required(),
        NAVER_CLIENT_ID: Joi.string().required(),
        NAVER_CALLBACK_URL: Joi.string().required(),
        FACEBOOK_CLIENT_ID: Joi.string().required(),
        FACEBOOK_CLIENT_SECRET: Joi.string().required(),
        FACEBOOK_CALLBACK_URL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get('DB_HOST'),
        port: 3306,
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: 'dm2023',
        entities: [User, Puzzle, Message],
        synchronize: true,
        logging: true,
      }),
    }),
    AuthModule,
    PuzzleModule,
    UserModule,
    HealthModule,
  ],
  controllers: [],
  providers: [{ provide: APP_FILTER, useClass: CustomExceptionFilter }],
})
export class AppModule {}

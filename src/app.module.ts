import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import * as process from 'process';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PuzzleModule } from './puzzle/puzzle.module';
import { MessageModule } from './message/message.module';
import * as Joi from 'joi';
import { User } from './auth/entity/user.entity';
import { Puzzle } from './puzzle/entity/puzzle.entity';
import { Message } from './message/entity/message.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev').required(),
        SERVER_PORT: Joi.string().required().default(8080),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_SCHEMA: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_CALLBACK_URL: Joi.string().required(),
        KAKAO_CLIENT_ID: Joi.string().required(),
        KAKAO_CALLBACK_URL: Joi.string().required(),
        NAVER_CLIENT_ID: Joi.string().required(),
        NAVER_CALLBACK_URL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_SCHEMA'),
        entities: [User, Puzzle, Message],
        synchronize: true,
      }),
    }),
    AuthModule,
    PuzzleModule,
    MessageModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

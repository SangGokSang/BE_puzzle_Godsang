import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { TypeORMExceptionFilter } from './exception/typeORM.exception-filter';

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
        charset: 'utf8mb4',
        entities: [User, Puzzle, Message],
        synchronize: true,
      }),
    }),
    PuzzleModule,
    UserModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: CustomExceptionFilter },
    {
      provide: APP_FILTER,
      useClass: TypeORMExceptionFilter,
    },
  ],
})
export class AppModule {}

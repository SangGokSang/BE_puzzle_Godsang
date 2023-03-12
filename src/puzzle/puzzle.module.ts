import { Module } from '@nestjs/common';
import { PuzzleController } from './puzzle.controller';
import { PuzzleService } from './puzzle.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Puzzle } from './entity/puzzle.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../auth/entity/user.entity';
import { Message } from './entity/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Puzzle, User, Message]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [PuzzleController],
  providers: [PuzzleService],
})
export class PuzzleModule {}

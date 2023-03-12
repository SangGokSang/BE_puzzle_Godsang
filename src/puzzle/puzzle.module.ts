import { Module } from '@nestjs/common';
import { PuzzleController } from './puzzle.controller';
import { PuzzleService } from './puzzle.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Puzzle } from './entity/puzzle.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Puzzle])],
  controllers: [PuzzleController],
  providers: [PuzzleService, JwtService],
})
export class PuzzleModule {}

import { Injectable } from '@nestjs/common';
import { PuzzleCreateDto } from './dto/puzzle-create.dto';
import { Repository } from 'typeorm';
import { Puzzle } from './entity/puzzle.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entity/user.entity';
import { PuzzleDto } from './dto/puzzle.dto';

@Injectable()
export class PuzzleService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Puzzle)
    private puzzleRepository: Repository<Puzzle>,
  ) {}

  async createPuzzle(userId: number, puzzleCreateDto: PuzzleCreateDto) {
    const { category, title } = puzzleCreateDto;
    await this.puzzleRepository
      .create({ user: { id: userId }, category, title })
      .save();
  }

  async getPuzzles(userId: number): Promise<PuzzleDto[]> {
    const puzzles = await this.puzzleRepository.findBy({
      user: { id: userId },
    });
    return puzzles.map((puzzle) => puzzle.toDto());
  }
}

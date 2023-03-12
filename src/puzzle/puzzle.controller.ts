import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { PuzzleService } from './puzzle.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { PuzzleCreateDto } from './dto/puzzle-create.dto';
import { GetUserId } from '../auth/decorator/get-user-id.decorator';
import { PuzzleDto } from './dto/puzzle.dto';

@Controller('/api/puzzle')
export class PuzzleController {
  constructor(private puzzleService: PuzzleService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPuzzle(
    @GetUserId() userId: number,
    @Body(ValidationPipe) puzzleCreateDto: PuzzleCreateDto,
  ): Promise<void> {
    await this.puzzleService.createPuzzle(userId, puzzleCreateDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getPuzzles(@GetUserId() userId: number): Promise<PuzzleDto[]> {
    return await this.puzzleService.getPuzzles(userId);
  }
}

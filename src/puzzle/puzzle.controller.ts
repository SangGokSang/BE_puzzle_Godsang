import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { PuzzleService } from './puzzle.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { PuzzleCreateDto } from './dto/puzzle-create.dto';
import { GetUserId } from '../auth/decorator/get-user-id.decorator';
import { PuzzleDto } from './dto/puzzle.dto';
import { MessageCreateDto } from './dto/message-create.dto';
import { JwtPassGuard } from '../auth/guard/jwt-pass.guard';

@Controller('/api/puzzles')
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
  @UseGuards(JwtPassGuard)
  async getPuzzles(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<PuzzleDto[]> {
    return await this.puzzleService.getPuzzles(userId);
  }

  @Delete(':puzzleId')
  @UseGuards(JwtAuthGuard)
  async deletePuzzles(
    @GetUserId() userId: number,
    @Param('puzzleId', ParseIntPipe) puzzleId: number,
  ): Promise<void> {
    return await this.puzzleService.deletePuzzle(userId, puzzleId);
  }

  @Post(':puzzleId')
  @UseGuards(JwtPassGuard)
  async createMessage(
    @GetUserId() userId: number,
    @Param('puzzleId', ParseIntPipe)
    puzzleId: number,
    @Body(ValidationPipe) messageCreateDto: MessageCreateDto,
  ) {
    await this.puzzleService.createMessage(userId, puzzleId, messageCreateDto);
  }

  @Patch(':puzzleId/messages/:messageId')
  @UseGuards(JwtAuthGuard)
  async readMessage(
    @GetUserId() userId: number,
    @Param('puzzleId', ParseIntPipe) puzzleId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    await this.puzzleService.readMessage(userId, puzzleId, messageId);
  }
}

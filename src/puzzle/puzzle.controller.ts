import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { PuzzleService } from './puzzle.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { PuzzleCreateDto } from './dto/puzzle-create.dto';
import { GetUserId } from '../auth/decorator/get-user-id.decorator';
import { PuzzleDto } from './dto/puzzle.dto';
import { MessageCreateDto } from './dto/message-create.dto';
import { GetUserNickname } from '../auth/decorator/get-user-nickname.decorator';

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
  @UseGuards(JwtAuthGuard)
  async getPuzzles(@GetUserId() userId: number): Promise<PuzzleDto[]> {
    return await this.puzzleService.getPuzzles(userId);
  }

  @Post(':puzzleId')
  @UseGuards(JwtAuthGuard)
  async createMessage(
    @GetUserId() userId: number,
    @GetUserNickname() userNickname: string,
    @Param('puzzleId', ParseIntPipe)
    puzzleId: number,
    @Body(ValidationPipe) messageCreateDto: MessageCreateDto,
  ) {
    await this.puzzleService.createMessage(
      userId,
      userNickname,
      puzzleId,
      messageCreateDto,
    );
  }

  @Patch(':puzzleId/message/:messageId')
  @UseGuards(JwtAuthGuard)
  async readMessage(
    @GetUserId() userId: number,
    @Param('puzzleId', ParseIntPipe) puzzleId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    await this.puzzleService.readMessage(userId, puzzleId, messageId);
  }
}

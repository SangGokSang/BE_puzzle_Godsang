import { HttpStatus, Injectable } from '@nestjs/common';
import { PuzzleCreateDto } from './dto/puzzle-create.dto';
import { Repository } from 'typeorm';
import { Puzzle } from './entity/puzzle.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entity/user.entity';
import { PuzzleDto } from './dto/puzzle.dto';
import { MessageCreateDto } from './dto/message-create.dto';
import { CustomException, ExceptionCode } from '../exception/custom.exception';
import { Message } from './entity/message.entity';

@Injectable()
export class PuzzleService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Puzzle)
    private puzzleRepository: Repository<Puzzle>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async checkExistUser(userId): Promise<void> {
    const exist = await this.userRepository.exist({
      where: { id: userId },
    });
    if (!exist) {
      throw new CustomException(
        ExceptionCode.INVALID_USER,
        '존재하지 않는 userId 입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getPuzzles(userId: number): Promise<PuzzleDto[]> {
    await this.checkExistUser(userId);
    const puzzles = await this.puzzleRepository.find({
      where: { user: { id: userId } },
      order: { createAt: 'DESC' },
    });
    return puzzles.map((puzzle) => puzzle.toDto());
  }

  async createPuzzle(
    userId: number,
    puzzleCreateDto: PuzzleCreateDto,
  ): Promise<PuzzleDto[]> {
    const puzzleCount = await this.puzzleRepository.countBy({
      user: { id: userId },
    });
    if (puzzleCount >= 10) {
      throw new CustomException(
        ExceptionCode.PUZZLE_FULL,
        `퍼즐이 이미 10개 이상 입니다.`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const { category, title } = puzzleCreateDto;
    await this.puzzleRepository
      .create({ user: { id: userId }, category, title })
      .save();
    return await this.getPuzzles(userId);
  }

  async deletePuzzle(userId: number, puzzleId: number): Promise<PuzzleDto[]> {
    const puzzle = await this.puzzleRepository.findOneOrFail({
      where: { id: puzzleId, user: { id: userId } },
    });
    await puzzle.remove();
    return await this.getPuzzles(userId);
  }

  async createMessage(
    userId: number | null,
    puzzleId: number,
    messageCreateDto: MessageCreateDto,
  ): Promise<PuzzleDto[]> {
    const puzzle: Puzzle = await this.puzzleRepository.findOneOrFail({
      where: { id: puzzleId },
    });

    if (puzzle.messages.length >= 9) {
      throw new CustomException(
        ExceptionCode.MESSAGE_FULL,
        '이미 9개의 메세지가 존재합니다',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.userRepository.manager.transaction(async (manager) => {
      if (userId) {
        await manager
          .createQueryBuilder()
          .update(User)
          .set({
            keyCount: () => 'keyCount + 1',
          })
          .where('id = :id', { id: userId })
          .execute();
      }
      const displayOrder = this.createDisplayOrder(puzzle.messages);

      await manager
        .create(Message, {
          puzzle: { id: puzzleId },
          from: messageCreateDto.from,
          to: messageCreateDto.to,
          displayOrder,
          content: messageCreateDto.content,
          isOpened: false,
        })
        .save();
    });

    return await this.getPuzzles(puzzle.user.id);
  }

  async readMessage(
    userId: number,
    puzzleId: number,
    messageId: number,
  ): Promise<{ keyCount: number; list: PuzzleDto[] }> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });

    if (user.keyCount === 0) {
      throw new CustomException(
        ExceptionCode.NO_KEY,
        '사용할 수 있는 열쇠가 없습니다',
        HttpStatus.BAD_REQUEST,
      );
    }
    const keyCount = user.keyCount - 1;
    await this.userRepository.manager.transaction(async (manager) => {
      await manager.update(User, userId, { keyCount });
      await manager.update(Message, messageId, { isOpened: true });
    });
    return { list: await this.getPuzzles(userId), keyCount };
  }

  async deleteMessage(
    userId: number,
    puzzleId: number,
    messageId: number,
  ): Promise<PuzzleDto[]> {
    await this.messageRepository.delete({
      id: messageId,
      puzzle: { id: puzzleId, user: { id: userId } },
    });
    return await this.getPuzzles(userId);
  }

  private createDisplayOrder(messages: Message[]) {
    let newNum;
    const displayOrders = messages.map((message) => {
      return message.displayOrder;
    });
    do {
      newNum = Math.floor(Math.random() * 9);
    } while (displayOrders.includes(newNum));

    return newNum;
  }
}

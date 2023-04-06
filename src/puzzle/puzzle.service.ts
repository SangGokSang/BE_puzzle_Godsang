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

  async createPuzzle(userId: number, puzzleCreateDto: PuzzleCreateDto) {
    const puzzleCount = await this.puzzleRepository.count({
      where: { user: { id: userId } },
    });
    if (puzzleCount >= 3) {
      throw new CustomException(
        ExceptionCode.PUZZLE_FULL,
        '이미 3개의 퍼즐이 존재합니다',
        HttpStatus.BAD_REQUEST,
      );
    }
    const { category, title } = puzzleCreateDto;
    await this.puzzleRepository
      .create({ user: { id: userId }, category, title })
      .save();
  }

  async getPuzzles(userId: number): Promise<PuzzleDto[]> {
    const puzzles = await this.puzzleRepository.find({
      where: { user: { id: userId } },
      order: { createAt: 'DESC' },
    });
    return puzzles.map((puzzle) => puzzle.toDto());
  }

  async deletePuzzle(userId: number, puzzleId: number): Promise<void> {
    const puzzle = await this.puzzleRepository.findOneOrFail({
      where: { id: puzzleId, user: { id: userId } },
    });
    await puzzle.softRemove();
  }

  async createMessage(
    userId: number | null,
    puzzleId: number,
    messageCreateDto: MessageCreateDto,
  ) {
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
          displayOrder,
          content: messageCreateDto.content,
          puzzle: { id: puzzleId },
          from: messageCreateDto.from,
          to: messageCreateDto.to,
          isOpened: false,
        })
        .save();
    });
  }

  async readMessage(
    userId: number,
    puzzleId: number,
    messageId: number,
  ): Promise<{ keyCount: number }> {
    const message = await this.messageRepository
      .createQueryBuilder()
      .where({ id: messageId, puzzle: { id: puzzleId } })
      .getOneOrFail();

    if (message.isOpened) {
      throw new CustomException(
        ExceptionCode.MESSAGE_ALREADY_OPEN,
        '메세지가 이미 열린 상태입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
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
    return { keyCount };
  }

  createDisplayOrder(messages: Message[]) {
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

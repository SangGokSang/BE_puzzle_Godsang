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
    const { category, title } = puzzleCreateDto;
    await this.puzzleRepository
      .create({ user: { id: userId }, category, title })
      .save();
  }

  async getPuzzles(userId: number): Promise<PuzzleDto[]> {
    const puzzles = await this.puzzleRepository.find({
      where: { user: { id: userId } },
    });
    return puzzles.map((puzzle) => puzzle.toDto());
  }

  async createMessage(
    userId: number,
    userNickname: string,
    puzzleId: number,
    messageCreateDto: MessageCreateDto,
  ) {
    const puzzle = await this.puzzleRepository
      .createQueryBuilder('puzzle')
      .leftJoinAndSelect('puzzle.messages', 'message')
      .where({ id: puzzleId })
      .getOneOrFail();

    if (puzzle.messages.length >= 9) {
      throw new CustomException(
        ExceptionCode.MESSAGE_FULL,
        '이미 9개에 메세지가 존재합니다',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.messageRepository
      .create({
        content: messageCreateDto.content,
        puzzle: puzzle,
        senderNickname: userNickname,
        isOpened: false,
      })
      .save();
  }
}

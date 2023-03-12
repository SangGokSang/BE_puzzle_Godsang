import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entity/user.entity';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserKeyDto } from './dto/user-key.dto';
import { CustomException, ExceptionCode } from '../exception/custom.exception';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserKeyCount(userId): Promise<UserKeyDto> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    return { keyCount: user.keyCount };
  }

  async withdrawUser(userId: number): Promise<void> {
    await this.userRepository.findOneOrFail({ where: { id: userId } });
    await this.userRepository.softDelete(userId);
  }

  async restoreUser(userId: number): Promise<void> {
    // entity가 존재 하지 않아도 예외 발생X
    await this.userRepository.restore(userId);
  }

  async updateUser(userId: number, userUpdateDto: UserUpdateDto) {
    // userId가 존재하지 않아도 아무런 예외를 던지지 않음
    await this.userRepository.update({ id: userId }, userUpdateDto);
  }

  async updateUserKeyCount(userId: number): Promise<UserKeyDto> {
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
    await this.userRepository
      .createQueryBuilder()
      .update('user')
      .set({ keyCount })
      .where({ id: userId })
      .execute();
    return { keyCount };
  }
}

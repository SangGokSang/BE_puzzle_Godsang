import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entity/user.entity';
import { UserUpdateDto } from './dto/user-update.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async withdrawUser(userId: number): Promise<void> {
    await this.userRepository.findOneByOrFail({ id: userId });
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
}

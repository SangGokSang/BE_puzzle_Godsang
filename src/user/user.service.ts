import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entity/user.entity';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserKeyDto } from './dto/user-key.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { CustomException, ExceptionCode } from '../exception/custom.exception';
import { JwtPayload } from '../auth/dto/jwt-payload';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
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

  async restoreUser(userId: number, res): Promise<Response> {
    await this.userRepository.restore(userId);
    const user = await this.userRepository.findOneByOrFail({ id: userId });
    return await this.issueToken(user, res);
  }

  async updateUser(userId: number, userUpdateDto: UserUpdateDto) {
    // userId가 존재하지 않아도 아무런 예외를 던지지 않음
    await this.userRepository.update({ id: userId }, userUpdateDto);
  }

  async loginOrSignIn(userDto: LoginDto, res: Response): Promise<Response> {
    const user = await this.findUserOrSave(userDto);
    return await this.issueToken(user, res);
  }

  async refreshToken(
    oldRefreshToken: string,
    userId: number,
    res: Response,
  ): Promise<Response> {
    const user = await this.userRepository.findOneByOrFail({ id: userId });
    if (!(await bcrypt.compare(oldRefreshToken, user.hashedRefreshToken))) {
      throw new CustomException(
        ExceptionCode.INVALID_TOKEN,
        'Refresh Token 비교 중에 예외가 발생했습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return await this.issueToken(user, res);
  }

  private async findUserOrSave(userDto: LoginDto) {
    const { provider, providerId } = userDto;
    const existingUser = await this.userRepository.findOne({
      where: { provider, providerId },
      withDeleted: true,
    });
    return existingUser || this.userRepository.create(userDto).save();
  }

  async issueToken(user: User, res: Response): Promise<Response> {
    const payload: JwtPayload = {
      userId: user.id,
      isWithdrawUser: !!user.deleteAt,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '3h' });
    await this.updateHashedRefreshToken(user.id, refreshToken);

    res.cookie('refresh-token', refreshToken, {
      // todo domain: 'dearmy2023.click',
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 3, // 3 hour
    });
    res.json({
      accessToken,
      userId: user.id,
      nickname: user.nickname,
      birthDate: user.birthdate?.getTime(),
    });
    return res;
  }

  private async updateHashedRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const salt = bcrypt.genSaltSync();
    const hashedRefreshToken = bcrypt.hashSync(refreshToken, salt);
    await this.userRepository.update({ id: userId }, { hashedRefreshToken });
  }

  async logout(res: Response): Promise<Response> {
    res.cookie('refresh-token', '', {
      maxAge: 0,
    });
    return res.send();
  }
}

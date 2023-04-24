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

  async updateUserKeyCount(userId) {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    await this.userRepository.update(
      { id: userId },
      { keyCount: user.keyCount + 1 },
    );
    return { keyCount: user.keyCount };
  }

  async withdrawUser(userId: number): Promise<void> {
    await this.userRepository.findOneOrFail({ where: { id: userId } });
    await this.userRepository.softDelete(userId);
  }

  async restoreUser(userId: number): Promise<{
    birthdate: number;
    isWithdrawUser: boolean;
    nickname: string;
    userId: number;
    isSignUp: boolean;
  }> {
    await this.userRepository.restore(userId);
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    return {
      userId,
      nickname: user.nickname,
      birthdate: user.birthdate?.getTime(),
      isWithdrawUser: !!user.deleteAt,
      isSignUp: true,
    };
  }

  async updateUser(
    userId: number,
    userUpdateDto: UserUpdateDto,
  ): Promise<{ nickname: string; birthdate: number }> {
    // userId가 존재하지 않아도 아무런 예외를 던지지 않음
    await this.userRepository.update({ id: userId }, userUpdateDto);
    const { nickname, birthdate } = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    return { nickname, birthdate: birthdate?.getTime() };
  }

  async loginOrSignUp(userDto: LoginDto, res: Response): Promise<Response> {
    const { user, isSignUp } = await this.findUserOrSave(userDto);
    const { accessToken, refreshToken } = await this.issueToken(user);

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
      birthdate: user.birthdate?.getTime(),
      isWithdrawUser: !!user.deleteAt,
      isSignUp,
      provider: user.provider,
      email: user.email,
    });
    return res;
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
    const { accessToken, refreshToken } = await this.issueToken(user);

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
      birthdate: user.birthdate?.getTime(),
      isWithdrawUser: !!user.deleteAt,
    });
    return res;
  }

  private async findUserOrSave(userDto: LoginDto): Promise<{
    user: User;
    isSignUp: boolean;
  }> {
    const { provider, providerId } = userDto;
    const existingUser = await this.userRepository.findOne({
      where: { provider, providerId },
      withDeleted: true,
    });
    if (existingUser) {
      return { user: existingUser, isSignUp: false };
    } else {
      const user = await this.userRepository.create(userDto).save();
      return { user, isSignUp: true };
    }
  }

  async issueToken(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      userId: user.id,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '3h' });
    await this.updateHashedRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
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

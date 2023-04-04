import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from './dto/jwt-payload';
import { CustomException, ExceptionCode } from '../exception/custom.exception';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

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

  private async issueToken(user: User, res: Response): Promise<Response> {
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

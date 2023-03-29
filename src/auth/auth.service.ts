import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { OauthUserDto } from './dto/oauth-user.dto';
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

  async loginOrSignIn(userDto: OauthUserDto, res: Response): Promise<Response> {
    const user = await this.findUserOrSave(userDto);
    const { accessToken, refreshToken } = this.createToken(user);
    await this.updateHashedRefreshToken(user.id, refreshToken);
    res.cookie('refresh-token', refreshToken, {
      // todo domain: 'dm2023.click',
      httpOnly: true,
      secure: true,
    });
    res.json(accessToken);
    return res;
  }

  async refreshToken(
    authorization: string,
    userId: number,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findOneByOrFail({ id: userId });
    const refreshToken = authorization.replace('Bearer ', '');
    if (!(await bcrypt.compare(refreshToken, user.hashedRefreshToken))) {
      throw new CustomException(
        ExceptionCode.INVALID_TOKEN,
        'Refresh Token 비교 중에 예외가 발생했습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const token = this.createToken(user);
    await this.updateHashedRefreshToken(user.id, token.refreshToken);
    return token;
  }

  private async findUserOrSave(userDto: OauthUserDto) {
    const { provider, providerId } = userDto;
    const existingUser = await this.userRepository.findOne({
      where: { provider, providerId },
      withDeleted: true,
    });
    return existingUser || this.userRepository.create(userDto).save();
  }

  private createToken(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload: JwtPayload = {
      userId: user.id,
      nickname: user.nickname,
      birthdate: user.birthdate?.getTime(),
      isDeleted: !!user.deleteAt,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '1d' });
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
}

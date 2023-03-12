import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { OauthUserDto } from './dto/oauth-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from './dto/jwt-payload';
import { CustomException, ExceptionCode } from '../exception/custom.exception';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async loginOrSignIn(userDto: OauthUserDto) {
    const user = await this.findUserOrSave(userDto);
    const token = this.createToken(user);
    await this.updateHashedRefreshToken(user, token.refreshToken);
    return token;
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
    await this.updateHashedRefreshToken(user, token.refreshToken);
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
      birthdate: user.birthdate.getTime(),
      isDeleted: !!user.deleteAt,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    return { accessToken, refreshToken };
  }

  private async updateHashedRefreshToken(
    user: User,
    refreshToken: string,
  ): Promise<void> {
    const salt = bcrypt.genSaltSync();
    user.hashedRefreshToken = bcrypt.hashSync(refreshToken, salt);
    await this.userRepository.save(user);
  }
}

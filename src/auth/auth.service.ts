import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from './dto/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async loginOrSignIn(userDto: UserDto) {
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
      throw new UnauthorizedException('잘못된 토큰입니다.');
    }
    const token = this.createToken(user);
    await this.updateHashedRefreshToken(user, token.refreshToken);
    return token;
  }

  private async findUserOrSave(userDto: UserDto) {
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
      birthdate: user.birthdate,
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

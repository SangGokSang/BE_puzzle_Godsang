import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DeletedUserException } from './exception/deleted-user.exception';

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
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
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
    if (existingUser?.deleteAt) {
      throw new DeletedUserException();
    }
    return existingUser || this.userRepository.create(userDto).save();
  }

  private createToken(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.jwtService.sign(
      {
        userId: user.id,
        nickname: user.nickname,
        birthdate: user.birthdate,
      },
      { expiresIn: '1h' },
    );
    const refreshToken = this.jwtService.sign(
      {
        provider: user.provider,
        providerId: user.providerId,
      },
      { expiresIn: '1d' },
    );
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

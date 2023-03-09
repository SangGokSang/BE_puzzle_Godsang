import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  loginOrSignIn = async (userDto: UserDto) => {
    const user = await this.findUserByEmailOrSave(userDto);
    const token = this.createToken(user);
    await this.updateHashedRefreshToken(user, token.refreshToken);
    return token;
  };

  private findUserByEmailOrSave = async (userDto: UserDto): Promise<User> => {
    const { provider, providerId, nickname, email } = userDto;
    // 이미 등록된 유저인 경우 바로 반환
    const existingUser = await this.userRepository.findOne({
      where: { provider, email },
    });
    if (existingUser) return existingUser;

    // 새로운 유저 생성 및 저장
    return this.userRepository.save(
      this.userRepository.create({ provider, providerId, nickname, email }),
    );
  };

  private createToken = (
    user: User,
  ): {
    accessToken: string;
    refreshToken: string;
  } => {
    const accessToken = this.jwtService.sign(
      {
        id: user.id,
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
  };

  private updateHashedRefreshToken = async (
    user: User,
    refreshToken: string,
  ): Promise<void> => {
    const salt = bcrypt.genSaltSync();
    user.hashedRefreshToken = bcrypt.hashSync(refreshToken, salt);
    await this.userRepository.save(user);
  };
}

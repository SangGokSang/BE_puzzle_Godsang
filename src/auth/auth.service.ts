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

  async findUserByEmailOrSave(userDto: UserDto): Promise<User> {
    const { provider, email, birthdate } = userDto;
    const user = await this.userRepository.findOne({
      where: { provider, email },
    });

    if (user) {
      return user;
    }
    console.log(birthdate);
    const newUser = this.userRepository.create({
      provider,
      email,
      birthdate,
    });
    await this.userRepository.save(newUser);
    return newUser;
  }

  createToken(user: User): { accessToken: string; refreshToken: string } {
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
        email: user.email,
      },
      { expiresIn: '3d' },
    );
    return { accessToken, refreshToken };
  }

  async updateHashedRefreshToken(
    id: number,
    refreshToken: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    const salt = bcrypt.genSaltSync();
    user.hashedRefreshToken = bcrypt.hashSync(refreshToken, salt);
    await this.userRepository.save(user);
  }
}

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  private readonly logger = new Logger(RefreshTokenStrategy.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload): Promise<User> {
    const { provider, providerId } = payload;
    if (!provider || !providerId) {
      throw new UnauthorizedException(`유효하지 않은 JWT 입니다.`);
    }

    const user = await this.userRepository.findOne({
      where: { provider, providerId },
    });

    if (!(await bcrypt.compare(payload, user.hashedRefreshToken))) {
      this.logger.warn(`유효하지 않은 Refresh Token 으로 요청이 들어왔습니다.`);
      throw new UnauthorizedException(`유효하지 않은 JWT 입니다.`);
    }
    return user;
  }
}

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access-token',
) {
  private readonly logger = new Logger(AccessTokenStrategy.name);

  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload): Promise<number> {
    const { userId } = payload;
    if (!userId) {
      this.logger.debug(
        `User Id가 존재 하지 않는 Token으로 요청이 들어왔습니다.`,
      );
      throw new UnauthorizedException(`유효하지 않은 JWT 입니다.`);
    }
    return userId;
  }
}

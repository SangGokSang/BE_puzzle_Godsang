import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-kakao';
import { UserDto } from '../dto/user.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('FACEBOOK_CLIENT_ID'),
      clientSecret: configService.get('FACEBOOK_CLIENT_SECRET'),
      callbackURL: configService.get('FACEBOOK_CALLBACK_URL'),
    });
  }

  async validate(
    accessToke: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<UserDto> {
    return {
      provider: profile.provider,
      providerId: profile.id,
      nickname: profile.displayName,
      email: null,
      // email: profile._json.email,
      // 페이스북에 어플 인증해야 가능하며 facebook은 리다이렉션 시 https이어야함
    };
  }
}

import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { OauthUserDto } from '../dto/oauth-user.dto';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('KAKAO_CLIENT_ID'),
      callbackURL: configService.get('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(
    accessToke: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<OauthUserDto> {
    const kakaoAccount = profile._json.kakao_account;
    return {
      provider: profile.provider,
      providerId: profile.id,
      nickname: kakaoAccount.profile.nickname,
      email: kakaoAccount.has_email ? kakaoAccount.email : null,
    };
  }
}

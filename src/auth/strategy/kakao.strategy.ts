import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';
import { OAuthProvider } from '../entity/provider.enum';

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
  ): Promise<UserDto> {
    const kakaoAccount = profile._json.kakao_account;
    return {
      provider: OAuthProvider.KAKAO,
      providerId: profile.id,
      nickname: kakaoAccount.profile.nickname,
      email: kakaoAccount.has_email ? kakaoAccount.email : null,
    };
  }
}

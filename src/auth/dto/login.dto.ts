import { IsIn } from 'class-validator';

export class LoginDto {
  @IsIn(['kakao', 'naver'])
  provider: string;
  providerId: string;
  nickname: string;
  email: string;
}

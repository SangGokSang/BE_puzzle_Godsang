import { IsEmail, IsIn, Length } from 'class-validator';

export class LoginDto {
  @IsIn(['google', 'kakao', 'naver', 'facebook'])
  provider: string;
  providerId: string;
  @Length(1, 10)
  nickname: string;
  @IsEmail()
  email: string;
}

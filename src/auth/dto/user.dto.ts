import { OAuthProvider } from '../entity/provider.enum';

export interface UserDto {
  provider: OAuthProvider;
  providerId: string;
  nickname: string;
  email: string;
}

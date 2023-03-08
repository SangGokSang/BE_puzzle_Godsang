import { OAuthProvider } from '../entity/provider.enum';

export interface UserDto {
  provider: OAuthProvider;
  email: string;
  birthdate: string;
}

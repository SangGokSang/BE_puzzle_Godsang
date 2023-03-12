import { IsNotIn, Length, MaxDate } from 'class-validator';

export class UserUpdateDto {
  @IsNotIn([' '])
  @Length(1, 7)
  nickname: string;
  @MaxDate(new Date())
  birthdate: Date;
}

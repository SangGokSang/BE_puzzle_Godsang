import { IsNotIn, Length, Matches, MaxDate } from 'class-validator';

export class UserUpdateDto {
  @IsNotIn([' '])
  @Matches(/^[^;]*$/)
  @Length(1, 7)
  nickname: string;
  @MaxDate(new Date())
  birthdate: Date;
}

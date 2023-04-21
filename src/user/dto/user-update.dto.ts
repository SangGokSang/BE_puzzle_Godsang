import { IsNotIn, Length, Matches, MaxDate } from 'class-validator';

export class UserUpdateDto {
  @IsNotIn([' '])
  @Matches(/^[^;]*$/)
  @Length(1, 10)
  nickname: string;

  @MaxDate(new Date())
  birthdate: Date;
}

import { IsDate, IsNotIn, Length, Matches, MaxDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UserUpdateDto {
  @IsNotIn([' '])
  @Matches(/^[^;]*$/)
  @Length(1, 10)
  nickname: string;

  @Type(() => Date)
  @IsDate()
  @MaxDate(new Date())
  birthdate: Date;
}

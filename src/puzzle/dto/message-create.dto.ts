import { Length, Matches } from 'class-validator';

export class MessageCreateDto {
  puzzleUserId: number;
  @Matches(/^[^;]*$/)
  @Length(1, 19)
  from: string;
  @Matches(/^[^;]*$/)
  @Length(1, 19)
  to: string;
  @Matches(/^[^;]*$/)
  content: string;
}

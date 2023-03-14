import { Matches } from 'class-validator';

export class MessageCreateDto {
  @Matches(/^[^;]*$/)
  from: string;
  @Matches(/^[^;]*$/)
  to: string;
  @Matches(/^[^;]*$/)
  content: string;
}

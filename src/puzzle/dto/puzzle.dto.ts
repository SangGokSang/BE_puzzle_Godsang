import { MessageDto } from './message.dto';

export class PuzzleDto {
  id: number;
  category: string;
  title: string;
  messages: MessageDto[];
  userNickname: string;
}

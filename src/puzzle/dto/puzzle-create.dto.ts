import { IsIn, Length } from 'class-validator';

export class PuzzleCreateDto {
  @IsIn(['EXERCISE', 'CAREER', 'TRAVEL', 'MONEY_MANAGEMENT', 'ETC'])
  category: string;
  @Length(4, 20)
  title: string;
}

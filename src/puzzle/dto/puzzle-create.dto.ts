import { IsIn, Length, Matches } from 'class-validator';

export class PuzzleCreateDto {
  @IsIn(['EXERCISE', 'CAREER', 'TRAVEL', 'MONEY_MANAGEMENT', 'ETC'])
  category: string;

  @Matches(/^[^;]*$/)
  @Length(1, 30)
  title: string;
}

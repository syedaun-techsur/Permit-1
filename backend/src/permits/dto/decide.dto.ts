import { IsIn, IsString, MinLength, MaxLength } from 'class-validator';

export class DecideDto {
  @IsIn(['approved', 'rejected'])
  outcome: 'approved' | 'rejected';

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  decisionReason: string;
}

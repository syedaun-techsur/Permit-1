import { IsUUID, ValidateIf } from 'class-validator';

export class AssignReviewerDto {
  // `null` clears the assignment (unassign); otherwise must be a reviewer's user id.
  @ValidateIf((o) => o.reviewerId !== null)
  @IsUUID()
  reviewerId!: string | null;
}

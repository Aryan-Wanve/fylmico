import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MinLength
} from "class-validator";

export const REVIEW_BULK_ACTIONS = [
  "approve",
  "request-revision",
  "reassign",
  "reject"
] as const;

export class BulkReviewActionDto {
  @IsIn(REVIEW_BULK_ACTIONS)
  action!: (typeof REVIEW_BULK_ACTIONS)[number];

  @IsArray()
  @IsString({ each: true })
  deliverableIds!: string[];

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  newEditorId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  reason?: string;
}

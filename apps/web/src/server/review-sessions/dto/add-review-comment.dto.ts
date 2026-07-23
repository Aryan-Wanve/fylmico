import { IsInt, IsOptional, IsString, MinLength } from "class-validator";

export class AddReviewCommentDto {
  @IsString()
  @MinLength(1)
  body!: string;

  @IsOptional()
  @IsInt()
  timestampSeconds?: number;

  @IsOptional()
  @IsInt()
  version?: number;
}

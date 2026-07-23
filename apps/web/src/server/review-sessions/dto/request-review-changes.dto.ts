import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class RequestReviewChangesDto {
  @IsString()
  @MinLength(1)
  feedback!: string;

  @IsOptional()
  @IsIn(["low", "medium", "high", "urgent"])
  priority?: string;

  @IsOptional()
  @IsString()
  deadline?: string;
}

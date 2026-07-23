import { IsString, MinLength } from "class-validator";

export class ToggleReviewReactionDto {
  @IsString()
  @MinLength(1)
  emoji!: string;
}

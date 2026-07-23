import { IsString, MinLength } from "class-validator";

export class AddReviewReplyDto {
  @IsString()
  @MinLength(1)
  body!: string;
}

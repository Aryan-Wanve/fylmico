import { IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  body!: string;

  @IsOptional()
  @IsNumber()
  timestampSeconds?: number;
}

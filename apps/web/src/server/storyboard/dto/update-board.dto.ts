import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Empty string clears the link (a board without a script).
  @IsOptional()
  @IsString()
  scriptId?: string;
}

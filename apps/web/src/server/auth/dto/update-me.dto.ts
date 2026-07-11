import { IsOptional, IsString, Matches, MinLength } from "class-validator";

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9_]{3,24}$/, {
    message:
      "Username must be 3-24 characters and can only contain lowercase letters, numbers, and underscores."
  })
  username?: string;
}

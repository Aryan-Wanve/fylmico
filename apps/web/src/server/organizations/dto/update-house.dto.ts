import { IsOptional, IsString, Matches, MinLength } from "class-validator";

export class UpdateHouseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: "handle must contain only lowercase letters, numbers, and hyphens"
  })
  handle?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

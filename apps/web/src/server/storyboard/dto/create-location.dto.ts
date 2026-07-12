import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateLocationDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  type!: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}

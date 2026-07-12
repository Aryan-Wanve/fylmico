import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateScriptDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  content?: string;
}

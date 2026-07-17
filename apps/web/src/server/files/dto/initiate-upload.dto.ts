import { IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class InitiateUploadDto {
  @IsOptional()
  @IsString()
  parentId?: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  mimeType!: string;

  @IsInt()
  @Min(1)
  size!: number;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsString()
  taskId?: string;
}

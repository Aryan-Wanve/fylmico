import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

const UPLOAD_CATEGORIES = [
  "raw",
  "assets",
  "deliverables",
  "project-files"
] as const;

export class ResolveDestinationDto {
  @IsString()
  @MinLength(1)
  clientId!: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsIn(UPLOAD_CATEGORIES)
  category?: (typeof UPLOAD_CATEGORIES)[number];
}

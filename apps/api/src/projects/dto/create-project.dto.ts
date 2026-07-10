import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MinLength
} from "class-validator";

export const PROJECT_TYPES = [
  "Short Film",
  "Documentary",
  "Commercial",
  "Music Video",
  "Feature Film",
  "Corporate Video",
  "Web Series",
  "Wedding Film"
] as const;

export const PROJECT_STAGES = [
  "Development",
  "Pre-Production",
  "In Production",
  "In Progress",
  "Post-Production",
  "On Hold",
  "Completed"
] as const;

export const PROJECT_COVER_ICONS = [
  "camera",
  "clapperboard",
  "heart",
  "megaphone",
  "mic",
  "music"
] as const;

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(PROJECT_TYPES)
  type?: (typeof PROJECT_TYPES)[number];

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsIn(PROJECT_STAGES)
  stage?: (typeof PROJECT_STAGES)[number];

  @IsOptional()
  @IsInt()
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsString()
  coverGradient?: string;

  @IsOptional()
  @IsIn(PROJECT_COVER_ICONS)
  coverIcon?: (typeof PROJECT_COVER_ICONS)[number];

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teamIds?: string[];
}

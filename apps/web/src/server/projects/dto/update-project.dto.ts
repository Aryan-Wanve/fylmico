import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MinLength
} from "class-validator";
import {
  PROJECT_COVER_ICONS,
  PROJECT_PRIORITIES,
  PROJECT_STAGES,
  PROJECT_TYPES
} from "./create-project.dto";

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

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
  @IsIn(PROJECT_PRIORITIES)
  priority?: (typeof PROJECT_PRIORITIES)[number];

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

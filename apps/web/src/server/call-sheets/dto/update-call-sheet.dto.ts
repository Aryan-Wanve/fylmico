import { IsArray, IsOptional, IsString, MinLength } from "class-validator";
import type { CrewCallTimeEntry } from "./create-call-sheet.dto";

export class UpdateCallSheetDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  shootDate?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  generalCallTime?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  weather?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  crewCallTimes?: CrewCallTimeEntry[];
}

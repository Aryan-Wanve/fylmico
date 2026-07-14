import { IsArray, IsOptional, IsString, MinLength } from "class-validator";

export type CrewCallTimeEntry = {
  userId: string;
  name: string;
  jobTitle: string;
  callTime: string;
};

export class CreateCallSheetDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  @MinLength(1)
  shootDate!: string;

  @IsString()
  @MinLength(1)
  generalCallTime!: string;

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

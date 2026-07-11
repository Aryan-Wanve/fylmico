import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

export const CREW_DEPARTMENTS = [
  "Production",
  "Camera",
  "Art",
  "Electric",
  "Sound",
  "Costume",
  "Post-Production"
] as const;

export const CREW_ROLE_CATEGORIES = [
  "Director",
  "Producer",
  "Cinematographer",
  "Editor",
  "Production Assistant",
  "Other"
] as const;

export const CREW_STATUSES = [
  "available",
  "on-set",
  "on-leave",
  "unavailable"
] as const;

export class UpdateCrewProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  jobTitle?: string;

  @IsOptional()
  @IsIn(CREW_DEPARTMENTS)
  department?: (typeof CREW_DEPARTMENTS)[number];

  @IsOptional()
  @IsIn(CREW_ROLE_CATEGORIES)
  roleCategory?: (typeof CREW_ROLE_CATEGORIES)[number];

  @IsOptional()
  @IsIn(CREW_STATUSES)
  status?: (typeof CREW_STATUSES)[number];

  @IsOptional()
  @IsString()
  currentProject?: string;

  @IsOptional()
  @IsString()
  projectStage?: string;

  @IsOptional()
  @IsString()
  availability?: string;

  @IsOptional()
  @IsString()
  birthday?: string;
}

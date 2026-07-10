import {
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength
} from "class-validator";

export const TIME_ENTRY_PHASES = [
  "Pre-Production",
  "Production",
  "Post-Production",
  "Planning"
] as const;

export class CreateTimeEntryDto {
  @IsString()
  @MinLength(1)
  date!: string;

  @IsNumber()
  @IsPositive()
  hours!: number;

  @IsOptional()
  @IsIn(TIME_ENTRY_PHASES)
  phase?: (typeof TIME_ENTRY_PHASES)[number];

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

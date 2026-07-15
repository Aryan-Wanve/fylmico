import { IsInt, IsISO8601, IsOptional, IsString, Min } from "class-validator";

export class AddWorkLogDto {
  @IsISO8601()
  startedAt!: string;

  @IsISO8601()
  endedAt!: string;

  @IsInt()
  @Min(1)
  durationMinutes!: number;

  @IsOptional()
  @IsString()
  note?: string;
}

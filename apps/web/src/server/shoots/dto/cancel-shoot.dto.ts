import { IsOptional, IsString, MinLength } from "class-validator";

export class CancelShootDto {
  @IsString()
  @MinLength(1)
  reason!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

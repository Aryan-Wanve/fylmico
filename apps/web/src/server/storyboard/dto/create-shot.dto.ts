import { IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateShotDto {
  @IsString()
  @MinLength(1)
  description!: string;

  @IsOptional()
  @IsString()
  cameraAngle?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

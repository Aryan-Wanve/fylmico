import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateShotDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsString()
  cameraAngle?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

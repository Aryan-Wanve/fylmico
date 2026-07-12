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

  // A data: URL PNG from the shot's drawing canvas, or "" to clear it.
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

import { IsNumber, IsOptional } from "class-validator";

export class UpdateMediaMetadataDto {
  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;
}

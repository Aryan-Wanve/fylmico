import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength
} from "class-validator";

export class UpdateChecklistItemDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  text?: string;

  @IsOptional()
  @IsBoolean()
  done?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

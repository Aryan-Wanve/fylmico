import { Type } from "class-transformer";
import {
  IsArray,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested
} from "class-validator";
import { CreateShotDto } from "./create-shot.dto";

export class CreateBoardDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  scriptId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShotDto)
  shots?: CreateShotDto[];
}

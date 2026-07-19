import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength
} from "class-validator";

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  body!: string;

  @IsOptional()
  @IsNumber()
  timestampSeconds?: number;

  @IsOptional()
  @IsInt()
  frameNumber?: number;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionedUserIds?: string[];
}

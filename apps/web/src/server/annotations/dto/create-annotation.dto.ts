import {
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MinLength
} from "class-validator";

export const ANNOTATION_TYPES = [
  "arrow",
  "rectangle",
  "circle",
  "freehand",
  "line",
  "highlight",
  "text",
  "blur"
] as const;

export class CreateAnnotationDto {
  @IsNumber()
  timestampSeconds!: number;

  @IsOptional()
  @IsInt()
  frameNumber?: number;

  @IsIn(ANNOTATION_TYPES)
  type!: (typeof ANNOTATION_TYPES)[number];

  @IsString()
  @MinLength(1)
  color!: string;

  @IsObject()
  data!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  commentId?: string;
}

import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

const UPLOAD_CATEGORIES = [
  "raw",
  "assets",
  "deliverables",
  "project-files"
] as const;

export class ResolveDestinationDto {
  @IsIn(["project", "client"])
  ownerType!: "project" | "client";

  @IsString()
  @MinLength(1)
  ownerId!: string;

  @IsOptional()
  @IsIn(UPLOAD_CATEGORIES)
  category?: (typeof UPLOAD_CATEGORIES)[number];
}

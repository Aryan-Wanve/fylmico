import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class CreateAnnouncementDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  body!: string;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}

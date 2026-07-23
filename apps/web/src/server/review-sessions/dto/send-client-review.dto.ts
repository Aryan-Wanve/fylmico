import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength
} from "class-validator";

export class SendClientReviewDto {
  @IsEmail()
  clientEmail!: string;

  @IsString()
  subject!: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsBoolean()
  includeProjectName?: boolean;

  @IsOptional()
  @IsBoolean()
  includeVideoVersion?: boolean;

  @IsOptional()
  @IsBoolean()
  includeNotes?: boolean;

  @IsOptional()
  @IsBoolean()
  allowDownload?: boolean;

  @IsOptional()
  @IsBoolean()
  allowFullscreen?: boolean;

  @IsOptional()
  @IsBoolean()
  allowVersionSwitch?: boolean;

  // Duration string like "7d", "24h" - parsed by token.util.ts's addDuration.
  @IsString()
  expiresIn!: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  password?: string;
}

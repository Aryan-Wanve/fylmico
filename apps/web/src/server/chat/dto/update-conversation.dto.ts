import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  topic?: string;
}

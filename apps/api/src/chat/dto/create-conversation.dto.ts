import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateConversationDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  topic?: string;
}

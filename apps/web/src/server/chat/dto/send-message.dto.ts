import { IsOptional, IsString, MinLength } from "class-validator";

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  body!: string;

  @IsOptional()
  @IsString()
  parentMessageId?: string;
}

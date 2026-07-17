import { IsString, MinLength } from "class-validator";

export class RequestExtraTimeDto {
  @IsString()
  @MinLength(1)
  reason!: string;
}

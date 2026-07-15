import { IsOptional, IsString } from "class-validator";

export class StopTimerDto {
  @IsOptional()
  @IsString()
  note?: string;
}

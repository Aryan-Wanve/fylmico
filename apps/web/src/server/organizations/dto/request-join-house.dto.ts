import { IsString, MinLength } from "class-validator";

export class RequestJoinHouseDto {
  @IsString()
  @MinLength(1)
  handle!: string;
}

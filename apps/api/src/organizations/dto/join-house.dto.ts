import { IsString, MinLength } from "class-validator";

export class JoinHouseDto {
  @IsString()
  @MinLength(1)
  inviteCode!: string;
}

import { IsString, MinLength } from "class-validator";

export class CreateRoomEventDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  date!: string;

  @IsString()
  @MinLength(1)
  time!: string;
}

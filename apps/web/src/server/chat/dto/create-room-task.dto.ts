import { IsString, MinLength } from "class-validator";

export class CreateRoomTaskDto {
  @IsString()
  @MinLength(1)
  title!: string;
}

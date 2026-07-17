import { IsString, MinLength } from "class-validator";

export class ReassignDeliverableDto {
  @IsString()
  @MinLength(1)
  newEditorId!: string;
}

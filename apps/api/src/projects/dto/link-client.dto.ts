import { IsString, MinLength } from "class-validator";

export class LinkClientDto {
  @IsString()
  @MinLength(1)
  clientId!: string;
}

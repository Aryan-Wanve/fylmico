import { IsString, MinLength } from "class-validator";

export class ReportShootIssueDto {
  @IsString()
  @MinLength(1)
  message!: string;
}

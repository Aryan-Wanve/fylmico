import { IsArray, IsString, MinLength } from "class-validator";

export class AssignRoleDto {
  @IsString()
  @MinLength(1)
  roleName!: string;

  @IsString()
  team!: string;

  @IsArray()
  @IsString({ each: true })
  permissions!: string[];
}

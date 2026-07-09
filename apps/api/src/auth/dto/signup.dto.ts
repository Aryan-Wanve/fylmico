import { IsEmail, IsString, MinLength } from "class-validator";

export class SignupDto {
  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(1)
  name!: string;
}

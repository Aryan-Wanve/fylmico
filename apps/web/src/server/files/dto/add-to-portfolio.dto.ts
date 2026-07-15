import { IsOptional, IsString } from "class-validator";

export class AddToPortfolioDto {
  @IsOptional()
  @IsString()
  category?: string;
}

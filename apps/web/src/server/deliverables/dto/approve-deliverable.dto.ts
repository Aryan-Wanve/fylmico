import { IsBoolean, IsOptional, IsString } from "class-validator";

export class ApproveDeliverableDto {
  @IsOptional()
  @IsBoolean()
  deliverToClient?: boolean;

  @IsOptional()
  @IsBoolean()
  addToPortfolio?: boolean;

  @IsOptional()
  @IsString()
  portfolioCategory?: string;

  @IsOptional()
  @IsString()
  finalName?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

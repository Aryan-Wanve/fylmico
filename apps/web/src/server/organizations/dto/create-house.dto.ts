import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MinLength
} from "class-validator";
import { HOUSE_TYPES, type HouseType } from "@/lib/house-types";

export class CreateHouseDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: "handle must contain only lowercase letters, numbers, and hyphens"
  })
  handle!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(HOUSE_TYPES)
  houseType!: HouseType;
}

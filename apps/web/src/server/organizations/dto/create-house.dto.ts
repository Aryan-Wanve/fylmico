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
  @Matches(/^[a-z0-9]{3,20}$/, {
    message:
      "handle must be 3-20 characters, lowercase letters and numbers only"
  })
  handle!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(HOUSE_TYPES)
  houseType!: HouseType;
}

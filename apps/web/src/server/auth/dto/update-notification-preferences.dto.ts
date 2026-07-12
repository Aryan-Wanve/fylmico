import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsString,
  MinLength,
  ValidateNested
} from "class-validator";

export class NotificationPreferenceItemDto {
  @IsString()
  @MinLength(1)
  id!: string;

  @IsBoolean()
  email!: boolean;

  @IsBoolean()
  push!: boolean;
}

export class UpdateNotificationPreferencesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationPreferenceItemDto)
  preferences!: NotificationPreferenceItemDto[];
}

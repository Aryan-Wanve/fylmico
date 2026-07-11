import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

const DEFAULT_LIMIT = 25;

export class CursorPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  cursor?: string;
}

export interface Page<T> {
  data: T[];
  page: {
    limit: number;
    cursor: string | null;
    nextCursor: string | null;
  };
}

export function resolveLimit(pagination: CursorPaginationDto): number {
  return pagination.limit ?? DEFAULT_LIMIT;
}

export function buildPage<T extends { id: string }>(
  rows: T[],
  limit: number,
  cursor?: string
): Page<T> {
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;

  return {
    data,
    page: {
      limit,
      cursor: cursor ?? null,
      nextCursor: hasMore ? data[data.length - 1].id : null
    }
  };
}

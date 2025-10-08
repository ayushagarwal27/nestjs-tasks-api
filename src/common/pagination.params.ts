import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max, IsIn } from 'class-validator';

export class PaginationParams {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  limit = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;
}

import {
  IsArray,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { TaskStatus } from './task.model';
import { Transform } from 'class-transformer';

export class FindTaskParam {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @MinLength(3)
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }: { value?: string }) => {
    if (!value) return undefined;
    return value
      .split(',')
      .map((labels) => labels.trim())
      .filter((label) => label.length);
  })
  labels?: string[];

  @IsOptional()
  @IsIn(['title', 'status'])
  sortBy: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

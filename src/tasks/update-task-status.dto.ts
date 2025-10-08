import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from './task.model';

export class UpdateTaskStatusStatusDto {
  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status: TaskStatus;
}

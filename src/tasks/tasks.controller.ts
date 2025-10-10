import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './create-task.dto';
import { FindOneParams } from './find-one.params';
import { UpdateTaskDto } from './update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status-exception';
import { Task } from './task.entity';
import { CreateTaskLabelDto } from './create-task-label.dto';
import { FindTaskParam } from './find-task.params';
import { PaginationParams } from '../common/pagination.params';
import { PaginationResponse } from '../common/pagination-response';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  public async findAll(
    @Query() filters: FindTaskParam,
    @Query() pagination: PaginationParams,
  ): Promise<PaginationResponse<Task>> {
    const [tasks, total] = await this.tasksService.findAll(filters, pagination);
    return {
      data: tasks,
      meta: { ...pagination, total },
    };
  }

  @Get('/:id')
  public async findOne(@Param() params: FindOneParams): Promise<Task> {
    return await this.findOneByIdOrFail(params.id);
  }

  @Post()
  public async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return await this.tasksService.create(createTaskDto);
  }

  // @Patch('/:id/status')
  // public updateTaskStatus(
  //   @Param() params: FindOneParams,
  //   @Body() body: UpdateTaskStatusStatusDto,
  // ): ITask {
  //   const task = this.findOneByIdOrFail(params.id);
  //   task.status = body.status;
  //   return task;
  // }

  @Patch('/:id')
  public async updateTask(
    @Param() params: FindOneParams,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    try {
      let task = await this.findOneByIdOrFail(params.id);
      const updatedTask = await this.tasksService.update(task, updateTaskDto);
      return updatedTask;
    } catch (error) {
      if (error instanceof WrongTaskStatusException) {
        throw new BadRequestException([error.message]);
      }
      throw error;
    }
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteTask(@Param() params: FindOneParams): Promise<void> {
    const task = await this.findOneByIdOrFail(params.id);
    this.tasksService.delete(task);
  }

  @Post('/:id/labels')
  public async addLabels(
    @Param() { id }: FindOneParams,
    @Body() createLabelsDto: CreateTaskLabelDto[],
  ): Promise<Task> {
    const task = await this.findOneByIdOrFail(id);
    return await this.tasksService.addLabels(task, createLabelsDto);
  }

  @Delete('/:id/labels')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async removeLabels(
    @Param() { id }: FindOneParams,
    @Body() labelNames: string[],
  ): Promise<void> {
    const task = await this.findOneByIdOrFail(id);
    return await this.tasksService.removeLabels(task, labelNames);
  }

  private async findOneByIdOrFail(id: string): Promise<Task> {
    const task = await this.tasksService.findOneById(id);

    if (!task) {
      throw new NotFoundException();
    }

    return task;
  }
}

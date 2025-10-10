import { Injectable } from '@nestjs/common';
import { TaskStatus } from './task.model';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status-exception';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskLabelDto } from './create-task-label.dto';
import { TaskLabel } from './task-label.entity';
import { FindTaskParam } from './find-task.params';
import { PaginationParams } from '../common/pagination.params';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(TaskLabel)
    private readonly taskLabelRepository: Repository<TaskLabel>,
  ) {}

  async findAll(
    filters: FindTaskParam,
    pagination: PaginationParams,
  ): Promise<[Task[], number]> {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.labels', 'labels');

    if (filters.status) {
      query.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters.search?.trim()) {
      query.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        {
          search: `%${filters.search}%`,
        },
      );
    }

    if (filters.labels?.length) {
      const subQuery = query
        .subQuery()
        .select('labels.taskId')
        .from('task_label', 'labels')
        .where('labels.name IN (:...names)', { names: filters.labels })
        .getQuery();

      query.andWhere(`task.id IN ${subQuery}`);
    }

    query.orderBy(`task.${filters.sortBy}`, filters.sortOrder);

    query.skip(pagination.offset).take(pagination.limit);

    return query.getManyAndCount();
  }

  async findOneById(id: string): Promise<Task | null> {
    return await this.taskRepository.findOne({
      where: { id },
      relations: ['labels'],
    });
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    if (createTaskDto.labels) {
      createTaskDto.labels = this.getUniqueLabels(createTaskDto.labels);
    }
    return await this.taskRepository.save(createTaskDto);
  }

  async update(task: Task, updatedTaskDto: UpdateTaskDto): Promise<Task> {
    if (
      updatedTaskDto.status &&
      !this.isValidStatusTransition(task.status, updatedTaskDto.status)
    ) {
      throw new WrongTaskStatusException();
    }
    if (updatedTaskDto.labels) {
      updatedTaskDto.labels = this.getUniqueLabels(updatedTaskDto.labels);
    }
    Object.assign(task, updatedTaskDto);
    return await this.taskRepository.save(task);
  }

  async delete(providedTask: Task): Promise<void> {
    await this.taskRepository.remove(providedTask);
  }

  async addLabels(task: Task, labelsDtos: CreateTaskLabelDto[]): Promise<Task> {
    const existingNames = new Set(task.labels.map((label) => label.name));

    const labels = this.getUniqueLabels(labelsDtos)
      .filter((dto) => !existingNames.has(dto.name))
      .map((label) => this.taskLabelRepository.create(label));

    if (labels.length > 0) {
      task.labels = [...task.labels, ...labels];
      return await this.taskRepository.save(task);
    }
    return task;
  }

  async removeLabels(task: Task, labelsToRemove: string[]): Promise<void> {
    task.labels = task.labels.filter(
      (label) => !labelsToRemove.includes(label.name),
    );
    await this.taskRepository.save(task);
  }

  private isValidStatusTransition(
    currentStatus: TaskStatus,
    newStatus: TaskStatus,
  ): boolean {
    const statusOrder = [
      TaskStatus.OPEN,
      TaskStatus.IN_PROGRESS,
      TaskStatus.DONE,
    ];

    return statusOrder.indexOf(currentStatus) <= statusOrder.indexOf(newStatus);
  }

  private getUniqueLabels(
    labelsDtos: CreateTaskLabelDto[],
  ): CreateTaskLabelDto[] {
    const uniqueLabelNames = [
      ...new Set(labelsDtos.map((label) => label.name)),
    ];
    return uniqueLabelNames.map((name) => ({ name }));
  }
}

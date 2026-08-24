import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    projectId: string,
    createTaskDto: CreateTaskDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this project',
      );
    }

    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        projectId,
      },
    });
  }

  async findAll(
    userId: string,
    projectId: string,
  ) {
    const project =
      await this.prisma.project.findUnique({
        where: {
          id: projectId,
        },
      });

    if (!project) {
      throw new NotFoundException(
        'Project not found',
      );
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this project',
      );
    }

    return this.prisma.task.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    userId: string,
    projectId: string,
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ) {
    const project =
      await this.prisma.project.findUnique({
        where: {
          id: projectId,
        },
      });

    if (!project) {
      throw new NotFoundException(
        'Project not found',
      );
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this project',
      );
    }

    const task =
      await this.prisma.task.findUnique({
        where: {
          id: taskId,
        },
      });

    if (!task || task.projectId !== projectId) {
      throw new NotFoundException(
        'Task not found',
      );
    }

    return this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...(updateTaskDto.completed !==
          undefined && {
          completed:
            updateTaskDto.completed,
        }),

        ...(updateTaskDto.title !==
          undefined && {
          title: updateTaskDto.title,
        }),

        ...(updateTaskDto.description !==
          undefined && {
          description:
            updateTaskDto.description,
        }),
      },
    });
  }

  async remove(
    userId: string,
    projectId: string,
    taskId: string,
  ) {
    const project =
      await this.prisma.project.findUnique({
        where: {
          id: projectId,
        },
      });

    if (!project) {
      throw new NotFoundException(
        'Project not found',
      );
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this project',
      );
    }

    const task =
      await this.prisma.task.findUnique({
        where: {
          id: taskId,
        },
      });

    if (!task || task.projectId !== projectId) {
      throw new NotFoundException(
        'Task not found',
      );
    }

    await this.prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return {
      message: 'Task deleted successfully',
    };
  }
}

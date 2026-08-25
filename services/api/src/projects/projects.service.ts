import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    createProjectDto: CreateProjectDto,
  ) {
    return this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        description:
          createProjectDto.description,
        ownerId: userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: {
        ownerId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDashboard(userId: string) {
    const projects =
      await this.prisma.project.findMany({
        where: {
          ownerId: userId,
        },
        include: {
          tasks: {
            select: {
              id: true,
              completed: true,
              status: true,
              priority: true,
              dueDate: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    const allTasks = projects.flatMap(
      (project) => project.tasks,
    );

    const now = new Date();

    const totalTasks = allTasks.length;

    const completedTasks =
      allTasks.filter(
        (task) =>
          task.completed ||
          task.status === 'DONE',
      ).length;

    const inProgressTasks =
      allTasks.filter(
        (task) =>
          !task.completed &&
          task.status === 'IN_PROGRESS',
      ).length;

    const todoTasks =
      allTasks.filter(
        (task) =>
          !task.completed &&
          task.status === 'TODO',
      ).length;

    const overdueTasks =
      allTasks.filter(
        (task) =>
          !task.completed &&
          task.status !== 'DONE' &&
          task.dueDate !== null &&
          new Date(task.dueDate) < now,
      ).length;

    const highPriorityTasks =
      allTasks.filter(
        (task) =>
          !task.completed &&
          task.priority === 'HIGH',
      ).length;

    return {
      projects: projects.length,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      highPriorityTasks,
    };
  }

  async findOne(
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

    return project;
  }

  async update(
    userId: string,
    projectId: string,
    updateProjectDto: UpdateProjectDto,
  ) {
    await this.findOne(
      userId,
      projectId,
    );

    return this.prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        ...(updateProjectDto.name !==
          undefined && {
          name: updateProjectDto.name,
        }),
        ...(updateProjectDto.description !==
          undefined && {
          description:
            updateProjectDto.description,
        }),
      },
    });
  }

  async remove(
    userId: string,
    projectId: string,
  ) {
    await this.findOne(
      userId,
      projectId,
    );

    await this.prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    return {
      message: 'Project deleted successfully',
    };
  }
}

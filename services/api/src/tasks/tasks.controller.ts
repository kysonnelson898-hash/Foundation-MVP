import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('projects/:projectId/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Request() request: { user: { id: string } },
    @Param('projectId') projectId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.create(
      request.user.id,
      projectId,
      createTaskDto,
    );
  }

  @Get()
  findAll(
    @Request() request: { user: { id: string } },
    @Param('projectId') projectId: string,
  ) {
    return this.tasksService.findAll(
      request.user.id,
      projectId,
    );
  }

  @Patch(':taskId')
  update(
    @Request() request: { user: { id: string } },
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(
      request.user.id,
      projectId,
      taskId,
      updateTaskDto,
    );
  }

  @Delete(':taskId')
  remove(
    @Request() request: { user: { id: string } },
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.remove(
      request.user.id,
      projectId,
      taskId,
    );
  }
}

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
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  create(
    @Request() request: { user: { id: string } },
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectsService.create(
      request.user.id,
      createProjectDto,
    );
  }

  @Get()
  findAll(
    @Request() request: { user: { id: string } },
  ) {
    return this.projectsService.findAll(
      request.user.id,
    );
  }

  @Get('dashboard')
  getDashboard(
    @Request() request: { user: { id: string } },
  ) {
    return this.projectsService.getDashboard(
      request.user.id,
    );
  }

  @Get(':id')
  findOne(
    @Request() request: { user: { id: string } },
    @Param('id') projectId: string,
  ) {
    return this.projectsService.findOne(
      request.user.id,
      projectId,
    );
  }

  @Patch(':id')
  update(
    @Request() request: { user: { id: string } },
    @Param('id') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(
      request.user.id,
      projectId,
      updateProjectDto,
    );
  }

  @Delete(':id')
  remove(
    @Request() request: { user: { id: string } },
    @Param('id') projectId: string,
  ) {
    return this.projectsService.remove(
      request.user.id,
      projectId,
    );
  }
}

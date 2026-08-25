import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
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
}

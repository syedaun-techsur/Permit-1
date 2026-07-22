import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermitsService, ListQuery } from './permits.service';
import { CreatePermitDto } from './dto/create-permit.dto';
import { UpdatePermitDto } from './dto/update-permit.dto';
import { ApplicationStatus } from './entities/permit-application.entity';
import { UserRole } from '../common/enums/role.enum';

interface AuthenticatedRequest {
  user: { id: string; email: string; role: UserRole };
}

@Controller('permits')
@UseGuards(JwtAuthGuard)
export class PermitsController {
  constructor(private readonly permitsService: PermitsService) {}

  // POST /permits — create draft
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreatePermitDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.permitsService.createDraft(req.user.id, dto);
  }

  // GET /permits — list applicant's own applications
  @Get()
  async list(
    @Query('status') status: ApplicationStatus | undefined,
    @Query('cursor') cursor: string | undefined,
    @Query('limit') limit: string | undefined,
    @Request() req: AuthenticatedRequest,
  ) {
    const query: ListQuery = {
      status,
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    return this.permitsService.listApplications(req.user.id, query);
  }

  // GET /permits/:id — full application detail
  @Get(':id')
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.permitsService.getById(req.user.id, id);
  }

  // PATCH /permits/:id — auto-save draft update
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePermitDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.permitsService.updateDraft(req.user.id, id, dto);
  }

  // POST /permits/:id/submit — submit draft (rate-limited)
  @Post(':id/submit')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async submit(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.permitsService.submitApplication(req.user.id, id);
  }

  // GET /permits/:id/lifecycle — get lifecycle stages
  @Get(':id/lifecycle')
  async getLifecycle(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const stages = await this.permitsService.getLifecycleStages(req.user.id, id);
    return { stages };
  }
}

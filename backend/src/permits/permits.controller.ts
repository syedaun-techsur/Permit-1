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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PermitsService, ListQuery } from './permits.service';
import { CreatePermitDto } from './dto/create-permit.dto';
import { UpdatePermitDto } from './dto/update-permit.dto';
import { RequestInfoDto } from './dto/request-info.dto';
import { RespondToInfoDto } from './dto/respond-to-info.dto';
import { DecideDto } from './dto/decide.dto';
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

  // GET /permits/review-queue — reviewer/admin: all submitted applications.
  // MUST be declared before the `:id` route: NestJS/Express match in
  // declaration order, and the `:id` route's ParseUUIDPipe would otherwise
  // reject the literal string "review-queue" with a 400.
  @Get('review-queue')
  @UseGuards(RolesGuard)
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  async reviewQueue(
    @Query('status') status: ApplicationStatus | undefined,
    @Query('permitType') permitType: string | undefined,
    @Query('assignment') assignment: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.permitsService.listReviewQueue(req.user.id, {
      status,
      permitType,
      assignment,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  // GET /permits/:id — full application detail
  @Get(':id')
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.permitsService.getById(req.user.id, id, req.user.role);
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
    const stages = await this.permitsService.getLifecycleStages(
      req.user.id,
      id,
      req.user.role,
    );
    return { stages };
  }

  // ── Phase 3: Lifecycle action endpoints ───────────────────────────────

  // POST /permits/:id/actions/begin-review — reviewer starts review
  @Post(':id/actions/begin-review')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  async beginReview(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.permitsService.beginReview(id, req.user.id);
  }

  // POST /permits/:id/actions/request-info — reviewer requests additional info
  @Post(':id/actions/request-info')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  async requestInfo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RequestInfoDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.permitsService.requestInfo(id, req.user.id, dto);
  }

  // POST /permits/:id/actions/respond-to-info — applicant responds to info request
  @Post(':id/actions/respond-to-info')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.APPLICANT)
  async respondToInfo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RespondToInfoDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.permitsService.respondToInfo(id, req.user.id, dto, false);
  }

  // POST /permits/:id/actions/decide — reviewer approves or rejects
  @Post(':id/actions/decide')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  async decide(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DecideDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.permitsService.decide(id, req.user.id, dto, isAdmin);
  }
}

import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { DashboardService } from './dashboard.service';
import { ApplicantDashboardDto } from './dto/applicant-dashboard.dto';
import { ReviewerDashboardDto } from './dto/reviewer-dashboard.dto';
import { AdminDashboardDto } from './dto/admin-dashboard.dto';

interface AuthenticatedRequest {
  user: { id: string; email: string; role: UserRole };
}

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('applicant')
  @Roles(UserRole.APPLICANT)
  getApplicantDashboard(
    @Request() req: AuthenticatedRequest,
  ): Promise<ApplicantDashboardDto> {
    return this.dashboardService.getApplicantDashboard(req.user.id);
  }

  @Get('reviewer')
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  getReviewerDashboard(
    @Request() req: AuthenticatedRequest,
  ): Promise<ReviewerDashboardDto> {
    return this.dashboardService.getReviewerDashboard(req.user.id);
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  getAdminDashboard(): Promise<AdminDashboardDto> {
    return this.dashboardService.getAdminDashboard();
  }
}

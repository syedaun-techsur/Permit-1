import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { AdminService } from './admin.service';
import { AdminPermitsQueryDto } from './dto/admin-permits-query.dto';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // PERM-07: Admin all-applications view
  @Get('permits')
  async getAllPermits(@Query() query: AdminPermitsQueryDto) {
    return this.adminService.getAllPermits(query);
  }

  // ADMN-01: List users
  @Get('users')
  async getUsers(@Query() query: GetUsersQueryDto) {
    return this.adminService.getUsers(query);
  }

  // ADMN-01: Create user
  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserDto, @Request() req: any) {
    return this.adminService.createUser(dto, req.user.id ?? req.user.sub);
  }

  // ADMN-01: Get single user
  @Get('users/:userId')
  async getUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.adminService.getUserById(userId);
  }

  // ADMN-01: Update user (deactivate/reactivate/role change)
  @Patch('users/:userId')
  async updateUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateUserDto,
    @Request() req: any,
  ) {
    return this.adminService.updateUser(userId, dto, req.user.id ?? req.user.sub);
  }

  // ADMN-03: Audit log (cursor-paginated)
  @Get('audit-log')
  async getAuditLog(@Query() query: AuditLogQueryDto) {
    return this.adminService.getAuditLog(query);
  }

  // ADMN-03: Audit log CSV export
  @Get('audit-log/export')
  async exportAuditLog(@Query() query: AuditLogQueryDto, @Res() res: Response) {
    return this.adminService.exportAuditLogCsv(query, res);
  }
}

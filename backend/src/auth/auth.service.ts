import {
  Injectable, ConflictException, UnauthorizedException,
  BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RefreshToken } from '../users/refresh-token.entity';
import { PasswordResetToken } from '../users/password-reset-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(PasswordResetToken)
    private readonly prtRepo: Repository<PasswordResetToken>,
  ) {}

  private toUserDto(user: User) {
    return { id: user.id, email: user.email, fullName: user.fullName, role: user.role };
  }

  private async issueTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' });

    // Refresh token: random 32-byte hex, stored as SHA-256 hash
    const rawRefresh = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawRefresh).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({ userId: user.id, tokenHash, expiresAt, revoked: false }),
    );

    return { accessToken, refreshToken: rawRefresh };
  }

  // AUTH-01: Register
  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException({ code: 'PASSWORD_MISMATCH', message: 'Passwords do not match.' });
    }
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException({ code: 'EMAIL_ALREADY_EXISTS', message: 'An account with this email already exists.' });
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({ email: dto.email, passwordHash, fullName: dto.fullName });
    const tokens = await this.issueTokens(user);
    return { user: this.toUserDto(user), ...tokens };
  }

  // AUTH-02: Login
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    }
    if (!user.isActive) {
      throw new ForbiddenException({ code: 'ACCOUNT_INACTIVE', message: 'Your account has been deactivated.' });
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    }
    const tokens = await this.issueTokens(user);
    return { user: this.toUserDto(user), ...tokens };
  }

  // AUTH-02: Refresh session
  async refresh(rawRefreshToken: string) {
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    const stored = await this.refreshTokenRepo.findOne({
      where: { tokenHash, revoked: false },
      relations: ['user'],
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException({ code: 'SESSION_EXPIRED', message: 'Session expired. Please log in again.' });
    }
    if (!stored.user.isActive) {
      throw new ForbiddenException({ code: 'ACCOUNT_INACTIVE', message: 'Account deactivated.' });
    }
    // Revoke old token (sliding window rotation)
    stored.revoked = true;
    stored.revokedAt = new Date();
    await this.refreshTokenRepo.save(stored);

    const tokens = await this.issueTokens(stored.user);
    return tokens;
  }

  // AUTH-03: Logout
  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    await this.refreshTokenRepo.update({ tokenHash }, { revoked: true, revokedAt: new Date() });
  }

  // AUTH-04: Forgot password — always 200 to prevent enumeration
  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return; // Silent — prevent enumeration

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prtRepo.save(
      this.prtRepo.create({ userId: user.id, tokenHash, expiresAt, usedAt: null }),
    );

    // In production: send email with reset link containing rawToken
    // For dev: log the token so testers can use it
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Password reset token for ${email}: ${rawToken}`);
    }
  }

  // AUTH-04: Reset password
  async resetPassword(rawToken: string, newPassword: string, confirmPassword: string): Promise<void> {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException({ code: 'PASSWORD_MISMATCH', message: 'Passwords do not match.' });
    }
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const prt = await this.prtRepo.findOne({ where: { tokenHash }, relations: ['user'] });

    if (!prt) {
      throw new BadRequestException({ code: 'RESET_TOKEN_INVALID', message: 'Invalid or expired reset token.' });
    }
    if (prt.usedAt) {
      throw new BadRequestException({ code: 'RESET_TOKEN_USED', message: 'This reset link has already been used.' });
    }
    if (prt.expiresAt < new Date()) {
      throw new BadRequestException({ code: 'RESET_TOKEN_EXPIRED', message: 'Reset link has expired. Please request a new one.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.usersService.updatePasswordHash(prt.userId, passwordHash);

    // Mark token used + revoke all refresh tokens for user
    prt.usedAt = new Date();
    await this.prtRepo.save(prt);
    await this.refreshTokenRepo.update({ userId: prt.userId }, { revoked: true, revokedAt: new Date() });
  }
}

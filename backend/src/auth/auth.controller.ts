import {
  Controller, Post, Get, Body, Req, Res, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register — AUTH-01
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTS);
    return { user: result.user, accessToken: result.accessToken };
  }

  // POST /auth/login — AUTH-02
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTS);
    return { user: result.user, accessToken: result.accessToken };
  }

  // POST /auth/refresh — AUTH-02
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawRefresh = req.cookies?.refreshToken;
    if (!rawRefresh) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ code: 'SESSION_EXPIRED', message: 'No refresh token.' });
    }
    const tokens = await this.authService.refresh(rawRefresh);
    res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTS);
    return { accessToken: tokens.accessToken };
  }

  // POST /auth/logout — AUTH-03
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawRefresh = req.cookies?.refreshToken;
    if (rawRefresh) {
      await this.authService.logout(rawRefresh);
    }
    res.clearCookie('refreshToken', { httpOnly: true, path: '/' });
    return { message: 'Logged out.' };
  }

  // POST /auth/forgot-password — AUTH-04
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { message: 'If that email is registered, a reset link has been sent.' };
  }

  // POST /auth/reset-password — AUTH-04
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword, dto.confirmPassword);
    return { message: 'Password updated. Please log in with your new password.' };
  }

  // GET /auth/me — AUTH-05
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request) {
    return req.user;
  }
}

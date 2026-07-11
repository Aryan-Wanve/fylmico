import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request, Response } from "express";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser
} from "../common/guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { RequestPasswordResetDto } from "./dto/request-password-reset.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { SignupDto } from "./dto/signup.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { generateOpaqueToken } from "./token.util";

const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post("signup")
  async signup(@Body() dto: SignupDto) {
    const data = await this.authService.signup(
      dto.email,
      dto.password,
      dto.name
    );
    return { data };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto.email, dto.password);
    return { data };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto) {
    const data = await this.authService.refresh(dto.refreshToken);
    return { data };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: AuthenticatedUser) {
    await this.authService.logout(user.sessionId);
    return { data: { success: true } };
  }

  @Post("logout-all")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logoutAll(@CurrentUser() user: AuthenticatedUser) {
    await this.authService.logoutAll(user.id);
    return { data: { success: true } };
  }

  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto.token);
    return { data: { success: true } };
  }

  @Post("request-password-reset")
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    await this.authService.requestPasswordReset(dto.email);
    return { data: { success: true } };
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { data: { success: true } };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.authService.me(user.id);
    return { data };
  }

  @Get("google")
  googleAuth(@Res() res: Response) {
    const state = generateOpaqueToken();
    const url = this.authService.getGoogleAuthUrl(state);

    res.cookie(GOOGLE_OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 5 * 60 * 1000
    });
    res.redirect(url);
  }

  @Get("google/callback")
  async googleCallback(
    @Query("code") code: string | undefined,
    @Query("error") error: string | undefined,
    @Query("state") state: string | undefined,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const frontendUrl = this.frontendUrl;
    const expectedState = req.cookies?.[GOOGLE_OAUTH_STATE_COOKIE] as
      string | undefined;
    res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE);

    if (error || !code || !state || !expectedState || state !== expectedState) {
      res.redirect(`${frontendUrl}/login?error=google_oauth_failed`);
      return;
    }

    try {
      const { accessToken, refreshToken } =
        await this.authService.handleGoogleCallback(code);
      const params = new URLSearchParams({ accessToken, refreshToken });
      res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
    } catch {
      res.redirect(`${frontendUrl}/login?error=google_oauth_failed`);
    }
  }

  private get frontendUrl(): string {
    const corsOrigin = this.configService.get<string>(
      "CORS_ORIGIN",
      "http://localhost:3000"
    );
    return corsOrigin.split(",")[0].trim();
  }
}

import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService, type User } from "@fylmico/database";
import { toAvatarLabel } from "../common/avatar-label.util";
import { AppException } from "../common/exceptions/app.exception";
import { hashPassword, verifyPassword } from "./password.util";
import {
  addDuration,
  generateOpaqueToken,
  hashOpaqueToken
} from "./token.util";

const EMAIL_PROVIDER = "email";
const EMAIL_VERIFICATION_TTL = "24h";
const PASSWORD_RESET_TTL = "1h";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async signup(email: string, password: string, name: string) {
    const normalizedEmail = normalizeEmail(email);

    const existing = await this.prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: EMAIL_PROVIDER,
          providerAccountId: normalizedEmail
        }
      }
    });
    if (existing) {
      throw new AppException(
        HttpStatus.CONFLICT,
        "email_already_registered",
        "An account with this email already exists."
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        authAccounts: {
          create: {
            provider: EMAIL_PROVIDER,
            providerAccountId: normalizedEmail,
            passwordHash
          }
        }
      }
    });

    await this.issueEmailVerificationToken(user.id, normalizedEmail);
    const tokens = await this.issueSessionTokens(user);

    return { user: toPublicUser(user), ...tokens };
  }

  async login(email: string, password: string) {
    const normalizedEmail = normalizeEmail(email);

    const authAccount = await this.prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: EMAIL_PROVIDER,
          providerAccountId: normalizedEmail
        }
      },
      include: { user: true }
    });

    if (
      !authAccount?.passwordHash ||
      !(await verifyPassword(authAccount.passwordHash, password))
    ) {
      throw new AppException(
        HttpStatus.UNAUTHORIZED,
        "invalid_credentials",
        "Invalid email or password."
      );
    }

    const tokens = await this.issueSessionTokens(authAccount.user);
    return { user: toPublicUser(authAccount.user), ...tokens };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash: hashOpaqueToken(refreshToken) },
      include: { user: true }
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new AppException(
        HttpStatus.UNAUTHORIZED,
        "invalid_refresh_token",
        "Invalid or expired refresh token."
      );
    }

    const newRefreshToken = generateOpaqueToken();
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: hashOpaqueToken(newRefreshToken),
        expiresAt: addDuration(new Date(), this.refreshTtl)
      }
    });

    return {
      accessToken: await this.signAccessToken(session.user, session.id),
      refreshToken: newRefreshToken
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash: hashOpaqueToken(token) }
    });

    if (!record || record.consumedAt || record.expiresAt < new Date()) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_or_expired_token",
        "This verification link is invalid or has expired."
      );
    }

    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { consumedAt: new Date() }
      }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() }
      })
    ]);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    // Behave identically whether or not the account exists, to avoid leaking which emails are registered.
    if (!user) {
      return;
    }

    const token = generateOpaqueToken();
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashOpaqueToken(token),
        expiresAt: addDuration(new Date(), PASSWORD_RESET_TTL)
      }
    });

    this.logger.log(`Password reset token for ${normalizedEmail}: ${token}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashOpaqueToken(token) }
    });

    if (!record || record.consumedAt || record.expiresAt < new Date()) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_or_expired_token",
        "This password reset link is invalid or has expired."
      );
    }

    const authAccount = await this.prisma.authAccount.findFirst({
      where: { userId: record.userId, provider: EMAIL_PROVIDER }
    });
    if (!authAccount) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_or_expired_token",
        "This password reset link is invalid or has expired."
      );
    }

    const passwordHash = await hashPassword(newPassword);

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { consumedAt: new Date() }
      }),
      this.prisma.authAccount.update({
        where: { id: authAccount.id },
        data: { passwordHash }
      }),
      this.prisma.session.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() }
      })
    ]);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId }
    });
    return toPublicUser(user);
  }

  private async issueEmailVerificationToken(
    userId: string,
    email: string
  ): Promise<void> {
    const token = generateOpaqueToken();
    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: hashOpaqueToken(token),
        expiresAt: addDuration(new Date(), EMAIL_VERIFICATION_TTL)
      }
    });
    this.logger.log(`Email verification token for ${email}: ${token}`);
  }

  private async issueSessionTokens(user: User): Promise<TokenPair> {
    const refreshToken = generateOpaqueToken();
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashOpaqueToken(refreshToken),
        expiresAt: addDuration(new Date(), this.refreshTtl)
      }
    });

    return {
      accessToken: await this.signAccessToken(user, session.id),
      refreshToken
    };
  }

  private signAccessToken(user: User, sessionId: string): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      sid: sessionId,
      activeOrganizationId: user.activeOrganizationId
    });
  }

  private get refreshTtl(): string {
    return this.configService.get<string>("JWT_REFRESH_TTL", "30d");
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarLabel: toAvatarLabel(user.name),
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt
  };
}

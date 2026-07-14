import type { User } from "@fylmico/database";
import { toAvatarLabel } from "../avatar-label.util";
import { getEnv, getOptionalEnv } from "../env";
import { AppException, HttpStatus } from "../http";
import { sendMail } from "../mail/mailer";
import {
  buildPasswordResetEmail,
  buildVerificationEmail
} from "../mail/templates";
import { prisma } from "../prisma";
import { getPublicUrl, uploadObject } from "../storage/supabase-storage";
import {
  buildGoogleAuthUrl,
  exchangeGoogleCode,
  fetchGoogleUserInfo,
  GOOGLE_PROVIDER
} from "./google-oauth.util";
import { signAccessToken } from "./jwt";
import { hashPassword, verifyPassword } from "./password.util";
import {
  addDuration,
  generateOpaqueToken,
  generateOtp,
  hashOpaqueToken
} from "./token.util";

const EMAIL_PROVIDER = "email";
const OTP_TTL = "10m";
const MAX_OTP_ATTEMPTS = 5;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface SessionMeta {
  userAgent?: string;
  ipAddress?: string;
}

class AuthService {
  private readonly prisma = prisma;

  async signup(
    email: string,
    password: string,
    name: string
  ): Promise<{ email: string }> {
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

    await this.issueEmailVerificationOtp(user.id, normalizedEmail);

    return { email: normalizedEmail };
  }

  async login(email: string, password: string, meta?: SessionMeta) {
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

    if (!authAccount.user.emailVerifiedAt) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        "email_not_verified",
        "Please verify your email address before logging in."
      );
    }

    const tokens = await this.issueSessionTokens(authAccount.user, meta);
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
      accessToken: this.signAccessToken(session.user, session.id),
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

  async verifyEmail(email: string, code: string, meta?: SessionMeta) {
    const normalizedEmail = normalizeEmail(email);
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (!user) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_or_expired_code",
        "This code is invalid or has expired."
      );
    }
    if (user.emailVerifiedAt) {
      throw new AppException(
        HttpStatus.CONFLICT,
        "email_already_verified",
        "This email address is already verified. Please log in."
      );
    }

    const record = await this.prisma.emailVerificationToken.findFirst({
      where: { userId: user.id, consumedAt: null },
      orderBy: { createdAt: "desc" }
    });

    if (
      !record ||
      record.expiresAt < new Date() ||
      record.attempts >= MAX_OTP_ATTEMPTS
    ) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_or_expired_code",
        "This code is invalid or has expired. Request a new one."
      );
    }

    if (record.tokenHash !== hashOpaqueToken(code)) {
      await this.prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } }
      });
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_or_expired_code",
        "That code is incorrect."
      );
    }

    const [, updatedUser] = await this.prisma.$transaction([
      this.prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { consumedAt: new Date() }
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() }
      })
    ]);

    const tokens = await this.issueSessionTokens(updatedUser, meta);
    return { user: toPublicUser(updatedUser), ...tokens };
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    // Behave identically whether or not the account exists or is already
    // verified, to avoid leaking which emails are registered.
    if (!user || user.emailVerifiedAt) {
      return;
    }

    await this.issueEmailVerificationOtp(user.id, normalizedEmail);
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

    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: new Date() }
    });

    const otp = generateOtp();
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashOpaqueToken(otp),
        expiresAt: addDuration(new Date(), OTP_TTL)
      }
    });

    await sendMail(buildPasswordResetEmail(normalizedEmail, otp));
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (!user) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_or_expired_code",
        "This code is invalid or has expired."
      );
    }

    const record = await this.prisma.passwordResetToken.findFirst({
      where: { userId: user.id, consumedAt: null },
      orderBy: { createdAt: "desc" }
    });

    if (
      !record ||
      record.expiresAt < new Date() ||
      record.attempts >= MAX_OTP_ATTEMPTS
    ) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_or_expired_code",
        "This code is invalid or has expired. Request a new one."
      );
    }

    if (record.tokenHash !== hashOpaqueToken(code)) {
      await this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } }
      });
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_or_expired_code",
        "That code is incorrect."
      );
    }

    const authAccount = await this.prisma.authAccount.findFirst({
      where: { userId: user.id, provider: EMAIL_PROVIDER }
    });
    if (!authAccount) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_or_expired_code",
        "This code is invalid or has expired."
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

  getGoogleAuthUrl(state: string): string {
    const clientId = getOptionalEnv("GOOGLE_CLIENT_ID");
    if (!clientId) {
      throw new AppException(
        HttpStatus.SERVICE_UNAVAILABLE,
        "google_oauth_not_configured",
        "Google sign-in is not configured on this server."
      );
    }

    return buildGoogleAuthUrl({
      clientId,
      redirectUri: this.googleCallbackUrl,
      state
    });
  }

  async handleGoogleCallback(code: string, meta?: SessionMeta) {
    const clientId = getOptionalEnv("GOOGLE_CLIENT_ID");
    const clientSecret = getOptionalEnv("GOOGLE_CLIENT_SECRET");
    if (!clientId || !clientSecret) {
      throw new AppException(
        HttpStatus.SERVICE_UNAVAILABLE,
        "google_oauth_not_configured",
        "Google sign-in is not configured on this server."
      );
    }

    const tokenResponse = await exchangeGoogleCode({
      code,
      clientId,
      clientSecret,
      redirectUri: this.googleCallbackUrl
    });
    const profile = await fetchGoogleUserInfo(tokenResponse.access_token);

    if (!profile.email) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "google_account_missing_email",
        "This Google account has no accessible email address."
      );
    }

    const normalizedEmail = normalizeEmail(profile.email);

    let authAccount = await this.prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: GOOGLE_PROVIDER,
          providerAccountId: profile.sub
        }
      },
      include: { user: true }
    });

    if (!authAccount) {
      // A user may already exist via email/password signup with the same
      // address - link the Google account to that user rather than
      // creating a duplicate.
      const existingUser = await this.prisma.user.findUnique({
        where: { email: normalizedEmail }
      });

      const user =
        existingUser ??
        (await this.prisma.user.create({
          data: {
            email: normalizedEmail,
            name: profile.name?.trim() || normalizedEmail,
            emailVerifiedAt: profile.email_verified ? new Date() : null
          }
        }));

      if (
        existingUser &&
        profile.email_verified &&
        !existingUser.emailVerifiedAt
      ) {
        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: { emailVerifiedAt: new Date() }
        });
      }

      authAccount = await this.prisma.authAccount.create({
        data: {
          userId: user.id,
          provider: GOOGLE_PROVIDER,
          providerAccountId: profile.sub
        },
        include: { user: true }
      });
    }

    const tokens = await this.issueSessionTokens(authAccount.user, meta);
    return { user: toPublicUser(authAccount.user), ...tokens };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId }
    });
    return toPublicUser(user);
  }

  async updateMe(
    userId: string,
    updates: { name?: string; username?: string }
  ) {
    if (updates.username) {
      const existing = await this.prisma.user.findUnique({
        where: { username: updates.username }
      });
      if (existing && existing.id !== userId) {
        throw new AppException(
          HttpStatus.CONFLICT,
          "username_taken",
          "This username is already taken."
        );
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
        ...(updates.username !== undefined
          ? { username: updates.username }
          : {})
      }
    });
    return toPublicUser(user);
  }

  async updateAvatar(
    userId: string,
    file: { name: string; buffer: ArrayBuffer; mimeType: string }
  ) {
    const storagePath = `avatars/${userId}-${generateOpaqueToken().slice(0, 8)}-${file.name}`;
    await uploadObject(storagePath, file.buffer, file.mimeType);
    const avatarUrl = getPublicUrl(storagePath);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl }
    });
    return toPublicUser(user);
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: Array<{ id: string; email: boolean; push: boolean }>
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { notificationPreferences: preferences }
    });
    return toPublicUser(user);
  }

  async changePassword(
    userId: string,
    currentSessionId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const authAccount = await this.prisma.authAccount.findFirst({
      where: { userId, provider: EMAIL_PROVIDER }
    });

    if (
      !authAccount?.passwordHash ||
      !(await verifyPassword(authAccount.passwordHash, currentPassword))
    ) {
      throw new AppException(
        HttpStatus.UNAUTHORIZED,
        "invalid_credentials",
        "Current password is incorrect."
      );
    }

    const passwordHash = await hashPassword(newPassword);

    await this.prisma.$transaction([
      this.prisma.authAccount.update({
        where: { id: authAccount.id },
        data: { passwordHash }
      }),
      this.prisma.session.updateMany({
        where: {
          userId,
          revokedAt: null,
          id: { not: currentSessionId }
        },
        data: { revokedAt: new Date() }
      })
    ]);
  }

  async listSessions(userId: string, currentSessionId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" }
    });

    return sessions.map((session) => ({
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      current: session.id === currentSessionId,
      createdAt: session.createdAt
    }));
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId }
    });
    if (!session || session.userId !== userId) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "session_not_found",
        "This session does not exist."
      );
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    });
  }

  private async issueEmailVerificationOtp(
    userId: string,
    email: string
  ): Promise<void> {
    await this.prisma.emailVerificationToken.updateMany({
      where: { userId, consumedAt: null },
      data: { consumedAt: new Date() }
    });

    const otp = generateOtp();
    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: hashOpaqueToken(otp),
        expiresAt: addDuration(new Date(), OTP_TTL)
      }
    });
    await sendMail(buildVerificationEmail(email, otp));
  }

  private async issueSessionTokens(
    user: User,
    meta?: SessionMeta
  ): Promise<TokenPair> {
    const refreshToken = generateOpaqueToken();
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashOpaqueToken(refreshToken),
        userAgent: meta?.userAgent,
        ipAddress: meta?.ipAddress,
        expiresAt: addDuration(new Date(), this.refreshTtl)
      }
    });

    return {
      accessToken: this.signAccessToken(user, session.id),
      refreshToken
    };
  }

  private signAccessToken(user: User, sessionId: string): string {
    return signAccessToken({
      sub: user.id,
      sid: sessionId,
      activeOrganizationId: user.activeOrganizationId
    });
  }

  private get refreshTtl(): string {
    return getEnv("JWT_REFRESH_TTL", "30d");
  }

  private get googleCallbackUrl(): string {
    return getEnv(
      "GOOGLE_CALLBACK_URL",
      "http://localhost:3000/api/v1/auth/google/callback"
    );
  }
}

export const authService = new AuthService();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    avatarUrl: user.avatarUrl,
    avatarLabel: toAvatarLabel(user.name),
    notificationPreferences: user.notificationPreferences as Array<{
      id: string;
      email: boolean;
      push: boolean;
    }> | null,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt
  };
}

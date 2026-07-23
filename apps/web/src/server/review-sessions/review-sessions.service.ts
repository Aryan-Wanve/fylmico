import { Prisma } from "@fylmico/database";
import type { NextRequest } from "next/server";
import {
  addDuration,
  generateOpaqueToken,
  generateOtp,
  hashOpaqueToken
} from "../auth/token.util";
import { hashPassword, verifyPassword } from "../auth/password.util";
import { AppException, HttpStatus } from "../http";
import {
  buildClientReviewInviteEmail,
  buildReviewOtpEmail
} from "../mail/templates";
import { sendMail } from "../mail/mailer";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";
import { getClientIp, rateLimit } from "../rate-limit";
import { broadcast, deliverableReviewTopic } from "../realtime/broadcast";
import { notificationsService } from "../notifications/notifications.service";
import {
  reviewSessionCookieName,
  signReviewSessionCookie,
  verifyReviewSessionCookie
} from "./review-session-cookie";
import type { SendClientReviewDto } from "./dto/send-client-review.dto";

const MAX_OTP_ATTEMPTS = 5;
const OTP_TTL = "10m";

const reviewSessionInclude = {
  deliverable: {
    include: { fileEntry: true, project: true, client: true }
  }
} satisfies Prisma.ReviewSessionInclude;

type ReviewSessionWithDeliverable = Prisma.ReviewSessionGetPayload<{
  include: typeof reviewSessionInclude;
}>;

class ReviewSessionsService {
  private readonly prisma = prisma;

  async createAndSend(
    userId: string,
    deliverableId: string,
    dto: SendClientReviewDto
  ) {
    const deliverable = await this.prisma.deliverable.findUnique({
      where: { id: deliverableId },
      include: { fileEntry: true, project: true, client: true }
    });
    if (!deliverable) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "deliverable_not_found",
        "This deliverable does not exist."
      );
    }
    await organizationsService.requireManagerRole(
      deliverable.organizationId,
      userId,
      "send a review to a client"
    );

    const clientEmail = dto.clientEmail.trim().toLowerCase();

    // Superseding an existing invite rather than letting two live links for
    // the same deliverable exist at once - mirrors inviteMember's
    // revoke-then-create pattern for house invitations.
    await this.prisma.reviewSession.updateMany({
      where: {
        deliverableId,
        status: { in: ["pending", "viewed", "reviewing"] }
      },
      data: { status: "revoked" }
    });

    const token = generateOpaqueToken();
    const passwordHash = dto.password ? await hashPassword(dto.password) : null;

    const session = await this.prisma.reviewSession.create({
      data: {
        deliverableId,
        organizationId: deliverable.organizationId,
        clientEmail,
        tokenHash: hashOpaqueToken(token),
        subject: dto.subject,
        message: dto.message,
        includeProjectName: dto.includeProjectName ?? true,
        includeVideoVersion: dto.includeVideoVersion ?? true,
        includeNotes: dto.includeNotes ?? false,
        allowDownload: dto.allowDownload ?? false,
        allowFullscreen: dto.allowFullscreen ?? true,
        allowVersionSwitch: dto.allowVersionSwitch ?? false,
        passwordHash,
        expiresAt: addDuration(new Date(), dto.expiresIn),
        sentById: userId
      }
    });

    await sendMail(
      buildClientReviewInviteEmail(clientEmail, {
        reviewToken: token,
        projectName: dto.includeProjectName
          ? (deliverable.project?.name ?? undefined)
          : undefined,
        videoTitle: deliverable.fileEntry.name,
        version: dto.includeVideoVersion ? deliverable.version : undefined,
        message: dto.message,
        deadline: session.expiresAt.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        })
      })
    );

    await this.logActivity(
      deliverableId,
      { type: "user", id: userId },
      "review_sent",
      null,
      clientEmail
    );

    return {
      id: session.id,
      clientEmail: session.clientEmail,
      status: session.status,
      expiresAt: session.expiresAt.toISOString(),
      createdAt: session.createdAt.toISOString()
    };
  }

  async listForDeliverable(userId: string, deliverableId: string) {
    const deliverable = await this.prisma.deliverable.findUnique({
      where: { id: deliverableId }
    });
    if (!deliverable) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "deliverable_not_found",
        "This deliverable does not exist."
      );
    }
    await organizationsService.requireMembership(
      deliverable.organizationId,
      userId
    );

    const sessions = await this.prisma.reviewSession.findMany({
      where: { deliverableId },
      orderBy: { createdAt: "desc" }
    });

    return sessions.map((session) => ({
      id: session.id,
      clientEmail: session.clientEmail,
      status: session.status,
      expiresAt: session.expiresAt.toISOString(),
      firstViewedAt: session.firstViewedAt?.toISOString() ?? null,
      lastActivityAt: session.lastActivityAt?.toISOString() ?? null,
      approvedAt: session.approvedAt?.toISOString() ?? null,
      changesRequestedAt: session.changesRequestedAt?.toISOString() ?? null,
      createdAt: session.createdAt.toISOString()
    }));
  }

  // Public: no auth. Returns only opaque, session-scoped fields - never the
  // deliverableId/organizationId/storage paths a client has no business
  // seeing.
  async getPublicPreview(token: string) {
    const session = await this.findValidSession(token);

    return {
      subject: session.subject,
      message: session.message,
      status: session.status,
      expiresAt: session.expiresAt.toISOString(),
      requiresPassword: Boolean(session.passwordHash),
      projectName: session.includeProjectName
        ? (session.deliverable.project?.name ?? null)
        : null,
      videoTitle: session.deliverable.fileEntry.name,
      version: session.includeVideoVersion ? session.deliverable.version : null,
      clientEmailMasked: maskEmail(session.clientEmail)
    };
  }

  async verifyPassword(token: string, password: string): Promise<void> {
    const session = await this.findValidSession(token);
    if (!session.passwordHash) {
      return;
    }
    if (!(await verifyPassword(session.passwordHash, password))) {
      throw new AppException(
        HttpStatus.UNAUTHORIZED,
        "invalid_password",
        "That password is incorrect."
      );
    }
  }

  async requestOtp(token: string, request: NextRequest): Promise<void> {
    const session = await this.findValidSession(token);
    const ip = getClientIp(request);
    rateLimit(`review-otp:${session.id}:${ip}`, 5, 15 * 60_000);

    await this.prisma.reviewOtpToken.updateMany({
      where: { reviewSessionId: session.id, consumedAt: null },
      data: { consumedAt: new Date() }
    });

    const code = generateOtp();
    await this.prisma.reviewOtpToken.create({
      data: {
        reviewSessionId: session.id,
        codeHash: hashOpaqueToken(code),
        expiresAt: addDuration(new Date(), OTP_TTL)
      }
    });

    await sendMail(buildReviewOtpEmail(session.clientEmail, code));
  }

  async verifyOtp(
    token: string,
    code: string
  ): Promise<{ cookieName: string; cookieValue: string }> {
    const session = await this.findValidSession(token);

    const record = await this.prisma.reviewOtpToken.findFirst({
      where: { reviewSessionId: session.id, consumedAt: null },
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

    if (record.codeHash !== hashOpaqueToken(code)) {
      await this.prisma.reviewOtpToken.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } }
      });
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_or_expired_code",
        "That code is incorrect."
      );
    }

    const now = new Date();
    const isFirstView = session.status === "pending";
    await this.prisma.$transaction([
      this.prisma.reviewOtpToken.update({
        where: { id: record.id },
        data: { consumedAt: now }
      }),
      this.prisma.reviewSession.update({
        where: { id: session.id },
        data: {
          firstViewedAt: session.firstViewedAt ?? now,
          lastActivityAt: now,
          status: isFirstView ? "viewed" : session.status
        }
      })
    ]);

    await this.logActivity(
      session.deliverableId,
      { type: "client", label: session.clientEmail },
      "review_viewed"
    );

    if (isFirstView) {
      await broadcast(deliverableReviewTopic(session.deliverableId), "viewed", {
        reviewSessionId: session.id,
        status: "viewed"
      });
      if (session.deliverable.createdById !== session.sentById) {
        await notificationsService.create(
          session.deliverable.createdById,
          "review_client_viewed",
          `Client viewed: v${session.deliverable.version}`,
          `${session.clientEmail} opened the review link.`
        );
      }
    }

    return {
      cookieName: reviewSessionCookieName(session.id),
      cookieValue: signReviewSessionCookie({
        reviewSessionId: session.id,
        clientEmail: session.clientEmail
      })
    };
  }

  // The gate every public content/action route calls. Cookie absence,
  // mismatch, or an expired/revoked session all fail the same way (no
  // distinction leaked to the caller beyond "not verified").
  async requireVerifiedSession(
    token: string,
    cookieValue: string | undefined
  ): Promise<ReviewSessionWithDeliverable> {
    const session = await this.findValidSession(token);

    if (!cookieValue) {
      throw new AppException(
        HttpStatus.UNAUTHORIZED,
        "otp_required",
        "Please verify the access code sent to your email."
      );
    }

    const claims = verifyReviewSessionCookie(cookieValue);
    if (
      !claims ||
      claims.reviewSessionId !== session.id ||
      claims.clientEmail !== session.clientEmail
    ) {
      throw new AppException(
        HttpStatus.UNAUTHORIZED,
        "otp_required",
        "Please verify the access code sent to your email."
      );
    }

    return session;
  }

  async findValidSession(token: string): Promise<ReviewSessionWithDeliverable> {
    const session = await this.prisma.reviewSession.findUnique({
      where: { tokenHash: hashOpaqueToken(token) },
      include: reviewSessionInclude
    });
    if (!session) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "review_link_not_found",
        "This review link does not exist."
      );
    }
    if (session.status === "revoked") {
      throw new AppException(
        HttpStatus.GONE,
        "review_link_revoked",
        "This review link is no longer valid."
      );
    }
    if (session.expiresAt < new Date()) {
      if (session.status !== "expired") {
        await this.prisma.reviewSession.update({
          where: { id: session.id },
          data: { status: "expired" }
        });
        await this.logActivity(
          session.deliverableId,
          { type: "client", label: session.clientEmail },
          "review_expired"
        );
        await broadcast(
          deliverableReviewTopic(session.deliverableId),
          "expired",
          { reviewSessionId: session.id, status: "expired" }
        );
        if (session.deliverable.createdById !== session.sentById) {
          await notificationsService.create(
            session.deliverable.createdById,
            "review_link_expired",
            `Review link expired: v${session.deliverable.version}`,
            `The review link sent to ${session.clientEmail} has expired.`
          );
        }
      }
      throw new AppException(
        HttpStatus.GONE,
        "review_link_expired",
        "This review link has expired."
      );
    }
    return session;
  }

  async logActivity(
    deliverableId: string,
    actor: { type: "user"; id: string } | { type: "client"; label: string },
    type: string,
    fromValue: string | null = null,
    toValue: string | null = null
  ): Promise<void> {
    try {
      await this.prisma.deliverableActivity.create({
        data: {
          deliverableId,
          actorId: actor.type === "user" ? actor.id : null,
          actorType: actor.type,
          actorLabel: actor.type === "client" ? actor.label : null,
          type,
          fromValue,
          toValue
        }
      });
    } catch (error) {
      console.error("[review-sessions] could not log activity", error);
    }
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || local.length <= 2) {
    return `***@${domain ?? ""}`;
  }
  return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

export const reviewSessionsService = new ReviewSessionsService();

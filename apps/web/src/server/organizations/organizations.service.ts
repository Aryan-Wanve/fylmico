import type {
  HouseInvitation,
  HouseJoinRequest,
  Prisma
} from "@fylmico/database";
import { toAvatarLabel } from "../avatar-label.util";
import {
  addDuration,
  generateOpaqueToken,
  hashOpaqueToken
} from "../auth/token.util";
import { getEnv } from "../env";
import { driveStructureService } from "../drive/drive-structure.service";
import { AppException, HttpStatus } from "../http";
import { HOUSE_TYPE_DEFAULT_MODULES, type HouseType } from "@/lib/house-types";
import { PERMISSION_PRESETS } from "@/lib/permissions";
import { sendMail } from "../mail/mailer";
import { buildJoinRequestEmail } from "../mail/templates";
import { notificationsService } from "../notifications/notifications.service";
import { prisma } from "../prisma";
import type { AssignRoleDto } from "./dto/assign-role.dto";
import type { CreateHouseDto } from "./dto/create-house.dto";
import type { InviteMemberDto } from "./dto/invite-member.dto";
import type { JoinHouseDto } from "./dto/join-house.dto";
import type { RequestJoinHouseDto } from "./dto/request-join-house.dto";
import type { UpdateHouseDto } from "./dto/update-house.dto";

const INVITATION_TTL = "7d";
const BASIC_PERMISSIONS = ["view_projects", "view_files"];

const DEFAULT_ROLES = [
  {
    name: "Owner",
    color: "#654cff",
    description: "Controls house settings, roles, invites, and billing.",
    permissions: PERMISSION_PRESETS.Owner
  },
  {
    name: "Producer",
    color: "#16c784",
    description: "Plans shoots, schedules tasks, and coordinates delivery.",
    permissions: PERMISSION_PRESETS.Producer
  },
  {
    name: "Editor",
    color: "#3b82f6",
    description: "Owns cuts, revisions, timelines, and final exports.",
    permissions: PERMISSION_PRESETS.Editor
  },
  {
    name: "Videographer",
    color: "#f97316",
    description: "Handles shoot capture, camera plans, and footage handoff.",
    permissions: BASIC_PERMISSIONS
  },
  {
    name: "Photographer",
    color: "#8b5cf6",
    description: "Covers stills, thumbnails, BTS, and campaign images.",
    permissions: BASIC_PERMISSIONS
  }
];

const DEFAULT_CONVERSATIONS = [
  { name: "general", topic: "Daily coordination and house-wide updates." },
  { name: "edit-bay", topic: "Cuts, revisions, exports, and feedback." },
  { name: "shoot-floor", topic: "On-set coordination and capture notes." }
];

const houseInclude = {
  roles: true,
  memberships: { include: { user: true, role: true } }
} satisfies Prisma.OrganizationInclude;

type OrganizationWithRelations = Prisma.OrganizationGetPayload<{
  include: typeof houseInclude;
}>;

class OrganizationsService {
  private readonly prisma = prisma;

  async createHouse(userId: string, dto: CreateHouseDto) {
    const existingHandle = await this.prisma.organization.findUnique({
      where: { handle: dto.handle }
    });
    if (existingHandle) {
      throw new AppException(
        HttpStatus.CONFLICT,
        "handle_unavailable",
        "This handle is already taken."
      );
    }

    const inviteCode = await this.generateUniqueInviteCode(dto.handle);
    const description =
      dto.description?.trim() || "A new creative production house.";

    const organization = await this.prisma.organization.create({
      data: {
        name: dto.name.trim(),
        handle: dto.handle,
        description,
        inviteCode,
        type: dto.houseType,
        enabledModules: HOUSE_TYPE_DEFAULT_MODULES[dto.houseType],
        roles: { create: DEFAULT_ROLES },
        conversations: { create: DEFAULT_CONVERSATIONS }
      },
      include: { roles: true }
    });

    const ownerRole = organization.roles.find((role) => role.name === "Owner");
    if (!ownerRole) {
      throw new Error("Owner role was not seeded for the new house.");
    }

    await this.prisma.organizationMembership.create({
      data: { organizationId: organization.id, userId, roleId: ownerRole.id }
    });
    await this.seedCrewProfile(organization.id, userId, ownerRole.name);
    await this.setActiveOrganization(userId, organization.id);

    return this.getHouseDto(organization.id, userId);
  }

  async updateHouse(
    organizationId: string,
    userId: string,
    dto: UpdateHouseDto
  ) {
    await this.requireMembership(organizationId, userId);

    if (dto.handle) {
      const existingHandle = await this.prisma.organization.findUnique({
        where: { handle: dto.handle }
      });
      if (existingHandle && existingHandle.id !== organizationId) {
        throw new AppException(
          HttpStatus.CONFLICT,
          "handle_unavailable",
          "This handle is already taken."
        );
      }
    }

    if (dto.enabledModules !== undefined) {
      await this.requireOwnerRole(
        organizationId,
        userId,
        "change enabled modules"
      );
    }

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.handle !== undefined ? { handle: dto.handle } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() }
          : {}),
        ...(dto.enabledModules !== undefined
          ? { enabledModules: dto.enabledModules }
          : {})
      }
    });

    return this.getHouseDto(organizationId, userId);
  }

  async joinHouse(userId: string, dto: JoinHouseDto) {
    const organization = await this.findOrganizationByInviteCode(
      dto.inviteCode
    );

    await this.addMembership(organization.id, organization.name, userId);
    return this.getHouseDto(organization.id, userId);
  }

  async activateHouse(userId: string, organizationId: string) {
    await this.requireAnyMembership(organizationId, userId);
    await this.setActiveOrganization(userId, organizationId);
  }

  async requestToJoinHouse(userId: string, dto: RequestJoinHouseDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { handle: dto.handle.trim().toLowerCase() }
    });
    if (!organization) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "house_not_found",
        "No house exists with that tag."
      );
    }

    const existingMembership =
      await this.prisma.organizationMembership.findUnique({
        where: {
          organizationId_userId: { organizationId: organization.id, userId }
        }
      });
    if (existingMembership) {
      throw new AppException(
        HttpStatus.CONFLICT,
        "already_member",
        "You are already a member of this house."
      );
    }

    const existingRequest = await this.prisma.houseJoinRequest.findUnique({
      where: {
        organizationId_userId: { organizationId: organization.id, userId }
      }
    });
    if (existingRequest?.status === "pending") {
      throw new AppException(
        HttpStatus.CONFLICT,
        "request_pending",
        "You already have a pending request to join this house."
      );
    }

    if (existingRequest) {
      await this.prisma.houseJoinRequest.update({
        where: { id: existingRequest.id },
        data: { status: "pending", respondedById: null, respondedAt: null }
      });
    } else {
      await this.prisma.houseJoinRequest.create({
        data: { organizationId: organization.id, userId }
      });
    }

    const requester = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId }
    });
    await this.notifyOwners(
      organization.id,
      "house_join_request",
      `${requester.name} wants to join ${organization.name}`,
      `${requester.name} asked to join ${organization.name}. Review the request from your dashboard.`
    );
    await this.emailOwners(organization.id, (ownerEmail) =>
      buildJoinRequestEmail(ownerEmail, requester.name, organization.name)
    );

    return { status: "pending" as const };
  }

  async listJoinRequests(organizationId: string, userId: string) {
    await this.requireOwnerRole(organizationId, userId, "view join requests");

    const requests = await this.prisma.houseJoinRequest.findMany({
      where: { organizationId, status: "pending" },
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });

    return requests.map(toJoinRequestDto);
  }

  async respondToJoinRequest(
    organizationId: string,
    userId: string,
    requestId: string,
    status: "approved" | "rejected"
  ) {
    await this.requireOwnerRole(organizationId, userId, "review join requests");

    const request = await this.prisma.houseJoinRequest.findUnique({
      where: { id: requestId }
    });
    if (!request || request.organizationId !== organizationId) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "join_request_not_found",
        "This join request does not exist."
      );
    }
    if (request.status !== "pending") {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "This request has already been reviewed."
      );
    }

    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { id: organizationId }
    });
    const approve = status === "approved";

    await this.prisma.houseJoinRequest.update({
      where: { id: requestId },
      data: { status, respondedById: userId, respondedAt: new Date() }
    });

    if (approve) {
      await this.addMembership(
        organizationId,
        organization.name,
        request.userId
      );
    }

    await notificationsService.create(
      request.userId,
      approve ? "house_join_approved" : "house_join_rejected",
      approve
        ? `You're in ${organization.name}!`
        : `Your request to join ${organization.name} was declined`,
      approve
        ? `Your request to join ${organization.name} was approved.`
        : `Your request to join ${organization.name} was declined by the house owner.`,
      organizationId
    );
  }

  async getInviteCodePreview(inviteCode: string) {
    const organization = await this.findOrganizationByInviteCode(inviteCode);
    const memberCount = await this.prisma.organizationMembership.count({
      where: { organizationId: organization.id }
    });

    return {
      houseName: organization.name,
      houseDescription: organization.description,
      memberCount
    };
  }

  buildInviteCodeUrl(inviteCode: string): string {
    return `${this.appUrl}/houses/join/${inviteCode}`;
  }

  private async findOrganizationByInviteCode(inviteCode: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { inviteCode: inviteCode.trim() }
    });
    if (!organization) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "invite_not_found",
        "This invite code is not valid."
      );
    }
    return organization;
  }

  async inviteMember(
    organizationId: string,
    inviterUserId: string,
    dto: InviteMemberDto
  ) {
    await this.requireMembership(organizationId, inviterUserId);
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      const existingMembership =
        await this.prisma.organizationMembership.findUnique({
          where: {
            organizationId_userId: { organizationId, userId: existingUser.id }
          }
        });
      if (existingMembership) {
        throw new AppException(
          HttpStatus.CONFLICT,
          "already_member",
          "This person is already a member of this house."
        );
      }
    }

    await this.prisma.houseInvitation.updateMany({
      where: { organizationId, email, status: "pending" },
      data: { status: "revoked" }
    });

    const token = generateOpaqueToken();
    const invitation = await this.prisma.houseInvitation.create({
      data: {
        organizationId,
        email,
        tokenHash: hashOpaqueToken(token),
        invitedById: inviterUserId,
        expiresAt: addDuration(new Date(), INVITATION_TTL)
      }
    });

    const inviteUrl = `${this.appUrl}/houses/invite/${token}`;
    return toInvitationDto(invitation, inviteUrl);
  }

  async listInvitations(organizationId: string, userId: string) {
    await this.requireMembership(organizationId, userId);

    const invitations = await this.prisma.houseInvitation.findMany({
      where: { organizationId, status: "pending" },
      orderBy: { createdAt: "desc" }
    });

    return invitations.map((invitation) => toInvitationDto(invitation));
  }

  async revokeInvitation(
    organizationId: string,
    userId: string,
    invitationId: string
  ): Promise<void> {
    await this.requireMembership(organizationId, userId);

    const invitation = await this.prisma.houseInvitation.findUnique({
      where: { id: invitationId }
    });
    if (!invitation || invitation.organizationId !== organizationId) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "invitation_not_found",
        "This invitation does not exist."
      );
    }
    if (invitation.status !== "pending") {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "This invitation is no longer pending."
      );
    }

    await this.prisma.houseInvitation.update({
      where: { id: invitationId },
      data: { status: "revoked" }
    });
  }

  async getInvitationPreview(token: string) {
    const invitation = await this.findValidInvitation(token);

    const [organization, invitedBy] = await Promise.all([
      this.prisma.organization.findUniqueOrThrow({
        where: { id: invitation.organizationId }
      }),
      this.prisma.user.findUniqueOrThrow({
        where: { id: invitation.invitedById }
      })
    ]);

    return {
      houseName: organization.name,
      houseDescription: organization.description,
      email: invitation.email,
      invitedByName: invitedBy.name,
      expiresAt: invitation.expiresAt
    };
  }

  async acceptInvitation(userId: string, token: string) {
    const invitation = await this.findValidInvitation(token);

    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { id: invitation.organizationId }
    });

    await this.addMembership(organization.id, organization.name, userId);

    await this.prisma.houseInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "accepted",
        acceptedById: userId,
        acceptedAt: new Date()
      }
    });

    // notifyOwnersOfNewMember (inside addMembership) already covers Owners,
    // but the person who sent this specific invite might not be one - they
    // still want to know their invite landed.
    if (invitation.invitedById !== userId) {
      const [invitee, ownerRole] = await Promise.all([
        this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
        this.prisma.role.findUnique({
          where: {
            organizationId_name: {
              organizationId: organization.id,
              name: "Owner"
            }
          }
        })
      ]);
      const inviterIsOwner = ownerRole
        ? await this.prisma.organizationMembership
            .findUnique({
              where: {
                organizationId_userId: {
                  organizationId: organization.id,
                  userId: invitation.invitedById
                }
              }
            })
            .then((membership) => membership?.roleId === ownerRole.id)
        : false;

      if (!inviterIsOwner) {
        await notificationsService.create(
          invitation.invitedById,
          "invitation_accepted",
          `${invitee.name} accepted your invite`,
          `${invitee.name} joined ${organization.name} using the invite you sent to ${invitation.email}.`,
          organization.id
        );
      }
    }

    return this.getHouseDto(organization.id, userId);
  }

  async leaveHouse(userId: string, organizationId: string): Promise<void> {
    await this.requireAnyMembership(organizationId, userId);

    const memberCount = await this.prisma.organizationMembership.count({
      where: { organizationId }
    });
    if (memberCount <= 1) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "You are the only member of this house. Add another member before leaving."
      );
    }

    await this.prisma.$transaction([
      this.prisma.organizationMembership.delete({
        where: { organizationId_userId: { organizationId, userId } }
      }),
      this.prisma.crewProfile.deleteMany({
        where: { organizationId, userId }
      })
    ]);

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId }
    });
    if (user.activeOrganizationId === organizationId) {
      const nextMembership = await this.prisma.organizationMembership.findFirst(
        {
          where: { userId }
        }
      );
      await this.prisma.user.update({
        where: { id: userId },
        data: { activeOrganizationId: nextMembership?.organizationId ?? null }
      });
    }
  }

  private async findValidInvitation(token: string) {
    const invitation = await this.prisma.houseInvitation.findUnique({
      where: { tokenHash: hashOpaqueToken(token) }
    });
    if (!invitation) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "invitation_not_found",
        "This invitation does not exist."
      );
    }
    if (invitation.status !== "pending" || invitation.expiresAt < new Date()) {
      throw new AppException(
        HttpStatus.GONE,
        "invitation_expired",
        "This invitation is no longer valid."
      );
    }
    return invitation;
  }

  private async addMembership(
    organizationId: string,
    organizationName: string,
    userId: string
  ): Promise<void> {
    const existingMembership =
      await this.prisma.organizationMembership.findUnique({
        where: { organizationId_userId: { organizationId, userId } }
      });
    if (existingMembership) {
      throw new AppException(
        HttpStatus.CONFLICT,
        "already_member",
        "You are already a member of this house."
      );
    }

    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { id: organizationId }
    });
    if (organization.bannedUserIds.includes(userId)) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        "banned_from_house",
        "You have been banned from this house."
      );
    }

    // No role yet - an admin must assign one (Position/Team/Permissions)
    // before this member gets any access. See requireMembership below.
    await this.prisma.organizationMembership.create({
      data: { organizationId, userId, roleId: null }
    });
    await this.setActiveOrganization(userId, organizationId);
    await this.notifyOwnersOfNewMember(
      organizationId,
      organizationName,
      userId
    );

    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId }
      });
      await driveStructureService.ensureEmployeeFolder(
        organizationId,
        userId,
        user.name
      );
    } catch (error) {
      console.error(
        "[organizations] could not create Drive Employee Work folder",
        error
      );
    }
  }

  private get appUrl(): string {
    return getEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  }

  private async notifyOwnersOfNewMember(
    organizationId: string,
    organizationName: string,
    joiningUserId: string
  ): Promise<void> {
    const joiningUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: joiningUserId }
    });

    await this.notifyOwners(
      organizationId,
      "house_joined",
      `${joiningUser.name} joined ${organizationName}`,
      `${joiningUser.name} joined ${organizationName} and is waiting for a role.`,
      joiningUserId
    );
  }

  // Notifies every member holding the "Owner" role in a house - used for
  // events that don't have one obvious individual recipient (new members,
  // new bookings). `excludeUserId` skips notifying whoever triggered the
  // event even if they're an Owner themselves.
  async notifyOwners(
    organizationId: string,
    type: string,
    title: string,
    body: string,
    excludeUserId?: string
  ): Promise<void> {
    const ownerRole = await this.prisma.role.findUnique({
      where: { organizationId_name: { organizationId, name: "Owner" } }
    });
    if (!ownerRole) {
      return;
    }

    const owners = await this.prisma.organizationMembership.findMany({
      where: { organizationId, roleId: ownerRole.id },
      select: { userId: true }
    });

    await Promise.all(
      owners
        .filter((owner) => owner.userId !== excludeUserId)
        .map((owner) =>
          notificationsService.create(
            owner.userId,
            type,
            title,
            body,
            organizationId
          )
        )
    );
  }

  private async emailOwners(
    organizationId: string,
    buildMessage: (ownerEmail: string) => Parameters<typeof sendMail>[0]
  ): Promise<void> {
    const ownerRole = await this.prisma.role.findUnique({
      where: { organizationId_name: { organizationId, name: "Owner" } }
    });
    if (!ownerRole) {
      return;
    }

    const owners = await this.prisma.organizationMembership.findMany({
      where: { organizationId, roleId: ownerRole.id },
      include: { user: true }
    });

    await Promise.all(
      owners.map((owner) => sendMail(buildMessage(owner.user.email)))
    );
  }

  private async seedCrewProfile(
    organizationId: string,
    userId: string,
    jobTitle: string
  ): Promise<void> {
    await this.prisma.crewProfile.create({
      data: { organizationId, userId, jobTitle }
    });
  }

  async removeMember(
    organizationId: string,
    requestingUserId: string,
    targetUserId: string
  ): Promise<void> {
    await this.requireOwnerRole(
      organizationId,
      requestingUserId,
      "remove members"
    );
    await this.requireMembership(organizationId, targetUserId);

    if (requestingUserId === targetUserId) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        'Use "Leave house" to remove yourself.'
      );
    }

    const memberCount = await this.prisma.organizationMembership.count({
      where: { organizationId }
    });
    if (memberCount <= 1) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "Cannot remove the last member of a house."
      );
    }

    await this.prisma.$transaction([
      this.prisma.organizationMembership.delete({
        where: {
          organizationId_userId: { organizationId, userId: targetUserId }
        }
      }),
      this.prisma.crewProfile.deleteMany({
        where: { organizationId, userId: targetUserId }
      })
    ]);
  }

  private async setActiveOrganization(
    userId: string,
    organizationId: string
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { activeOrganizationId: organizationId }
    });
  }

  private async generateUniqueInviteCode(handle: string): Promise<string> {
    const prefix = handle.slice(0, 4).toUpperCase();

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = `${prefix}-${Math.floor(1000 + Math.random() * 8999)}`;
      const existing = await this.prisma.organization.findUnique({
        where: { inviteCode: candidate }
      });
      if (!existing) {
        return candidate;
      }
    }

    throw new Error("Failed to generate a unique invite code.");
  }

  async requireOwnerRole(
    organizationId: string,
    userId: string,
    action = "do this"
  ) {
    const membership = await this.prisma.organizationMembership.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
      include: { role: true }
    });
    if (!membership || membership.role?.name !== "Owner") {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        "forbidden",
        `Only house owners can ${action}.`
      );
    }
    return membership;
  }

  // Owner or Admin - the gate for manager-level actions (review approvals,
  // reassignment, ...) that shouldn't be limited to the Owner alone but
  // also aren't part of the 19-key custom permission system.
  async requireManagerRole(
    organizationId: string,
    userId: string,
    action = "do this"
  ) {
    const membership = await this.prisma.organizationMembership.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
      include: { role: true }
    });
    if (
      !membership ||
      (membership.role?.name !== "Owner" && membership.role?.name !== "Admin")
    ) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        "forbidden",
        `Only owners and admins can ${action}.`
      );
    }
    return membership;
  }

  // The access gate every domain service (tasks, chat, files, projects,
  // crews, ...) calls - requires a role to have been assigned, so a
  // pending member (joined, awaiting an admin's role assignment) gets no
  // data access anywhere until that happens.
  async requireMembership(organizationId: string, userId: string) {
    const membership = await this.prisma.organizationMembership.findUnique({
      where: { organizationId_userId: { organizationId, userId } }
    });
    if (!membership || !membership.roleId) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        "forbidden",
        "You are not an active member of this house."
      );
    }
    return membership;
  }

  // Pending-or-active - only for the handful of calls a member must be
  // able to make before a role exists (switching which house is active,
  // leaving a house they haven't been approved into yet).
  async requireAnyMembership(organizationId: string, userId: string) {
    const membership = await this.prisma.organizationMembership.findUnique({
      where: { organizationId_userId: { organizationId, userId } }
    });
    if (!membership) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        "forbidden",
        "You are not a member of this house."
      );
    }
    return membership;
  }

  async requirePermission(
    organizationId: string,
    userId: string,
    permission: string,
    action = "do this"
  ) {
    const membership = await this.prisma.organizationMembership.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
      include: { role: true }
    });
    const allowed =
      membership?.role?.name === "Owner" ||
      Boolean(membership?.role?.permissions.includes(permission));
    if (!allowed) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        "forbidden",
        `You don't have permission to ${action}.`
      );
    }
    return membership;
  }

  async checkHandleAvailability(handle: string): Promise<boolean> {
    const existing = await this.prisma.organization.findUnique({
      where: { handle: handle.trim().toLowerCase() }
    });
    return !existing;
  }

  async assignRole(
    organizationId: string,
    approverUserId: string,
    membershipId: string,
    dto: AssignRoleDto
  ) {
    await this.requirePermission(
      organizationId,
      approverUserId,
      "approve_members",
      "assign roles"
    );

    const membership = await this.getPendingMembership(
      organizationId,
      membershipId
    );

    const roleName = dto.roleName.trim();
    const role = await this.prisma.role.upsert({
      where: { organizationId_name: { organizationId, name: roleName } },
      create: {
        organizationId,
        name: roleName,
        color: "#654cff",
        description: "",
        permissions: dto.permissions
      },
      update: { permissions: dto.permissions }
    });

    await this.prisma.organizationMembership.update({
      where: { id: membership.id },
      data: { roleId: role.id }
    });
    await this.prisma.crewProfile.upsert({
      where: {
        organizationId_userId: { organizationId, userId: membership.userId }
      },
      create: {
        organizationId,
        userId: membership.userId,
        jobTitle: roleName,
        department: dto.team.trim() || "Production"
      },
      update: {
        jobTitle: roleName,
        department: dto.team.trim() || "Production"
      }
    });

    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { id: organizationId }
    });
    await notificationsService.create(
      membership.userId,
      "member_role_assigned",
      `You're in ${organization.name}!`,
      `You were assigned ${roleName} in ${organization.name}. Your workspace is ready.`,
      organizationId
    );

    return this.getHouseDto(organizationId, approverUserId);
  }

  async rejectPendingMember(
    organizationId: string,
    approverUserId: string,
    membershipId: string
  ) {
    await this.requirePermission(
      organizationId,
      approverUserId,
      "approve_members",
      "reject members"
    );
    const membership = await this.getPendingMembership(
      organizationId,
      membershipId
    );
    await this.prisma.organizationMembership.delete({
      where: { id: membership.id }
    });
    return this.getHouseDto(organizationId, approverUserId);
  }

  async banPendingMember(
    organizationId: string,
    approverUserId: string,
    membershipId: string
  ) {
    await this.requirePermission(
      organizationId,
      approverUserId,
      "approve_members",
      "ban members"
    );
    const membership = await this.getPendingMembership(
      organizationId,
      membershipId
    );
    await this.prisma.$transaction([
      this.prisma.organizationMembership.delete({
        where: { id: membership.id }
      }),
      this.prisma.organization.update({
        where: { id: organizationId },
        data: { bannedUserIds: { push: membership.userId } }
      })
    ]);
    return this.getHouseDto(organizationId, approverUserId);
  }

  private async getPendingMembership(
    organizationId: string,
    membershipId: string
  ) {
    const membership = await this.prisma.organizationMembership.findUnique({
      where: { id: membershipId }
    });
    if (
      !membership ||
      membership.organizationId !== organizationId ||
      membership.roleId
    ) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "pending_member_not_found",
        "This pending member does not exist."
      );
    }
    return membership;
  }

  async getHousesForUser(userId: string) {
    const memberships = await this.prisma.organizationMembership.findMany({
      where: { userId },
      select: { organizationId: true }
    });

    if (memberships.length === 0) {
      return [];
    }

    const organizationIds = memberships.map((m) => m.organizationId);

    // Batched into a single query rather than one findUnique per house -
    // this runs on every authenticated page load via GET /workspace.
    const organizations = await this.prisma.organization.findMany({
      where: { id: { in: organizationIds } },
      include: houseInclude
    });

    const aggregates = await this.getStorageAndActivity(organizationIds);

    return organizations
      .map((organization) => ({
        ...toHouseDto(organization, userId),
        ...(aggregates.get(organization.id) ?? {
          storageBytes: 0,
          lastActivityAt: null
        })
      }))
      .sort(compareHouses);
  }

  async toggleFavorite(organizationId: string, userId: string) {
    return this.toggleMembershipFlag(organizationId, userId, "favoritedAt");
  }

  async togglePin(organizationId: string, userId: string) {
    return this.toggleMembershipFlag(organizationId, userId, "pinnedAt");
  }

  async toggleArchive(organizationId: string, userId: string) {
    return this.toggleMembershipFlag(organizationId, userId, "archivedAt");
  }

  async reorderHouses(
    userId: string,
    organizationIds: string[]
  ): Promise<void> {
    await this.prisma.$transaction(
      organizationIds.map((organizationId, index) =>
        this.prisma.organizationMembership.updateMany({
          where: { organizationId, userId },
          data: { order: index }
        })
      )
    );
  }

  private async toggleMembershipFlag(
    organizationId: string,
    userId: string,
    field: "favoritedAt" | "pinnedAt" | "archivedAt"
  ) {
    const membership = await this.requireMembership(organizationId, userId);
    await this.prisma.organizationMembership.update({
      where: { id: membership.id },
      data: { [field]: membership[field] ? null : new Date() }
    });
    return this.getHouseDto(organizationId, userId);
  }

  private async getStorageAndActivity(
    organizationIds: string[]
  ): Promise<
    Map<string, { storageBytes: number; lastActivityAt: string | null }>
  > {
    const [storage, activity] = await Promise.all([
      this.prisma.fileEntry.groupBy({
        by: ["organizationId"],
        where: { organizationId: { in: organizationIds } },
        _sum: { size: true }
      }),
      this.prisma.task.groupBy({
        by: ["organizationId"],
        where: { organizationId: { in: organizationIds } },
        _max: { updatedAt: true }
      })
    ]);

    const result = new Map<
      string,
      { storageBytes: number; lastActivityAt: string | null }
    >();
    for (const organizationId of organizationIds) {
      result.set(organizationId, { storageBytes: 0, lastActivityAt: null });
    }
    for (const row of storage) {
      const entry = result.get(row.organizationId);
      if (entry) {
        entry.storageBytes = row._sum.size ?? 0;
      }
    }
    for (const row of activity) {
      const entry = result.get(row.organizationId);
      if (entry && row._max.updatedAt) {
        entry.lastActivityAt = row._max.updatedAt.toISOString();
      }
    }
    return result;
  }

  private async getHouseDto(organizationId: string, requestingUserId: string) {
    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { id: organizationId },
      include: houseInclude
    });
    const aggregates = await this.getStorageAndActivity([organizationId]);
    return {
      ...toHouseDto(organization, requestingUserId),
      ...(aggregates.get(organizationId) ?? {
        storageBytes: 0,
        lastActivityAt: null
      })
    };
  }
}

export const organizationsService = new OrganizationsService();

function toHouseDto(
  organization: OrganizationWithRelations,
  requestingUserId: string
) {
  const activeMemberships = organization.memberships.filter(
    (membership) => membership.roleId && membership.role
  );
  const pendingMemberships = organization.memberships.filter(
    (membership) => !membership.roleId
  );

  const memberCountByRoleId = new Map<string, number>();
  for (const membership of activeMemberships) {
    memberCountByRoleId.set(
      membership.roleId as string,
      (memberCountByRoleId.get(membership.roleId as string) ?? 0) + 1
    );
  }

  const myMembership = organization.memberships.find(
    (membership) => membership.userId === requestingUserId
  );
  const canApproveMembers =
    myMembership?.role?.name === "Owner" ||
    Boolean(myMembership?.role?.permissions.includes("approve_members"));

  return {
    id: organization.id,
    name: organization.name,
    handle: organization.handle,
    description: organization.description,
    inviteCode: organization.inviteCode,
    type: organization.type as HouseType,
    enabledModules: organization.enabledModules,
    myRole: myMembership?.role?.name ?? null,
    isFavorite: Boolean(myMembership?.favoritedAt),
    isPinned: Boolean(myMembership?.pinnedAt),
    isArchived: Boolean(myMembership?.archivedAt),
    order: myMembership?.order ?? 0,
    members: activeMemberships.map((membership) => ({
      id: membership.user.id,
      name: membership.user.name,
      avatarUrl: membership.user.avatarUrl,
      avatarLabel: toAvatarLabel(membership.user.name),
      role: membership.role!.name,
      status: membership.user.id === requestingUserId ? "online" : "offline",
      lastSeenAt: membership.user.lastSeenAt?.toISOString() ?? null
    })),
    pendingMembers: canApproveMembers
      ? pendingMemberships.map((membership) => ({
          membershipId: membership.id,
          userId: membership.user.id,
          name: membership.user.name,
          username: membership.user.username,
          avatarUrl: membership.user.avatarUrl,
          joinedAt: membership.createdAt.toISOString()
        }))
      : [],
    roles: organization.roles.map((role) => ({
      id: role.id,
      name: role.name,
      color: role.color,
      description: role.description,
      permissions: role.permissions,
      memberCount: memberCountByRoleId.get(role.id) ?? 0
    }))
  };
}

function compareHouses(
  a: ReturnType<typeof toHouseDto>,
  b: ReturnType<typeof toHouseDto>
): number {
  if (a.isPinned !== b.isPinned) {
    return a.isPinned ? -1 : 1;
  }
  if (a.isFavorite !== b.isFavorite) {
    return a.isFavorite ? -1 : 1;
  }
  if (a.order !== b.order) {
    return a.order - b.order;
  }
  return a.name.localeCompare(b.name);
}

function toInvitationDto(invitation: HouseInvitation, inviteUrl?: string) {
  return {
    id: invitation.id,
    email: invitation.email,
    status: invitation.status,
    createdAt: invitation.createdAt,
    expiresAt: invitation.expiresAt,
    ...(inviteUrl ? { inviteUrl } : {})
  };
}

function toJoinRequestDto(
  request: HouseJoinRequest & {
    user: { id: string; name: string; email: string; avatarUrl: string | null };
  }
) {
  return {
    id: request.id,
    userId: request.user.id,
    userName: request.user.name,
    userEmail: request.user.email,
    userAvatarLabel: toAvatarLabel(request.user.name),
    createdAt: request.createdAt
  };
}

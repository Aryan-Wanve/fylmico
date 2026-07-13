import type { HouseInvitation, Prisma } from "@fylmico/database";
import {
  addDuration,
  generateOpaqueToken,
  hashOpaqueToken
} from "../auth/token.util";
import { getEnv } from "../env";
import { AppException, HttpStatus } from "../http";
import { notificationsService } from "../notifications/notifications.service";
import { prisma } from "../prisma";
import type { CreateHouseDto } from "./dto/create-house.dto";
import type { InviteMemberDto } from "./dto/invite-member.dto";
import type { JoinHouseDto } from "./dto/join-house.dto";
import type { UpdateHouseDto } from "./dto/update-house.dto";

const MEMBER_ROLE_NAME = "Member";
const INVITATION_TTL = "7d";

const DEFAULT_ROLES = [
  {
    name: "Owner",
    color: "#654cff",
    description: "Controls house settings, roles, invites, and billing."
  },
  {
    name: "Producer",
    color: "#16c784",
    description: "Plans shoots, schedules tasks, and coordinates delivery."
  },
  {
    name: "Editor",
    color: "#3b82f6",
    description: "Owns cuts, revisions, timelines, and final exports."
  },
  {
    name: "Videographer",
    color: "#f97316",
    description: "Handles shoot capture, camera plans, and footage handoff."
  },
  {
    name: "Photographer",
    color: "#8b5cf6",
    description: "Covers stills, thumbnails, BTS, and campaign images."
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

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.handle !== undefined ? { handle: dto.handle } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() }
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

    return this.getHouseDto(organization.id, userId);
  }

  async leaveHouse(userId: string, organizationId: string): Promise<void> {
    await this.requireMembership(organizationId, userId);

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

    const memberRole = await this.getOrCreateMemberRole(organizationId);

    await this.prisma.organizationMembership.create({
      data: { organizationId, userId, roleId: memberRole.id }
    });
    await this.seedCrewProfile(organizationId, userId, memberRole.name);
    await this.setActiveOrganization(userId, organizationId);
    await this.notifyOwnersOfNewMember(
      organizationId,
      organizationName,
      userId
    );
  }

  private get appUrl(): string {
    return getEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  }

  private async notifyOwnersOfNewMember(
    organizationId: string,
    organizationName: string,
    joiningUserId: string
  ): Promise<void> {
    const ownerRole = await this.prisma.role.findUnique({
      where: { organizationId_name: { organizationId, name: "Owner" } }
    });
    if (!ownerRole) {
      return;
    }

    const [joiningUser, owners] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: joiningUserId } }),
      this.prisma.organizationMembership.findMany({
        where: { organizationId, roleId: ownerRole.id },
        select: { userId: true }
      })
    ]);

    await Promise.all(
      owners.map((owner) =>
        notificationsService.create(
          owner.userId,
          "house_joined",
          `${joiningUser.name} joined ${organizationName}`,
          `${joiningUser.name} joined ${organizationName} as a Member.`
        )
      )
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
    await this.requireOwnerRole(organizationId, requestingUserId);
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

  private async getOrCreateMemberRole(organizationId: string) {
    const existing = await this.prisma.role.findUnique({
      where: { organizationId_name: { organizationId, name: MEMBER_ROLE_NAME } }
    });
    if (existing) {
      return existing;
    }

    return this.prisma.role.create({
      data: {
        organizationId,
        name: MEMBER_ROLE_NAME,
        color: "#94a3b8",
        description: "General house member."
      }
    });
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

  private async requireOwnerRole(organizationId: string, userId: string) {
    const membership = await this.prisma.organizationMembership.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
      include: { role: true }
    });
    if (!membership || membership.role.name !== "Owner") {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        "forbidden",
        "Only house owners can remove members."
      );
    }
    return membership;
  }

  async requireMembership(organizationId: string, userId: string) {
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

  async getHousesForUser(userId: string) {
    const memberships = await this.prisma.organizationMembership.findMany({
      where: { userId },
      select: { organizationId: true }
    });

    if (memberships.length === 0) {
      return [];
    }

    // Batched into a single query rather than one findUnique per house -
    // this runs on every authenticated page load via GET /workspace.
    const organizations = await this.prisma.organization.findMany({
      where: { id: { in: memberships.map((m) => m.organizationId) } },
      include: houseInclude
    });

    return organizations.map((organization) =>
      toHouseDto(organization, userId)
    );
  }

  private async getHouseDto(organizationId: string, requestingUserId: string) {
    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { id: organizationId },
      include: houseInclude
    });
    return toHouseDto(organization, requestingUserId);
  }
}

export const organizationsService = new OrganizationsService();

function toHouseDto(
  organization: OrganizationWithRelations,
  requestingUserId: string
) {
  const memberCountByRoleId = new Map<string, number>();
  for (const membership of organization.memberships) {
    memberCountByRoleId.set(
      membership.roleId,
      (memberCountByRoleId.get(membership.roleId) ?? 0) + 1
    );
  }

  return {
    id: organization.id,
    name: organization.name,
    handle: organization.handle,
    description: organization.description,
    inviteCode: organization.inviteCode,
    members: organization.memberships.map((membership) => ({
      id: membership.user.id,
      name: membership.user.name,
      role: membership.role.name,
      status: membership.user.id === requestingUserId ? "online" : "offline"
    })),
    roles: organization.roles.map((role) => ({
      id: role.id,
      name: role.name,
      color: role.color,
      description: role.description,
      memberCount: memberCountByRoleId.get(role.id) ?? 0
    }))
  };
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

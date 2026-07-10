import { HttpStatus, Injectable } from "@nestjs/common";
import { Prisma, PrismaService } from "@fylmico/database";
import { AppException } from "../common/exceptions/app.exception";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateHouseDto } from "./dto/create-house.dto";
import { JoinHouseDto } from "./dto/join-house.dto";

const MEMBER_ROLE_NAME = "Member";

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

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

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

  async joinHouse(userId: string, dto: JoinHouseDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { inviteCode: dto.inviteCode.trim() }
    });
    if (!organization) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "invite_not_found",
        "This invite code is not valid."
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

    const memberRole = await this.getOrCreateMemberRole(organization.id);

    await this.prisma.organizationMembership.create({
      data: { organizationId: organization.id, userId, roleId: memberRole.id }
    });
    await this.seedCrewProfile(organization.id, userId, memberRole.name);
    await this.setActiveOrganization(userId, organization.id);
    await this.notifyOwnersOfNewMember(
      organization.id,
      organization.name,
      userId
    );

    return this.getHouseDto(organization.id, userId);
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
        this.notificationsService.create(
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
    await this.requireMembership(organizationId, requestingUserId);
    await this.requireMembership(organizationId, targetUserId);

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

    return Promise.all(
      memberships.map((membership) =>
        this.getHouseDto(membership.organizationId, userId)
      )
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

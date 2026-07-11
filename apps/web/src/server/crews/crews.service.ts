import type { Prisma } from "@fylmico/database";
import { AppException, HttpStatus } from "../http";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";
import type { UpdateCrewProfileDto } from "./dto/update-crew-profile.dto";

const crewProfileInclude = {
  user: true
} satisfies Prisma.CrewProfileInclude;

type CrewProfileWithUser = Prisma.CrewProfileGetPayload<{
  include: typeof crewProfileInclude;
}>;

class CrewsService {
  private readonly prisma = prisma;

  async list(userId: string, houseId: string) {
    await organizationsService.requireMembership(houseId, userId);

    const profiles = await this.prisma.crewProfile.findMany({
      where: { organizationId: houseId },
      include: crewProfileInclude,
      orderBy: { createdAt: "asc" }
    });

    return profiles.map(toCrewMemberDto);
  }

  async update(
    userId: string,
    houseId: string,
    targetUserId: string,
    dto: UpdateCrewProfileDto
  ) {
    await organizationsService.requireMembership(houseId, userId);
    const profile = await this.findProfileOrThrow(houseId, targetUserId);

    const updated = await this.prisma.crewProfile.update({
      where: { id: profile.id },
      data: {
        ...(dto.jobTitle !== undefined
          ? { jobTitle: dto.jobTitle.trim() }
          : {}),
        ...(dto.department !== undefined ? { department: dto.department } : {}),
        ...(dto.roleCategory !== undefined
          ? { roleCategory: dto.roleCategory }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.currentProject !== undefined
          ? { currentProject: dto.currentProject.trim() || null }
          : {}),
        ...(dto.projectStage !== undefined
          ? { projectStage: dto.projectStage.trim() || null }
          : {}),
        ...(dto.availability !== undefined
          ? { availability: dto.availability.trim() || null }
          : {}),
        ...(dto.birthday !== undefined
          ? { birthday: dto.birthday.trim() || null }
          : {})
      },
      include: crewProfileInclude
    });

    return toCrewMemberDto(updated);
  }

  async remove(
    userId: string,
    houseId: string,
    targetUserId: string
  ): Promise<void> {
    await organizationsService.removeMember(houseId, userId, targetUserId);
  }

  private async findProfileOrThrow(
    organizationId: string,
    userId: string
  ): Promise<CrewProfileWithUser> {
    const profile = await this.prisma.crewProfile.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
      include: crewProfileInclude
    });
    if (!profile) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "crew_profile_not_found",
        "This crew member does not exist."
      );
    }
    return profile;
  }
}

export const crewsService = new CrewsService();

function toCrewMemberDto(profile: CrewProfileWithUser) {
  return {
    id: profile.user.id,
    name: profile.user.name,
    email: profile.user.email,
    jobTitle: profile.jobTitle,
    department: profile.department,
    roleCategory: profile.roleCategory,
    status: profile.status,
    currentProject: profile.currentProject,
    projectStage: profile.projectStage,
    availability: profile.availability,
    birthday: profile.birthday
  };
}

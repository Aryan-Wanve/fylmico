import { Injectable } from "@nestjs/common";
import { PrismaService } from "@fylmico/database";
import { toAvatarLabel } from "../common/avatar-label.util";
import { OrganizationsService } from "../organizations/organizations.service";

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationsService: OrganizationsService
  ) {}

  async getWorkspace(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId }
    });
    const houses = await this.organizationsService.getHousesForUser(userId);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarLabel: toAvatarLabel(user.name)
      },
      activeHouseId: user.activeOrganizationId ?? "",
      houses,
      tasks: [],
      chatRooms: []
    };
  }
}

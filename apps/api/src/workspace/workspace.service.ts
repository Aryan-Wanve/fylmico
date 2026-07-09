import { Injectable } from "@nestjs/common";
import { PrismaService } from "@fylmico/database";
import { toAvatarLabel } from "../common/avatar-label.util";
import { ChatService } from "../chat/chat.service";
import { OrganizationsService } from "../organizations/organizations.service";
import { TasksService } from "../tasks/tasks.service";

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationsService: OrganizationsService,
    private readonly tasksService: TasksService,
    private readonly chatService: ChatService
  ) {}

  async getWorkspace(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId }
    });
    const houses = await this.organizationsService.getHousesForUser(userId);

    const activeOrganizationId = user.activeOrganizationId;
    const [tasks, chatRooms] = activeOrganizationId
      ? await Promise.all([
          this.tasksService.getTasksForOrganization(activeOrganizationId),
          this.chatService.getConversationsForOrganization(activeOrganizationId)
        ])
      : [[], []];

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarLabel: toAvatarLabel(user.name)
      },
      activeHouseId: activeOrganizationId ?? "",
      houses,
      tasks,
      chatRooms
    };
  }
}

import { toAvatarLabel } from "../avatar-label.util";
import { chatService } from "../chat/chat.service";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";
import { tasksService } from "../tasks/tasks.service";

class WorkspaceService {
  private readonly prisma = prisma;

  async getWorkspace(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId }
    });
    const houses = await organizationsService.getHousesForUser(userId);

    const activeOrganizationId = user.activeOrganizationId;
    const [tasks, chatRooms] = activeOrganizationId
      ? await Promise.all([
          tasksService.getTasksForOrganization(activeOrganizationId),
          chatService.getConversationsForOrganization(activeOrganizationId)
        ])
      : [[], []];

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        avatarLabel: toAvatarLabel(user.name),
        emailVerifiedAt: user.emailVerifiedAt
      },
      activeHouseId: activeOrganizationId ?? "",
      houses,
      tasks,
      chatRooms
    };
  }
}

export const workspaceService = new WorkspaceService();

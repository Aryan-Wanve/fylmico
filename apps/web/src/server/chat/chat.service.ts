import type { Prisma } from "@fylmico/database";
import { AppException, HttpStatus } from "../http";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";
import type { CreateConversationDto } from "./dto/create-conversation.dto";
import type { UpdateConversationDto } from "./dto/update-conversation.dto";

const roomInclude = {
  messages: { include: { author: true }, orderBy: { createdAt: "asc" } }
} satisfies Prisma.ConversationInclude;

type ConversationWithRelations = Prisma.ConversationGetPayload<{
  include: typeof roomInclude;
}>;

class ChatService {
  private readonly prisma = prisma;

  async sendMessage(userId: string, roomId: string, body: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: roomId }
    });
    if (!conversation) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "room_not_found",
        "Choose a valid chat room."
      );
    }

    await organizationsService.requireMembership(
      conversation.organizationId,
      userId
    );

    await this.prisma.message.create({
      data: { conversationId: roomId, authorId: userId, body }
    });

    return this.getRoomDto(roomId);
  }

  async createConversation(
    userId: string,
    organizationId: string,
    dto: CreateConversationDto
  ) {
    await organizationsService.requireMembership(organizationId, userId);

    const existing = await this.prisma.conversation.findUnique({
      where: { organizationId_name: { organizationId, name: dto.name.trim() } }
    });
    if (existing) {
      throw new AppException(
        HttpStatus.CONFLICT,
        "channel_name_taken",
        "A channel with this name already exists in this house."
      );
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        organizationId,
        name: dto.name.trim(),
        topic: dto.topic?.trim() || "No topic set."
      }
    });

    return this.getRoomDto(conversation.id);
  }

  async updateConversation(
    userId: string,
    roomId: string,
    dto: UpdateConversationDto
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: roomId }
    });
    if (!conversation) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "room_not_found",
        "Choose a valid chat room."
      );
    }

    await organizationsService.requireMembership(
      conversation.organizationId,
      userId
    );

    if (dto.name) {
      const existing = await this.prisma.conversation.findUnique({
        where: {
          organizationId_name: {
            organizationId: conversation.organizationId,
            name: dto.name.trim()
          }
        }
      });
      if (existing && existing.id !== roomId) {
        throw new AppException(
          HttpStatus.CONFLICT,
          "channel_name_taken",
          "A channel with this name already exists in this house."
        );
      }
    }

    await this.prisma.conversation.update({
      where: { id: roomId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.topic !== undefined ? { topic: dto.topic.trim() } : {})
      }
    });

    return this.getRoomDto(roomId);
  }

  async getConversationsForOrganization(organizationId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: { organizationId },
      include: roomInclude,
      orderBy: { createdAt: "asc" }
    });

    return conversations.map(toRoomDto);
  }

  async listRoomFiles(userId: string, roomId: string) {
    const conversation = await this.requireConversation(userId, roomId);

    const entries = await this.prisma.fileEntry.findMany({
      where: {
        conversationId: roomId,
        organizationId: conversation.organizationId
      },
      include: { uploadedBy: true },
      orderBy: { createdAt: "desc" }
    });

    return entries.map((entry) => ({
      id: entry.id,
      parentId: entry.parentId,
      name: entry.name,
      type: entry.type,
      size: entry.size,
      mimeType: entry.mimeType,
      uploadedById: entry.uploadedById,
      uploadedByName: entry.uploadedBy.name,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString()
    }));
  }

  async listRoomTasks(userId: string, roomId: string) {
    await this.requireConversation(userId, roomId);

    const tasks = await this.prisma.task.findMany({
      where: { conversationId: roomId },
      include: { assignee: true },
      orderBy: { createdAt: "desc" }
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      project: task.project,
      assigneeId: task.assigneeId,
      assigneeName: task.assignee.name,
      role: task.role,
      dueDate: task.dueDate,
      status: task.status,
      priority: task.priority
    }));
  }

  async createRoomTask(userId: string, roomId: string, title: string) {
    const conversation = await this.requireConversation(userId, roomId);
    const membership = await this.prisma.organizationMembership.findUnique({
      where: {
        organizationId_userId: {
          organizationId: conversation.organizationId,
          userId
        }
      },
      include: { role: true }
    });
    if (!membership) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        "not_a_member",
        "You are not a member of this house."
      );
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    await this.prisma.task.create({
      data: {
        organizationId: conversation.organizationId,
        conversationId: roomId,
        title: title.trim(),
        project: "General",
        assigneeId: userId,
        role: membership.role.name,
        dueDate: dueDate.toISOString().slice(0, 10)
      }
    });

    return this.listRoomTasks(userId, roomId);
  }

  async listRoomEvents(userId: string, roomId: string) {
    const conversation = await this.requireConversation(userId, roomId);

    const events = await this.prisma.calendarEvent.findMany({
      where: { conversationId: roomId },
      orderBy: { date: "asc" }
    });

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      projectId: event.projectId,
      organizationId: conversation.organizationId
    }));
  }

  async createRoomEvent(
    userId: string,
    roomId: string,
    dto: { title: string; date: string; time: string }
  ) {
    const conversation = await this.requireConversation(userId, roomId);

    await this.prisma.calendarEvent.create({
      data: {
        organizationId: conversation.organizationId,
        conversationId: roomId,
        createdById: userId,
        title: dto.title.trim(),
        date: dto.date,
        time: dto.time
      }
    });

    return this.listRoomEvents(userId, roomId);
  }

  private async requireConversation(userId: string, roomId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: roomId }
    });
    if (!conversation) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "room_not_found",
        "Choose a valid chat room."
      );
    }

    await organizationsService.requireMembership(
      conversation.organizationId,
      userId
    );

    return conversation;
  }

  private async getRoomDto(roomId: string) {
    const conversation = await this.prisma.conversation.findUniqueOrThrow({
      where: { id: roomId },
      include: roomInclude
    });
    return toRoomDto(conversation);
  }
}

export const chatService = new ChatService();

function toRoomDto(conversation: ConversationWithRelations) {
  return {
    id: conversation.id,
    name: conversation.name,
    topic: conversation.topic,
    unreadCount: 0,
    messages: conversation.messages.map((message) => ({
      id: message.id,
      authorId: message.authorId,
      authorName: message.author.name,
      sentAt: message.createdAt.toISOString(),
      body: message.body
    }))
  };
}

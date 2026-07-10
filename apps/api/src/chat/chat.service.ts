import { HttpStatus, Injectable } from "@nestjs/common";
import { Prisma, PrismaService } from "@fylmico/database";
import { AppException } from "../common/exceptions/app.exception";
import { OrganizationsService } from "../organizations/organizations.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";

const roomInclude = {
  messages: { include: { author: true }, orderBy: { createdAt: "asc" } }
} satisfies Prisma.ConversationInclude;

type ConversationWithRelations = Prisma.ConversationGetPayload<{
  include: typeof roomInclude;
}>;

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationsService: OrganizationsService
  ) {}

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

    await this.organizationsService.requireMembership(
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
    await this.organizationsService.requireMembership(organizationId, userId);

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

  async getConversationsForOrganization(organizationId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: { organizationId },
      include: roomInclude,
      orderBy: { createdAt: "asc" }
    });

    return conversations.map(toRoomDto);
  }

  private async getRoomDto(roomId: string) {
    const conversation = await this.prisma.conversation.findUniqueOrThrow({
      where: { id: roomId },
      include: roomInclude
    });
    return toRoomDto(conversation);
  }
}

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

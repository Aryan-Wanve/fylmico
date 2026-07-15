import type { Prisma } from "@fylmico/database";
import { AppException, HttpStatus } from "../http";
import { organizationsService } from "../organizations/organizations.service";
import {
  buildPage,
  resolveLimit,
  type CursorPaginationDto,
  type Page
} from "../pagination";
import { prisma } from "../prisma";
import {
  broadcast,
  conversationTopic,
  houseChatTopic
} from "../realtime/broadcast";
import type { CreateConversationDto } from "./dto/create-conversation.dto";
import type { UpdateConversationDto } from "./dto/update-conversation.dto";

const RECENT_MESSAGES_LIMIT = 50;
const EDIT_WINDOW_MS = 10 * 60 * 1000;

const roomInclude = {
  messages: {
    include: { author: true, reactions: true },
    orderBy: { createdAt: "desc" },
    take: RECENT_MESSAGES_LIMIT
  }
} satisfies Prisma.ConversationInclude;

type ConversationWithRelations = Prisma.ConversationGetPayload<{
  include: typeof roomInclude;
}>;

const messageInclude = {
  author: true,
  reactions: true
} satisfies Prisma.MessageInclude;

type MessageWithRelations = Prisma.MessageGetPayload<{
  include: typeof messageInclude;
}>;

const REACTION_EMOJIS = ["👍", "❤️", "😂", "🎉", "😮", "👀"];

class ChatService {
  private readonly prisma = prisma;

  async sendMessage(
    userId: string,
    roomId: string,
    body: string,
    parentMessageId?: string
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

    if (parentMessageId) {
      const parent = await this.prisma.message.findUnique({
        where: { id: parentMessageId }
      });
      if (!parent || parent.conversationId !== roomId) {
        throw new AppException(
          HttpStatus.BAD_REQUEST,
          "invalid_request",
          "The message you're replying to doesn't exist in this channel."
        );
      }
    }

    const created = await this.prisma.message.create({
      data: {
        conversationId: roomId,
        authorId: userId,
        body,
        parentMessageId: parentMessageId ?? null
      },
      include: messageInclude
    });

    const dto = toMessageDto(created, userId, 0);

    await broadcast(conversationTopic(roomId), "message:new", dto);
    await broadcast(
      houseChatTopic(conversation.organizationId),
      "message:new",
      {
        conversationId: roomId,
        messageId: dto.id,
        authorId: dto.authorId,
        body: dto.body,
        sentAt: dto.sentAt
      }
    );

    return dto;
  }

  async listMessages(
    userId: string,
    roomId: string,
    pagination: CursorPaginationDto
  ): Promise<Page<ReturnType<typeof toMessageDto>>> {
    await this.requireConversation(userId, roomId);

    const limit = resolveLimit(pagination);
    const messages = await this.prisma.message.findMany({
      where: { conversationId: roomId },
      include: messageInclude,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(pagination.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {})
    });

    const page = buildPage(messages, limit, pagination.cursor);
    const replyCountByParent = await this.countReplies(
      page.data.map((message) => message.id)
    );

    return {
      ...page,
      data: page.data
        .slice()
        .reverse()
        .map((message) =>
          toMessageDto(message, userId, replyCountByParent.get(message.id) ?? 0)
        )
    };
  }

  async markRead(userId: string, roomId: string): Promise<void> {
    await this.requireConversation(userId, roomId);

    const latest = await this.prisma.message.findFirst({
      where: { conversationId: roomId },
      orderBy: { createdAt: "desc" }
    });

    const read = await this.prisma.conversationRead.upsert({
      where: { conversationId_userId: { conversationId: roomId, userId } },
      update: { lastReadMessageId: latest?.id ?? null, lastReadAt: new Date() },
      create: {
        conversationId: roomId,
        userId,
        lastReadMessageId: latest?.id ?? null
      }
    });

    await broadcast(conversationTopic(roomId), "read", {
      userId,
      lastReadAt: read.lastReadAt.toISOString()
    });
  }

  async editMessage(userId: string, messageId: string, body: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId }
    });
    if (!message) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "message_not_found",
        "This message no longer exists."
      );
    }

    if (message.authorId !== userId) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        "not_author",
        "You can only edit your own messages."
      );
    }

    if (Date.now() - message.createdAt.getTime() > EDIT_WINDOW_MS) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        "edit_window_expired",
        "Messages can only be edited within 10 minutes of sending."
      );
    }

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: { body, editedAt: new Date() },
      include: messageInclude
    });
    const replyCount = await this.prisma.message.count({
      where: { parentMessageId: messageId }
    });
    const dto = toMessageDto(updated, userId, replyCount);

    await broadcast(
      conversationTopic(message.conversationId),
      "message:edit",
      dto
    );

    return dto;
  }

  async toggleReaction(userId: string, messageId: string, emoji: string) {
    if (!REACTION_EMOJIS.includes(emoji)) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "That's not a supported reaction."
      );
    }

    const message = await this.prisma.message.findUnique({
      where: { id: messageId }
    });
    if (!message) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "message_not_found",
        "This message no longer exists."
      );
    }

    const conversation = await this.prisma.conversation.findUniqueOrThrow({
      where: { id: message.conversationId }
    });
    await organizationsService.requireMembership(
      conversation.organizationId,
      userId
    );

    const existing = await this.prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: { messageId, userId, emoji }
      }
    });

    if (existing) {
      await this.prisma.messageReaction.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.messageReaction.create({
        data: { messageId, userId, emoji }
      });
    }

    const updated = await this.prisma.message.findUniqueOrThrow({
      where: { id: messageId },
      include: messageInclude
    });
    const replyCount = await this.prisma.message.count({
      where: { parentMessageId: messageId }
    });
    const dto = toMessageDto(updated, userId, replyCount);

    await broadcast(
      conversationTopic(message.conversationId),
      "reaction:update",
      dto
    );

    return dto;
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

    return this.getRoomDto(conversation.id, userId);
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

    return this.getRoomDto(roomId, userId);
  }

  async getConversationsForOrganization(
    organizationId: string,
    userId: string
  ) {
    const conversations = await this.prisma.conversation.findMany({
      where: { organizationId },
      include: roomInclude,
      orderBy: { createdAt: "asc" }
    });

    const reads = await this.prisma.conversationRead.findMany({
      where: {
        userId,
        conversationId: { in: conversations.map((c) => c.id) }
      }
    });
    const readByConversationId = new Map(
      reads.map((read) => [read.conversationId, read])
    );

    return conversations.map((conversation) =>
      toRoomDto(
        conversation,
        userId,
        readByConversationId.get(conversation.id) ?? null
      )
    );
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
      include: { assignees: { include: { user: true } } },
      orderBy: { createdAt: "desc" }
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      assignees: task.assignees.map((a) => ({
        userId: a.userId,
        name: a.user.name,
        responsibility: a.responsibility
      })),
      dueDate: task.dueDate?.toISOString() ?? null,
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
        createdById: userId,
        title: title.trim(),
        dueDate,
        assignees: {
          create: [{ userId, responsibility: membership.role.name }]
        }
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

  private async countReplies(
    messageIds: string[]
  ): Promise<Map<string, number>> {
    if (messageIds.length === 0) {
      return new Map();
    }

    const groups = await this.prisma.message.groupBy({
      by: ["parentMessageId"],
      where: { parentMessageId: { in: messageIds } },
      _count: { _all: true }
    });

    return new Map(
      groups
        .filter(
          (group): group is typeof group & { parentMessageId: string } =>
            group.parentMessageId !== null
        )
        .map((group) => [group.parentMessageId, group._count._all])
    );
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

  private async getRoomDto(roomId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUniqueOrThrow({
      where: { id: roomId },
      include: roomInclude
    });
    const read = await this.prisma.conversationRead.findUnique({
      where: { conversationId_userId: { conversationId: roomId, userId } }
    });
    return toRoomDto(conversation, userId, read);
  }
}

export const chatService = new ChatService();

function toMessageDto(
  message: MessageWithRelations,
  userId: string,
  replyCount: number
) {
  const reactionsByEmoji = new Map<
    string,
    { emoji: string; count: number; reactedByMe: boolean }
  >();
  for (const reaction of message.reactions) {
    const existing = reactionsByEmoji.get(reaction.emoji);
    if (existing) {
      existing.count += 1;
      existing.reactedByMe ||= reaction.userId === userId;
    } else {
      reactionsByEmoji.set(reaction.emoji, {
        emoji: reaction.emoji,
        count: 1,
        reactedByMe: reaction.userId === userId
      });
    }
  }

  return {
    id: message.id,
    conversationId: message.conversationId,
    authorId: message.authorId,
    authorName: message.author.name,
    sentAt: message.createdAt.toISOString(),
    body: message.body,
    editedAt: message.editedAt?.toISOString() ?? null,
    parentMessageId: message.parentMessageId,
    replyCount,
    reactions: [...reactionsByEmoji.values()]
  };
}

function toRoomDto(
  conversation: ConversationWithRelations,
  userId: string,
  read: { lastReadAt: Date } | null
) {
  const messagesAscending = conversation.messages.slice().reverse();

  const replyCountByParent = new Map<string, number>();
  for (const message of messagesAscending) {
    if (message.parentMessageId) {
      replyCountByParent.set(
        message.parentMessageId,
        (replyCountByParent.get(message.parentMessageId) ?? 0) + 1
      );
    }
  }

  const lastReadAt = read?.lastReadAt ?? new Date(0);
  const unreadCount = messagesAscending.filter(
    (message) => message.authorId !== userId && message.createdAt > lastReadAt
  ).length;

  return {
    id: conversation.id,
    name: conversation.name,
    topic: conversation.topic,
    unreadCount,
    messages: messagesAscending.map((message) =>
      toMessageDto(message, userId, replyCountByParent.get(message.id) ?? 0)
    )
  };
}

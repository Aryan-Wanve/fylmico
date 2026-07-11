import { AppException, HttpStatus } from "../http";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";
import type { CreateBoardDto } from "./dto/create-board.dto";
import type { CreateShotDto } from "./dto/create-shot.dto";
import type { UpdateShotDto } from "./dto/update-shot.dto";

const boardInclude = {
  shots: { orderBy: { order: "asc" as const } }
} as const;

class StoryboardService {
  private readonly prisma = prisma;

  async listBoards(userId: string, houseId: string) {
    await organizationsService.requireMembership(houseId, userId);

    const boards = await this.prisma.board.findMany({
      where: { organizationId: houseId },
      include: boardInclude,
      orderBy: { updatedAt: "desc" }
    });

    return boards.map(toBoardDto);
  }

  async createBoard(userId: string, houseId: string, dto: CreateBoardDto) {
    await organizationsService.requireMembership(houseId, userId);

    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId }
      });
      if (!project || project.organizationId !== houseId) {
        throw new AppException(
          HttpStatus.NOT_FOUND,
          "project_not_found",
          "This project does not exist in this house."
        );
      }
    }

    const board = await this.prisma.board.create({
      data: {
        organizationId: houseId,
        projectId: dto.projectId ?? null,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        shots: dto.shots
          ? {
              create: dto.shots.map((shot, index) => ({
                order: shot.order ?? index,
                description: shot.description.trim(),
                cameraAngle: shot.cameraAngle?.trim() || null,
                notes: shot.notes?.trim() || null
              }))
            }
          : undefined
      },
      include: boardInclude
    });

    return toBoardDto(board);
  }

  async deleteBoard(
    userId: string,
    houseId: string,
    boardId: string
  ): Promise<void> {
    await organizationsService.requireMembership(houseId, userId);
    await this.requireBoard(houseId, boardId);

    await this.prisma.board.delete({ where: { id: boardId } });
  }

  async createShot(
    userId: string,
    houseId: string,
    boardId: string,
    dto: CreateShotDto
  ) {
    await organizationsService.requireMembership(houseId, userId);
    await this.requireBoard(houseId, boardId);

    const maxOrder = await this.prisma.shot.aggregate({
      where: { boardId },
      _max: { order: true }
    });

    const shot = await this.prisma.shot.create({
      data: {
        boardId,
        order: dto.order ?? (maxOrder._max.order ?? -1) + 1,
        description: dto.description.trim(),
        cameraAngle: dto.cameraAngle?.trim() || null,
        notes: dto.notes?.trim() || null
      }
    });

    await this.prisma.board.update({
      where: { id: boardId },
      data: { updatedAt: new Date() }
    });

    return toShotDto(shot);
  }

  async updateShot(
    userId: string,
    houseId: string,
    shotId: string,
    dto: UpdateShotDto
  ) {
    await organizationsService.requireMembership(houseId, userId);

    const shot = await this.prisma.shot.findUnique({
      where: { id: shotId },
      include: { board: true }
    });
    if (!shot || shot.board.organizationId !== houseId) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "shot_not_found",
        "This shot does not exist."
      );
    }

    const updated = await this.prisma.shot.update({
      where: { id: shotId },
      data: {
        ...(dto.description !== undefined
          ? { description: dto.description.trim() }
          : {}),
        ...(dto.cameraAngle !== undefined
          ? { cameraAngle: dto.cameraAngle.trim() || null }
          : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes.trim() || null } : {})
      }
    });

    return toShotDto(updated);
  }

  private async requireBoard(houseId: string, boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId }
    });
    if (!board || board.organizationId !== houseId) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "board_not_found",
        "This board does not exist in this house."
      );
    }
    return board;
  }
}

export const storyboardService = new StoryboardService();

function toShotDto(shot: {
  id: string;
  boardId: string;
  order: number;
  description: string;
  cameraAngle: string | null;
  notes: string | null;
  imageUrl: string | null;
}) {
  return {
    id: shot.id,
    boardId: shot.boardId,
    order: shot.order,
    description: shot.description,
    cameraAngle: shot.cameraAngle,
    notes: shot.notes,
    imageUrl: shot.imageUrl
  };
}

function toBoardDto(board: {
  id: string;
  organizationId: string;
  projectId: string | null;
  name: string;
  description: string | null;
  updatedAt: Date;
  shots: Array<Parameters<typeof toShotDto>[0]>;
}) {
  return {
    id: board.id,
    projectId: board.projectId,
    name: board.name,
    description: board.description,
    updatedAt: board.updatedAt,
    shots: board.shots.map(toShotDto)
  };
}

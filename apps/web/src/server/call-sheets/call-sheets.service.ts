import type { Prisma } from "@fylmico/database";
import { AppException, HttpStatus } from "../http";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";
import type { CreateCallSheetDto } from "./dto/create-call-sheet.dto";
import type { UpdateCallSheetDto } from "./dto/update-call-sheet.dto";

const callSheetInclude = {
  project: true,
  createdBy: true
} satisfies Prisma.CallSheetInclude;

type CallSheetWithRelations = Prisma.CallSheetGetPayload<{
  include: typeof callSheetInclude;
}>;

class CallSheetsService {
  private readonly prisma = prisma;

  async list(userId: string, houseId: string) {
    await organizationsService.requireMembership(houseId, userId);

    const callSheets = await this.prisma.callSheet.findMany({
      where: { organizationId: houseId },
      include: callSheetInclude,
      orderBy: { shootDate: "desc" }
    });

    return callSheets.map(toCallSheetDto);
  }

  async create(userId: string, houseId: string, dto: CreateCallSheetDto) {
    await organizationsService.requireMembership(houseId, userId);

    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId }
      });
      if (!project || project.organizationId !== houseId) {
        throw new AppException(
          HttpStatus.BAD_REQUEST,
          "invalid_request",
          "projectId must belong to this house."
        );
      }
    }

    const callSheet = await this.prisma.callSheet.create({
      data: {
        organizationId: houseId,
        projectId: dto.projectId ?? null,
        title: dto.title.trim(),
        shootDate: dto.shootDate.trim(),
        generalCallTime: dto.generalCallTime.trim(),
        location: dto.location?.trim() || null,
        weather: dto.weather?.trim() || null,
        notes: dto.notes?.trim() || null,
        crewCallTimes: (dto.crewCallTimes ?? []) as Prisma.InputJsonValue,
        createdById: userId
      },
      include: callSheetInclude
    });

    return toCallSheetDto(callSheet);
  }

  async get(userId: string, callSheetId: string) {
    const callSheet = await this.findOrThrow(callSheetId);
    await organizationsService.requireMembership(
      callSheet.organizationId,
      userId
    );
    return toCallSheetDto(callSheet);
  }

  async update(userId: string, callSheetId: string, dto: UpdateCallSheetDto) {
    const callSheet = await this.findOrThrow(callSheetId);
    await organizationsService.requireMembership(
      callSheet.organizationId,
      userId
    );

    const updated = await this.prisma.callSheet.update({
      where: { id: callSheetId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.projectId !== undefined
          ? { projectId: dto.projectId || null }
          : {}),
        ...(dto.shootDate !== undefined
          ? { shootDate: dto.shootDate.trim() }
          : {}),
        ...(dto.generalCallTime !== undefined
          ? { generalCallTime: dto.generalCallTime.trim() }
          : {}),
        ...(dto.location !== undefined
          ? { location: dto.location.trim() || null }
          : {}),
        ...(dto.weather !== undefined
          ? { weather: dto.weather.trim() || null }
          : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes.trim() || null } : {}),
        ...(dto.crewCallTimes !== undefined
          ? { crewCallTimes: dto.crewCallTimes as Prisma.InputJsonValue }
          : {})
      },
      include: callSheetInclude
    });

    return toCallSheetDto(updated);
  }

  async remove(userId: string, callSheetId: string): Promise<void> {
    const callSheet = await this.findOrThrow(callSheetId);
    await organizationsService.requireMembership(
      callSheet.organizationId,
      userId
    );
    await this.prisma.callSheet.delete({ where: { id: callSheetId } });
  }

  private async findOrThrow(
    callSheetId: string
  ): Promise<CallSheetWithRelations> {
    const callSheet = await this.prisma.callSheet.findUnique({
      where: { id: callSheetId },
      include: callSheetInclude
    });
    if (!callSheet) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "call_sheet_not_found",
        "This call sheet does not exist."
      );
    }
    return callSheet;
  }
}

export const callSheetsService = new CallSheetsService();

function toCallSheetDto(callSheet: CallSheetWithRelations) {
  return {
    id: callSheet.id,
    projectId: callSheet.projectId,
    projectTitle: callSheet.project?.name ?? null,
    title: callSheet.title,
    shootDate: callSheet.shootDate,
    generalCallTime: callSheet.generalCallTime,
    location: callSheet.location,
    weather: callSheet.weather,
    notes: callSheet.notes,
    crewCallTimes: callSheet.crewCallTimes as unknown as Array<{
      userId: string;
      name: string;
      jobTitle: string;
      callTime: string;
    }>,
    createdById: callSheet.createdById,
    createdByName: callSheet.createdBy.name,
    createdAt: callSheet.createdAt.toISOString(),
    updatedAt: callSheet.updatedAt.toISOString()
  };
}

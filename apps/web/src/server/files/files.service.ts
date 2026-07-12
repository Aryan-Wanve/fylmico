import { signDownloadToken } from "../drive/drive-token.util";
import { driveService } from "../drive/drive.service";
import { AppException, HttpStatus } from "../http";
import { getAppUrl } from "../mail/mailer";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";
import type { CreateFolderDto } from "./dto/create-folder.dto";

class FilesService {
  private readonly prisma = prisma;

  async list(userId: string, houseId: string, parentId: string | null) {
    await organizationsService.requireMembership(houseId, userId);

    if (parentId) {
      await this.requireEntry(houseId, parentId);
    }

    const entries = await this.prisma.fileEntry.findMany({
      where: { organizationId: houseId, parentId },
      include: { uploadedBy: true },
      orderBy: [{ type: "asc" }, { name: "asc" }]
    });

    return entries.map(toFileEntryDto);
  }

  async createFolder(userId: string, houseId: string, dto: CreateFolderDto) {
    await organizationsService.requireMembership(houseId, userId);

    if (dto.parentId) {
      await this.requireEntry(houseId, dto.parentId);
    }

    const folder = await this.prisma.fileEntry.create({
      data: {
        organizationId: houseId,
        parentId: dto.parentId ?? null,
        name: dto.name.trim(),
        type: "folder",
        uploadedById: userId
      },
      include: { uploadedBy: true }
    });

    return toFileEntryDto(folder);
  }

  async uploadFile(
    userId: string,
    houseId: string,
    parentId: string | null,
    file: { name: string; buffer: ArrayBuffer; mimeType: string; size: number },
    conversationId?: string | null
  ) {
    await organizationsService.requireMembership(houseId, userId);

    if (parentId) {
      await this.requireEntry(houseId, parentId);
    }

    // The file's bytes live in the uploader's own Google Drive (their
    // "Fylmico" folder) - this row is just the shared team index/tree
    // pointing at it. See ADR 0038.
    const storagePath = await driveService.upload(userId, {
      name: file.name,
      buffer: file.buffer,
      mimeType: file.mimeType
    });

    const entry = await this.prisma.fileEntry.create({
      data: {
        organizationId: houseId,
        parentId,
        conversationId: conversationId ?? null,
        name: file.name,
        type: "file",
        storagePath,
        size: file.size,
        mimeType: file.mimeType,
        uploadedById: userId
      },
      include: { uploadedBy: true }
    });

    return toFileEntryDto(entry);
  }

  async deleteEntry(
    userId: string,
    houseId: string,
    entryId: string
  ): Promise<void> {
    await organizationsService.requireMembership(houseId, userId);
    const entry = await this.requireEntry(houseId, entryId);

    const driveTargets = await this.collectDriveTargets(entry.id);
    await Promise.all(
      driveTargets.map((target) =>
        driveService.remove(target.uploaderId, target.fileId)
      )
    );
    await this.prisma.fileEntry.delete({ where: { id: entryId } });
  }

  async getDownloadUrl(
    userId: string,
    houseId: string,
    entryId: string
  ): Promise<string> {
    await organizationsService.requireMembership(houseId, userId);
    const entry = await this.requireEntry(houseId, entryId);

    if (entry.type !== "file" || !entry.storagePath) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "Only files can be downloaded."
      );
    }

    return `${getAppUrl()}/api/v1/files/download/${signDownloadToken(entry.id)}`;
  }

  private async collectDriveTargets(
    entryId: string
  ): Promise<{ fileId: string; uploaderId: string }[]> {
    const entry = await this.prisma.fileEntry.findUniqueOrThrow({
      where: { id: entryId }
    });

    if (entry.type === "file") {
      return entry.storagePath
        ? [{ fileId: entry.storagePath, uploaderId: entry.uploadedById }]
        : [];
    }

    const children = await this.prisma.fileEntry.findMany({
      where: { parentId: entryId }
    });

    const nested = await Promise.all(
      children.map((child) => this.collectDriveTargets(child.id))
    );
    return nested.flat();
  }

  async getSummary(userId: string, houseId: string) {
    await organizationsService.requireMembership(houseId, userId);

    const [files, recent] = await Promise.all([
      this.prisma.fileEntry.findMany({
        where: { organizationId: houseId, type: "file" },
        select: { size: true, mimeType: true }
      }),
      this.prisma.fileEntry.findMany({
        where: { organizationId: houseId, type: "file" },
        include: { uploadedBy: true },
        orderBy: { createdAt: "desc" },
        take: 5
      })
    ]);

    const bytesByCategory = new Map<string, number>();
    for (const category of CATEGORY_ORDER) {
      bytesByCategory.set(category, 0);
    }
    let usedBytes = 0;
    for (const file of files) {
      const bytes = file.size ?? 0;
      usedBytes += bytes;
      const category = categorizeMimeType(file.mimeType);
      bytesByCategory.set(
        category,
        (bytesByCategory.get(category) ?? 0) + bytes
      );
    }

    return {
      usedBytes,
      byCategory: CATEGORY_ORDER.map((category) => ({
        category,
        bytes: bytesByCategory.get(category) ?? 0
      })).filter((entry) => entry.bytes > 0),
      recent: recent.map((entry) => ({
        id: entry.id,
        name: entry.name,
        uploadedByName: entry.uploadedBy.name,
        createdAt: entry.createdAt
      }))
    };
  }

  private async requireEntry(houseId: string, entryId: string) {
    const entry = await this.prisma.fileEntry.findUnique({
      where: { id: entryId }
    });
    if (!entry || entry.organizationId !== houseId) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "file_not_found",
        "This file or folder does not exist in this house."
      );
    }
    return entry;
  }
}

const CATEGORY_ORDER = [
  "video",
  "audio",
  "image",
  "document",
  "other"
] as const;

function categorizeMimeType(
  mimeType: string | null
): (typeof CATEGORY_ORDER)[number] {
  if (!mimeType) {
    return "other";
  }
  if (mimeType.startsWith("video/")) {
    return "video";
  }
  if (mimeType.startsWith("audio/")) {
    return "audio";
  }
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  if (
    mimeType === "application/pdf" ||
    mimeType.includes("document") ||
    mimeType.includes("spreadsheet") ||
    mimeType.startsWith("text/")
  ) {
    return "document";
  }
  return "other";
}

export const filesService = new FilesService();

function toFileEntryDto(entry: {
  id: string;
  parentId: string | null;
  name: string;
  type: string;
  storagePath: string | null;
  size: number | null;
  mimeType: string | null;
  uploadedBy: { id: string; name: string };
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: entry.id,
    parentId: entry.parentId,
    name: entry.name,
    type: entry.type,
    size: entry.size,
    mimeType: entry.mimeType,
    uploadedById: entry.uploadedBy.id,
    uploadedByName: entry.uploadedBy.name,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt
  };
}

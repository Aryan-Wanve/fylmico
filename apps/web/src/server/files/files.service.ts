import { signDownloadToken } from "../drive/drive-token.util";
import { driveService } from "../drive/drive.service";
import {
  driveStructureService,
  type UploadCategory
} from "../drive/drive-structure.service";
import { AppException, HttpStatus } from "../http";
import { getAppUrl } from "../mail/mailer";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";
import type { CreateFolderDto } from "./dto/create-folder.dto";

class FilesService {
  private readonly prisma = prisma;

  async list(
    userId: string,
    houseId: string,
    parentId: string | null,
    sensitive = false
  ) {
    if (sensitive) {
      await organizationsService.requireOwnerRole(
        houseId,
        userId,
        "view the Sensitive folder"
      );
    } else {
      await organizationsService.requireMembership(houseId, userId);
    }

    if (parentId) {
      await this.requireEntry(houseId, parentId, userId);
    }

    const entries = await this.prisma.fileEntry.findMany({
      where: { organizationId: houseId, parentId, sensitive },
      include: { uploadedBy: true },
      orderBy: [{ type: "asc" }, { name: "asc" }]
    });

    return entries.map(toFileEntryDto);
  }

  async createFolder(userId: string, houseId: string, dto: CreateFolderDto) {
    await organizationsService.requireMembership(houseId, userId);

    const parentEntry = dto.parentId
      ? await this.requireEntry(houseId, dto.parentId, userId)
      : null;
    const parentDriveFolderId = await this.rootFolderId(houseId, parentEntry);
    const name = dto.name.trim();

    const driveFolderId = await driveService.createFolder(
      houseId,
      name,
      parentDriveFolderId
    );

    const folder = await this.prisma.fileEntry.create({
      data: {
        organizationId: houseId,
        parentId: dto.parentId ?? null,
        name,
        type: "folder",
        storagePath: driveFolderId,
        sensitive: parentEntry?.sensitive ?? false,
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
    conversationId?: string | null,
    taskId?: string | null
  ) {
    await organizationsService.requireMembership(houseId, userId);

    const parentEntry = parentId
      ? await this.requireEntry(houseId, parentId, userId)
      : null;
    const parentDriveFolderId = await this.rootFolderId(houseId, parentEntry);

    const storagePath = await driveService.upload(
      houseId,
      { name: file.name, buffer: file.buffer, mimeType: file.mimeType },
      parentDriveFolderId
    );

    const entry = await this.prisma.fileEntry.create({
      data: {
        organizationId: houseId,
        parentId,
        conversationId: conversationId ?? null,
        taskId: taskId ?? null,
        name: file.name,
        type: "file",
        storagePath,
        size: file.size,
        mimeType: file.mimeType,
        sensitive: parentEntry?.sensitive ?? false,
        uploadedById: userId
      },
      include: { uploadedBy: true }
    });

    await this.mirrorIntoEmployeeWork(
      houseId,
      userId,
      entry.name,
      file.mimeType,
      storagePath,
      file.size
    );

    return toFileEntryDto(entry);
  }

  async listForTask(userId: string, taskId: string) {
    const houseId = await this.requireTaskHouseId(taskId);
    await organizationsService.requireMembership(houseId, userId);

    const entries = await this.prisma.fileEntry.findMany({
      where: { organizationId: houseId, taskId },
      include: { uploadedBy: true },
      orderBy: { createdAt: "desc" }
    });

    return entries.map(toFileEntryDto);
  }

  async linkToTask(userId: string, taskId: string, entryId: string) {
    const houseId = await this.requireTaskHouseId(taskId);
    await organizationsService.requireMembership(houseId, userId);
    const entry = await this.requireEntry(houseId, entryId, userId);

    const linked = await this.prisma.fileEntry.update({
      where: { id: entry.id },
      data: { taskId },
      include: { uploadedBy: true }
    });

    return toFileEntryDto(linked);
  }

  async unlinkFromTask(
    userId: string,
    taskId: string,
    entryId: string
  ): Promise<void> {
    const houseId = await this.requireTaskHouseId(taskId);
    await organizationsService.requireMembership(houseId, userId);
    const entry = await this.requireEntry(houseId, entryId, userId);

    await this.prisma.fileEntry.update({
      where: { id: entry.id },
      data: { taskId: null }
    });
  }

  private async requireTaskHouseId(taskId: string): Promise<string> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { organizationId: true }
    });
    if (!task) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "task_not_found",
        "This task does not exist."
      );
    }
    return task.organizationId;
  }

  async resolveDestination(
    userId: string,
    houseId: string,
    params: {
      clientId: string | "misc";
      projectId?: string;
      category?: UploadCategory;
    }
  ): Promise<{ parentId: string }> {
    await organizationsService.requireMembership(houseId, userId);
    const folder = await driveStructureService.resolveDestination(
      houseId,
      params
    );
    return { parentId: folder.id };
  }

  async addToPortfolio(
    userId: string,
    houseId: string,
    entryId: string,
    category: string
  ) {
    await organizationsService.requireMembership(houseId, userId);
    const entry = await this.requireEntry(houseId, entryId, userId);
    if (entry.type !== "file" || !entry.storagePath) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "Only files can be added to the Portfolio."
      );
    }

    const portfolioFolder = await driveStructureService.getFolderByKey(
      houseId,
      `portfolio:${category}`
    );

    const copy = await this.prisma.fileEntry.create({
      data: {
        organizationId: houseId,
        parentId: portfolioFolder.id,
        name: entry.name,
        type: "file",
        storagePath: entry.storagePath,
        size: entry.size,
        mimeType: entry.mimeType,
        uploadedById: userId
      },
      include: { uploadedBy: true }
    });

    return toFileEntryDto(copy);
  }

  async deleteEntry(
    userId: string,
    houseId: string,
    entryId: string
  ): Promise<void> {
    await organizationsService.requireMembership(houseId, userId);
    const entry = await this.requireEntry(houseId, entryId, userId);

    if (entry.driveKey) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "protected_folder",
        "This folder is managed automatically and can't be deleted."
      );
    }

    const fileIds = await this.collectDriveFileIds(entry.id);
    await Promise.all(
      fileIds.map((fileId) => driveService.remove(houseId, fileId))
    );
    await this.prisma.fileEntry.delete({ where: { id: entryId } });
  }

  async getDownloadUrl(
    userId: string,
    houseId: string,
    entryId: string
  ): Promise<string> {
    await organizationsService.requireMembership(houseId, userId);
    const entry = await this.requireEntry(houseId, entryId, userId);

    if (entry.type !== "file" || !entry.storagePath) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "Only files can be downloaded."
      );
    }

    return `${getAppUrl()}/api/v1/files/download/${signDownloadToken(entry.id)}`;
  }

  private async collectDriveFileIds(entryId: string): Promise<string[]> {
    const entry = await this.prisma.fileEntry.findUniqueOrThrow({
      where: { id: entryId }
    });

    if (entry.type === "file") {
      return entry.storagePath ? [entry.storagePath] : [];
    }

    const children = await this.prisma.fileEntry.findMany({
      where: { parentId: entryId }
    });
    const nested = await Promise.all(
      children.map((child) => this.collectDriveFileIds(child.id))
    );
    return nested.flat();
  }

  private async mirrorIntoEmployeeWork(
    houseId: string,
    uploaderId: string,
    name: string,
    mimeType: string,
    storagePath: string,
    size: number
  ): Promise<void> {
    try {
      const subfolder = mimeType.startsWith("video/")
        ? "Videos"
        : mimeType.startsWith("image/")
          ? "Images"
          : "Documents";
      const employeeSubfolder = await driveStructureService.getFolderByKey(
        houseId,
        `employee:${uploaderId}:${subfolder}`
      );
      await this.prisma.fileEntry.create({
        data: {
          organizationId: houseId,
          parentId: employeeSubfolder.id,
          name,
          type: "file",
          storagePath,
          size,
          mimeType,
          sensitive: true,
          uploadedById: uploaderId
        }
      });
    } catch (error) {
      console.error(
        "[files] could not mirror upload into Employee Work",
        error
      );
    }
  }

  private async rootFolderId(
    houseId: string,
    parentEntry: { storagePath: string | null } | null
  ): Promise<string> {
    if (parentEntry) {
      return parentEntry.storagePath!;
    }
    const { visibleRootFolderId } =
      await driveService.getRootFolderIds(houseId);
    return visibleRootFolderId;
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

  private async requireEntry(houseId: string, entryId: string, userId: string) {
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
    if (entry.sensitive) {
      await organizationsService.requireOwnerRole(
        houseId,
        userId,
        "access the Sensitive folder"
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
  taskId: string | null;
  name: string;
  type: string;
  storagePath: string | null;
  size: number | null;
  mimeType: string | null;
  sensitive: boolean;
  uploadedBy: { id: string; name: string };
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: entry.id,
    parentId: entry.parentId,
    taskId: entry.taskId,
    name: entry.name,
    type: entry.type,
    size: entry.size,
    mimeType: entry.mimeType,
    sensitive: entry.sensitive,
    uploadedById: entry.uploadedBy.id,
    uploadedByName: entry.uploadedBy.name,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt
  };
}

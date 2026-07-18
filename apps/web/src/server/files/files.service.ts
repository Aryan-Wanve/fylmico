import {
  signDownloadToken,
  signUploadSessionToken,
  verifyUploadSessionToken,
  type UploadSessionClaims
} from "../drive/drive-token.util";
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
import type { InitiateUploadDto } from "./dto/initiate-upload.dto";
import type { UpdateMediaMetadataDto } from "./dto/update-media-metadata.dto";

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

    return this.createFileEntryRow({
      organizationId: houseId,
      parentId,
      parentEntry,
      conversationId: conversationId ?? null,
      taskId: taskId ?? null,
      name: file.name,
      storagePath,
      size: file.size,
      mimeType: file.mimeType,
      uploadedById: userId
    });
  }

  // Step 1 of the resumable-upload flow (ADR 0058): opens a Drive
  // resumable-upload session and hands the caller back a signed, opaque
  // token encoding everything needed to relay chunks and finalize the
  // FileEntry later - no session state is kept in our own database, Drive
  // keeps the session alive server-side for up to a week.
  async initiateUpload(
    userId: string,
    houseId: string,
    dto: InitiateUploadDto
  ): Promise<{ uploadToken: string }> {
    await organizationsService.requireMembership(houseId, userId);

    const parentEntry = dto.parentId
      ? await this.requireEntry(houseId, dto.parentId, userId)
      : null;
    const parentDriveFolderId = await this.rootFolderId(houseId, parentEntry);

    const driveSessionUrl = await driveService.initiateResumableUpload(
      houseId,
      parentDriveFolderId,
      dto.name,
      dto.mimeType,
      dto.size
    );

    const uploadToken = signUploadSessionToken({
      organizationId: houseId,
      userId,
      driveSessionUrl,
      parentId: dto.parentId ?? null,
      name: dto.name,
      mimeType: dto.mimeType,
      size: dto.size,
      conversationId: dto.conversationId ?? null,
      taskId: dto.taskId ?? null
    });

    return { uploadToken };
  }

  // Step 2 - relays one chunk to the Drive session named by the token.
  // Unauthenticated by design, same trust model as getDownloadUrl's
  // signed token: it's meaningless without our server's stored Drive
  // access token, so no separate requireUser check is needed here.
  async relayUploadChunk(
    token: string,
    chunk: ArrayBuffer,
    start: number,
    end: number,
    total: number
  ) {
    const claims = this.verifyUploadToken(token);

    let result;
    try {
      result = await driveService.uploadResumableChunk(
        claims.organizationId,
        claims.driveSessionUrl,
        chunk,
        start,
        end,
        total
      );
    } catch (error) {
      throw new AppException(
        HttpStatus.BAD_GATEWAY,
        "drive_upload_failed",
        error instanceof Error
          ? error.message
          : "Could not upload this chunk to Google Drive."
      );
    }

    if (!result.done) {
      return {
        status: "incomplete" as const,
        receivedBytes: result.receivedBytes
      };
    }

    const file = await this.finalizeUploadFromClaims(claims, result.fileId);
    return { status: "complete" as const, file };
  }

  // Step 3 - "how far did we get?", the mechanism that lets the client
  // resume after a dropped connection instead of restarting from 0%.
  async getUploadStatus(token: string) {
    const claims = this.verifyUploadToken(token);

    let result;
    try {
      result = await driveService.getResumableUploadStatus(
        claims.organizationId,
        claims.driveSessionUrl,
        claims.size
      );
    } catch (error) {
      throw new AppException(
        HttpStatus.GONE,
        "upload_session_expired",
        error instanceof Error
          ? error.message
          : "This upload session has expired - please restart the upload."
      );
    }

    if (!result.done) {
      return {
        status: "incomplete" as const,
        receivedBytes: result.receivedBytes,
        total: claims.size
      };
    }

    const file = await this.finalizeUploadFromClaims(claims, result.fileId);
    return { status: "complete" as const, file };
  }

  async updateMediaMetadata(
    userId: string,
    houseId: string,
    entryId: string,
    dto: UpdateMediaMetadataDto
  ) {
    await organizationsService.requireMembership(houseId, userId);
    await this.requireEntry(houseId, entryId, userId);

    const updated = await this.prisma.fileEntry.update({
      where: { id: entryId },
      data: {
        ...(dto.durationSeconds !== undefined
          ? { durationSeconds: dto.durationSeconds }
          : {}),
        ...(dto.width !== undefined ? { width: dto.width } : {}),
        ...(dto.height !== undefined ? { height: dto.height } : {})
      },
      include: { uploadedBy: true }
    });

    return toFileEntryDto(updated);
  }

  private verifyUploadToken(token: string): UploadSessionClaims {
    try {
      return verifyUploadSessionToken(token);
    } catch {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_or_expired_token",
        "This upload session is invalid or has expired."
      );
    }
  }

  private async finalizeUploadFromClaims(
    claims: UploadSessionClaims,
    fileId: string
  ) {
    const parentEntry = claims.parentId
      ? await this.prisma.fileEntry.findUnique({
          where: { id: claims.parentId }
        })
      : null;

    return this.createFileEntryRow({
      organizationId: claims.organizationId,
      parentId: claims.parentId,
      parentEntry,
      conversationId: claims.conversationId,
      taskId: claims.taskId,
      name: claims.name,
      storagePath: fileId,
      size: claims.size,
      mimeType: claims.mimeType,
      uploadedById: claims.userId
    });
  }

  private async createFileEntryRow(params: {
    organizationId: string;
    parentId: string | null;
    parentEntry: { sensitive: boolean } | null;
    conversationId: string | null;
    taskId: string | null;
    name: string;
    storagePath: string;
    size: number;
    mimeType: string;
    uploadedById: string;
  }) {
    const entry = await this.prisma.fileEntry.create({
      data: {
        organizationId: params.organizationId,
        parentId: params.parentId,
        conversationId: params.conversationId,
        taskId: params.taskId,
        name: params.name,
        type: "file",
        storagePath: params.storagePath,
        size: params.size,
        mimeType: params.mimeType,
        sensitive: params.parentEntry?.sensitive ?? false,
        uploadedById: params.uploadedById
      },
      include: { uploadedBy: true }
    });

    await this.mirrorIntoEmployeeWork(
      params.organizationId,
      params.uploadedById,
      entry.name,
      params.mimeType,
      params.storagePath,
      params.size
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
      ownerType: "project" | "client";
      ownerId: string;
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
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
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
    durationSeconds: entry.durationSeconds,
    width: entry.width,
    height: entry.height,
    sensitive: entry.sensitive,
    uploadedById: entry.uploadedBy.id,
    uploadedByName: entry.uploadedBy.name,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt
  };
}

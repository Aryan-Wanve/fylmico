import { Prisma, type FileEntry } from "@fylmico/database";
import { prisma } from "../prisma";
import { driveService } from "./drive.service";

const RESOURCE_SUBFOLDERS = [
  "Fonts",
  "LUTs",
  "Music",
  "SFX",
  "Logos",
  "Brand Assets",
  "Templates",
  "Motion Graphics",
  "Stock Assets",
  "Misc"
];
const PORTFOLIO_CATEGORIES = [
  "Commercials",
  "Reels",
  "Films",
  "Photography",
  "Misc"
];
// Both a Project and a Client workspace get the same subfolder set (ADR
// 0059) - they are independent, co-equal owners of work.
const OWNER_SUBFOLDERS = [
  "Scripts",
  "Storyboards",
  "Raw Data",
  "Shoots",
  "Project Files",
  "Deliveries",
  "Assets"
];

type OwnerType = "project" | "client";
const OWNER_ROOT_KEY: Record<OwnerType, string> = {
  project: "projects",
  client: "clients"
};
const EMPLOYEE_SUBFOLDERS = [
  "Videos",
  "Scripts",
  "Storyboards",
  "Images",
  "Designs",
  "Documents"
];
const SENSITIVE_FOLDERS = [
  { key: "sensitive:finance", name: "Finance" },
  { key: "sensitive:quotations", name: "Quotations" },
  { key: "sensitive:contracts", name: "Contracts" },
  { key: "sensitive:hr", name: "HR" },
  { key: "sensitive:internal", name: "Internal" },
  { key: "sensitive:employeework", name: "Employee Work" }
];

export type UploadCategory =
  "raw" | "assets" | "deliverables" | "project-files";

const CATEGORY_TO_SUBFOLDER: Record<UploadCategory, string> = {
  raw: "Raw Data",
  assets: "Assets",
  deliverables: "Deliveries",
  "project-files": "Project Files"
};

class DriveStructureService {
  private readonly prisma = prisma;

  async ensureHouseSkeleton(organizationId: string): Promise<void> {
    // Two independent top-level trees: Projects/ and Clients/ (ADR 0059).
    await this.ensureFolder(
      organizationId,
      "projects",
      "Projects",
      null,
      false
    );
    await this.ensureFolder(organizationId, "clients", "Clients", null, false);
    const resources = await this.ensureFolder(
      organizationId,
      "resources",
      "Resources",
      null,
      false
    );
    const portfolio = await this.ensureFolder(
      organizationId,
      "portfolio",
      "Portfolio",
      null,
      false
    );

    for (const name of RESOURCE_SUBFOLDERS) {
      await this.ensureFolder(
        organizationId,
        `resources:${name}`,
        name,
        resources,
        false
      );
    }
    for (const name of PORTFOLIO_CATEGORIES) {
      await this.ensureFolder(
        organizationId,
        `portfolio:${name}`,
        name,
        portfolio,
        false
      );
    }
    for (const folder of SENSITIVE_FOLDERS) {
      await this.ensureFolder(
        organizationId,
        folder.key,
        folder.name,
        null,
        true
      );
    }
  }

  // Creates (idempotently) a Project or Client workspace folder as a
  // top-level entry under Projects/ or Clients/, with the shared subfolder
  // set. drive-key scheme: `project:<id>` / `client:<id>` and
  // `project:<id>:<sub>` / `client:<id>:<sub>`.
  async ensureOwnerFolder(
    organizationId: string,
    ownerType: OwnerType,
    ownerId: string,
    name: string
  ): Promise<FileEntry> {
    const root = await this.requireFolder(
      organizationId,
      OWNER_ROOT_KEY[ownerType]
    );
    const ownerKey = `${ownerType}:${ownerId}`;
    const owner = await this.ensureFolder(
      organizationId,
      ownerKey,
      name,
      root,
      false
    );

    for (const sub of OWNER_SUBFOLDERS) {
      await this.ensureFolder(
        organizationId,
        `${ownerKey}:${sub}`,
        sub,
        owner,
        false
      );
    }
    return owner;
  }

  async ensureRawDataDateFolder(
    organizationId: string,
    ownerType: OwnerType,
    ownerId: string,
    dateISO: string
  ): Promise<FileEntry> {
    const ownerKey = `${ownerType}:${ownerId}`;
    const rawData = await this.requireFolder(
      organizationId,
      `${ownerKey}:Raw Data`
    );
    return this.ensureFolder(
      organizationId,
      `${ownerKey}:rawdata:${dateISO}`,
      dateISO,
      rawData,
      false
    );
  }

  async ensureShootFolder(
    organizationId: string,
    ownerType: OwnerType,
    ownerId: string,
    shootId: string,
    name: string,
    dateISO: string
  ): Promise<FileEntry> {
    const ownerKey = `${ownerType}:${ownerId}`;
    const shoots = await this.requireFolder(
      organizationId,
      `${ownerKey}:Shoots`
    );
    return this.ensureFolder(
      organizationId,
      `${ownerKey}:shoot:${shootId}`,
      `${dateISO} - ${name}`,
      shoots,
      false
    );
  }

  async ensureEmployeeFolder(
    organizationId: string,
    userId: string,
    name: string
  ): Promise<FileEntry> {
    const employeeWork = await this.requireFolder(
      organizationId,
      "sensitive:employeework"
    );
    const employee = await this.ensureFolder(
      organizationId,
      `employee:${userId}`,
      name,
      employeeWork,
      true
    );
    for (const sub of EMPLOYEE_SUBFOLDERS) {
      await this.ensureFolder(
        organizationId,
        `employee:${userId}:${sub}`,
        sub,
        employee,
        true
      );
    }
    return employee;
  }

  // Resolves the destination folder for an upload owned by a Project or a
  // Client. `category` picks the subfolder (Raw Data gets a dated child).
  async resolveDestination(
    organizationId: string,
    params: {
      ownerType: OwnerType;
      ownerId: string;
      category?: UploadCategory;
    }
  ): Promise<FileEntry> {
    const ownerKey = `${params.ownerType}:${params.ownerId}`;
    const subfolderName =
      CATEGORY_TO_SUBFOLDER[params.category ?? "project-files"];
    if (subfolderName === "Raw Data") {
      const dateISO = new Date().toISOString().slice(0, 10);
      return this.ensureRawDataDateFolder(
        organizationId,
        params.ownerType,
        params.ownerId,
        dateISO
      );
    }
    return this.requireFolder(organizationId, `${ownerKey}:${subfolderName}`);
  }

  private async ensureFolder(
    organizationId: string,
    driveKey: string,
    name: string,
    parent: FileEntry | null,
    sensitive: boolean
  ): Promise<FileEntry> {
    const existing = await this.prisma.fileEntry.findUnique({
      where: { organizationId_driveKey: { organizationId, driveKey } }
    });
    if (existing) {
      return existing;
    }

    const parentDriveFolderId = parent
      ? parent.storagePath!
      : sensitive
        ? (await driveService.getRootFolderIds(organizationId))
            .sensitiveRootFolderId
        : (await driveService.getRootFolderIds(organizationId))
            .visibleRootFolderId;
    const driveFolderId = await driveService.createFolder(
      organizationId,
      name,
      parentDriveFolderId
    );
    const connection = await this.prisma.driveConnection.findUniqueOrThrow({
      where: { organizationId }
    });

    try {
      return await this.prisma.fileEntry.create({
        data: {
          organizationId,
          parentId: parent?.id ?? null,
          name,
          type: "folder",
          storagePath: driveFolderId,
          driveKey,
          sensitive,
          uploadedById: connection.connectedById
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const race = await this.prisma.fileEntry.findUnique({
          where: { organizationId_driveKey: { organizationId, driveKey } }
        });
        if (race) {
          return race;
        }
      }
      throw error;
    }
  }

  async getFolderByKey(
    organizationId: string,
    driveKey: string
  ): Promise<FileEntry> {
    return this.requireFolder(organizationId, driveKey);
  }

  private async requireFolder(
    organizationId: string,
    driveKey: string
  ): Promise<FileEntry> {
    return this.prisma.fileEntry.findUniqueOrThrow({
      where: { organizationId_driveKey: { organizationId, driveKey } }
    });
  }
}

export const driveStructureService = new DriveStructureService();

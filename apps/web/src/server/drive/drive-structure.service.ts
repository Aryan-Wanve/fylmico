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
const PROJECT_SUBFOLDERS = [
  "Scripts",
  "Storyboards",
  "Raw Data",
  "Project Files",
  "Deliveries",
  "Assets"
];
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
    const clients = await this.ensureFolder(
      organizationId,
      "clients",
      "Clients",
      null,
      false
    );
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

    await this.ensureFolder(
      organizationId,
      "client:misc",
      "Misc",
      clients,
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

  async ensureClientFolder(
    organizationId: string,
    clientId: string,
    name: string
  ): Promise<FileEntry> {
    const clients = await this.requireFolder(organizationId, "clients");
    return this.ensureFolder(
      organizationId,
      `client:${clientId}`,
      name,
      clients,
      false
    );
  }

  async ensureProjectFolder(
    organizationId: string,
    projectId: string,
    name: string,
    clientId: string | null
  ): Promise<FileEntry> {
    const parentKey = clientId ? `client:${clientId}` : "client:misc";
    const parent = await this.requireFolder(organizationId, parentKey);
    const project = await this.ensureFolder(
      organizationId,
      `project:${projectId}`,
      name,
      parent,
      false
    );

    for (const sub of PROJECT_SUBFOLDERS) {
      await this.ensureFolder(
        organizationId,
        `project:${projectId}:${sub}`,
        sub,
        project,
        false
      );
    }
    return project;
  }

  async ensureRawDataDateFolder(
    organizationId: string,
    projectId: string,
    dateISO: string
  ): Promise<FileEntry> {
    const rawData = await this.requireFolder(
      organizationId,
      `project:${projectId}:Raw Data`
    );
    return this.ensureFolder(
      organizationId,
      `project:${projectId}:rawdata:${dateISO}`,
      dateISO,
      rawData,
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

  async resolveDestination(
    organizationId: string,
    params: {
      clientId: string | "misc";
      projectId?: string;
      category?: UploadCategory;
    }
  ): Promise<FileEntry> {
    if (params.clientId === "misc") {
      return this.requireFolder(organizationId, "client:misc");
    }
    if (!params.projectId) {
      return this.requireFolder(organizationId, `client:${params.clientId}`);
    }

    const subfolderName =
      CATEGORY_TO_SUBFOLDER[params.category ?? "project-files"];
    if (subfolderName === "Raw Data") {
      const dateISO = new Date().toISOString().slice(0, 10);
      return this.ensureRawDataDateFolder(
        organizationId,
        params.projectId,
        dateISO
      );
    }
    return this.requireFolder(
      organizationId,
      `project:${params.projectId}:${subfolderName}`
    );
  }

  async moveProjectFolderToClient(
    organizationId: string,
    projectId: string,
    clientId: string
  ): Promise<void> {
    const project = await this.requireFolder(
      organizationId,
      `project:${projectId}`
    );
    const newParent = await this.requireFolder(
      organizationId,
      `client:${clientId}`
    );
    if (project.parentId === newParent.id) {
      return;
    }

    const oldParent = project.parentId
      ? await this.prisma.fileEntry.findUnique({
          where: { id: project.parentId }
        })
      : null;
    const { visibleRootFolderId } =
      await driveService.getRootFolderIds(organizationId);

    await driveService.moveFolder(
      organizationId,
      project.storagePath!,
      newParent.storagePath!,
      oldParent?.storagePath ?? visibleRootFolderId
    );

    await this.prisma.fileEntry.update({
      where: { id: project.id },
      data: { parentId: newParent.id }
    });
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

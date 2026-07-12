import { AppException, HttpStatus } from "../http";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";
import type { CreateScriptDto } from "./dto/create-script.dto";
import type { UpdateScriptDto } from "./dto/update-script.dto";

class ScriptsService {
  private readonly prisma = prisma;

  async list(userId: string, houseId: string) {
    await organizationsService.requireMembership(houseId, userId);

    const scripts = await this.prisma.script.findMany({
      where: { organizationId: houseId },
      include: { createdBy: true },
      orderBy: { updatedAt: "desc" }
    });

    return scripts.map(toScriptSummaryDto);
  }

  async get(userId: string, houseId: string, scriptId: string) {
    await organizationsService.requireMembership(houseId, userId);
    const script = await this.requireScript(houseId, scriptId);
    return toScriptDto(script);
  }

  async create(userId: string, houseId: string, dto: CreateScriptDto) {
    await organizationsService.requireMembership(houseId, userId);

    if (dto.projectId) {
      await this.requireProject(houseId, dto.projectId);
    }

    const script = await this.prisma.script.create({
      data: {
        organizationId: houseId,
        projectId: dto.projectId || null,
        title: dto.title.trim(),
        content: dto.content ?? "",
        createdById: userId
      },
      include: { createdBy: true }
    });

    return toScriptDto(script);
  }

  async update(
    userId: string,
    houseId: string,
    scriptId: string,
    dto: UpdateScriptDto
  ) {
    await organizationsService.requireMembership(houseId, userId);
    await this.requireScript(houseId, scriptId);

    if (dto.projectId) {
      await this.requireProject(houseId, dto.projectId);
    }

    const script = await this.prisma.script.update({
      where: { id: scriptId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.projectId !== undefined
          ? { projectId: dto.projectId || null }
          : {})
      },
      include: { createdBy: true }
    });

    return toScriptDto(script);
  }

  async delete(userId: string, houseId: string, scriptId: string) {
    await organizationsService.requireMembership(houseId, userId);
    await this.requireScript(houseId, scriptId);

    await this.prisma.script.delete({ where: { id: scriptId } });
  }

  private async requireScript(houseId: string, scriptId: string) {
    const script = await this.prisma.script.findUnique({
      where: { id: scriptId },
      include: { createdBy: true }
    });
    if (!script || script.organizationId !== houseId) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "script_not_found",
        "This script does not exist in this house."
      );
    }
    return script;
  }

  private async requireProject(houseId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    });
    if (!project || project.organizationId !== houseId) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "project_not_found",
        "This project does not exist in this house."
      );
    }
    return project;
  }
}

export const scriptsService = new ScriptsService();

function toScriptSummaryDto(script: {
  id: string;
  projectId: string | null;
  title: string;
  content: string;
  createdBy: { id: string; name: string };
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: script.id,
    projectId: script.projectId,
    title: script.title,
    wordCount: script.content.trim()
      ? script.content.trim().split(/\s+/).length
      : 0,
    createdById: script.createdBy.id,
    createdByName: script.createdBy.name,
    createdAt: script.createdAt,
    updatedAt: script.updatedAt
  };
}

function toScriptDto(script: {
  id: string;
  projectId: string | null;
  title: string;
  content: string;
  createdBy: { id: string; name: string };
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: script.id,
    projectId: script.projectId,
    title: script.title,
    content: script.content,
    createdById: script.createdBy.id,
    createdByName: script.createdBy.name,
    createdAt: script.createdAt,
    updatedAt: script.updatedAt
  };
}

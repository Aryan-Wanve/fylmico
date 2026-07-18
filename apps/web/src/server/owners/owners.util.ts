import { AppException, HttpStatus } from "../http";
import { prisma } from "../prisma";

// A unit of work (task, deliverable, shoot, calendar event) belongs to
// exactly one owner - a Project OR a Client, never both (ADR 0059). This
// helper is the single place that resolves, validates, and maps that
// polymorphic ownership so every service shares one implementation rather
// than duplicating Project and Client code paths.

export type OwnerType = "project" | "client";

export interface OwnerInput {
  ownerType: OwnerType;
  ownerId: string;
}

export interface ResolvedOwner {
  ownerType: OwnerType;
  ownerId: string;
  ownerName: string;
}

// Prisma-shaped `{ projectId }` or `{ clientId }` - spread into a create's
// `data` or a `where` to scope by owner.
export function ownerWhere(owner: OwnerInput): {
  projectId?: string;
  clientId?: string;
} {
  return owner.ownerType === "project"
    ? { projectId: owner.ownerId }
    : { clientId: owner.ownerId };
}

// Reads the owner off a row that includes `project` and/or `client`
// relations (or bare `projectId`/`clientId`). Returns null when unowned.
export function toOwnerDto(row: {
  projectId?: string | null;
  clientId?: string | null;
  project?: { id: string; name: string } | null;
  client?: { id: string; name: string } | null;
}): ResolvedOwner | null {
  if (row.project) {
    return {
      ownerType: "project",
      ownerId: row.project.id,
      ownerName: row.project.name
    };
  }
  if (row.client) {
    return {
      ownerType: "client",
      ownerId: row.client.id,
      ownerName: row.client.name
    };
  }
  if (row.projectId) {
    return { ownerType: "project", ownerId: row.projectId, ownerName: "" };
  }
  if (row.clientId) {
    return { ownerType: "client", ownerId: row.clientId, ownerName: "" };
  }
  return null;
}

// Validates that the referenced Project/Client exists in this house and
// returns its display name. Throws 404 if it doesn't belong to the house.
export async function resolveOwner(
  houseId: string,
  owner: OwnerInput
): Promise<ResolvedOwner> {
  if (owner.ownerType === "project") {
    const project = await prisma.project.findFirst({
      where: { id: owner.ownerId, organizationId: houseId },
      select: { id: true, name: true }
    });
    if (!project) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "project_not_found",
        "This project does not exist."
      );
    }
    return {
      ownerType: "project",
      ownerId: project.id,
      ownerName: project.name
    };
  }

  const client = await prisma.client.findFirst({
    where: { id: owner.ownerId, organizationId: houseId },
    select: { id: true, name: true }
  });
  if (!client) {
    throw new AppException(
      HttpStatus.NOT_FOUND,
      "client_not_found",
      "This client does not exist."
    );
  }
  return { ownerType: "client", ownerId: client.id, ownerName: client.name };
}

import { apiRequest } from "@/lib/api/client";
import { clearSession, setSession } from "@/lib/session";
import type {
  ChatRoom,
  CreateHouseRequest,
  CreateTaskRequest,
  House,
  JoinHouseRequest,
  LoginRequest,
  ProductionTask,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  SendChatMessageRequest,
  SignupRequest,
  WorkspaceSnapshot
} from "../types/base";

let activeHouseId: string | null = null;

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export async function login(request: LoginRequest): Promise<WorkspaceSnapshot> {
  if (!request.email.trim() || !request.password.trim()) {
    throw new Error("Enter an email and password to continue.");
  }

  const { accessToken, refreshToken } = await apiRequest<TokenPair>(
    "/auth/login",
    {
      method: "POST",
      body: request,
      auth: false
    }
  );
  setSession(accessToken, refreshToken);

  return getWorkspace();
}

export async function signup(
  request: SignupRequest
): Promise<WorkspaceSnapshot> {
  if (
    !request.name.trim() ||
    !request.email.trim() ||
    !request.password.trim()
  ) {
    throw new Error("Name, email, and password are required.");
  }

  const { accessToken, refreshToken } = await apiRequest<TokenPair>(
    "/auth/signup",
    {
      method: "POST",
      body: request,
      auth: false
    }
  );
  setSession(accessToken, refreshToken);

  return getWorkspace();
}

export function logout(): void {
  clearSession();
  activeHouseId = null;
}

export async function requestPasswordReset(
  request: RequestPasswordResetRequest
): Promise<void> {
  if (!request.email.trim()) {
    throw new Error("Enter your email address.");
  }

  await apiRequest<{ success: boolean }>("/auth/request-password-reset", {
    method: "POST",
    body: request,
    auth: false
  });
}

export async function resetPassword(
  request: ResetPasswordRequest
): Promise<void> {
  if (!request.token.trim() || !request.newPassword.trim()) {
    throw new Error("Enter the reset code and a new password.");
  }

  await apiRequest<{ success: boolean }>("/auth/reset-password", {
    method: "POST",
    body: request,
    auth: false
  });
}

export async function verifyEmail(token: string): Promise<void> {
  if (!token.trim()) {
    throw new Error("Missing verification code.");
  }

  await apiRequest<{ success: boolean }>("/auth/verify-email", {
    method: "POST",
    body: { token },
    auth: false
  });
}

export async function getWorkspace(): Promise<WorkspaceSnapshot> {
  const snapshot = await apiRequest<WorkspaceSnapshot>("/workspace");
  activeHouseId = snapshot.activeHouseId || null;
  return snapshot;
}

export async function createHouse(request: CreateHouseRequest): Promise<House> {
  if (!request.name.trim() || !request.handle.trim()) {
    throw new Error("House name and handle are required.");
  }

  const house = await apiRequest<House>("/houses", {
    method: "POST",
    body: request
  });
  activeHouseId = house.id;
  return house;
}

export async function joinHouse(request: JoinHouseRequest): Promise<House> {
  if (!request.inviteCode.trim()) {
    throw new Error("Enter a house invite code.");
  }

  const house = await apiRequest<House>("/houses/join", {
    method: "POST",
    body: request
  });
  activeHouseId = house.id;
  return house;
}

export async function createTask(
  request: CreateTaskRequest
): Promise<ProductionTask> {
  if (!request.title.trim() || !request.project.trim() || !request.dueDate) {
    throw new Error("Task title, project, and due date are required.");
  }

  if (!activeHouseId) {
    throw new Error("Join or create a house before scheduling tasks.");
  }

  return apiRequest<ProductionTask>("/tasks", {
    method: "POST",
    body: { houseId: activeHouseId, ...request }
  });
}

export async function sendChatMessage(
  request: SendChatMessageRequest
): Promise<ChatRoom> {
  if (!request.body.trim()) {
    throw new Error("Write a message before sending.");
  }

  return apiRequest<ChatRoom>(`/chat/rooms/${request.roomId}/messages`, {
    method: "POST",
    body: { body: request.body }
  });
}

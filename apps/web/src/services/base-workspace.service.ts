import { apiRequest } from "@/lib/api/client";
import { clearSession, setSession } from "@/lib/session";
import type {
  Analytics,
  CalendarEvent,
  ChatRoom,
  CreateCalendarEventRequest,
  CreateConversationRequest,
  CreateHouseRequest,
  CreateProjectRequest,
  CreateTaskRequest,
  CreateTimeEntryRequest,
  CrewMember,
  House,
  HouseInvitation,
  InvitationPreview,
  JoinHouseRequest,
  LoginRequest,
  ProductionTask,
  Project,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  SendChatMessageRequest,
  SignupRequest,
  TimeEntry,
  UpdateCrewProfileRequest,
  UpdateProjectRequest,
  UpdateTaskRequest,
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

export async function inviteMember(email: string): Promise<HouseInvitation> {
  if (!email.trim()) {
    throw new Error("Enter an email address to invite.");
  }

  if (!activeHouseId) {
    throw new Error("Join or create a house before inviting members.");
  }

  return apiRequest<HouseInvitation>(`/houses/${activeHouseId}/invitations`, {
    method: "POST",
    body: { email }
  });
}

export async function listInvitations(): Promise<HouseInvitation[]> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing invitations.");
  }

  return apiRequest<HouseInvitation[]>(`/houses/${activeHouseId}/invitations`);
}

export async function revokeInvitation(invitationId: string): Promise<void> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before revoking invitations.");
  }

  await apiRequest<{ success: boolean }>(
    `/houses/${activeHouseId}/invitations/${invitationId}`,
    { method: "DELETE" }
  );
}

export async function leaveHouse(): Promise<void> {
  if (!activeHouseId) {
    throw new Error("You are not in a house.");
  }

  await apiRequest<{ success: boolean }>(`/houses/${activeHouseId}/leave`, {
    method: "POST"
  });
  activeHouseId = null;
}

export async function getInvitationPreview(
  token: string
): Promise<InvitationPreview> {
  return apiRequest<InvitationPreview>(`/invitations/${token}`, {
    auth: false
  });
}

export async function acceptInvitation(token: string): Promise<House> {
  const house = await apiRequest<House>(`/invitations/${token}/accept`, {
    method: "POST"
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

export async function updateTask(
  taskId: string,
  request: UpdateTaskRequest
): Promise<ProductionTask> {
  return apiRequest<ProductionTask>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: request
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/tasks/${taskId}`, {
    method: "DELETE"
  });
}

export async function listProjects(): Promise<Project[]> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing projects.");
  }

  return apiRequest<Project[]>(`/houses/${activeHouseId}/projects`, {
    query: { limit: 100 }
  });
}

export async function createProject(
  request: CreateProjectRequest
): Promise<Project> {
  if (!request.name.trim()) {
    throw new Error("Give the project a name.");
  }

  if (!activeHouseId) {
    throw new Error("Join or create a house before creating projects.");
  }

  return apiRequest<Project>(`/houses/${activeHouseId}/projects`, {
    method: "POST",
    body: request
  });
}

export async function updateProject(
  projectId: string,
  request: UpdateProjectRequest
): Promise<Project> {
  return apiRequest<Project>(`/projects/${projectId}`, {
    method: "PATCH",
    body: request
  });
}

export async function archiveProject(projectId: string): Promise<Project> {
  return apiRequest<Project>(`/projects/${projectId}/archive`, {
    method: "POST"
  });
}

export async function listCrew(): Promise<CrewMember[]> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing the crew.");
  }

  return apiRequest<CrewMember[]>(`/houses/${activeHouseId}/crew`);
}

export async function updateCrewProfile(
  userId: string,
  request: UpdateCrewProfileRequest
): Promise<CrewMember> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before editing crew profiles.");
  }

  return apiRequest<CrewMember>(`/houses/${activeHouseId}/crew/${userId}`, {
    method: "PATCH",
    body: request
  });
}

export async function removeCrewMember(userId: string): Promise<void> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before removing crew members.");
  }

  await apiRequest<{ success: boolean }>(
    `/houses/${activeHouseId}/crew/${userId}`,
    { method: "DELETE" }
  );
}

export async function listCalendarEvents(): Promise<CalendarEvent[]> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing the calendar.");
  }

  return apiRequest<CalendarEvent[]>(
    `/houses/${activeHouseId}/calendar-events`
  );
}

export async function createCalendarEvent(
  request: CreateCalendarEventRequest
): Promise<CalendarEvent> {
  if (!request.title.trim() || !request.date.trim() || !request.time.trim()) {
    throw new Error("Title, date, and time are required.");
  }

  if (!activeHouseId) {
    throw new Error("Join or create a house before scheduling events.");
  }

  return apiRequest<CalendarEvent>(`/houses/${activeHouseId}/calendar-events`, {
    method: "POST",
    body: request
  });
}

export async function listTimeEntries(): Promise<TimeEntry[]> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing time entries.");
  }

  return apiRequest<TimeEntry[]>(`/houses/${activeHouseId}/time-entries`);
}

export async function createTimeEntry(
  request: CreateTimeEntryRequest
): Promise<TimeEntry> {
  if (!request.date.trim() || !(request.hours > 0)) {
    throw new Error("Date and a positive number of hours are required.");
  }

  if (!activeHouseId) {
    throw new Error("Join or create a house before logging time.");
  }

  return apiRequest<TimeEntry>(`/houses/${activeHouseId}/time-entries`, {
    method: "POST",
    body: request
  });
}

export async function getAnalytics(): Promise<Analytics> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing analytics.");
  }

  return apiRequest<Analytics>(`/houses/${activeHouseId}/analytics`);
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

export async function createConversation(
  request: CreateConversationRequest
): Promise<ChatRoom> {
  if (!request.name.trim()) {
    throw new Error("Give the channel a name.");
  }

  if (!activeHouseId) {
    throw new Error("Join or create a house before starting a channel.");
  }

  return apiRequest<ChatRoom>(`/houses/${activeHouseId}/conversations`, {
    method: "POST",
    body: request
  });
}

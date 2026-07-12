import { apiRequest } from "@/lib/api/client";
import { clearSession, setSession } from "@/lib/session";
import type {
  AccountSession,
  Analytics,
  Board,
  Booking,
  CalendarEvent,
  ChangePasswordRequest,
  ChatRoom,
  CreateBoardRequest,
  CreateBookingRequest,
  CreateCalendarEventRequest,
  CreateCharacterRequest,
  CreateConversationRequest,
  CreateHouseRequest,
  CreateLocationRequest,
  CreateProjectRequest,
  CreateShotRequest,
  CreateTaskRequest,
  CreateTimeEntryRequest,
  CrewMember,
  DashboardSummary,
  FileEntryItem,
  FilesSummary,
  House,
  HouseInvitation,
  InviteCodePreview,
  InvitationPreview,
  JoinHouseRequest,
  LoginRequest,
  NotificationItem,
  ProductionTask,
  Project,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  SendChatMessageRequest,
  Shot,
  SignupRequest,
  StoryCharacter,
  StoryLocationItem,
  TimeEntry,
  UpdateCrewProfileRequest,
  UpdateConversationRequest,
  UpdateHouseRequest,
  UpdateMeRequest,
  UpdateProjectRequest,
  UpdateShotRequest,
  UpdateTaskRequest,
  UserProfile,
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

export async function resendVerificationEmail(): Promise<void> {
  await apiRequest<{ success: boolean }>("/auth/resend-verification", {
    method: "POST"
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

export async function getInviteCodePreview(
  code: string
): Promise<InviteCodePreview> {
  return apiRequest<InviteCodePreview>(`/houses/join/${code}/preview`, {
    auth: false
  });
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

export async function updateConversation(
  roomId: string,
  request: UpdateConversationRequest
): Promise<ChatRoom> {
  return apiRequest<ChatRoom>(`/chat/rooms/${roomId}`, {
    method: "PATCH",
    body: request
  });
}

export async function updateHouse(request: UpdateHouseRequest): Promise<House> {
  if (!activeHouseId) {
    throw new Error(
      "Join or create a house before editing workspace settings."
    );
  }

  return apiRequest<House>(`/houses/${activeHouseId}`, {
    method: "PATCH",
    body: request
  });
}

export async function updateMe(request: UpdateMeRequest): Promise<UserProfile> {
  if (request.name !== undefined && !request.name.trim()) {
    throw new Error("Enter your name.");
  }

  return apiRequest<UserProfile>("/auth/me", {
    method: "PATCH",
    body: request
  });
}

export async function uploadAvatar(file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.set("file", file);

  return apiRequest<UserProfile>("/auth/me/avatar", {
    method: "POST",
    body: formData
  });
}

export async function changePassword(
  request: ChangePasswordRequest
): Promise<void> {
  if (!request.currentPassword || !request.newPassword) {
    throw new Error("Fill in all password fields.");
  }

  await apiRequest<{ success: boolean }>("/auth/change-password", {
    method: "POST",
    body: request
  });
}

export async function listSessions(): Promise<AccountSession[]> {
  return apiRequest<AccountSession[]>("/auth/sessions");
}

export async function revokeSession(sessionId: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/auth/sessions/${sessionId}`, {
    method: "DELETE"
  });
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing the dashboard.");
  }

  return apiRequest<DashboardSummary>(
    `/houses/${activeHouseId}/dashboard-summary`
  );
}

export async function listNotifications(): Promise<NotificationItem[]> {
  return apiRequest<NotificationItem[]>("/notifications", {
    query: { limit: 20 }
  });
}

export async function markNotificationRead(
  notificationId: string
): Promise<NotificationItem> {
  return apiRequest<NotificationItem>(`/notifications/${notificationId}/read`, {
    method: "POST"
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiRequest<{ success: boolean }>("/notifications/read-all", {
    method: "POST"
  });
}

export async function listFileEntries(
  parentId: string | null
): Promise<FileEntryItem[]> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing files.");
  }

  return apiRequest<FileEntryItem[]>(`/houses/${activeHouseId}/files`, {
    query: parentId ? { parentId } : undefined
  });
}

export async function createFolder(
  name: string,
  parentId: string | null
): Promise<FileEntryItem> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before creating folders.");
  }

  return apiRequest<FileEntryItem>(`/houses/${activeHouseId}/files`, {
    method: "POST",
    body: { name, parentId: parentId ?? undefined }
  });
}

export async function uploadFileEntry(
  file: File,
  parentId: string | null
): Promise<FileEntryItem> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before uploading files.");
  }

  const formData = new FormData();
  formData.set("file", file);
  if (parentId) {
    formData.set("parentId", parentId);
  }

  return apiRequest<FileEntryItem>(`/houses/${activeHouseId}/files/upload`, {
    method: "POST",
    body: formData
  });
}

export async function deleteFileEntry(entryId: string): Promise<void> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before deleting files.");
  }

  await apiRequest<{ success: boolean }>(
    `/houses/${activeHouseId}/files/${entryId}`,
    { method: "DELETE" }
  );
}

export async function getFileDownloadUrl(entryId: string): Promise<string> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before downloading files.");
  }

  const { url } = await apiRequest<{ url: string }>(
    `/houses/${activeHouseId}/files/${entryId}/download`
  );
  return url;
}

export async function getFilesSummary(): Promise<FilesSummary> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing storage usage.");
  }

  return apiRequest<FilesSummary>(`/houses/${activeHouseId}/files/summary`);
}

export async function listBookings(): Promise<Booking[]> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing bookings.");
  }

  return apiRequest<Booking[]>(`/houses/${activeHouseId}/bookings`);
}

export async function createBooking(
  request: CreateBookingRequest
): Promise<Booking> {
  if (!request.resourceName.trim()) {
    throw new Error("Give the resource a name.");
  }

  if (!activeHouseId) {
    throw new Error("Join or create a house before creating bookings.");
  }

  return apiRequest<Booking>(`/houses/${activeHouseId}/bookings`, {
    method: "POST",
    body: request
  });
}

export async function listBoards(): Promise<Board[]> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing storyboards.");
  }

  return apiRequest<Board[]>(`/houses/${activeHouseId}/boards`);
}

export async function createBoard(request: CreateBoardRequest): Promise<Board> {
  if (!request.name.trim()) {
    throw new Error("Give the board a name.");
  }

  if (!activeHouseId) {
    throw new Error("Join or create a house before creating boards.");
  }

  return apiRequest<Board>(`/houses/${activeHouseId}/boards`, {
    method: "POST",
    body: request
  });
}

export async function deleteBoard(boardId: string): Promise<void> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before deleting boards.");
  }

  await apiRequest<{ success: boolean }>(
    `/houses/${activeHouseId}/boards/${boardId}`,
    { method: "DELETE" }
  );
}

export async function createShot(
  boardId: string,
  request: CreateShotRequest
): Promise<Shot> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before adding shots.");
  }

  return apiRequest<Shot>(`/houses/${activeHouseId}/boards/${boardId}/shots`, {
    method: "POST",
    body: request
  });
}

export async function updateShot(
  shotId: string,
  request: UpdateShotRequest
): Promise<Shot> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before editing shots.");
  }

  return apiRequest<Shot>(`/houses/${activeHouseId}/shots/${shotId}`, {
    method: "PATCH",
    body: request
  });
}

export async function listCharacters(): Promise<StoryCharacter[]> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing characters.");
  }

  return apiRequest<StoryCharacter[]>(`/houses/${activeHouseId}/characters`);
}

export async function createCharacter(
  request: CreateCharacterRequest
): Promise<StoryCharacter> {
  if (!request.name.trim() || !request.role.trim()) {
    throw new Error("Give the character a name and role.");
  }

  if (!activeHouseId) {
    throw new Error("Join or create a house before creating characters.");
  }

  return apiRequest<StoryCharacter>(`/houses/${activeHouseId}/characters`, {
    method: "POST",
    body: request
  });
}

export async function deleteCharacter(characterId: string): Promise<void> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before deleting characters.");
  }

  await apiRequest<{ success: boolean }>(
    `/houses/${activeHouseId}/characters/${characterId}`,
    { method: "DELETE" }
  );
}

export async function listLocations(): Promise<StoryLocationItem[]> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing locations.");
  }

  return apiRequest<StoryLocationItem[]>(`/houses/${activeHouseId}/locations`);
}

export async function createLocation(
  request: CreateLocationRequest
): Promise<StoryLocationItem> {
  if (!request.name.trim() || !request.type.trim()) {
    throw new Error("Give the location a name and type.");
  }

  if (!activeHouseId) {
    throw new Error("Join or create a house before creating locations.");
  }

  return apiRequest<StoryLocationItem>(`/houses/${activeHouseId}/locations`, {
    method: "POST",
    body: request
  });
}

export async function deleteLocation(locationId: string): Promise<void> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before deleting locations.");
  }

  await apiRequest<{ success: boolean }>(
    `/houses/${activeHouseId}/locations/${locationId}`,
    { method: "DELETE" }
  );
}

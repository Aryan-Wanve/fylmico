import { apiRequest, refreshSession } from "@/lib/api/client";
import { clearSession, getAccessToken, setSession } from "@/lib/session";
import type {
  AccountSession,
  Analytics,
  Board,
  Booking,
  CalendarEvent,
  ChangePasswordRequest,
  BookingStatus,
  ChatRoom,
  Comment,
  CreateBoardRequest,
  CreateBookingRequest,
  CreateCalendarEventRequest,
  CreateCharacterRequest,
  CreateConversationRequest,
  CreateHouseRequest,
  CreateLocationRequest,
  CreateProjectRequest,
  CreateScriptRequest,
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
  NotificationPreferenceSetting,
  ProductionTask,
  Project,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  Script,
  ScriptSummary,
  SendChatMessageRequest,
  Shot,
  SignupRequest,
  StoryCharacter,
  StoryLocationItem,
  TimeEntry,
  UpdateBoardRequest,
  UpdateCrewProfileRequest,
  UpdateConversationRequest,
  UpdateHouseRequest,
  UpdateMeRequest,
  UpdateProjectRequest,
  UpdateScriptRequest,
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

export async function getProject(projectId: string): Promise<Project> {
  return apiRequest<Project>(`/projects/${projectId}`);
}

export async function listProjectComments(
  projectId: string
): Promise<Comment[]> {
  return apiRequest<Comment[]>(`/projects/${projectId}/comments`, {
    query: { limit: 50 }
  });
}

export async function createProjectComment(
  projectId: string,
  body: string
): Promise<Comment> {
  return apiRequest<Comment>(`/projects/${projectId}/comments`, {
    method: "POST",
    body: { body }
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

export async function getAnalytics(days = 7): Promise<Analytics> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing analytics.");
  }

  return apiRequest<Analytics>(`/houses/${activeHouseId}/analytics`, {
    query: { days }
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

export async function listRoomFiles(roomId: string): Promise<FileEntryItem[]> {
  return apiRequest<FileEntryItem[]>(`/chat/rooms/${roomId}/files`);
}

export async function listRoomTasks(roomId: string): Promise<ProductionTask[]> {
  return apiRequest<ProductionTask[]>(`/chat/rooms/${roomId}/tasks`);
}

export async function createRoomTask(
  roomId: string,
  title: string
): Promise<ProductionTask[]> {
  if (!title.trim()) {
    throw new Error("Enter a task title.");
  }

  return apiRequest<ProductionTask[]>(`/chat/rooms/${roomId}/tasks`, {
    method: "POST",
    body: { title }
  });
}

export async function listRoomEvents(roomId: string): Promise<CalendarEvent[]> {
  return apiRequest<CalendarEvent[]>(`/chat/rooms/${roomId}/events`);
}

export async function createRoomEvent(
  roomId: string,
  request: { title: string; date: string; time: string }
): Promise<CalendarEvent[]> {
  if (!request.title.trim() || !request.date.trim() || !request.time.trim()) {
    throw new Error("Enter a title, date, and time for the event.");
  }

  return apiRequest<CalendarEvent[]>(`/chat/rooms/${roomId}/events`, {
    method: "POST",
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

export async function updateNotificationPreferences(
  preferences: NotificationPreferenceSetting[]
): Promise<UserProfile> {
  return apiRequest<UserProfile>("/auth/me/notification-preferences", {
    method: "PATCH",
    body: { preferences }
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
  parentId: string | null,
  conversationId?: string | null
): Promise<FileEntryItem> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before uploading files.");
  }

  const formData = new FormData();
  formData.set("file", file);
  if (parentId) {
    formData.set("parentId", parentId);
  }
  if (conversationId) {
    formData.set("conversationId", conversationId);
  }

  return apiRequest<FileEntryItem>(`/houses/${activeHouseId}/files/upload`, {
    method: "POST",
    body: formData
  });
}

export interface UploadHandle {
  promise: Promise<FileEntryItem>;
  cancel: () => void;
}

// XMLHttpRequest (not fetch) so `xhr.upload.onprogress` can report bytes
// sent as the request body streams out - fetch has no equivalent hook for
// upload (as opposed to download) progress.
export function uploadFileEntryWithProgress(
  file: File,
  parentId: string | null,
  onProgress: (loaded: number, total: number) => void,
  conversationId?: string | null
): UploadHandle {
  if (!activeHouseId) {
    throw new Error("Join or create a house before uploading files.");
  }
  const houseId = activeHouseId;

  const formData = new FormData();
  formData.set("file", file);
  if (parentId) {
    formData.set("parentId", parentId);
  }
  if (conversationId) {
    formData.set("conversationId", conversationId);
  }

  class UploadHttpError extends Error {
    constructor(
      message: string,
      readonly status: number
    ) {
      super(message);
    }
  }

  let activeRequest: XMLHttpRequest | undefined;

  const send = (): Promise<FileEntryItem> =>
    new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      activeRequest = request;
      request.open("POST", `/api/v1/houses/${houseId}/files/upload`);
      const token = getAccessToken();
      if (token) {
        request.setRequestHeader("Authorization", `Bearer ${token}`);
      }
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(event.loaded, event.total);
        }
      };
      request.onload = () => {
        let payload: {
          data?: FileEntryItem;
          error?: { message: string };
        } | null;
        try {
          payload = JSON.parse(request.responseText);
        } catch {
          payload = null;
        }
        if (request.status >= 200 && request.status < 300 && payload?.data) {
          resolve(payload.data);
        } else {
          reject(
            new UploadHttpError(
              payload?.error?.message ?? "Could not upload the file.",
              request.status
            )
          );
        }
      };
      request.onerror = () =>
        reject(new UploadHttpError("Could not upload the file.", 0));
      request.onabort = () =>
        reject(new UploadHttpError("Upload cancelled.", 0));
      request.send(formData);
    });

  const promise = (async () => {
    try {
      return await send();
    } catch (error) {
      if (error instanceof UploadHttpError && error.status === 401) {
        const refreshed = await refreshSession();
        if (refreshed) {
          return await send();
        }
      }
      throw error;
    }
  })();

  return {
    promise,
    cancel: () => activeRequest?.abort()
  };
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

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<Booking> {
  return apiRequest<Booking>(`/bookings/${bookingId}`, {
    method: "PATCH",
    body: { status }
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

export async function updateBoard(
  boardId: string,
  request: UpdateBoardRequest
): Promise<Board> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before editing boards.");
  }

  return apiRequest<Board>(`/houses/${activeHouseId}/boards/${boardId}`, {
    method: "PATCH",
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

export async function listScripts(): Promise<ScriptSummary[]> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing scripts.");
  }

  return apiRequest<ScriptSummary[]>(`/houses/${activeHouseId}/scripts`);
}

export async function getScript(scriptId: string): Promise<Script> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing scripts.");
  }

  return apiRequest<Script>(`/houses/${activeHouseId}/scripts/${scriptId}`);
}

export async function createScript(
  request: CreateScriptRequest
): Promise<Script> {
  if (!request.title.trim()) {
    throw new Error("Give the script a title.");
  }

  if (!activeHouseId) {
    throw new Error("Join or create a house before creating scripts.");
  }

  return apiRequest<Script>(`/houses/${activeHouseId}/scripts`, {
    method: "POST",
    body: request
  });
}

export async function updateScript(
  scriptId: string,
  request: UpdateScriptRequest
): Promise<Script> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before editing scripts.");
  }

  return apiRequest<Script>(`/houses/${activeHouseId}/scripts/${scriptId}`, {
    method: "PATCH",
    body: request
  });
}

export async function deleteScript(scriptId: string): Promise<void> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before deleting scripts.");
  }

  await apiRequest<{ success: boolean }>(
    `/houses/${activeHouseId}/scripts/${scriptId}`,
    { method: "DELETE" }
  );
}

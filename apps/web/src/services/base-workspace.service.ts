import { apiRequest, apiRequestPage } from "@/lib/api/client";
import { clearSession, setSession } from "@/lib/session";
import type {
  AccountSession,
  Analytics,
  Annotation,
  Announcement,
  ApproveDeliverableOptions,
  AssignRoleRequest,
  Board,
  Booking,
  CalendarEvent,
  ChangePasswordRequest,
  BookingStatus,
  ChannelTaskItem,
  ChatMessage,
  ChatRoom,
  ClientItem,
  ClientStats,
  Comment,
  CreateBoardRequest,
  CreateAnnouncementRequest,
  CreateBookingRequest,
  CreateCalendarEventRequest,
  CreateCharacterRequest,
  CreateClientRequest,
  CreateConversationRequest,
  CreateDeliverableRequest,
  CreateHouseRequest,
  CreateLocationRequest,
  CreateProjectRequest,
  CreateScriptRequest,
  CreateShootRequest,
  CreateShotRequest,
  CreateTaskRequest,
  CreateTimeEntryRequest,
  CrewMember,
  DashboardSummary,
  Deliverable,
  DeliverableActivityEntry,
  EditChatMessageRequest,
  EditorStats,
  FileEntryItem,
  FilesSummary,
  House,
  HouseInvitation,
  InviteCodePreview,
  InvitationPreview,
  JoinHouseRequest,
  JoinRequest,
  LoginRequest,
  NotificationItem,
  NotificationPreferenceSetting,
  PersonalStats,
  ProductionTask,
  Project,
  ProjectAnalytics,
  ProjectStats,
  ProjectTimelineEntry,
  RequestJoinHouseRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  ReviewBulkAction,
  ReviewMetrics,
  ReviewQueueItem,
  TaskActivityItem,
  TaskChecklistItemDto,
  TaskTimeEntryItem,
  Script,
  ScriptSummary,
  SendChatMessageRequest,
  Shoot,
  Shot,
  SignupRequest,
  StoryCharacter,
  StoryLocationItem,
  TimeEntry,
  UpdateAnnouncementRequest,
  UpdateBoardRequest,
  UpdateCrewProfileRequest,
  UpdateConversationRequest,
  UpdateHouseRequest,
  UpdateClientRequest,
  UpdateMeRequest,
  UpdateProjectRequest,
  UpdateScriptRequest,
  UpdateShotRequest,
  UpdateTaskRequest,
  OwnerType,
  UploadCategory,
  UserProfile,
  WorkspaceSnapshot
} from "../types/base";

let activeHouseId: string | null = null;

export function getActiveHouseId(): string | null {
  return activeHouseId;
}

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
): Promise<{ email: string }> {
  if (
    !request.name.trim() ||
    !request.email.trim() ||
    !request.password.trim()
  ) {
    throw new Error("Name, email, and password are required.");
  }

  return apiRequest<{ email: string }>("/auth/signup", {
    method: "POST",
    body: request,
    auth: false
  });
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
  if (
    !request.email.trim() ||
    !request.code.trim() ||
    !request.newPassword.trim()
  ) {
    throw new Error("Enter your email, the reset code, and a new password.");
  }

  await apiRequest<{ success: boolean }>("/auth/reset-password", {
    method: "POST",
    body: request,
    auth: false
  });
}

export async function verifyEmail(
  email: string,
  code: string
): Promise<WorkspaceSnapshot> {
  if (!email.trim() || !code.trim()) {
    throw new Error("Enter your email and the verification code.");
  }

  const { accessToken, refreshToken } = await apiRequest<TokenPair>(
    "/auth/verify-email",
    {
      method: "POST",
      body: { email, code },
      auth: false
    }
  );
  setSession(accessToken, refreshToken);

  return getWorkspace();
}

export async function resendVerificationEmail(email: string): Promise<void> {
  await apiRequest<{ success: boolean }>("/auth/resend-verification", {
    method: "POST",
    body: { email },
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

export async function activateHouse(houseId: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/houses/${houseId}/activate`, {
    method: "POST"
  });
  activeHouseId = houseId;
}

export async function requestToJoinHouse(
  request: RequestJoinHouseRequest
): Promise<{ status: string }> {
  if (!request.handle.trim()) {
    throw new Error("Enter a house tag.");
  }

  return apiRequest<{ status: string }>("/houses/join-requests", {
    method: "POST",
    body: request
  });
}

export async function listJoinRequests(
  houseId: string
): Promise<JoinRequest[]> {
  return apiRequest<JoinRequest[]>(`/houses/${houseId}/join-requests`);
}

export async function respondToJoinRequest(
  houseId: string,
  requestId: string,
  status: "approved" | "rejected"
): Promise<void> {
  await apiRequest<{ success: boolean }>(
    `/houses/${houseId}/join-requests/${requestId}`,
    {
      method: "PATCH",
      body: { status }
    }
  );
}

export async function checkHandleAvailability(
  handle: string
): Promise<boolean> {
  const result = await apiRequest<{ available: boolean }>(
    "/houses/check-handle",
    { query: { handle } }
  );
  return result.available;
}

export async function assignRole(
  houseId: string,
  membershipId: string,
  request: AssignRoleRequest
): Promise<House> {
  return apiRequest<House>(
    `/houses/${houseId}/pending-members/${membershipId}/assign-role`,
    { method: "POST", body: request }
  );
}

export async function rejectPendingMember(
  houseId: string,
  membershipId: string
): Promise<House> {
  return apiRequest<House>(
    `/houses/${houseId}/pending-members/${membershipId}/reject`,
    { method: "POST" }
  );
}

export async function banPendingMember(
  houseId: string,
  membershipId: string
): Promise<House> {
  return apiRequest<House>(
    `/houses/${houseId}/pending-members/${membershipId}/ban`,
    { method: "POST" }
  );
}

export async function toggleFavoriteHouse(houseId: string): Promise<House> {
  return apiRequest<House>(`/houses/${houseId}/favorite`, { method: "POST" });
}

export async function togglePinHouse(houseId: string): Promise<House> {
  return apiRequest<House>(`/houses/${houseId}/pin`, { method: "POST" });
}

export async function toggleArchiveHouse(houseId: string): Promise<House> {
  return apiRequest<House>(`/houses/${houseId}/archive`, { method: "POST" });
}

export async function reorderHouses(organizationIds: string[]): Promise<void> {
  await apiRequest<{ success: boolean }>("/houses/reorder", {
    method: "POST",
    body: { organizationIds }
  });
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
  if (!request.title.trim()) {
    throw new Error("Give the task a title.");
  }

  if (!activeHouseId) {
    throw new Error("Join or create a house before scheduling tasks.");
  }

  return apiRequest<ProductionTask>("/tasks", {
    method: "POST",
    body: { houseId: activeHouseId, ...request }
  });
}

export async function getTask(taskId: string): Promise<ProductionTask> {
  return apiRequest<ProductionTask>(`/tasks/${taskId}`);
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

export async function duplicateTaskRequest(
  taskId: string
): Promise<ProductionTask> {
  return apiRequest<ProductionTask>(`/tasks/${taskId}/duplicate`, {
    method: "POST"
  });
}

export async function listTaskTemplates(
  houseId: string
): Promise<ProductionTask[]> {
  return apiRequest<ProductionTask[]>(`/houses/${houseId}/task-templates`);
}

export async function saveTaskAsTemplate(
  taskId: string
): Promise<ProductionTask> {
  return apiRequest<ProductionTask>(`/tasks/${taskId}/save-as-template`, {
    method: "POST"
  });
}

export async function createTaskFromTemplate(
  templateId: string
): Promise<ProductionTask> {
  return apiRequest<ProductionTask>(
    `/tasks/${templateId}/create-from-template`,
    { method: "POST" }
  );
}

export async function addChecklistItem(
  taskId: string,
  text: string
): Promise<TaskChecklistItemDto> {
  return apiRequest<TaskChecklistItemDto>(`/tasks/${taskId}/checklist`, {
    method: "POST",
    body: { text }
  });
}

export async function updateChecklistItem(
  taskId: string,
  itemId: string,
  updates: Partial<{ text: string; done: boolean; order: number }>
): Promise<TaskChecklistItemDto> {
  return apiRequest<TaskChecklistItemDto>(
    `/tasks/${taskId}/checklist/${itemId}`,
    { method: "PATCH", body: updates }
  );
}

export async function removeChecklistItem(
  taskId: string,
  itemId: string
): Promise<void> {
  await apiRequest<{ success: boolean }>(
    `/tasks/${taskId}/checklist/${itemId}`,
    { method: "DELETE" }
  );
}

export async function addTaskDependency(
  taskId: string,
  blockingTaskId: string
): Promise<ProductionTask> {
  return apiRequest<ProductionTask>(`/tasks/${taskId}/dependencies`, {
    method: "POST",
    body: { blockingTaskId }
  });
}

export async function removeTaskDependency(
  taskId: string,
  blockingTaskId: string
): Promise<ProductionTask> {
  return apiRequest<ProductionTask>(
    `/tasks/${taskId}/dependencies/${blockingTaskId}`,
    { method: "DELETE" }
  );
}

export async function startTaskTimer(
  taskId: string
): Promise<TaskTimeEntryItem> {
  return apiRequest<TaskTimeEntryItem>(`/tasks/${taskId}/time-entries/start`, {
    method: "POST"
  });
}

export async function stopTaskTimer(
  taskId: string,
  note?: string
): Promise<TaskTimeEntryItem> {
  return apiRequest<TaskTimeEntryItem>(`/tasks/${taskId}/time-entries/stop`, {
    method: "POST",
    body: { note }
  });
}

export async function addTaskWorkLog(
  taskId: string,
  entry: {
    startedAt: string;
    endedAt: string;
    durationMinutes: number;
    note?: string;
  }
): Promise<TaskTimeEntryItem> {
  return apiRequest<TaskTimeEntryItem>(`/tasks/${taskId}/time-entries`, {
    method: "POST",
    body: entry
  });
}

export async function listTaskTimeEntries(
  taskId: string
): Promise<TaskTimeEntryItem[]> {
  return apiRequest<TaskTimeEntryItem[]>(`/tasks/${taskId}/time-entries`);
}

export async function listTaskActivity(
  taskId: string
): Promise<TaskActivityItem[]> {
  return apiRequest<TaskActivityItem[]>(`/tasks/${taskId}/activity`);
}

export async function listTaskAttachments(
  taskId: string
): Promise<FileEntryItem[]> {
  return apiRequest<FileEntryItem[]>(`/tasks/${taskId}/attachments`);
}

export async function linkTaskAttachment(
  taskId: string,
  entryId: string
): Promise<FileEntryItem> {
  return apiRequest<FileEntryItem>(`/tasks/${taskId}/attachments`, {
    method: "POST",
    body: { entryId }
  });
}

export async function unlinkTaskAttachment(
  taskId: string,
  entryId: string
): Promise<void> {
  await apiRequest<{ success: boolean }>(
    `/tasks/${taskId}/attachments/${entryId}`,
    { method: "DELETE" }
  );
}

export async function uploadTaskAttachment(
  taskId: string,
  file: File
): Promise<FileEntryItem> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before uploading files.");
  }

  const formData = new FormData();
  formData.set("file", file);
  formData.set("taskId", taskId);

  return apiRequest<FileEntryItem>(`/houses/${activeHouseId}/files/upload`, {
    method: "POST",
    body: formData
  });
}

export async function listClients(): Promise<ClientItem[]> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing clients.");
  }

  return apiRequest<ClientItem[]>(`/houses/${activeHouseId}/clients`, {
    query: { limit: 100 }
  });
}

export async function createClient(
  request: CreateClientRequest
): Promise<ClientItem> {
  if (!request.name.trim()) {
    throw new Error("Give the client a name.");
  }

  if (!activeHouseId) {
    throw new Error("Join or create a house before adding clients.");
  }

  return apiRequest<ClientItem>(`/houses/${activeHouseId}/clients`, {
    method: "POST",
    body: request
  });
}

export async function updateClient(
  clientId: string,
  request: UpdateClientRequest
): Promise<ClientItem> {
  return apiRequest<ClientItem>(`/clients/${clientId}`, {
    method: "PATCH",
    body: request
  });
}

export async function archiveClient(clientId: string): Promise<ClientItem> {
  return apiRequest<ClientItem>(`/clients/${clientId}/archive`, {
    method: "POST"
  });
}

export async function deleteClient(clientId: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/clients/${clientId}`, {
    method: "DELETE"
  });
}

export async function getClientStats(clientId: string): Promise<ClientStats> {
  return apiRequest<ClientStats>(`/clients/${clientId}/stats`);
}

export async function getClient(clientId: string): Promise<ClientItem> {
  return apiRequest<ClientItem>(`/clients/${clientId}`);
}

export async function listShootsForOwner(owner: {
  ownerType: OwnerType;
  ownerId: string;
}): Promise<Shoot[]> {
  return owner.ownerType === "project"
    ? listShoots(owner.ownerId)
    : apiRequest<Shoot[]>(`/clients/${owner.ownerId}/shoots`);
}

export async function listDeliverablesForOwner(owner: {
  ownerType: OwnerType;
  ownerId: string;
}): Promise<Deliverable[]> {
  return owner.ownerType === "project"
    ? listDeliverables(owner.ownerId)
    : apiRequest<Deliverable[]>(`/clients/${owner.ownerId}/deliverables`);
}

export async function getProjectStats(
  projectId: string
): Promise<ProjectStats> {
  return apiRequest<ProjectStats>(`/projects/${projectId}/stats`);
}

export async function getProjectTimeline(
  projectId: string
): Promise<ProjectTimelineEntry[]> {
  return apiRequest<ProjectTimelineEntry[]>(`/projects/${projectId}/timeline`);
}

export async function getProjectAnalytics(
  projectId: string
): Promise<ProjectAnalytics> {
  return apiRequest<ProjectAnalytics>(`/projects/${projectId}/analytics`);
}

export async function getProjectConversation(
  projectId: string
): Promise<{ roomId: string }> {
  return apiRequest<{ roomId: string }>(`/projects/${projectId}/conversation`);
}

export async function pinMessage(messageId: string): Promise<ChatMessage> {
  return apiRequest<ChatMessage>(`/messages/${messageId}/pin`, {
    method: "POST"
  });
}

export async function listShoots(projectId: string): Promise<Shoot[]> {
  return apiRequest<Shoot[]>(`/projects/${projectId}/shoots`);
}

export async function getShoot(shootId: string): Promise<Shoot> {
  return apiRequest<Shoot>(`/shoots/${shootId}`);
}

export async function createShoot(
  projectId: string,
  request: CreateShootRequest
): Promise<Shoot> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before scheduling a shoot.");
  }

  return apiRequest<Shoot>(
    `/houses/${activeHouseId}/projects/${projectId}/shoots`,
    { method: "POST", body: request }
  );
}

export async function createShootForOwner(
  owner: { ownerType: OwnerType; ownerId: string },
  request: CreateShootRequest
): Promise<Shoot> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before scheduling a shoot.");
  }

  return apiRequest<Shoot>(`/houses/${activeHouseId}/shoots`, {
    method: "POST",
    body: { ...request, ownerType: owner.ownerType, ownerId: owner.ownerId }
  });
}

export async function markShootReached(shootId: string): Promise<Shoot> {
  return apiRequest<Shoot>(`/shoots/${shootId}/reached`, { method: "POST" });
}

export async function startShoot(shootId: string): Promise<Shoot> {
  return apiRequest<Shoot>(`/shoots/${shootId}/start`, { method: "POST" });
}

export async function finishShoot(shootId: string): Promise<Shoot> {
  return apiRequest<Shoot>(`/shoots/${shootId}/finish`, { method: "POST" });
}

export async function finishAndUploadShoot(shootId: string): Promise<Shoot> {
  return apiRequest<Shoot>(`/shoots/${shootId}/finish-upload`, {
    method: "POST"
  });
}

export async function markShootUploaded(shootId: string): Promise<Shoot> {
  return apiRequest<Shoot>(`/shoots/${shootId}/mark-uploaded`, {
    method: "POST"
  });
}

export async function markShootReadyForEditing(
  shootId: string
): Promise<Shoot> {
  return apiRequest<Shoot>(`/shoots/${shootId}/ready-for-editing`, {
    method: "POST"
  });
}

export async function getShootUploadFolder(
  shootId: string
): Promise<{ parentId: string }> {
  return apiRequest<{ parentId: string }>(`/shoots/${shootId}/upload-folder`);
}

export async function uploadFilesToShoot(
  shootId: string,
  files: File[]
): Promise<FileEntryItem[]> {
  const { parentId } = await getShootUploadFolder(shootId);
  const uploaded: FileEntryItem[] = [];
  for (const file of files) {
    uploaded.push(await uploadFileEntry(file, parentId));
  }
  return uploaded;
}

export async function archiveShoot(shootId: string): Promise<Shoot> {
  return apiRequest<Shoot>(`/shoots/${shootId}/archive`, { method: "POST" });
}

export async function cancelShoot(
  shootId: string,
  reason: string,
  notes?: string
): Promise<Shoot> {
  return apiRequest<Shoot>(`/shoots/${shootId}/cancel`, {
    method: "POST",
    body: { reason, notes }
  });
}

export async function reportShootIssue(
  shootId: string,
  message: string
): Promise<void> {
  await apiRequest<{ success: boolean }>(`/shoots/${shootId}/report-issue`, {
    method: "POST",
    body: { message }
  });
}

export async function requestShootExtraTime(
  shootId: string,
  reason: string
): Promise<void> {
  await apiRequest<{ success: boolean }>(
    `/shoots/${shootId}/request-extra-time`,
    { method: "POST", body: { reason } }
  );
}

export async function createDeliverable(
  projectId: string,
  request: CreateDeliverableRequest
): Promise<Deliverable> {
  return apiRequest<Deliverable>(`/projects/${projectId}/deliverables`, {
    method: "POST",
    body: request
  });
}

export async function listDeliverables(
  projectId: string
): Promise<Deliverable[]> {
  return apiRequest<Deliverable[]>(`/projects/${projectId}/deliverables`);
}

export async function createDeliverableForOwner(
  owner: { ownerType: OwnerType; ownerId: string },
  request: Omit<CreateDeliverableRequest, "ownerType" | "ownerId">
): Promise<Deliverable> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before submitting a draft.");
  }

  return apiRequest<Deliverable>(`/houses/${activeHouseId}/deliverables`, {
    method: "POST",
    body: { ...request, ownerType: owner.ownerType, ownerId: owner.ownerId }
  });
}

export async function approveDeliverable(
  deliverableId: string,
  options?: ApproveDeliverableOptions
): Promise<Deliverable> {
  return apiRequest<Deliverable>(`/deliverables/${deliverableId}/approve`, {
    method: "POST",
    body: options
  });
}

export async function rejectDeliverable(
  deliverableId: string,
  reason: string
): Promise<Deliverable> {
  return apiRequest<Deliverable>(`/deliverables/${deliverableId}/reject`, {
    method: "POST",
    body: { reason }
  });
}

export async function requestDeliverableRevision(
  deliverableId: string,
  comment?: string
): Promise<Deliverable> {
  return apiRequest<Deliverable>(
    `/deliverables/${deliverableId}/request-revision`,
    { method: "POST", body: comment ? { comment } : undefined }
  );
}

export async function reassignDeliverable(
  deliverableId: string,
  newEditorId: string
): Promise<Deliverable> {
  return apiRequest<Deliverable>(`/deliverables/${deliverableId}/reassign`, {
    method: "PATCH",
    body: { newEditorId }
  });
}

export async function markDeliverableFirstReviewed(
  deliverableId: string
): Promise<Deliverable> {
  return apiRequest<Deliverable>(
    `/deliverables/${deliverableId}/review-started`,
    { method: "POST" }
  );
}

export async function getDeliverableActivity(
  deliverableId: string
): Promise<DeliverableActivityEntry[]> {
  return apiRequest<DeliverableActivityEntry[]>(
    `/deliverables/${deliverableId}/activity`
  );
}

export async function getEditorStats(userId: string): Promise<EditorStats> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing editor stats.");
  }
  return apiRequest<EditorStats>(
    `/houses/${activeHouseId}/crew/${userId}/editor-stats`
  );
}

export async function listDeliverableComments(
  deliverableId: string
): Promise<Comment[]> {
  return apiRequest<Comment[]>(`/deliverables/${deliverableId}/comments`, {
    query: { limit: 50 }
  });
}

export async function createDeliverableComment(
  deliverableId: string,
  body: string,
  timestampSeconds?: number,
  extra?: {
    frameNumber?: number;
    parentId?: string;
    mentionedUserIds?: string[];
  }
): Promise<Comment> {
  return apiRequest<Comment>(`/deliverables/${deliverableId}/comments`, {
    method: "POST",
    body: { body, timestampSeconds, ...extra }
  });
}

export async function updateDeliverableComment(
  deliverableId: string,
  commentId: string,
  body: string
): Promise<Comment> {
  return apiRequest<Comment>(
    `/deliverables/${deliverableId}/comments/${commentId}`,
    { method: "PATCH", body: { body } }
  );
}

export async function deleteDeliverableComment(
  deliverableId: string,
  commentId: string
): Promise<void> {
  await apiRequest(`/deliverables/${deliverableId}/comments/${commentId}`, {
    method: "DELETE"
  });
}

export async function resolveDeliverableComment(
  deliverableId: string,
  commentId: string
): Promise<Comment> {
  return apiRequest<Comment>(
    `/deliverables/${deliverableId}/comments/${commentId}/resolve`,
    { method: "POST" }
  );
}

export async function reopenDeliverableComment(
  deliverableId: string,
  commentId: string
): Promise<Comment> {
  return apiRequest<Comment>(
    `/deliverables/${deliverableId}/comments/${commentId}/reopen`,
    { method: "POST" }
  );
}

export async function pinDeliverableComment(
  deliverableId: string,
  commentId: string
): Promise<Comment> {
  return apiRequest<Comment>(
    `/deliverables/${deliverableId}/comments/${commentId}/pin`,
    { method: "POST" }
  );
}

export async function toggleDeliverableCommentReaction(
  deliverableId: string,
  commentId: string,
  emoji: string
): Promise<Comment> {
  return apiRequest<Comment>(
    `/deliverables/${deliverableId}/comments/${commentId}/reactions`,
    { method: "POST", body: { emoji } }
  );
}

export async function listDeliverableAnnotations(
  deliverableId: string
): Promise<Annotation[]> {
  return apiRequest<Annotation[]>(`/deliverables/${deliverableId}/annotations`);
}

export async function createDeliverableAnnotation(
  deliverableId: string,
  input: {
    timestampSeconds: number;
    frameNumber?: number;
    type: Annotation["type"];
    color: string;
    data: Record<string, unknown>;
    commentId?: string;
  }
): Promise<Annotation> {
  return apiRequest<Annotation>(`/deliverables/${deliverableId}/annotations`, {
    method: "POST",
    body: input
  });
}

export async function deleteDeliverableAnnotation(
  deliverableId: string,
  annotationId: string
): Promise<void> {
  await apiRequest(
    `/deliverables/${deliverableId}/annotations/${annotationId}`,
    { method: "DELETE" }
  );
}

export async function listReviewQueue(filters?: {
  projectId?: string;
  clientId?: string;
  editorId?: string;
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: "submittedAt" | "priority" | "version";
}): Promise<ReviewQueueItem[]> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing the review queue.");
  }
  return apiRequest<ReviewQueueItem[]>(
    `/houses/${activeHouseId}/review-queue`,
    { query: filters as Record<string, string | number | undefined> }
  );
}

export async function getReviewMetrics(): Promise<ReviewMetrics> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing review metrics.");
  }
  return apiRequest<ReviewMetrics>(
    `/houses/${activeHouseId}/review-queue/metrics`
  );
}

export async function bulkReviewAction(
  action: ReviewBulkAction,
  deliverableIds: string[],
  payload?: { comment?: string; newEditorId?: string; reason?: string }
): Promise<{ results: { id: string; ok: boolean; error?: string }[] }> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before reviewing submissions.");
  }
  return apiRequest(`/houses/${activeHouseId}/review-queue/bulk-action`, {
    method: "POST",
    body: { action, deliverableIds, ...payload }
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

export async function listTaskComments(taskId: string): Promise<Comment[]> {
  return apiRequest<Comment[]>(`/tasks/${taskId}/comments`, {
    query: { limit: 50 }
  });
}

export async function createTaskComment(
  taskId: string,
  body: string
): Promise<Comment> {
  return apiRequest<Comment>(`/tasks/${taskId}/comments`, {
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

export async function getMyStats(): Promise<PersonalStats> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing your stats.");
  }

  return apiRequest<PersonalStats>(`/houses/${activeHouseId}/analytics/me`);
}

export async function sendChatMessage(
  request: SendChatMessageRequest
): Promise<ChatMessage> {
  if (!request.body.trim()) {
    throw new Error("Write a message before sending.");
  }

  return apiRequest<ChatMessage>(`/chat/rooms/${request.roomId}/messages`, {
    method: "POST",
    body: { body: request.body, parentMessageId: request.parentMessageId }
  });
}

export async function listOlderMessages(
  roomId: string,
  cursor?: string
): Promise<{ messages: ChatMessage[]; nextCursor: string | null }> {
  const { data, page } = await apiRequestPage<ChatMessage>(
    `/chat/rooms/${roomId}/messages`,
    { query: { cursor, limit: 40 } }
  );
  return { messages: data, nextCursor: page.nextCursor };
}

export async function markConversationRead(roomId: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/chat/rooms/${roomId}/read`, {
    method: "POST"
  });
}

export async function sendHeartbeat(): Promise<void> {
  await apiRequest<{ success: boolean }>("/auth/me/heartbeat", {
    method: "POST"
  });
}

export async function toggleMessageReaction(
  messageId: string,
  emoji: string
): Promise<ChatMessage> {
  return apiRequest<ChatMessage>(`/messages/${messageId}/reactions`, {
    method: "POST",
    body: { emoji }
  });
}

export async function editChatMessage(
  request: EditChatMessageRequest
): Promise<ChatMessage> {
  if (!request.body.trim()) {
    throw new Error("Write a message before saving.");
  }

  return apiRequest<ChatMessage>(`/messages/${request.messageId}`, {
    method: "PATCH",
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

export async function listRoomTasks(
  roomId: string
): Promise<ChannelTaskItem[]> {
  return apiRequest<ChannelTaskItem[]>(`/chat/rooms/${roomId}/tasks`);
}

export async function createRoomTask(
  roomId: string,
  title: string
): Promise<ChannelTaskItem[]> {
  if (!title.trim()) {
    throw new Error("Enter a task title.");
  }

  return apiRequest<ChannelTaskItem[]>(`/chat/rooms/${roomId}/tasks`, {
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
  parentId: string | null,
  sensitive = false
): Promise<FileEntryItem[]> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing files.");
  }

  return apiRequest<FileEntryItem[]>(`/houses/${activeHouseId}/files`, {
    query: { ...(parentId ? { parentId } : {}), sensitive: String(sensitive) }
  });
}

export async function resolveFileDestination(params: {
  ownerType: OwnerType;
  ownerId: string;
  category?: UploadCategory;
}): Promise<{ parentId: string }> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before uploading files.");
  }

  return apiRequest<{ parentId: string }>(
    `/houses/${activeHouseId}/files/resolve-destination`,
    { method: "POST", body: params }
  );
}

export async function addFileToPortfolio(
  entryId: string,
  category?: string
): Promise<FileEntryItem> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before updating the Portfolio.");
  }

  return apiRequest<FileEntryItem>(
    `/houses/${activeHouseId}/files/${entryId}/add-to-portfolio`,
    { method: "POST", body: { category } }
  );
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

// Step 1 of the resumable-upload flow (ADR 0058) - opens a Drive
// resumable-upload session and returns a signed, opaque token. The actual
// bytes then go through the specialized binary transport in
// lib/uploads/upload-engine.ts (raw XHR PUTs with Content-Range headers,
// not this JSON apiRequest wrapper), since the chunk/status endpoints are
// unauthenticated-by-token rather than session-authenticated.
export async function initiateFileUpload(
  parentId: string | null,
  file: { name: string; mimeType: string; size: number },
  options?: { conversationId?: string; taskId?: string }
): Promise<{ uploadToken: string }> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before uploading files.");
  }

  return apiRequest<{ uploadToken: string }>(
    `/houses/${activeHouseId}/files/upload-sessions`,
    {
      method: "POST",
      body: {
        parentId: parentId ?? undefined,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        conversationId: options?.conversationId,
        taskId: options?.taskId
      }
    }
  );
}

export async function updateFileMetadata(
  entryId: string,
  metadata: { durationSeconds?: number; width?: number; height?: number }
): Promise<FileEntryItem> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before updating a file.");
  }

  return apiRequest<FileEntryItem>(
    `/houses/${activeHouseId}/files/${entryId}`,
    { method: "PATCH", body: metadata }
  );
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

export async function getFolderDownloadUrl(entryId: string): Promise<string> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before downloading files.");
  }

  const { url } = await apiRequest<{ url: string }>(
    `/houses/${activeHouseId}/files/${entryId}/download-folder`
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

export async function listAnnouncements(): Promise<Announcement[]> {
  if (!activeHouseId) {
    throw new Error("Join or create a house before viewing announcements.");
  }

  return apiRequest<Announcement[]>(`/houses/${activeHouseId}/announcements`);
}

export async function createAnnouncement(
  request: CreateAnnouncementRequest
): Promise<Announcement> {
  if (!request.title.trim() || !request.body.trim()) {
    throw new Error("Give the announcement a title and body.");
  }

  if (!activeHouseId) {
    throw new Error("Join or create a house before posting announcements.");
  }

  return apiRequest<Announcement>(`/houses/${activeHouseId}/announcements`, {
    method: "POST",
    body: request
  });
}

export async function updateAnnouncement(
  announcementId: string,
  request: UpdateAnnouncementRequest
): Promise<Announcement> {
  return apiRequest<Announcement>(`/announcements/${announcementId}`, {
    method: "PATCH",
    body: request
  });
}

export async function deleteAnnouncement(
  announcementId: string
): Promise<void> {
  await apiRequest<{ success: boolean }>(`/announcements/${announcementId}`, {
    method: "DELETE"
  });
}

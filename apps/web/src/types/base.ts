import type { HouseType } from "@/lib/house-types";

// Freeform - Positions are house-defined text (see POSITION_SUGGESTIONS
// in @/lib/permissions for the picker's suggested list), not a fixed set.
export type RoleName = string;

export type TaskType =
  | "shoot"
  | "edit"
  | "color-grade"
  | "sound-design"
  | "vfx"
  | "motion-graphics"
  | "storyboarding"
  | "script-writing"
  | "thumbnail"
  | "photography"
  | "reels"
  | "social-media"
  | "client-review"
  | "asset-collection"
  | "equipment"
  | "location-scouting"
  | "casting"
  | "meeting"
  | "admin"
  | "custom";

export type TaskStatus =
  | "todo"
  | "in-progress"
  | "review"
  | "changes-requested"
  | "completed"
  | "archived";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskRecurrenceRule = "daily" | "weekly" | "monthly";

export type TaskAssigneeItem = {
  userId: string;
  name: string;
  responsibility: string | null;
};

export type TaskAssigneeInput = { userId: string; responsibility?: string };

export type TaskChecklistItemDto = {
  id: string;
  text: string;
  done: boolean;
  order: number;
};

export type TaskRef = { id: string; title: string; status: TaskStatus };

export type TaskActivityItem = {
  id: string;
  type: string;
  fromValue: string | null;
  toValue: string | null;
  actorId: string;
  actorName: string;
  createdAt: string;
};

export type ChannelTaskItem = {
  id: string;
  title: string;
  assignees: TaskAssigneeItem[];
  dueDate: string | null;
  status: TaskStatus;
  priority: TaskPriority;
};

export type TaskTimeEntryItem = {
  id: string;
  userId: string;
  userName: string | null;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  note: string | null;
};

export type ProjectStage =
  | "Development"
  | "Pre-Production"
  | "In Production"
  | "In Progress"
  | "Post-Production"
  | "On Hold"
  | "Completed";

export type ProjectStatus = "active" | "in-progress" | "on-hold" | "completed";

export type ProjectType =
  | "Short Film"
  | "Documentary"
  | "Commercial"
  | "Music Video"
  | "Feature Film"
  | "Corporate Video"
  | "Web Series"
  | "Wedding Film";

export type ProjectCoverIcon =
  "camera" | "clapperboard" | "heart" | "megaphone" | "mic" | "music";

export type CrewDepartment =
  | "Production"
  | "Camera"
  | "Art"
  | "Electric"
  | "Sound"
  | "Costume"
  | "Post-Production"
  | "Creative"
  | "Marketing"
  | "Management";

export type CrewRoleCategory =
  | "Director"
  | "Producer"
  | "Cinematographer"
  | "Editor"
  | "Production Assistant"
  | "Other";

export type CrewMemberStatus =
  "available" | "on-set" | "on-leave" | "unavailable";

export type NotificationPreferenceSetting = {
  id: string;
  email: boolean;
  push: boolean;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  avatarLabel: string;
  notificationPreferences: NotificationPreferenceSetting[] | null;
  emailVerifiedAt: string | null;
};

export type HouseRole = {
  id: string;
  name: RoleName;
  color: string;
  description: string;
  permissions: string[];
  memberCount: number;
};

export type HouseMember = {
  id: string;
  name: string;
  role: RoleName;
  status: "online" | "away" | "offline";
  lastSeenAt: string | null;
};

export type PendingMember = {
  membershipId: string;
  userId: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  joinedAt: string;
};

export type House = {
  id: string;
  name: string;
  handle: string;
  description: string;
  inviteCode: string;
  type: HouseType;
  enabledModules: string[];
  myRole: RoleName | null;
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  order: number;
  storageBytes: number;
  lastActivityAt: string | null;
  members: HouseMember[];
  pendingMembers: PendingMember[];
  roles: HouseRole[];
};

export type ProductionTask = {
  id: string;
  title: string;
  description: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  startDate: string | null;
  estimatedMinutes: number | null;
  recurrenceRule: TaskRecurrenceRule | null;
  recurrenceEndDate: string | null;
  equipment: string[];
  location: string | null;
  callTime: string | null;
  deliverables: string[];
  tags: string[];
  progress: number;
  createdById: string;
  createdByName: string;
  projectId: string | null;
  projectTitle: string | null;
  clientId: string | null;
  clientName: string | null;
  boardId: string | null;
  boardName: string | null;
  scriptId: string | null;
  scriptTitle: string | null;
  shootDayEventId: string | null;
  shootDayEventTitle: string | null;
  parentTaskId: string | null;
  assignees: TaskAssigneeItem[];
  checklistItems: TaskChecklistItemDto[];
  subtasks: TaskRef[];
  blockedByTasks: TaskRef[];
  blockingTasks: TaskRef[];
  isBlocked: boolean;
  attachmentIds: string[];
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
};

export type Project = {
  id: string;
  title: string;
  type: ProjectType | null;
  genre: string | null;
  description: string | null;
  stage: ProjectStage;
  status: ProjectStatus;
  progress: number;
  coverGradient: string | null;
  coverIcon: ProjectCoverIcon | null;
  dueDate: string | null;
  teamIds: string[];
  clients: { id: string; name: string }[];
};

export type UploadCategory =
  "raw" | "assets" | "deliverables" | "project-files";

export type ClientItem = {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

export type CrewMember = {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: CrewDepartment;
  roleCategory: CrewRoleCategory;
  status: CrewMemberStatus;
  currentProject: string | null;
  projectStage: string | null;
  availability: string | null;
  birthday: string | null;
};

export type CalendarEventCategory =
  | "shoot"
  | "post-production"
  | "meeting"
  | "pre-production"
  | "delivery"
  | "other";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string | null;
  category: CalendarEventCategory;
  projectId: string | null;
  organizationId: string;
};

export type TimeEntryPhase =
  "Pre-Production" | "Production" | "Post-Production" | "Planning";

export type TimeEntry = {
  id: string;
  organizationId: string;
  projectId: string | null;
  userId: string;
  phase: TimeEntryPhase;
  hours: number;
  date: string;
  note: string | null;
};

export type TaskStatusBreakdownEntry = {
  status: string;
  label: string;
  color: string;
  count: number;
};

export type TimeLoggedDay = {
  date: string;
  label: string;
  hours: number;
};

export type TimeDistributionEntry = {
  phase: TimeEntryPhase;
  color: string;
  hours: number;
};

export type AnalyticsTopProject = {
  id: string;
  title: string;
  progress: number;
  coverGradient: string | null;
  coverIcon: string | null;
};

export type AnalyticsProjectHoursSeries = {
  id: string;
  label: string;
  color: string;
  points: number[];
};

export type AnalyticsContributor = {
  userId: string;
  name: string;
  hours: number;
};

export type AnalyticsWorkloadEntry = {
  userId: string;
  name: string;
  jobTitle: string | null;
  percentage: number;
};

export type ActivityHeatmap = {
  dayLabels: string[];
  timeLabels: string[];
  matrix: number[][];
};

export type Analytics = {
  totalProjects: number;
  activeProjects: number;
  tasksTotal: number;
  tasksCompleted: number;
  hoursLoggedTotal: number;
  teamEfficiency: number;
  taskStatusBreakdown: TaskStatusBreakdownEntry[];
  timeLoggedByDay: TimeLoggedDay[];
  timeDistribution: TimeDistributionEntry[];
  topActiveProjects: AnalyticsTopProject[];
  projectHoursSeries: AnalyticsProjectHoursSeries[];
  topContributors: AnalyticsContributor[];
  teamWorkload: AnalyticsWorkloadEntry[];
  taskEstimateVsActual: { estimatedMinutes: number; actualMinutes: number };
  activityHeatmap: ActivityHeatmap;
};

export type PersonalStats = {
  tasksCompleted: number;
  tasksPending: number;
  completionRate: number;
  onTimePercentage: number;
  workingHours: { today: number; week: number; month: number; total: number };
  workStreak: { current: number; best: number };
};

export type MessageReactionSummary = {
  emoji: string;
  count: number;
  reactedByMe: boolean;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  authorId: string;
  authorName: string;
  sentAt: string;
  body: string;
  editedAt: string | null;
  parentMessageId: string | null;
  replyCount: number;
  reactions: MessageReactionSummary[];
};

export type ChatRoom = {
  id: string;
  name: string;
  topic: string;
  unreadCount: number;
  messages: ChatMessage[];
};

export type WorkspaceSnapshot = {
  user: UserProfile;
  houses: House[];
  activeHouseId: string;
  tasks: ProductionTask[];
  chatRooms: ChatRoom[];
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  name: string;
  email: string;
  password: string;
};

export type RequestPasswordResetRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  code: string;
  newPassword: string;
};

export type CreateHouseRequest = {
  name: string;
  handle: string;
  description?: string;
  houseType: HouseType;
};

export type AssignRoleRequest = {
  roleName: string;
  team: string;
  permissions: string[];
};

export type JoinHouseRequest = {
  inviteCode: string;
};

export type RequestJoinHouseRequest = {
  handle: string;
};

export type JoinRequest = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatarLabel: string;
  createdAt: string;
};

export type HouseInvitation = {
  id: string;
  email: string;
  status: "pending" | "accepted" | "revoked";
  createdAt: string;
  expiresAt: string;
  inviteUrl?: string;
};

export type InvitationPreview = {
  houseName: string;
  houseDescription: string;
  email: string;
  invitedByName: string;
  expiresAt: string;
};

export type InviteCodePreview = {
  houseName: string;
  houseDescription: string;
  memberCount: number;
};

export type CreateTaskRequest = {
  title: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignees?: TaskAssigneeInput[];
  dueDate?: string;
  startDate?: string;
  estimatedMinutes?: number;
  recurrenceRule?: TaskRecurrenceRule;
  recurrenceEndDate?: string;
  projectId?: string;
  boardId?: string;
  scriptId?: string;
  shootDayEventId?: string;
  parentTaskId?: string;
  equipment?: string[];
  location?: string;
  callTime?: string;
  deliverables?: string[];
  tags?: string[];
};

export type UpdateTaskRequest = Partial<{
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assignees: TaskAssigneeInput[];
  dueDate: string;
  startDate: string;
  estimatedMinutes: number;
  recurrenceRule: TaskRecurrenceRule;
  recurrenceEndDate: string;
  projectId: string;
  boardId: string;
  scriptId: string;
  shootDayEventId: string;
  equipment: string[];
  location: string;
  callTime: string;
  deliverables: string[];
  tags: string[];
  progress: number;
}>;

export type SendChatMessageRequest = {
  roomId: string;
  body: string;
  parentMessageId?: string;
};

export type EditChatMessageRequest = {
  messageId: string;
  body: string;
};

export type CreateConversationRequest = {
  name: string;
  topic?: string;
};

export type UpdateConversationRequest = Partial<{
  name: string;
  topic: string;
}>;

export type CreateProjectRequest = {
  name: string;
  description?: string;
  type?: ProjectType;
  genre?: string;
  stage?: ProjectStage;
  progress?: number;
  coverGradient?: string;
  coverIcon?: ProjectCoverIcon;
  dueDate?: string;
  teamIds?: string[];
};

export type UpdateProjectRequest = Partial<CreateProjectRequest>;

export type CreateCalendarEventRequest = {
  title: string;
  date: string;
  time: string;
  location?: string;
  category?: CalendarEventCategory;
  projectId?: string;
};

export type CreateTimeEntryRequest = {
  date: string;
  hours: number;
  phase?: TimeEntryPhase;
  projectId?: string;
  note?: string;
};

export type ResourceCategory = "studio" | "equipment" | "venue";

export type BookingStatus = "confirmed" | "pending" | "cancelled";

export type Booking = {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceCategory: ResourceCategory;
  resourceSubtitle: string | null;
  resourceTag: string | null;
  projectId: string | null;
  projectName: string | null;
  projectPhase: string | null;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  bookedById: string;
  bookedByName: string;
  notes: string | null;
  createdAt: string;
};

export type CreateBookingRequest = {
  resourceName: string;
  resourceCategory?: ResourceCategory;
  projectId?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status?: BookingStatus;
  notes?: string;
};

export type Shot = {
  id: string;
  boardId: string;
  order: number;
  description: string;
  cameraAngle: string | null;
  notes: string | null;
  imageUrl: string | null;
};

export type Board = {
  id: string;
  projectId: string | null;
  scriptId: string | null;
  name: string;
  description: string | null;
  updatedAt: string;
  shots: Shot[];
};

export type CreateShotRequest = {
  description: string;
  cameraAngle?: string;
  notes?: string;
  order?: number;
};

export type CreateBoardRequest = {
  name: string;
  description?: string;
  projectId?: string;
  scriptId?: string;
  shots?: CreateShotRequest[];
};

export type UpdateBoardRequest = Partial<{
  name: string;
  description: string;
  scriptId: string;
}>;

export type UpdateShotRequest = Partial<{
  description: string;
  cameraAngle: string;
  notes: string;
  imageUrl: string;
}>;

export type Script = {
  id: string;
  projectId: string | null;
  title: string;
  content: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
};

export type ScriptSummary = Omit<Script, "content"> & { wordCount: number };

export type CreateScriptRequest = {
  title: string;
  projectId?: string;
  content?: string;
};

export type UpdateScriptRequest = Partial<{
  title: string;
  projectId: string;
  content: string;
}>;

export type CrewCallTime = {
  userId: string;
  name: string;
  jobTitle: string;
  callTime: string;
};

export type CallSheet = {
  id: string;
  projectId: string | null;
  projectTitle: string | null;
  title: string;
  shootDate: string;
  generalCallTime: string;
  location: string | null;
  weather: string | null;
  notes: string | null;
  crewCallTimes: CrewCallTime[];
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCallSheetRequest = {
  title: string;
  projectId?: string;
  shootDate: string;
  generalCallTime: string;
  location?: string;
  weather?: string;
  notes?: string;
  crewCallTimes?: CrewCallTime[];
};

export type UpdateCallSheetRequest = Partial<CreateCallSheetRequest>;

export type Announcement = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateAnnouncementRequest = {
  title: string;
  body: string;
  pinned?: boolean;
};

export type UpdateAnnouncementRequest = Partial<CreateAnnouncementRequest>;

export type StoryCharacter = {
  id: string;
  projectId: string | null;
  name: string;
  role: string;
  description: string | null;
};

export type CreateCharacterRequest = {
  name: string;
  role: string;
  description?: string;
  projectId?: string;
};

export type StoryLocationItem = {
  id: string;
  projectId: string | null;
  name: string;
  type: string;
  shotCount: number;
};

export type CreateLocationRequest = {
  name: string;
  type: string;
  projectId?: string;
};

export type FileEntryType = "folder" | "file";

export type FileEntryItem = {
  id: string;
  parentId: string | null;
  taskId: string | null;
  name: string;
  type: FileEntryType;
  size: number | null;
  mimeType: string | null;
  sensitive: boolean;
  uploadedById: string;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
};

export type FilesSummary = {
  usedBytes: number;
  byCategory: Array<{ category: string; bytes: number }>;
  recent: Array<{
    id: string;
    name: string;
    uploadedByName: string;
    createdAt: string;
  }>;
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  organizationId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type UpdateHouseRequest = Partial<{
  name: string;
  handle: string;
  description: string;
  enabledModules: string[];
}>;

export type UpdateMeRequest = Partial<{
  name: string;
  username: string;
}>;

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type AccountSession = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  current: boolean;
  createdAt: string;
};

export type ActivityEntry = {
  id: string;
  actorName: string;
  text: string;
  occurredAt: string;
};

export type DashboardSummary = {
  activeProjects: number;
  activeProjectsSparkline: number[];
  upcomingShootsCount: number;
  upcomingShootsSparkline: number[];
  nextShoot: { date: string; time: string; title: string } | null;
  recentActivity: ActivityEntry[];
};

export type UpdateCrewProfileRequest = Partial<{
  jobTitle: string;
  department: CrewDepartment;
  roleCategory: CrewRoleCategory;
  status: CrewMemberStatus;
  currentProject: string;
  projectStage: string;
  availability: string;
  birthday: string;
}>;

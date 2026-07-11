export type RoleName =
  | "Owner"
  | "Producer"
  | "Editor"
  | "Videographer"
  | "Photographer"
  | "Designer"
  | "Client"
  | "Member";

export type TaskStatus = "todo" | "in-progress" | "on-hold" | "done";

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
  | "Post-Production";

export type CrewRoleCategory =
  | "Director"
  | "Producer"
  | "Cinematographer"
  | "Editor"
  | "Production Assistant"
  | "Other";

export type CrewMemberStatus =
  "available" | "on-set" | "on-leave" | "unavailable";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarLabel: string;
  emailVerifiedAt: string | null;
};

export type HouseRole = {
  id: string;
  name: RoleName;
  color: string;
  description: string;
  memberCount: number;
};

export type HouseMember = {
  id: string;
  name: string;
  role: RoleName;
  status: "online" | "away" | "offline";
};

export type House = {
  id: string;
  name: string;
  handle: string;
  description: string;
  inviteCode: string;
  members: HouseMember[];
  roles: HouseRole[];
};

export type ProductionTask = {
  id: string;
  title: string;
  project: string;
  assigneeId: string;
  assigneeName: string;
  role: RoleName;
  dueDate: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
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
  activityHeatmap: ActivityHeatmap;
};

export type ChatMessage = {
  id: string;
  authorId: string;
  authorName: string;
  sentAt: string;
  body: string;
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
  token: string;
  newPassword: string;
};

export type CreateHouseRequest = {
  name: string;
  handle: string;
  description: string;
};

export type JoinHouseRequest = {
  inviteCode: string;
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

export type CreateTaskRequest = {
  title: string;
  project: string;
  assigneeId: string;
  dueDate: string;
  priority?: "low" | "medium" | "high";
  status?: TaskStatus;
};

export type UpdateTaskRequest = Partial<{
  title: string;
  project: string;
  assigneeId: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: TaskStatus;
}>;

export type SendChatMessageRequest = {
  roomId: string;
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
  shots?: CreateShotRequest[];
};

export type UpdateShotRequest = Partial<{
  description: string;
  cameraAngle: string;
  notes: string;
}>;

export type FileEntryType = "folder" | "file";

export type FileEntryItem = {
  id: string;
  parentId: string | null;
  name: string;
  type: FileEntryType;
  size: number | null;
  mimeType: string | null;
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
  readAt: string | null;
  createdAt: string;
};

export type UpdateHouseRequest = Partial<{
  name: string;
  handle: string;
  description: string;
}>;

export type UpdateMeRequest = {
  name: string;
};

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

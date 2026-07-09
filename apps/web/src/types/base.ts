export type RoleName =
  | "Owner"
  | "Producer"
  | "Editor"
  | "Videographer"
  | "Photographer"
  | "Designer"
  | "Client"
  | "Member";

export type TaskStatus = "scheduled" | "in-progress" | "review" | "done";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarLabel: string;
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

export type CreateTaskRequest = {
  title: string;
  project: string;
  assigneeId: string;
  role: RoleName;
  dueDate: string;
};

export type SendChatMessageRequest = {
  roomId: string;
  body: string;
};

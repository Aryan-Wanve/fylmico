import type {
  ChatRoom,
  CreateHouseRequest,
  CreateTaskRequest,
  House,
  HouseRole,
  JoinHouseRequest,
  LoginRequest,
  ProductionTask,
  SendChatMessageRequest,
  WorkspaceSnapshot
} from "../types/base";

const user = {
  id: "user-aryan",
  name: "Aryan Wanve",
  email: "aryan@fylmico.test",
  avatarLabel: "AW"
};

const defaultRoles: HouseRole[] = [
  {
    id: "role-owner",
    name: "Owner",
    color: "#654cff",
    description: "Controls house settings, roles, invites, and billing.",
    memberCount: 1
  },
  {
    id: "role-producer",
    name: "Producer",
    color: "#16c784",
    description: "Plans shoots, schedules tasks, and coordinates delivery.",
    memberCount: 1
  },
  {
    id: "role-editor",
    name: "Editor",
    color: "#3b82f6",
    description: "Owns cuts, revisions, timelines, and final exports.",
    memberCount: 1
  },
  {
    id: "role-videographer",
    name: "Videographer",
    color: "#f97316",
    description: "Handles shoot capture, camera plans, and footage handoff.",
    memberCount: 1
  },
  {
    id: "role-photographer",
    name: "Photographer",
    color: "#8b5cf6",
    description: "Covers stills, thumbnails, BTS, and campaign images.",
    memberCount: 1
  }
];

function createDefaultHouse(
  overrides?: Partial<
    Pick<House, "id" | "name" | "handle" | "description" | "inviteCode">
  >
): House {
  return {
    id: overrides?.id ?? "house-nova",
    name: overrides?.name ?? "Nova Frame House",
    handle: overrides?.handle ?? "nova-frame",
    description:
      overrides?.description ??
      "Commercial films, reels, launch videos, and event edits.",
    inviteCode: overrides?.inviteCode ?? "NOVA-2048",
    members: [
      { id: user.id, name: user.name, role: "Owner", status: "online" },
      {
        id: "user-priya",
        name: "Priya Shah",
        role: "Producer",
        status: "online"
      },
      {
        id: "user-rahul",
        name: "Rahul Mehta",
        role: "Videographer",
        status: "online"
      },
      { id: "user-ananya", name: "Ananya Rao", role: "Editor", status: "away" },
      {
        id: "user-karan",
        name: "Karan Gill",
        role: "Photographer",
        status: "offline"
      }
    ],
    roles: defaultRoles
  };
}

const defaultTasks: ProductionTask[] = [
  {
    id: "task-1",
    title: "Review storyboard",
    project: "Beyond Frames",
    assigneeId: user.id,
    assigneeName: user.name,
    role: "Editor",
    dueDate: "Today",
    status: "review",
    priority: "high"
  },
  {
    id: "task-2",
    title: "Finalize shot list",
    project: "Ad Campaign",
    assigneeId: "user-priya",
    assigneeName: "Priya Shah",
    role: "Videographer",
    dueDate: "Today",
    status: "scheduled",
    priority: "medium"
  },
  {
    id: "task-3",
    title: "Location permissions",
    project: "Wanderers",
    assigneeId: "user-karan",
    assigneeName: "Karan Gill",
    role: "Photographer",
    dueDate: "29 May",
    status: "scheduled",
    priority: "low"
  },
  {
    id: "task-4",
    title: "Edit rough cut",
    project: "Echoes",
    assigneeId: "user-ananya",
    assigneeName: "Ananya Rao",
    role: "Editor",
    dueDate: "30 May",
    status: "in-progress",
    priority: "medium"
  }
];

const defaultChatRooms: ChatRoom[] = [
  {
    id: "room-general",
    name: "general",
    topic: "Daily coordination and house-wide updates.",
    unreadCount: 2,
    messages: [
      {
        id: "msg-1",
        authorId: "user-rahul",
        authorName: "Rahul Mehta",
        sentAt: "09:12",
        body: "Camera kit is packed for tomorrow. Need final shot order by tonight."
      },
      {
        id: "msg-2",
        authorId: "user-ananya",
        authorName: "Ananya Rao",
        sentAt: "09:18",
        body: "I will send the cutdown references after lunch."
      }
    ]
  },
  {
    id: "room-edit-bay",
    name: "edit-bay",
    topic: "Cuts, revisions, exports, and feedback.",
    unreadCount: 0,
    messages: [
      {
        id: "msg-3",
        authorId: "user-ananya",
        authorName: "Ananya Rao",
        sentAt: "10:02",
        body: "Version 03 is ready for producer review."
      }
    ]
  },
  {
    id: "room-shoot-floor",
    name: "shoot-floor",
    topic: "On-set coordination and capture notes.",
    unreadCount: 1,
    messages: [
      {
        id: "msg-4",
        authorId: "user-karan",
        authorName: "Karan Gill",
        sentAt: "10:25",
        body: "Need 20 minutes for stills before the hero video take."
      }
    ]
  }
];

let mockSnapshot: WorkspaceSnapshot = {
  user,
  activeHouseId: "",
  houses: [],
  tasks: [],
  chatRooms: []
};

function activateHouse(house: House) {
  mockSnapshot = {
    ...mockSnapshot,
    houses: [...mockSnapshot.houses, house],
    activeHouseId: house.id,
    tasks: defaultTasks,
    chatRooms: defaultChatRooms
  };
}

function cloneSnapshot(): WorkspaceSnapshot {
  return structuredClone(mockSnapshot);
}

function wait<T>(value: T, delay = 420): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });
}

export async function login(request: LoginRequest): Promise<WorkspaceSnapshot> {
  if (!request.email.trim() || !request.password.trim()) {
    throw new Error("Enter an email and password to continue.");
  }

  return wait(cloneSnapshot(), 520);
}

export async function getWorkspace(): Promise<WorkspaceSnapshot> {
  return wait(cloneSnapshot());
}

export async function createHouse(request: CreateHouseRequest): Promise<House> {
  if (!request.name.trim() || !request.handle.trim()) {
    throw new Error("House name and handle are required.");
  }

  const house: House = {
    id: `house-${Date.now()}`,
    name: request.name.trim(),
    handle: request.handle.trim().toLowerCase().replaceAll(" ", "-"),
    description:
      request.description.trim() || "A new creative production house.",
    inviteCode: `${request.handle.slice(0, 4).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 8999
    )}`,
    members: createDefaultHouse().members,
    roles: defaultRoles
  };

  activateHouse(house);

  return wait(structuredClone(house), 480);
}

export async function joinHouse(request: JoinHouseRequest): Promise<House> {
  if (!request.inviteCode.trim()) {
    throw new Error("Enter a house invite code.");
  }

  const house: House = {
    id: `house-joined-${Date.now()}`,
    name: "Joined Studio House",
    handle: "joined-studio",
    description: "A house joined from a mock invite code.",
    inviteCode: request.inviteCode.trim().toUpperCase(),
    members: createDefaultHouse().members,
    roles: defaultRoles
  };

  activateHouse(house);

  return wait(structuredClone(house), 480);
}

export async function createTask(
  request: CreateTaskRequest
): Promise<ProductionTask> {
  const activeHouse = mockSnapshot.houses.find(
    (house) => house.id === mockSnapshot.activeHouseId
  );
  const member = activeHouse?.members.find(
    (houseMember) => houseMember.id === request.assigneeId
  );

  if (!request.title.trim() || !request.project.trim() || !request.dueDate) {
    throw new Error("Task title, project, and due date are required.");
  }

  if (!member) {
    throw new Error("Choose a valid assignee.");
  }

  const task: ProductionTask = {
    id: `task-${Date.now()}`,
    title: request.title.trim(),
    project: request.project.trim(),
    assigneeId: member.id,
    assigneeName: member.name,
    role: request.role,
    dueDate: request.dueDate,
    status: "scheduled",
    priority: "medium"
  };

  mockSnapshot = {
    ...mockSnapshot,
    tasks: [task, ...mockSnapshot.tasks]
  };

  return wait(structuredClone(task), 420);
}

export async function sendChatMessage(
  request: SendChatMessageRequest
): Promise<ChatRoom> {
  if (!request.body.trim()) {
    throw new Error("Write a message before sending.");
  }

  const room = mockSnapshot.chatRooms.find(
    (chatRoom) => chatRoom.id === request.roomId
  );

  if (!room) {
    throw new Error("Choose a valid chat room.");
  }

  const updatedRoom: ChatRoom = {
    ...room,
    messages: [
      ...room.messages,
      {
        id: `msg-${Date.now()}`,
        authorId: mockSnapshot.user.id,
        authorName: mockSnapshot.user.name,
        sentAt: "now",
        body: request.body.trim()
      }
    ]
  };

  mockSnapshot = {
    ...mockSnapshot,
    chatRooms: mockSnapshot.chatRooms.map((chatRoom) =>
      chatRoom.id === updatedRoom.id ? updatedRoom : chatRoom
    )
  };

  return wait(structuredClone(updatedRoom), 260);
}

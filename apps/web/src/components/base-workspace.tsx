"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  createHouse,
  createTask,
  getWorkspace,
  joinHouse,
  login,
  sendChatMessage
} from "../services/base-workspace.service";
import type {
  ChatRoom,
  House,
  ProductionTask,
  RoleName,
  WorkspaceSnapshot
} from "../types/base";

type AsyncState = "idle" | "loading" | "success" | "error";

const roleOptions: RoleName[] = [
  "Producer",
  "Editor",
  "Videographer",
  "Photographer",
  "Designer",
  "Client"
];

export function BaseWorkspace() {
  const [workspace, setWorkspace] = useState<WorkspaceSnapshot | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState("room-general");
  const [authState, setAuthState] = useState<AsyncState>("idle");
  const [actionState, setActionState] = useState<AsyncState>("idle");
  const [notice, setNotice] = useState("Mock services are active.");
  const [error, setError] = useState("");

  const activeHouse = useMemo(() => {
    return workspace?.houses.find(
      (house) => house.id === workspace.activeHouseId
    );
  }, [workspace]);

  const selectedRoom = useMemo(() => {
    return workspace?.chatRooms.find((room) => room.id === selectedRoomId);
  }, [selectedRoomId, workspace]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setAuthState("loading");
    setError("");

    try {
      const snapshot = await login({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? "")
      });
      setWorkspace(snapshot);
      setSelectedRoomId(snapshot.chatRooms[0]?.id ?? "");
      setAuthState("success");
      setNotice("Signed in through the mock auth service.");
    } catch (loginError) {
      setAuthState("error");
      setError(getErrorMessage(loginError));
    }
  }

  async function refreshWorkspace() {
    setActionState("loading");
    setError("");

    try {
      const snapshot = await getWorkspace();
      setWorkspace(snapshot);
      setActionState("success");
      setNotice("Workspace refreshed from mock services.");
    } catch (refreshError) {
      setActionState("error");
      setError(getErrorMessage(refreshError));
    }
  }

  async function handleCreateHouse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    await runAction(async () => {
      const house = await createHouse({
        name: String(form.get("houseName") ?? ""),
        handle: String(form.get("houseHandle") ?? ""),
        description: String(form.get("houseDescription") ?? "")
      });
      await mergeHouse(house);
      event.currentTarget.reset();
      setNotice(`Created ${house.name} with mock service data.`);
    });
  }

  async function handleJoinHouse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    await runAction(async () => {
      const house = await joinHouse({
        inviteCode: String(form.get("inviteCode") ?? "")
      });
      await mergeHouse(house);
      event.currentTarget.reset();
      setNotice(`Joined ${house.name} through a mock invite.`);
    });
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    await runAction(async () => {
      const task = await createTask({
        title: String(form.get("taskTitle") ?? ""),
        project: String(form.get("taskProject") ?? ""),
        assigneeId: String(form.get("assigneeId") ?? ""),
        role: String(form.get("taskRole") ?? "Editor") as RoleName,
        dueDate: String(form.get("dueDate") ?? "")
      });
      setWorkspace((current) =>
        current ? { ...current, tasks: [task, ...current.tasks] } : current
      );
      event.currentTarget.reset();
      setNotice(`Scheduled ${task.title}.`);
    });
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    await runAction(async () => {
      const room = await sendChatMessage({
        roomId: selectedRoomId,
        body: String(form.get("message") ?? "")
      });
      setWorkspace((current) =>
        current
          ? {
              ...current,
              chatRooms: current.chatRooms.map((chatRoom) =>
                chatRoom.id === room.id ? room : chatRoom
              )
            }
          : current
      );
      event.currentTarget.reset();
      setNotice(`Message sent to #${room.name}.`);
    });
  }

  async function runAction(action: () => Promise<void>) {
    setActionState("loading");
    setError("");

    try {
      await action();
      setActionState("success");
    } catch (actionError) {
      setActionState("error");
      setError(getErrorMessage(actionError));
    }
  }

  async function mergeHouse(house: House) {
    setWorkspace((current) =>
      current
        ? {
            ...current,
            houses: [...current.houses, house],
            activeHouseId: house.id
          }
        : current
    );
  }

  if (!workspace) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
        <section className="mx-auto grid min-h-screen w-full max-w-6xl gap-10 px-5 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
          <div className="space-y-8">
            <header className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-lg bg-white text-sm font-black text-[#11151b]">
                F
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Fylmico</p>
                <p className="text-xs text-white/50">
                  Creative production base
                </p>
              </div>
            </header>

            <div className="max-w-2xl space-y-5">
              <p className="text-sm font-semibold tracking-[0.18em] text-[#8bd3ff] uppercase">
                Frontend mock environment
              </p>
              <h1 className="text-4xl leading-tight font-semibold text-balance sm:text-6xl">
                Manage houses, roles, tasks, and chat before the backend lands.
              </h1>
              <p className="max-w-xl text-base leading-7 text-white/62">
                This base uses public API contracts and realistic mock services.
                The UI does not know whether data comes from mocks or real APIs.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatusTile label="Build mode" value="Frontend only" />
              <StatusTile label="Data source" value="Mock services" />
              <StatusTile label="Backend" value="Black box" />
            </div>
          </div>

          <section className="rounded-lg border border-white/10 bg-[#11151b] p-5 shadow-2xl shadow-black/30">
            <div className="mb-6">
              <p className="text-sm text-white/50">Welcome back</p>
              <h2 className="mt-1 text-2xl font-semibold">
                Login to your house
              </h2>
            </div>

            <form className="space-y-4" onSubmit={handleLogin}>
              <Field label="Email">
                <input
                  className="input"
                  name="email"
                  type="email"
                  defaultValue="aryan@fylmico.test"
                  autoComplete="email"
                />
              </Field>
              <Field label="Password">
                <input
                  className="input"
                  name="password"
                  type="password"
                  defaultValue="password"
                  autoComplete="current-password"
                />
              </Field>

              {error ? <Alert tone="error" message={error} /> : null}

              <button
                className="primary-button w-full"
                data-testid="login-submit"
                disabled={authState === "loading"}
              >
                {authState === "loading" ? "Signing in..." : "Enter workspace"}
              </button>
            </form>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-white/10 bg-[#0f1217] p-4 lg:border-r lg:border-b-0">
          <div className="mb-7 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-white text-sm font-black text-[#11151b]">
              F
            </div>
            <div>
              <p className="font-semibold">Fylmico</p>
              <p className="text-xs text-white/45">Base workspace</p>
            </div>
          </div>

          <nav className="space-y-1" aria-label="Primary">
            {["Overview", "Houses", "Roles", "Tasks", "Chat"].map((item) => (
              <a
                className="nav-item"
                href={`#${item.toLowerCase()}`}
                key={item}
              >
                <span>{item}</span>
              </a>
            ))}
          </nav>

          <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-white/45">Signed in as</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-full bg-[#8bd3ff] text-xs font-bold text-[#071017]">
                {workspace.user.avatarLabel}
              </div>
              <div>
                <p className="text-sm font-medium">{workspace.user.name}</p>
                <p className="text-xs text-white/45">{workspace.user.email}</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b0d10]/90 px-5 py-4 backdrop-blur">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm text-white/45">Active house</p>
                <h1 className="text-2xl font-semibold">{activeHouse?.name}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  className="select"
                  value={workspace.activeHouseId}
                  onChange={(event) =>
                    setWorkspace((current) =>
                      current
                        ? { ...current, activeHouseId: event.target.value }
                        : current
                    )
                  }
                >
                  {workspace.houses.map((house) => (
                    <option key={house.id} value={house.id}>
                      {house.name}
                    </option>
                  ))}
                </select>
                <button
                  className="secondary-button"
                  data-testid="refresh-workspace"
                  onClick={refreshWorkspace}
                >
                  {actionState === "loading" ? "Syncing..." : "Refresh mocks"}
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-5 px-5 py-5">
            <section className="grid gap-4 xl:grid-cols-4" id="overview">
              <MetricCard label="Houses" value={workspace.houses.length} />
              <MetricCard
                label="Members"
                value={activeHouse?.members.length ?? 0}
              />
              <MetricCard label="Open tasks" value={workspace.tasks.length} />
              <MetricCard
                label="Chat rooms"
                value={workspace.chatRooms.length}
              />
            </section>

            {error ? (
              <Alert tone="error" message={error} />
            ) : (
              <Alert tone="info" message={notice} />
            )}

            <section className="grid gap-5 xl:grid-cols-[1fr_1fr]" id="houses">
              <Panel
                title="Create house"
                subtitle="Mock contract: POST /api/v1/houses"
              >
                <form className="grid gap-3" onSubmit={handleCreateHouse}>
                  <Field label="House name">
                    <input
                      className="input"
                      name="houseName"
                      placeholder="North Star Films"
                    />
                  </Field>
                  <Field label="Handle">
                    <input
                      className="input"
                      name="houseHandle"
                      placeholder="north-star"
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      className="input min-h-24 resize-none"
                      name="houseDescription"
                      placeholder="Short house description"
                    />
                  </Field>
                  <button
                    className="primary-button"
                    data-testid="create-house-submit"
                  >
                    Create house
                  </button>
                </form>
              </Panel>

              <Panel
                title="Join house"
                subtitle="Mock contract: POST /api/v1/houses/join"
              >
                <form className="grid gap-3" onSubmit={handleJoinHouse}>
                  <Field label="Invite code">
                    <input
                      className="input"
                      name="inviteCode"
                      placeholder="NOVA-2048"
                    />
                  </Field>
                  <button
                    className="secondary-button"
                    data-testid="join-house-submit"
                  >
                    Join with invite
                  </button>
                </form>
                <div className="mt-5 rounded-lg bg-white/[0.03] p-4">
                  <p className="text-sm font-medium">Current invite</p>
                  <p className="mt-1 font-mono text-sm text-[#8bd3ff]">
                    {activeHouse?.inviteCode}
                  </p>
                </div>
              </Panel>
            </section>

            <section
              className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]"
              id="roles"
            >
              <Panel
                title="House roles"
                subtitle="Discord-style production roles"
              >
                <div className="grid gap-3">
                  {activeHouse?.roles.map((role) => (
                    <div className="role-row" key={role.id}>
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: role.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{role.name}</p>
                        <p className="text-sm text-white/45">
                          {role.description}
                        </p>
                      </div>
                      <span className="text-sm text-white/50">
                        {role.memberCount}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel
                title="Task scheduler and assigner"
                subtitle="Mock contract: POST /api/v1/tasks"
              >
                <form
                  className="grid gap-3 lg:grid-cols-2"
                  onSubmit={handleCreateTask}
                >
                  <Field label="Task title">
                    <input
                      className="input"
                      name="taskTitle"
                      placeholder="Prepare rough cut"
                    />
                  </Field>
                  <Field label="Project">
                    <input
                      className="input"
                      name="taskProject"
                      placeholder="Cafe Noir Opening"
                    />
                  </Field>
                  <Field label="Assignee">
                    <select className="select w-full" name="assigneeId">
                      {activeHouse?.members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Role">
                    <select className="select w-full" name="taskRole">
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Due date">
                    <input className="input" name="dueDate" type="date" />
                  </Field>
                  <button
                    className="primary-button self-end"
                    data-testid="create-task-submit"
                  >
                    Schedule task
                  </button>
                </form>
              </Panel>
            </section>

            <section
              className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]"
              id="tasks"
            >
              <Panel
                title="Assigned tasks"
                subtitle="Loading, empty, error, and success states supported"
              >
                {workspace.tasks.length ? (
                  <div className="grid gap-3">
                    {workspace.tasks.map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No tasks yet"
                    body="Schedule the first production task."
                  />
                )}
              </Panel>

              <Panel
                title="Chat rooms"
                subtitle="Mock contract: POST /api/v1/chat/rooms/:roomId/messages"
              >
                <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
                  <div className="space-y-2">
                    {workspace.chatRooms.map((room) => (
                      <button
                        className={
                          room.id === selectedRoomId
                            ? "room-button active"
                            : "room-button"
                        }
                        data-testid={`room-${room.id}`}
                        key={room.id}
                        onClick={() => setSelectedRoomId(room.id)}
                      >
                        #{room.name}
                        {room.unreadCount ? (
                          <span>{room.unreadCount}</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                  <ChatPanel
                    room={selectedRoom}
                    onSendMessage={handleSendMessage}
                    isSending={actionState === "loading"}
                  />
                </div>
              </Panel>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatusTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs text-white/45">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#11151b] p-4">
      <p className="text-sm text-white/45">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Panel({
  children,
  subtitle,
  title
}: {
  children: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#11151b] p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-white/45">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Field({
  children,
  label
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-white/72">
      {label}
      {children}
    </label>
  );
}

function Alert({ message, tone }: { message: string; tone: "error" | "info" }) {
  return (
    <div className={tone === "error" ? "alert error" : "alert"}>{message}</div>
  );
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/14 p-6 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-white/45">{body}</p>
    </div>
  );
}

function TaskRow({ task }: { task: ProductionTask }) {
  return (
    <article className="task-row">
      <div>
        <p className="font-medium">{task.title}</p>
        <p className="mt-1 text-sm text-white/45">
          {task.project} · {task.assigneeName} · {task.role}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm">{task.dueDate}</p>
        <p className="mt-1 text-xs font-medium text-[#8bd3ff]">{task.status}</p>
      </div>
    </article>
  );
}

function ChatPanel({
  isSending,
  onSendMessage,
  room
}: {
  isSending: boolean;
  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
  room?: ChatRoom;
}) {
  if (!room) {
    return (
      <EmptyState
        title="No room selected"
        body="Choose a room to start chatting."
      />
    );
  }

  return (
    <div className="min-w-0">
      <div className="mb-3">
        <p className="font-medium">#{room.name}</p>
        <p className="text-sm text-white/45">{room.topic}</p>
      </div>
      <div className="chat-scroll">
        {room.messages.map((message) => (
          <div className="message-row" key={message.id}>
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">
              {message.authorName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {message.authorName}
                <span className="ml-2 text-xs font-normal text-white/35">
                  {message.sentAt}
                </span>
              </p>
              <p className="mt-1 text-sm leading-6 text-white/68">
                {message.body}
              </p>
            </div>
          </div>
        ))}
      </div>
      <form className="mt-3 flex gap-2" onSubmit={onSendMessage}>
        <input
          className="input"
          name="message"
          placeholder={`Message #${room.name}`}
        />
        <button
          className="primary-button shrink-0"
          data-testid="send-message-submit"
          disabled={isSending}
        >
          Send
        </button>
      </form>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

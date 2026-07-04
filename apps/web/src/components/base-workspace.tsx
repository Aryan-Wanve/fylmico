"use client";

import Image from "next/image";
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

const navItems = [
  { label: "Home", icon: "H" },
  { label: "Projects", icon: "P" },
  { label: "Calendar", icon: "C" },
  { label: "Tasks", icon: "T" },
  { label: "Crews", icon: "U" },
  { label: "Files", icon: "F" },
  { label: "Storyboard", icon: "S" },
  { label: "Messages", icon: "M", badge: "4" },
  { label: "Bookings", icon: "B" },
  { label: "Analytics", icon: "A" },
  { label: "Settings", icon: "G" }
];

const scheduleItems = [
  {
    time: "09:00 AM",
    title: "Shoot - Interview Scene",
    project: "Beyond Frames",
    place: "Studio A",
    tone: "violet"
  },
  {
    time: "11:30 AM",
    title: "Lighting Setup",
    project: "Ad Campaign",
    place: "Stage 2",
    tone: "blue"
  },
  {
    time: "01:30 PM",
    title: "Lunch Break",
    project: "Crew",
    place: "Cafe",
    tone: "violet"
  },
  {
    time: "02:30 PM",
    title: "Client Review",
    project: "Brand Film",
    place: "Meeting Room",
    tone: "blue"
  },
  {
    time: "04:30 PM",
    title: "Edit Review",
    project: "Documentary",
    place: "Edit Suite 1",
    tone: "violet"
  }
];

const recentProjects = [
  { title: "Beyond Frames", type: "Short Film", progress: 68, theme: "blue" },
  { title: "Wanderers", type: "Documentary", progress: 42, theme: "purple" },
  {
    title: "Lumea Ad Campaign",
    type: "Commercial",
    progress: 75,
    theme: "silver"
  },
  { title: "Echoes", type: "Music Video", progress: 30, theme: "pink" }
];

const activities = [
  {
    name: "Priya",
    text: "uploaded 12 files to Beyond Frames",
    time: "2 minutes ago",
    icon: "F"
  },
  {
    name: "Rahul",
    text: "updated the call sheet for Ad Campaign",
    time: "15 minutes ago",
    icon: "C"
  },
  {
    name: "Ananya",
    text: "completed task Storyboard v2",
    time: "1 hour ago",
    icon: "T"
  },
  {
    name: "Karan",
    text: "added a new location to Wanderers",
    time: "2 hours ago",
    icon: "L"
  }
];

const viewCopy: Record<string, { title: string; body: string }> = {
  Home: {
    title: "Production command center",
    body: "Live overview of houses, tasks, schedules, chat, and recent movement."
  },
  Projects: {
    title: "Project pipeline",
    body: "Track active productions, progress, ownership, and next handoff points."
  },
  Calendar: {
    title: "Shoot calendar",
    body: "Plan shoot windows, reviews, bookings, and crew availability."
  },
  Tasks: {
    title: "Task scheduler",
    body: "Assign production work by role, deadline, priority, and owner."
  },
  Crews: {
    title: "Crew roster",
    body: "Coordinate roles for editors, videographers, photographers, and clients."
  },
  Files: {
    title: "Asset library",
    body: "A future home for briefs, cuts, photos, notes, and production files."
  },
  Storyboard: {
    title: "Storyboard board",
    body: "Keep concepts, scene notes, shot lists, and creative references together."
  },
  Messages: {
    title: "House chat",
    body: "Jump between chat rooms and keep production decisions visible."
  },
  Bookings: {
    title: "Bookings",
    body: "Reserve locations, studios, gear, and edit suites through API contracts."
  },
  Analytics: {
    title: "Production analytics",
    body: "Measure workload, delivery health, utilization, and project velocity."
  },
  Settings: {
    title: "House settings",
    body: "Manage profile, notification preferences, house metadata, and access."
  }
};

export function BaseWorkspace() {
  const [workspace, setWorkspace] = useState<WorkspaceSnapshot | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState("room-general");
  const [authState, setAuthState] = useState<AsyncState>("idle");
  const [actionState, setActionState] = useState<AsyncState>("idle");
  const [notice, setNotice] = useState("Mock services are active.");
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState("Home");
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(
    () => new Set()
  );
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(
    recentProjects[0]?.title ?? ""
  );

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
      setSelectedRoomId(snapshot.chatRooms[0]?.id ?? "room-general");
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
      setSelectedRoomId(snapshot.chatRooms[0]?.id ?? "room-general");
      setActionState("success");
      setNotice("Workspace refreshed from mock services.");
    } catch (refreshError) {
      setActionState("error");
      setError(getErrorMessage(refreshError));
    }
  }

  async function handleCreateHouse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    await runAction(async () => {
      const house = await createHouse({
        name: String(form.get("houseName") ?? ""),
        handle: String(form.get("houseHandle") ?? ""),
        description: String(form.get("houseDescription") ?? "")
      });
      const snapshot = await getWorkspace();
      setWorkspace(snapshot);
      setSelectedRoomId(snapshot.chatRooms[0]?.id ?? "room-general");
      formElement.reset();
      setNotice(`Created ${house.name} with mock service data.`);
    });
  }

  async function handleJoinHouse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    await runAction(async () => {
      const house = await joinHouse({
        inviteCode: String(form.get("inviteCode") ?? "")
      });
      const snapshot = await getWorkspace();
      setWorkspace(snapshot);
      setSelectedRoomId(snapshot.chatRooms[0]?.id ?? "room-general");
      formElement.reset();
      setNotice(`Joined ${house.name} through a mock invite.`);
    });
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

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
      formElement.reset();
      setNotice(`Scheduled ${task.title}.`);
    });
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

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
      formElement.reset();
      setNotice(`Message sent to #${room.name}.`);
    });
  }

  function handleViewChange(view: string) {
    setActiveView(view);
    setIsCreateMenuOpen(false);
    setIsNotificationsOpen(false);
  }

  function handleToggleTask(taskId: string) {
    setCompletedTaskIds((current) => {
      const next = new Set(current);

      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }

      return next;
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

  if (!workspace) {
    return (
      <LoginPage authState={authState} error={error} onLogin={handleLogin} />
    );
  }

  if (!activeHouse) {
    return (
      <AppShell
        activeView={activeView}
        compact
        isCreateMenuOpen={isCreateMenuOpen}
        isNotificationsOpen={isNotificationsOpen}
        onCreateToggle={() => setIsCreateMenuOpen((value) => !value)}
        onNotificationToggle={() => setIsNotificationsOpen((value) => !value)}
        onSearchChange={setSearchQuery}
        onViewChange={handleViewChange}
        searchQuery={searchQuery}
        user={workspace.user}
      >
        <NoHousePage
          actionState={actionState}
          error={error}
          onCreateHouse={handleCreateHouse}
          onJoinHouse={handleJoinHouse}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      activeView={activeView}
      isCreateMenuOpen={isCreateMenuOpen}
      isNotificationsOpen={isNotificationsOpen}
      onCreateToggle={() => setIsCreateMenuOpen((value) => !value)}
      onNotificationToggle={() => setIsNotificationsOpen((value) => !value)}
      onSearchChange={setSearchQuery}
      onViewChange={handleViewChange}
      searchQuery={searchQuery}
      user={workspace.user}
    >
      <DashboardPage
        actionState={actionState}
        activeView={activeView}
        activeHouse={activeHouse}
        error={error}
        notice={notice}
        selectedRoom={selectedRoom}
        selectedRoomId={selectedRoomId}
        selectedScheduleIndex={selectedScheduleIndex}
        selectedProject={selectedProject}
        completedTaskIds={completedTaskIds}
        tasks={workspace.tasks}
        chatRooms={workspace.chatRooms}
        onCreateHouse={handleCreateHouse}
        onCreateTask={handleCreateTask}
        onJoinHouse={handleJoinHouse}
        onProjectSelect={setSelectedProject}
        onRefresh={refreshWorkspace}
        onRoomSelect={setSelectedRoomId}
        onSendMessage={handleSendMessage}
        onScheduleSelect={setSelectedScheduleIndex}
        onToggleTask={handleToggleTask}
      />
    </AppShell>
  );
}

function LoginPage({
  authState,
  error,
  onLogin
}: {
  authState: AsyncState;
  error: string;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="login-shell">
      <section className="login-left">
        <div className="login-left__image" aria-hidden="true" />
        <div className="login-left__wash" aria-hidden="true" />
        <div className="login-dots" aria-hidden="true" />

        <header className="login-brand" aria-label="Fylmico">
          <Image
            alt=""
            className="login-brand-mark"
            height={38}
            src="/images/login/brand-mark.png"
            width={38}
          />
          <span>fylmico</span>
        </header>

        <section className="login-copy" aria-labelledby="login-heading">
          <h1 id="login-heading">
            All your production.
            <span>One workspace.</span>
          </h1>
          <p>
            Plan shoots. Manage teams. Track progress. Create stories. Fylmico
            keeps your production in sync, from pre to post.
          </p>
        </section>

        <section className="login-features" aria-label="Fylmico tools">
          <LoginFeature
            icon="cal"
            title="Plan & Schedule"
            body="Organize shoots and deadlines"
          />
          <LoginFeature
            icon="team"
            title="Manage Teams"
            body="Assign roles and collaborate"
          />
          <LoginFeature
            icon="file"
            title="Store & Share"
            body="Keep files, notes and assets safe"
          />
          <LoginFeature
            icon="flow"
            title="Track Progress"
            body="Stay updated and deliver on time"
          />
        </section>

        <aside className="login-quote" aria-label="Customer quote">
          <span>“</span>
          <p>Fylmico makes the complex, incredibly simple.</p>
          <strong>– Filmmaker, Mumbai</strong>
        </aside>
      </section>

      <section className="login-right" aria-label="Authentication">
        <div className="login-topline">
          <span>New here?</span>
          <button className="login-small-button" type="button">
            Sign up
          </button>
        </div>

        <section className="auth-card">
          <div className="auth-card__header">
            <h2>Welcome back 👋</h2>
            <p>Log in to continue to Fylmico</p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Auth mode">
            <button className="active" role="tab" type="button">
              Log In
            </button>
            <button role="tab" type="button">
              Sign Up
            </button>
          </div>

          <form className="auth-form" onSubmit={onLogin}>
            <label>
              <span>Email address</span>
              <div className="auth-input-wrap">
                <Image
                  alt=""
                  height={20}
                  src="/images/login/mail.png"
                  width={20}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
            </label>

            <label>
              <span>Password</span>
              <div className="auth-input-wrap">
                <Image
                  alt=""
                  height={20}
                  src="/images/login/lock.png"
                  width={20}
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <Image
                  alt=""
                  height={20}
                  src="/images/login/eye.png"
                  width={20}
                />
              </div>
            </label>

            <a className="forgot-link" href="#forgot-password">
              Forgot password?
            </a>

            {error ? <Alert tone="error" message={error} /> : null}

            <button
              className="login-submit"
              data-testid="login-submit"
              disabled={authState === "loading"}
            >
              {authState === "loading" ? "Logging in..." : "Log In"}
              <span aria-hidden="true">-&gt;</span>
            </button>
          </form>

          <div className="social-divider">
            <span>or continue with</span>
          </div>

          <div className="social-buttons">
            <button type="button">
              <Image
                alt=""
                height={22}
                src="/images/login/google.png"
                width={22}
              />
              Google
            </button>
            <button type="button">
              <Image
                alt=""
                height={22}
                src="/images/login/apple.png"
                width={22}
              />
              Apple
            </button>
            <button type="button">
              <Image
                alt=""
                height={22}
                src="/images/login/microsoft.png"
                width={22}
              />
              Microsoft
            </button>
          </div>
        </section>

        <aside className="security-note">
          <Image
            alt=""
            height={44}
            src="/images/login/security.png"
            width={44}
          />
          <p>
            <strong>Your data is safe with us.</strong>
            <span>
              We use enterprise-grade security to keep your projects protected.
            </span>
          </p>
        </aside>
      </section>
    </main>
  );
}

function AppShell({
  activeView,
  children,
  compact,
  isCreateMenuOpen,
  isNotificationsOpen,
  onCreateToggle,
  onNotificationToggle,
  onSearchChange,
  onViewChange,
  searchQuery,
  user
}: {
  activeView: string;
  children: React.ReactNode;
  compact?: boolean;
  isCreateMenuOpen: boolean;
  isNotificationsOpen: boolean;
  onCreateToggle: () => void;
  onNotificationToggle: () => void;
  onSearchChange: (value: string) => void;
  onViewChange: (view: string) => void;
  searchQuery: string;
  user: WorkspaceSnapshot["user"];
}) {
  return (
    <main className={compact ? "app-shell app-shell--compact" : "app-shell"}>
      <aside className="app-sidebar" aria-label="Sidebar">
        <div className="sidebar-logo">
          <div>F</div>
          <span>fylmico</span>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          {navItems.map((item) => (
            <button
              aria-current={activeView === item.label ? "page" : undefined}
              className={activeView === item.label ? "active" : ""}
              key={item.label}
              onClick={() => onViewChange(item.label)}
              title={compact ? item.label : undefined}
              type="button"
            >
              <span aria-hidden="true">{item.icon}</span>
              {!compact ? <strong>{item.label}</strong> : null}
              {item.badge && !compact ? <em>{item.badge}</em> : null}
            </button>
          ))}
        </nav>

        {!compact ? (
          <aside className="upgrade-card">
            <div aria-hidden="true">P</div>
            <strong>Upgrade to Pro</strong>
            <p>Unlock advanced features and more storage.</p>
            <button type="button">Upgrade Now</button>
          </aside>
        ) : null}

        <div className="sidebar-user">
          <Avatar label={user.avatarLabel} />
          {!compact ? (
            <div>
              <strong>{user.name}</strong>
              <span>Director</span>
            </div>
          ) : null}
        </div>
      </aside>

      <section className="app-main">
        <header className="app-topbar">
          <div className="search-box">
            <span aria-hidden="true">Q</span>
            <input
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search projects, tasks, people..."
              value={searchQuery}
            />
            <kbd>{searchQuery ? `${searchQuery.length}` : "Ctrl K"}</kbd>
            {searchQuery ? (
              <div className="search-preview" role="status">
                Searching mock data for <strong>{searchQuery}</strong>
              </div>
            ) : null}
          </div>
          <div className="topbar-actions">
            <div className="topbar-menu-wrap">
              <button
                aria-expanded={isCreateMenuOpen}
                className="create-button"
                onClick={onCreateToggle}
                type="button"
              >
                + {compact ? "Create" : "New"}
              </button>
              {isCreateMenuOpen ? (
                <div className="topbar-menu">
                  <button
                    onClick={() => onViewChange("Projects")}
                    type="button"
                  >
                    New project
                    <span>Frontend contract only</span>
                  </button>
                  <button onClick={() => onViewChange("Tasks")} type="button">
                    New task
                    <span>Uses mock scheduler</span>
                  </button>
                  <button
                    onClick={() => onViewChange("Messages")}
                    type="button"
                  >
                    New chat room
                    <span>Backend todo</span>
                  </button>
                </div>
              ) : null}
            </div>
            <button
              aria-expanded={isNotificationsOpen}
              className="icon-button"
              onClick={onNotificationToggle}
              type="button"
              aria-label="Notifications"
            >
              N
            </button>
            {isNotificationsOpen ? (
              <div className="notification-popover">
                <strong>Notifications</strong>
                {activities.slice(0, 3).map((activity) => (
                  <button
                    key={`${activity.name}-${activity.time}`}
                    onClick={() => onViewChange("Messages")}
                    type="button"
                  >
                    <span>{activity.icon}</span>
                    <em>
                      {activity.name} {activity.text}
                    </em>
                  </button>
                ))}
              </div>
            ) : null}
            <Avatar label={user.avatarLabel} />
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}

function NoHousePage({
  actionState,
  error,
  onCreateHouse,
  onJoinHouse
}: {
  actionState: AsyncState;
  error: string;
  onCreateHouse: (event: FormEvent<HTMLFormElement>) => void;
  onJoinHouse: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="no-house-stage">
      <div className="no-house-copy">
        <h1>
          You are not in <span>a house</span> yet.
        </h1>
        <p>
          Houses are where teams plan, create and bring productions to life.
        </p>
        <div className="no-house-photo" aria-hidden="true" />
      </div>

      <section className="house-choice-card">
        <div className="house-choice-icon" aria-hidden="true">
          U+
        </div>
        <h2>Create or join a house</h2>
        <p>
          Join an existing house if you have an invite or create your own to get
          started.
        </p>

        <form className="house-choice-action" onSubmit={onCreateHouse}>
          <div className="house-action-icon">+</div>
          <div>
            <strong>Create a house</strong>
            <span>
              Build your own space. Invite your team and start collaborating.
            </span>
          </div>
          <input name="houseName" defaultValue="Nova Frame House" hidden />
          <input name="houseHandle" defaultValue="nova-frame" hidden />
          <input
            name="houseDescription"
            defaultValue="Commercial films, reels, launch videos, and event edits."
            hidden
          />
          <button disabled={actionState === "loading"} type="submit">
            -&gt;
          </button>
        </form>

        <form className="house-choice-action" onSubmit={onJoinHouse}>
          <div className="house-action-icon secondary">U</div>
          <div>
            <strong>Join a house</strong>
            <span>Enter an invite code to join your team house.</span>
          </div>
          <input name="inviteCode" defaultValue="NOVA-2048" hidden />
          <button disabled={actionState === "loading"} type="submit">
            -&gt;
          </button>
        </form>

        {error ? <Alert tone="error" message={error} /> : null}

        <a href="#learn-houses">Learn more about houses -&gt;</a>
      </section>
    </section>
  );
}

function DashboardPage({
  actionState,
  activeView,
  activeHouse,
  chatRooms,
  completedTaskIds,
  error,
  notice,
  onCreateHouse,
  onCreateTask,
  onJoinHouse,
  onProjectSelect,
  onRefresh,
  onRoomSelect,
  onScheduleSelect,
  onSendMessage,
  onToggleTask,
  selectedProject,
  selectedRoom,
  selectedRoomId,
  selectedScheduleIndex,
  tasks
}: {
  actionState: AsyncState;
  activeView: string;
  activeHouse: House;
  chatRooms: ChatRoom[];
  completedTaskIds: Set<string>;
  error: string;
  notice: string;
  onCreateHouse: (event: FormEvent<HTMLFormElement>) => void;
  onCreateTask: (event: FormEvent<HTMLFormElement>) => void;
  onJoinHouse: (event: FormEvent<HTMLFormElement>) => void;
  onProjectSelect: (project: string) => void;
  onRefresh: () => void;
  onRoomSelect: (roomId: string) => void;
  onScheduleSelect: (index: number) => void;
  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
  onToggleTask: (taskId: string) => void;
  selectedProject: string;
  selectedRoom?: ChatRoom;
  selectedRoomId: string;
  selectedScheduleIndex: number;
  tasks: ProductionTask[];
}) {
  const dueToday = tasks.filter(
    (task) => task.status !== "done" && !completedTaskIds.has(task.id)
  ).length;
  const activeCopy = viewCopy[activeView] ?? viewCopy.Home;
  const selectedSchedule = scheduleItems[selectedScheduleIndex];

  return (
    <section className="dashboard-page" data-view={activeView} id="home">
      <div className="dashboard-heading">
        <div>
          <h1>Good morning, Aryan</h1>
          <p>Here is what is happening with your productions today.</p>
        </div>
        <span>Wednesday, 28 May 2025</span>
      </div>

      <section className="view-focus" aria-live="polite">
        <div>
          <span>{activeView}</span>
          <h2>{activeCopy.title}</h2>
          <p>{activeCopy.body}</p>
        </div>
        <button type="button" onClick={onRefresh}>
          Refresh mock data
        </button>
      </section>

      <section className="stats-grid" aria-label="House stats">
        <StatCard
          icon="P"
          title="Active Projects"
          value="6"
          note="+2 this month"
          tone="violet"
        />
        <StatCard
          icon="S"
          title="Upcoming Shoots"
          value="3"
          note="Next: Tomorrow, 9:00 AM"
          tone="blue"
        />
        <StatCard
          icon="T"
          title="Tasks Due Today"
          value={String(dueToday)}
          note="2 high priority"
          tone="green"
        />
        <StatCard
          icon="U"
          title="Team Online"
          value={`${activeHouse.members.filter((member) => member.status !== "offline").length}`}
          note={`${activeHouse.members.length} total members`}
          tone="orange"
        />
      </section>

      {error ? (
        <Alert tone="error" message={error} />
      ) : (
        <Alert tone="info" message={notice} />
      )}

      <section className="dashboard-grid">
        <PanelLight title="Upcoming Schedule" action="View Calendar">
          <div className="schedule-list">
            {scheduleItems.map((item, index) => (
              <button
                className={
                  selectedScheduleIndex === index
                    ? "schedule-item active"
                    : "schedule-item"
                }
                key={`${item.time}-${item.title}`}
                onClick={() => onScheduleSelect(index)}
                type="button"
              >
                <time>{item.time}</time>
                <span className={`timeline-dot ${item.tone}`} />
                <div>
                  <strong>{item.title}</strong>
                  <p>Project: {item.project}</p>
                </div>
                <em>{item.place}</em>
              </button>
            ))}
          </div>
          {selectedSchedule ? (
            <div className="schedule-detail">
              <strong>{selectedSchedule.title}</strong>
              <span>
                {selectedSchedule.time} at {selectedSchedule.place}
              </span>
              <p>
                Backend task: persist schedule selection and calendar edits via
                the public calendar API.
              </p>
            </div>
          ) : null}
        </PanelLight>

        <PanelLight title="My Tasks" action="View all">
          <div className="task-list-light">
            {tasks.slice(0, 4).map((task) => (
              <TaskRowLight
                completed={completedTaskIds.has(task.id)}
                key={task.id}
                onToggle={onToggleTask}
                task={task}
              />
            ))}
          </div>
        </PanelLight>

        <PanelLight title="Recent Projects" action="View all">
          <div className="project-strip">
            {recentProjects.map((project) => (
              <button
                className={`project-card-mini ${project.theme}${
                  selectedProject === project.title ? "active" : ""
                }`}
                key={project.title}
                onClick={() => onProjectSelect(project.title)}
                type="button"
              >
                <div aria-hidden="true" />
                <strong>{project.title}</strong>
                <span>{project.type}</span>
                <ProgressBar value={project.progress} />
              </button>
            ))}
          </div>
          <div className="project-detail">
            <strong>{selectedProject}</strong>
            <span>
              Selected locally. Backend will provide project detail APIs.
            </span>
          </div>
        </PanelLight>

        <PanelLight title="Recent Activity" action="View all">
          <div className="activity-list">
            {activities.map((activity) => (
              <article
                className="activity-item"
                key={`${activity.name}-${activity.time}`}
              >
                <Avatar label={activity.name.slice(0, 2).toUpperCase()} />
                <div>
                  <p>
                    <strong>{activity.name}</strong> {activity.text}
                  </p>
                  <span>{activity.time}</span>
                </div>
                <em>{activity.icon}</em>
              </article>
            ))}
          </div>
        </PanelLight>
      </section>

      <section className="dashboard-grid lower">
        <PanelLight title="House Management" action="Refresh">
          <div className="house-management-grid">
            <form className="mini-form" onSubmit={onCreateHouse}>
              <strong>Create house</strong>
              <input name="houseName" placeholder="North Star Films" />
              <input name="houseHandle" placeholder="north-star" />
              <input name="houseDescription" placeholder="Description" />
              <button disabled={actionState === "loading"}>Create</button>
            </form>
            <form className="mini-form" onSubmit={onJoinHouse}>
              <strong>Join house</strong>
              <input name="inviteCode" placeholder="NOVA-2048" />
              <button disabled={actionState === "loading"}>Join</button>
            </form>
            <button className="mini-refresh" onClick={onRefresh} type="button">
              Refresh mock workspace
            </button>
          </div>
        </PanelLight>

        <PanelLight title="Task Scheduler" action="Create">
          <form className="mini-form two-col" onSubmit={onCreateTask}>
            <input name="taskTitle" placeholder="Prepare rough cut" />
            <input name="taskProject" placeholder="Cafe Noir Opening" />
            <select name="assigneeId">
              {activeHouse.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <select name="taskRole">
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <input name="dueDate" type="date" />
            <button disabled={actionState === "loading"}>Schedule</button>
          </form>
        </PanelLight>

        <PanelLight title="House Chat" action="Rooms">
          <div className="chat-dashboard">
            <div className="chat-room-list">
              {chatRooms.map((room) => (
                <button
                  className={room.id === selectedRoomId ? "active" : ""}
                  key={room.id}
                  onClick={() => onRoomSelect(room.id)}
                  type="button"
                >
                  #{room.name}
                  {room.unreadCount ? <span>{room.unreadCount}</span> : null}
                </button>
              ))}
            </div>
            <ChatPanel
              room={selectedRoom}
              onSendMessage={onSendMessage}
              isSending={actionState === "loading"}
            />
          </div>
        </PanelLight>
      </section>
    </section>
  );
}

function LoginFeature({
  body,
  icon,
  title
}: {
  body: string;
  icon: "cal" | "team" | "file" | "flow";
  title: string;
}) {
  const iconSrc = {
    cal: "/images/login/calendar.png",
    team: "/images/login/team.png",
    file: "/images/login/folder.png",
    flow: "/images/login/progress.png"
  }[icon];

  return (
    <article className="login-feature">
      <div aria-hidden="true">
        <Image alt="" height={52} src={iconSrc} width={52} />
      </div>
      <h2>{title}</h2>
      <p>{body}</p>
    </article>
  );
}

function StatCard({
  icon,
  note,
  title,
  tone,
  value
}: {
  icon: string;
  note: string;
  title: string;
  tone: "violet" | "blue" | "green" | "orange";
  value: string;
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{value}</span>
        <p>{note}</p>
      </div>
      <div className={`stat-spark ${tone}`} />
    </article>
  );
}

function PanelLight({
  action,
  children,
  title
}: {
  action?: string;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="panel-light">
      <header>
        <h2>{title}</h2>
        {action ? <button type="button">{action}</button> : null}
      </header>
      {children}
    </section>
  );
}

function TaskRowLight({
  completed,
  onToggle,
  task
}: {
  completed: boolean;
  onToggle: (taskId: string) => void;
  task: ProductionTask;
}) {
  return (
    <article
      className={completed ? "task-row-light completed" : "task-row-light"}
    >
      <input
        aria-label={`Complete ${task.title}`}
        checked={completed}
        onChange={() => onToggle(task.id)}
        type="checkbox"
      />
      <div>
        <strong>{task.title}</strong>
        <span>{task.project}</span>
      </div>
      <em className={task.priority}>{task.priority}</em>
      <time>{task.dueDate}</time>
    </article>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-bar" aria-label={`${value}% complete`}>
      <span style={{ width: `${value}%` }} />
      <em>{value}%</em>
    </div>
  );
}

function Avatar({ label }: { label: string }) {
  return (
    <div className="avatar">
      {label}
      <span />
    </div>
  );
}

function Alert({ message, tone }: { message: string; tone: "error" | "info" }) {
  return (
    <div className={tone === "error" ? "alert error" : "alert"}>{message}</div>
  );
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <div className="empty-state">
      <p>{title}</p>
      <span>{body}</span>
    </div>
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
    <div className="chat-panel">
      <div className="chat-panel-heading">
        <strong>#{room.name}</strong>
        <span>{room.topic}</span>
      </div>
      <div className="chat-scroll">
        {room.messages.map((message) => (
          <div className="message-row" key={message.id}>
            <Avatar
              label={message.authorName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            />
            <div>
              <p>
                <strong>{message.authorName}</strong>
                <span>{message.sentAt}</span>
              </p>
              <em>{message.body}</em>
            </div>
          </div>
        ))}
      </div>
      <form className="chat-composer" onSubmit={onSendMessage}>
        <input name="message" placeholder={`Message #${room.name}`} />
        <button data-testid="send-message-submit" disabled={isSending}>
          Send
        </button>
      </form>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

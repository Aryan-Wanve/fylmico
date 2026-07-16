"use client";

import { useEffect, useRef, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import {
  Bell,
  Calendar,
  CheckCheck,
  MessageSquare,
  UserPlus,
  Users
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { formatRelativeTime } from "@/lib/relative-time";
import { useWorkspace } from "@/lib/workspace-context";
import {
  activateHouse,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "@/services/base-workspace.service";
import type { NotificationItem } from "@/types/base";

const POLL_INTERVAL_MS = 25_000;

// Where each notification type's "relevant page" is, once its house is
// active - a plain lookup, not a routing framework, since it's just 10-ish
// known notification types.
export const TYPE_DESTINATION: Record<string, string> = {
  task_assigned: "/tasks",
  task_comment: "/tasks",
  task_mentioned: "/tasks",
  task_status_changed: "/tasks",
  task_review_requested: "/tasks",
  task_completed: "/tasks",
  project_comment: "/projects",
  booking_status_changed: "/bookings",
  booking_created: "/bookings",
  announcement_posted: "/announcements",
  house_join_request: "/crews",
  member_role_assigned: "/home"
};

export const TYPE_STYLES: Record<
  string,
  { icon: typeof Bell; bg: string; color: string }
> = {
  task_assigned: {
    icon: CheckCheck,
    bg: "bg-[#654cff]/10",
    color: "text-[#654cff]"
  },
  task_comment: {
    icon: MessageSquare,
    bg: "bg-[#3b82f6]/10",
    color: "text-[#3b82f6]"
  },
  project_comment: {
    icon: MessageSquare,
    bg: "bg-[#3b82f6]/10",
    color: "text-[#3b82f6]"
  },
  house_joined: {
    icon: Users,
    bg: "bg-[#16c784]/10",
    color: "text-[#16c784]"
  },
  invitation_accepted: {
    icon: UserPlus,
    bg: "bg-[#16c784]/10",
    color: "text-[#16c784]"
  },
  booking_created: {
    icon: Calendar,
    bg: "bg-[#f97316]/10",
    color: "text-[#f97316]"
  },
  house_join_request: {
    icon: UserPlus,
    bg: "bg-[#654cff]/10",
    color: "text-[#654cff]"
  },
  house_join_approved: {
    icon: Users,
    bg: "bg-[#16c784]/10",
    color: "text-[#16c784]"
  },
  house_join_rejected: {
    icon: Users,
    bg: "bg-[#8a90a3]/10",
    color: "text-[#8a90a3]"
  }
};

export const DEFAULT_TYPE_STYLE = {
  icon: Bell,
  bg: "bg-[#8a90a3]/10",
  color: "text-[#8a90a3]"
};

export function NotificationBell() {
  const router = useRouter();
  const { workspace, refreshWorkspace } = useWorkspace();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isOpenRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    function refresh() {
      listNotifications()
        .then((data) => {
          if (!cancelled) {
            setNotifications(data);
          }
        })
        .catch(() => {
          // Notification bell fails quietly.
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    }

    refresh();
    // Polls in the background so the unread badge stays fresh without a
    // full realtime (WebSocket) layer - a deliberately simple substitute
    // documented as the deferred approach in ADR 0023.
    const interval = window.setInterval(() => {
      if (!isOpenRef.current) {
        refresh();
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.readAt
  ).length;

  async function handleOpen(open: boolean) {
    isOpenRef.current = open;
    if (!open) {
      return;
    }

    try {
      setNotifications(await listNotifications());
    } catch {
      // Keep whatever was already loaded.
    }
  }

  async function handleSelect(notification: NotificationItem) {
    if (!notification.readAt) {
      try {
        const updated = await markNotificationRead(notification.id);
        setNotifications((current) =>
          current.map((item) => (item.id === updated.id ? updated : item))
        );
      } catch {
        // Ignore - the item just stays unread visually.
      }
    }

    if (
      notification.organizationId &&
      notification.organizationId !== workspace.activeHouseId
    ) {
      try {
        await activateHouse(notification.organizationId);
        await refreshWorkspace();
      } catch {
        return;
      }
    }
    router.push((TYPE_DESTINATION[notification.type] ?? "/home") as Route);
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((current) =>
        current.map((item) => ({ ...item, readAt: new Date().toISOString() }))
      );
    } catch {
      // Ignore.
    }
  }

  return (
    <Popover onOpenChange={handleOpen}>
      <PopoverTrigger
        render={
          <button
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-xl text-[#4b5268] hover:bg-black/[0.03] dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
            type="button"
          >
            <Bell className="h-[1.15rem] w-[1.15rem]" />
            {unreadCount > 0 ? (
              <span className="absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#ef4444] px-1 text-[0.6rem] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </button>
        }
      />
      <PopoverContent align="end" className="w-80">
        <div className="flex items-center justify-between">
          <strong className="text-sm font-bold text-[#12142b] dark:text-[#f1f2f8]">
            Notifications
          </strong>
          {unreadCount > 0 ? (
            <button
              className="text-xs font-semibold text-[#654cff]"
              onClick={handleMarkAllRead}
              type="button"
            >
              Mark all read
            </button>
          ) : null}
        </div>
        <div className="grid max-h-96 gap-1 overflow-y-auto">
          {loading ? (
            <p className="py-6 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
              Loading...
            </p>
          ) : notifications.length > 0 ? (
            notifications.slice(0, 8).map((notification) => {
              const style =
                TYPE_STYLES[notification.type] ?? DEFAULT_TYPE_STYLE;
              const Icon = style.icon;

              return (
                <button
                  className={`flex items-start gap-2.5 rounded-lg p-2 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.05] ${
                    notification.readAt ? "" : "bg-[#654cff]/[0.04]"
                  }`}
                  key={notification.id}
                  onClick={() => handleSelect(notification)}
                  type="button"
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${style.bg} ${style.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#3a3f57] dark:text-[#b4b8cc]">
                      <strong className="font-semibold text-[#12142b] dark:text-[#f1f2f8]">
                        {notification.title}
                      </strong>{" "}
                      {notification.body}
                    </p>
                    <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.readAt ? (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#654cff]" />
                  ) : null}
                </button>
              );
            })
          ) : (
            <div className="grid place-items-center gap-2 py-8 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-black/[0.04] text-[#8a90a3] dark:bg-white/[0.06] dark:text-[#7d8299]">
                <Bell className="h-4.5 w-4.5" />
              </span>
              <p className="text-sm text-[#8a90a3] dark:text-[#7d8299]">
                You&apos;re all caught up.
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { formatRelativeTime } from "@/lib/relative-time";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "@/services/base-workspace.service";
import type { NotificationItem } from "@/types/base";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    listNotifications()
      .then((data) => {
        if (!cancelled) {
          setNotifications(data);
        }
      })
      .catch(() => {
        // Notification bell fails quietly.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.readAt
  ).length;

  async function handleOpen(open: boolean) {
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
    if (notification.readAt) {
      return;
    }

    try {
      const updated = await markNotificationRead(notification.id);
      setNotifications((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch {
      // Ignore - the item just stays unread visually.
    }
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
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
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
        <div className="grid gap-1">
          {notifications.length > 0 ? (
            notifications.slice(0, 6).map((notification) => (
              <button
                className={`flex items-start gap-2.5 rounded-lg p-2 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.05] ${
                  notification.readAt ? "" : "bg-[#654cff]/[0.04]"
                }`}
                key={notification.id}
                onClick={() => handleSelect(notification)}
                type="button"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#654cff]/10 text-xs font-bold text-[#654cff]">
                  {notification.title.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-[#3a3f57] dark:text-[#b4b8cc]">
                    <strong className="font-semibold">
                      {notification.title}
                    </strong>{" "}
                    {notification.body}
                  </p>
                  <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
              You&apos;re all caught up.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

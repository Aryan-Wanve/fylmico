"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  DEFAULT_TYPE_STYLE,
  TYPE_DESTINATION,
  TYPE_STYLES
} from "@/components/layout/notification-bell";
import { formatRelativeTime } from "@/lib/relative-time";
import { useWorkspace } from "@/lib/workspace-context";
import {
  activateHouse,
  listNotifications,
  markNotificationRead
} from "@/services/base-workspace.service";
import type { NotificationItem } from "@/types/base";

export function NotificationsPreviewPanel() {
  const router = useRouter();
  const { workspace, refreshWorkspace } = useWorkspace();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    listNotifications()
      .then((data) => {
        if (!cancelled) {
          setNotifications(data.filter((item) => !item.readAt).slice(0, 5));
        }
      })
      .catch(() => {
        // Fails quietly - the bell surfaces the real list.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSelect(notification: NotificationItem) {
    try {
      await markNotificationRead(notification.id);
    } catch {
      // Ignore.
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

  return (
    <DashboardPanel title="Notifications">
      <div className="grid gap-1 p-2">
        {notifications.length > 0 ? (
          notifications.map((notification) => {
            const style = TYPE_STYLES[notification.type] ?? DEFAULT_TYPE_STYLE;
            const Icon = style.icon;
            return (
              <button
                className="flex items-start gap-2.5 rounded-lg p-2.5 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                key={notification.id}
                onClick={() => void handleSelect(notification)}
                type="button"
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${style.bg} ${style.color}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#12142b] dark:text-[#f1f2f8]">
                    {notification.title}
                  </p>
                  <span className="text-xs text-[#667085] dark:text-[#878ca0]">
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="grid place-items-center gap-2 py-8 text-center">
            <Bell className="h-6 w-6 text-[#667085] dark:text-[#878ca0]" />
            <p className="text-sm text-[#667085] dark:text-[#878ca0]">
              You&apos;re all caught up.
            </p>
          </div>
        )}
      </div>
    </DashboardPanel>
  );
}

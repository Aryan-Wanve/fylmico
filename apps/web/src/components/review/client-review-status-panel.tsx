"use client";

import { useCallback, useEffect, useState } from "react";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { formatRelativeTime } from "@/lib/relative-time";
import { useDeliverableReviewChannel } from "@/lib/realtime/use-deliverable-review-channel";
import { listReviewSessions } from "@/services/base-workspace.service";
import type { ReviewSessionStatus, ReviewSessionSummary } from "@/types/base";

const STATUS_META: Record<
  ReviewSessionStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Sent, awaiting open",
    className: "bg-white/10 text-white/70"
  },
  viewed: {
    label: "Client Viewed",
    className: "bg-blue-500/15 text-blue-300"
  },
  reviewing: {
    label: "Client Reviewing",
    className: "bg-blue-500/15 text-blue-300"
  },
  changes_requested: {
    label: "Changes Requested",
    className: "bg-amber-500/15 text-amber-300"
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-500/15 text-emerald-300"
  },
  expired: {
    label: "Expired",
    className: "bg-white/10 text-white/50"
  },
  revoked: {
    label: "Revoked",
    className: "bg-white/10 text-white/50"
  }
};

function initialsFromEmail(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

export function ClientReviewStatusPanel({
  deliverableId
}: {
  deliverableId: string;
}) {
  const [session, setSession] = useState<ReviewSessionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    listReviewSessions(deliverableId)
      .then((sessions) => {
        setSession(sessions[0] ?? null);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [deliverableId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime pushes tell us *something* changed for this deliverable's
  // review session, but not the full updated row - refetch rather than
  // trying to reconstruct the summary from the broadcast payload alone.
  useDeliverableReviewChannel(deliverableId, () => refresh());

  if (loading || !session) {
    return null;
  }

  const meta = STATUS_META[session.status];

  return (
    <div className="grid gap-2 rounded-2xl border border-white/10 bg-[#171a28] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <AvatarWithStatus
            label={initialsFromEmail(session.clientEmail)}
            size="sm"
            userId={session.id}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">
              {session.clientEmail}
            </p>
            <p className="truncate text-xs text-white/40">
              {session.lastActivityAt
                ? `Last active ${formatRelativeTime(session.lastActivityAt)}`
                : "Not yet opened"}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${meta.className}`}
        >
          {meta.label}
        </span>
      </div>

      {session.approvedAt ? (
        <p className="text-xs text-white/40">
          Approved {formatRelativeTime(session.approvedAt)}
        </p>
      ) : session.firstViewedAt ? (
        <p className="text-xs text-white/40">
          First viewed {formatRelativeTime(session.firstViewedAt)}
        </p>
      ) : null}
    </div>
  );
}

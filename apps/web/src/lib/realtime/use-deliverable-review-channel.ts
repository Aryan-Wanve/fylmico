"use client";

import { useEffect } from "react";
import { getRealtimeClient } from "./supabase-client";

export type DeliverableReviewStatus =
  | "pending"
  | "viewed"
  | "reviewing"
  | "changes_requested"
  | "approved"
  | "expired"
  | "revoked";

export interface DeliverableReviewEvent {
  reviewSessionId: string;
  status: DeliverableReviewStatus;
}

// One channel per deliverable, carrying every client-review-session status
// change (viewed/comment/approved/changes_requested/expired) so the
// internal review workspace's live status panel updates without polling -
// same broadcast-only shape as use-conversation-channel.ts, just a single
// event type per message instead of several.
export function useDeliverableReviewChannel(
  deliverableId: string | null,
  onEvent: (event: string, payload: DeliverableReviewEvent) => void
): void {
  useEffect(() => {
    if (!deliverableId) {
      return;
    }

    const supabase = getRealtimeClient();
    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel(`deliverable:${deliverableId}:review`)
      .on("broadcast", { event: "viewed" }, ({ payload }) =>
        onEvent("viewed", payload as DeliverableReviewEvent)
      )
      .on("broadcast", { event: "comment" }, ({ payload }) =>
        onEvent("comment", payload as DeliverableReviewEvent)
      )
      .on("broadcast", { event: "changes_requested" }, ({ payload }) =>
        onEvent("changes_requested", payload as DeliverableReviewEvent)
      )
      .on("broadcast", { event: "approved" }, ({ payload }) =>
        onEvent("approved", payload as DeliverableReviewEvent)
      )
      .on("broadcast", { event: "expired" }, ({ payload }) =>
        onEvent("expired", payload as DeliverableReviewEvent)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onEvent is expected to be stable-enough per caller; re-subscribing on every render would thrash the channel
  }, [deliverableId]);
}

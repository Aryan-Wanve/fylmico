"use client";

import { useEffect, useRef } from "react";
import { getRealtimeClient } from "./supabase-client";

export type ChatDigestEvent = {
  conversationId: string;
  messageId: string;
  authorId: string;
  body: string;
  sentAt: string;
};

// One channel per house (not per conversation) purely for sidebar-list
// concerns - preview text, unread badge, reordering - so the list can stay
// live without opening a channel per conversation the user isn't even
// looking at.
export function useHouseChatDigest(
  houseId: string | null,
  onDigest: (event: ChatDigestEvent) => void
) {
  const onDigestRef = useRef(onDigest);
  useEffect(() => {
    onDigestRef.current = onDigest;
  });

  useEffect(() => {
    if (!houseId) {
      return;
    }

    const supabase = getRealtimeClient();
    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel(`house:${houseId}:chat`)
      .on("broadcast", { event: "message:new" }, ({ payload }) => {
        onDigestRef.current(payload as ChatDigestEvent);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [houseId]);
}

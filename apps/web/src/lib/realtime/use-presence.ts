"use client";

import { useEffect, useState } from "react";
import { getRealtimeClient } from "./supabase-client";

export function usePresence(
  houseId: string | null,
  selfId: string,
  selfName: string
): Set<string> {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!houseId) {
      return;
    }

    const supabase = getRealtimeClient();
    if (!supabase) {
      return;
    }

    const channel = supabase.channel(`house:${houseId}:presence`, {
      config: { presence: { key: selfId } }
    });

    function syncState() {
      setOnlineUserIds(new Set(Object.keys(channel.presenceState())));
    }

    channel
      .on("presence", { event: "sync" }, syncState)
      .subscribe((subscribeStatus) => {
        if (subscribeStatus === "SUBSCRIBED") {
          void channel.track({
            userId: selfId,
            name: selfName,
            onlineAt: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setOnlineUserIds(new Set());
    };
  }, [houseId, selfId, selfName]);

  return onlineUserIds;
}

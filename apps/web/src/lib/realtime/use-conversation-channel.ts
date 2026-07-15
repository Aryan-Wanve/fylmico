"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getRealtimeClient } from "./supabase-client";
import type { ChatMessage } from "@/types/base";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

const TYPING_TIMEOUT_MS = 3000;
const TYPING_BROADCAST_THROTTLE_MS = 2000;

// One shared Realtime channel per open conversation, carrying messages,
// reaction updates, read receipts, and typing pings - a single socket
// subscription instead of one channel per concern, since they all belong
// to the same topic anyway.
export function useConversationChannel(
  conversationId: string | null,
  selfId: string,
  selfName: string,
  handlers: {
    onMessage: (message: ChatMessage) => void;
    onReaction: (message: ChatMessage) => void;
    onRead: (userId: string, lastReadAt: string) => void;
  }
) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(
    new Map()
  );
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });
  const channelRef = useRef<ReturnType<
    NonNullable<ReturnType<typeof getRealtimeClient>>["channel"]
  > | null>(null);
  const lastTypingSentRef = useRef(0);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const supabase = getRealtimeClient();
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reporting the synchronous "no realtime client configured" case, not deriving render output
      setStatus("disconnected");
      return;
    }

    setStatus("connecting");
    const typingClearTimers = new Map<string, ReturnType<typeof setTimeout>>();

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on("broadcast", { event: "message:new" }, ({ payload }) => {
        handlersRef.current.onMessage(payload as ChatMessage);
      })
      .on("broadcast", { event: "reaction:update" }, ({ payload }) => {
        handlersRef.current.onReaction(payload as ChatMessage);
      })
      .on("broadcast", { event: "read" }, ({ payload }) => {
        const { userId, lastReadAt } = payload as {
          userId: string;
          lastReadAt: string;
        };
        handlersRef.current.onRead(userId, lastReadAt);
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const { userId, name } = payload as { userId: string; name: string };
        if (userId === selfId) {
          return;
        }

        setTypingUsers((current) => {
          const next = new Map(current);
          next.set(userId, name);
          return next;
        });

        const existingTimer = typingClearTimers.get(userId);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }
        typingClearTimers.set(
          userId,
          setTimeout(() => {
            setTypingUsers((current) => {
              const next = new Map(current);
              next.delete(userId);
              return next;
            });
            typingClearTimers.delete(userId);
          }, TYPING_TIMEOUT_MS)
        );
      })
      .subscribe((subscribeStatus) => {
        if (subscribeStatus === "SUBSCRIBED") {
          setStatus("connected");
        } else if (
          subscribeStatus === "CHANNEL_ERROR" ||
          subscribeStatus === "TIMED_OUT" ||
          subscribeStatus === "CLOSED"
        ) {
          setStatus("disconnected");
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      for (const timer of typingClearTimers.values()) {
        clearTimeout(timer);
      }
      setTypingUsers(new Map());
    };
  }, [conversationId, selfId]);

  const notifyTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingSentRef.current < TYPING_BROADCAST_THROTTLE_MS) {
      return;
    }
    lastTypingSentRef.current = now;
    channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: selfId, name: selfName }
    });
  }, [selfId, selfName]);

  return {
    status,
    typingUsers: [...typingUsers.values()],
    notifyTyping
  };
}

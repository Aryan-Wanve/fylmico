"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  listJoinRequests,
  respondToJoinRequest
} from "@/services/base-workspace.service";
import type { JoinRequest } from "@/types/base";

export function JoinRequestsDialog({
  houseId,
  houseName,
  open,
  onOpenChange,
  onResolved
}: {
  houseId: string;
  houseName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolved: () => void;
}) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting to loading each time the dialog re-opens for a (possibly different) house, not deriving render output
    setLoading(true);
    listJoinRequests(houseId)
      .then((data) => {
        if (!cancelled) {
          setRequests(data);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, houseId]);

  async function handleRespond(
    requestId: string,
    status: "approved" | "rejected"
  ) {
    setRespondingId(requestId);
    try {
      await respondToJoinRequest(houseId, requestId, status);
      setRequests((current) => current.filter((r) => r.id !== requestId));
      onResolved();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not update the request."
      );
    } finally {
      setRespondingId(null);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Join requests for {houseName}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid max-h-96 gap-3 overflow-y-auto">
          {loading ? (
            <p className="py-8 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
              Loading requests...
            </p>
          ) : requests.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
              No pending requests.
            </p>
          ) : (
            requests.map((request) => (
              <div
                className="flex items-center gap-3 rounded-xl border border-black/[0.06] p-3 dark:border-white/[0.08]"
                key={request.id}
              >
                <Avatar>
                  <AvatarFallback>{request.userAvatarLabel}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                    {request.userName}
                  </p>
                  <p className="truncate text-xs text-[#8a90a3] dark:text-[#7d8299]">
                    {request.userEmail}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    className="h-8 w-8 rounded-lg bg-emerald-500/10 p-0 text-emerald-600 hover:bg-emerald-500/20"
                    disabled={respondingId === request.id}
                    onClick={() => handleRespond(request.id, "approved")}
                    title="Approve"
                    variant="ghost"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    className="h-8 w-8 rounded-lg bg-red-500/10 p-0 text-red-600 hover:bg-red-500/20"
                    disabled={respondingId === request.id}
                    onClick={() => handleRespond(request.id, "rejected")}
                    title="Reject"
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

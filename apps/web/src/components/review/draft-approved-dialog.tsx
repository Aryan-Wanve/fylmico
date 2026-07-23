"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

export function DraftApprovedDialog({
  open,
  onOpenChange,
  onSendToClient,
  onMarkFinalInternally
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendToClient: () => void;
  onMarkFinalInternally: () => void;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Draft Approved</DialogTitle>
          <DialogDescription>
            This draft has been approved internally. Would you like to send it
            to the client for review?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-3 flex-col gap-2 sm:flex-col">
          <Button className="w-full" onClick={onSendToClient} type="button">
            Send to Client
          </Button>
          <Button
            className="w-full"
            onClick={onMarkFinalInternally}
            type="button"
            variant="outline"
          >
            Mark as Final Internally
          </Button>
          <Button
            className="w-full text-[#667085] dark:text-[#878ca0]"
            onClick={() => onOpenChange(false)}
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

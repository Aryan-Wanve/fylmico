"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ProfileSection } from "@/components/settings/profile-section";

// Hosts the full profile / password / sessions editor (previously the
// Settings "Profile & Account" tab) in a dialog opened from the top-right
// avatar, so account management lives where users expect it.
export function AccountDialog({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Profile &amp; Account</DialogTitle>
        </DialogHeader>
        <ProfileSection />
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { SendClientReviewRequest } from "@/types/base";

// The client page presents this as a calendar "expiry date", but the
// backend session model stores a duration parsed by the existing
// addDuration() util (token.util.ts) - a small preset list keeps the UI
// simple without adding a second date<->duration conversion path.
const EXPIRY_OPTIONS = [
  { value: "3d", label: "3 days" },
  { value: "7d", label: "7 days" },
  { value: "14d", label: "14 days" },
  { value: "30d", label: "30 days" }
];

export function ClientDeliveryDialog({
  open,
  onOpenChange,
  defaultSubject,
  onSubmit
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSubject: string;
  onSubmit: (request: SendClientReviewRequest) => Promise<void>;
}) {
  const [clientEmail, setClientEmail] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");
  const [includeProjectName, setIncludeProjectName] = useState(true);
  const [includeVideoVersion, setIncludeVideoVersion] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [expiresIn, setExpiresIn] = useState("7d");
  const [password, setPassword] = useState("");
  const [allowDownload, setAllowDownload] = useState(false);
  const [allowFullscreen, setAllowFullscreen] = useState(true);
  const [allowVersionSwitch, setAllowVersionSwitch] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!clientEmail.trim()) {
      setError("Enter the client's email address.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({
        clientEmail: clientEmail.trim(),
        subject: subject.trim() || defaultSubject,
        message: message.trim() || undefined,
        includeProjectName,
        includeVideoVersion,
        includeNotes,
        allowDownload,
        allowFullscreen,
        allowVersionSwitch,
        expiresIn,
        password: password.trim() || undefined
      });
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not send this review to the client."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Client Delivery</DialogTitle>
        </DialogHeader>

        <div className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1">
          <div className="grid gap-1.5">
            <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
              Client email
            </Label>
            <Input
              onChange={(event) => setClientEmail(event.target.value)}
              placeholder="client@example.com"
              type="email"
              value={clientEmail}
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
              Subject
            </Label>
            <Input
              onChange={(event) => setSubject(event.target.value)}
              value={subject}
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
              Message (optional)
            </Label>
            <textarea
              className="min-h-20 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-[#11142c] outline-none focus:border-[var(--fylmico-accent)] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
              onChange={(event) => setMessage(event.target.value)}
              placeholder="A short note to include in the email."
              value={message}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={includeProjectName}
                onCheckedChange={(checked) =>
                  setIncludeProjectName(Boolean(checked))
                }
              />
              <span className="text-sm text-[#3a3f57] dark:text-[#b4b8cc]">
                Include project name
              </span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={includeVideoVersion}
                onCheckedChange={(checked) =>
                  setIncludeVideoVersion(Boolean(checked))
                }
              />
              <span className="text-sm text-[#3a3f57] dark:text-[#b4b8cc]">
                Include video version
              </span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={includeNotes}
                onCheckedChange={(checked) => setIncludeNotes(Boolean(checked))}
              />
              <span className="text-sm text-[#3a3f57] dark:text-[#b4b8cc]">
                Include notes
              </span>
            </label>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
              Expiry date for review link
            </Label>
            <Select
              onValueChange={(next) => next && setExpiresIn(next)}
              value={expiresIn}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPIRY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
              Password protection (optional)
            </Label>
            <Input
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Leave blank for no password"
              type="text"
              value={password}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={allowDownload}
                onCheckedChange={(checked) =>
                  setAllowDownload(Boolean(checked))
                }
              />
              <span className="text-sm text-[#3a3f57] dark:text-[#b4b8cc]">
                Allow download
              </span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={allowFullscreen}
                onCheckedChange={(checked) =>
                  setAllowFullscreen(Boolean(checked))
                }
              />
              <span className="text-sm text-[#3a3f57] dark:text-[#b4b8cc]">
                Allow fullscreen
              </span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={allowVersionSwitch}
                onCheckedChange={(checked) =>
                  setAllowVersionSwitch(Boolean(checked))
                }
              />
              <span className="text-sm text-[#3a3f57] dark:text-[#b4b8cc]">
                Allow switching versions
              </span>
            </label>
          </div>

          {error ? (
            <p className="text-xs font-semibold text-red-500">{error}</p>
          ) : null}
        </div>

        <DialogFooter className="mt-3">
          <Button
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={submitting}
            onClick={() => void handleSubmit()}
            type="button"
          >
            {submitting ? "Sending..." : "Send Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

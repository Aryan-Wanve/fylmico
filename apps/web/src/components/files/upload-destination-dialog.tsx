"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { OwnerSelect, type OwnerValue } from "@/components/owners/owner-select";
import type { UploadCategory } from "@/types/base";

const CATEGORIES: { value: UploadCategory; label: string }[] = [
  { value: "raw", label: "Raw Footage" },
  { value: "assets", label: "Asset" },
  { value: "deliverables", label: "Deliverable" },
  { value: "project-files", label: "Project File" }
];

export function UploadDestinationDialog({
  open,
  onOpenChange,
  onConfirm
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (destination: OwnerValue & { category: UploadCategory }) => void;
}) {
  const [owner, setOwner] = useState<OwnerValue | null>(null);
  const [category, setCategory] = useState<UploadCategory>("project-files");

  function reset() {
    setOwner(null);
    setCategory("project-files");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!owner) {
      return;
    }
    onConfirm({ ...owner, category });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          reset();
        }
        onOpenChange(next);
      }}
      open={open}
    >
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Where should this go?</DialogTitle>
          </DialogHeader>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-1.5">
              <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Owner
              </Label>
              <OwnerSelect onChange={setOwner} value={owner} />
            </div>

            {owner ? (
              <label className="grid gap-1.5">
                <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                  Type
                </Label>
                <Select
                  items={Object.fromEntries(
                    CATEGORIES.map((option) => [option.value, option.label])
                  )}
                  onValueChange={(next) => setCategory(next as UploadCategory)}
                  value={category}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            ) : null}
          </div>

          <DialogFooter className="mt-5">
            <Button
              className="h-9 rounded-lg border-black/10 px-4 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="h-9 rounded-lg bg-[#654cff] px-4 text-sm font-bold text-white hover:bg-[#5a41ea] disabled:opacity-50"
              disabled={!owner}
              type="submit"
            >
              Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

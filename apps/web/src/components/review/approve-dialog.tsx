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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { ApproveDeliverableOptions } from "@/types/base";

// Mirrors drive-structure.service.ts's PORTFOLIO_CATEGORIES - kept in
// sync manually since that list lives in server-only code.
const PORTFOLIO_CATEGORIES = [
  "Commercials",
  "Reels",
  "Films",
  "Photography",
  "Misc"
];

export function ApproveDialog({
  open,
  onOpenChange,
  defaultFileName,
  onSubmit
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultFileName: string;
  onSubmit: (options: ApproveDeliverableOptions) => Promise<void>;
}) {
  const [deliverToClient, setDeliverToClient] = useState(true);
  const [addToPortfolio, setAddToPortfolio] = useState(false);
  const [portfolioCategory, setPortfolioCategory] = useState("Misc");
  const [finalName, setFinalName] = useState(defaultFileName);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({
        deliverToClient,
        addToPortfolio,
        portfolioCategory: addToPortfolio ? portfolioCategory : undefined,
        finalName: finalName.trim() || undefined,
        notes: notes.trim() || undefined
      });
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not approve this submission."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Submission</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <label className="flex items-start gap-2.5">
            <Checkbox
              checked={deliverToClient}
              onCheckedChange={(checked) =>
                setDeliverToClient(Boolean(checked))
              }
            />
            <span className="grid gap-0.5">
              <span className="text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                Deliver to client deliverables
              </span>
              <span className="text-xs text-[#667085] dark:text-[#878ca0]">
                Copies the approved video into Deliveries.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2.5">
            <Checkbox
              checked={addToPortfolio}
              onCheckedChange={(checked) => setAddToPortfolio(Boolean(checked))}
            />
            <span className="grid gap-0.5">
              <span className="text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                Move to Portfolio
              </span>
              <span className="text-xs text-[#667085] dark:text-[#878ca0]">
                Adds it to the House Portfolio, attributed to the editor.
              </span>
            </span>
          </label>

          {addToPortfolio ? (
            <div className="ml-6 grid gap-1.5">
              <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Portfolio category
              </Label>
              <Select
                onValueChange={(next) => next && setPortfolioCategory(next)}
                value={portfolioCategory}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PORTFOLIO_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="grid gap-1.5">
            <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
              Final delivery name
            </Label>
            <input
              className="h-9 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm text-[#11142c] outline-none focus:border-[var(--fylmico-accent)] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
              onChange={(event) => setFinalName(event.target.value)}
              value={finalName}
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
              Notes (optional)
            </Label>
            <textarea
              className="min-h-20 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-[#11142c] outline-none focus:border-[var(--fylmico-accent)] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Anything worth noting about this approval."
              value={notes}
            />
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
            className="bg-emerald-500 text-white hover:bg-emerald-600"
            disabled={submitting}
            onClick={() => void handleSubmit()}
            type="button"
          >
            {submitting ? "Approving..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { PRIORITY_ORDER, PRIORITY_META } from "@/components/tasks/task-data";
import { REVIEW_STATUS_META } from "@/components/review/review-item-card";

export type ReviewSortBy =
  | "newest"
  | "oldest"
  | "dueDate"
  | "priority"
  | "version"
  | "client"
  | "project"
  | "editor";

export function ReviewToolbar({
  search,
  onSearchChange,
  projectOptions,
  projectId,
  onProjectChange,
  clientOptions,
  clientId,
  onClientChange,
  editorOptions,
  editorId,
  onEditorChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  sortBy,
  onSortByChange,
  selectedCount,
  onBulkApprove,
  onBulkRequestChanges,
  onBulkReassign,
  onClearSelection
}: {
  search: string;
  onSearchChange: (value: string) => void;
  projectOptions: { id: string; label: string }[];
  projectId: string;
  onProjectChange: (value: string) => void;
  clientOptions: { id: string; label: string }[];
  clientId: string;
  onClientChange: (value: string) => void;
  editorOptions: { id: string; label: string }[];
  editorId: string;
  onEditorChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  sortBy: ReviewSortBy;
  onSortByChange: (value: ReviewSortBy) => void;
  selectedCount: number;
  onBulkApprove: () => void;
  onBulkRequestChanges: () => void;
  onBulkReassign: () => void;
  onClearSelection: () => void;
}) {
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#667085]" />
          <input
            className="h-9 w-full rounded-lg border border-black/10 bg-white pr-3 pl-9 text-sm text-[#11142c] outline-none focus:border-[var(--fylmico-accent)] dark:border-white/10 dark:bg-[#171a28] dark:text-[#f1f2f8]"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search project, task, client, editor..."
            value={search}
          />
        </div>

        <Select
          items={{
            all: "All Projects",
            ...Object.fromEntries(
              projectOptions.map((option) => [option.id, option.label])
            )
          }}
          onValueChange={(next) => onProjectChange(next ?? "all")}
          value={projectId}
        >
          <SelectTrigger className="bg-white dark:bg-[#171a28]" size="sm">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projectOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={{
            all: "All Clients",
            ...Object.fromEntries(
              clientOptions.map((option) => [option.id, option.label])
            )
          }}
          onValueChange={(next) => onClientChange(next ?? "all")}
          value={clientId}
        >
          <SelectTrigger className="bg-white dark:bg-[#171a28]" size="sm">
            <SelectValue placeholder="Client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clientOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={{
            all: "All Editors",
            ...Object.fromEntries(
              editorOptions.map((option) => [option.id, option.label])
            )
          }}
          onValueChange={(next) => onEditorChange(next ?? "all")}
          value={editorId}
        >
          <SelectTrigger className="bg-white dark:bg-[#171a28]" size="sm">
            <SelectValue placeholder="Editor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Editors</SelectItem>
            {editorOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={{
            all: "All Statuses",
            review: REVIEW_STATUS_META.review.label,
            revision: REVIEW_STATUS_META.revision.label,
            approved: REVIEW_STATUS_META.approved.label,
            rejected: REVIEW_STATUS_META.rejected.label
          }}
          onValueChange={(next) => onStatusChange(next ?? "all")}
          value={status}
        >
          <SelectTrigger className="bg-white dark:bg-[#171a28]" size="sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(["review", "revision", "approved", "rejected"] as const).map(
              (value) => (
                <SelectItem key={value} value={value}>
                  {REVIEW_STATUS_META[value].label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        <Select
          items={{
            all: "All Priorities",
            ...Object.fromEntries(
              PRIORITY_ORDER.map((value) => [value, PRIORITY_META[value].label])
            )
          }}
          onValueChange={(next) => onPriorityChange(next ?? "all")}
          value={priority}
        >
          <SelectTrigger className="bg-white dark:bg-[#171a28]" size="sm">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {PRIORITY_ORDER.map((value) => (
              <SelectItem key={value} value={value}>
                {PRIORITY_META[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={{
            newest: "Newest",
            oldest: "Oldest",
            dueDate: "Due Date",
            priority: "Priority",
            client: "Client",
            project: "Project",
            editor: "Editor",
            version: "Version"
          }}
          onValueChange={(value) => onSortByChange(value as ReviewSortBy)}
          value={sortBy}
        >
          <SelectTrigger className="bg-white dark:bg-[#171a28]" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="dueDate">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="version">Version</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedCount > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--fylmico-accent)]/20 bg-[var(--fylmico-accent)]/5 px-4 py-2.5">
          <span className="text-sm font-bold text-[var(--fylmico-accent)]">
            {selectedCount} selected
          </span>
          <Button
            className="h-8 bg-emerald-500 px-3 text-xs font-bold text-white hover:bg-emerald-600"
            onClick={onBulkApprove}
            type="button"
          >
            Bulk Approve
          </Button>
          <Button
            className="h-8 border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-500/30"
            onClick={onBulkRequestChanges}
            type="button"
            variant="outline"
          >
            Bulk Request Changes
          </Button>
          <Button
            className="h-8 px-3 text-xs font-bold"
            onClick={onBulkReassign}
            type="button"
            variant="outline"
          >
            Bulk Reassign
          </Button>
          <button
            className="ml-auto text-xs font-bold text-[#667085]"
            onClick={onClearSelection}
            type="button"
          >
            Clear
          </button>
        </div>
      ) : null}
    </div>
  );
}

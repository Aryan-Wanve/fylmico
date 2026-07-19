"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/workspace-context";
import {
  bulkReviewAction,
  getReviewMetrics,
  listClients,
  listProjects,
  listReviewQueue,
  reassignDeliverable,
  requestDeliverableRevision
} from "@/services/base-workspace.service";
import { ReviewItemCard } from "@/components/review/review-item-card";
import {
  ReviewToolbar,
  type ReviewSortBy
} from "@/components/review/review-toolbar";
import { RequestChangesDialog } from "@/components/review/request-changes-dialog";
import { ReassignDialog } from "@/components/review/reassign-dialog";
import type {
  ClientItem,
  Project,
  ReviewMetrics,
  ReviewQueueItem
} from "@/types/base";

type Target = { ids: string[]; editorId?: string };

const METRIC_CARDS: {
  key: keyof ReviewMetrics;
  label: string;
  accent: string;
}[] = [
  {
    key: "waitingForReview",
    label: "Waiting for Review",
    accent: "text-amber-600"
  },
  {
    key: "changesRequested",
    label: "Changes Requested",
    accent: "text-red-600"
  },
  {
    key: "approvedToday",
    label: "Approved Today",
    accent: "text-emerald-600"
  },
  { key: "overdueReviews", label: "Overdue Reviews", accent: "text-[#654cff]" }
];

export function ReviewPage() {
  const { activeHouse, workspace } = useWorkspace();
  const router = useRouter();
  const myRole = activeHouse?.members.find(
    (member) => member.id === workspace.user.id
  )?.role;
  const isManager = myRole === "Owner" || myRole === "Admin";
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [metrics, setMetrics] = useState<ReviewMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState("all");
  const [clientId, setClientId] = useState("all");
  const [editorId, setEditorId] = useState("all");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [sortBy, setSortBy] = useState<ReviewSortBy>("newest");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [requestChangesTarget, setRequestChangesTarget] =
    useState<Target | null>(null);
  const [reassignTarget, setReassignTarget] = useState<Target | null>(null);

  async function refresh() {
    const [queue, reviewMetrics] = await Promise.all([
      listReviewQueue(),
      getReviewMetrics()
    ]);
    setItems(queue);
    setMetrics(reviewMetrics);
  }

  useEffect(() => {
    if (!isManager) return;
    let cancelled = false;

    Promise.all([
      listReviewQueue(),
      getReviewMetrics(),
      listProjects(),
      listClients()
    ])
      .then(([queue, reviewMetrics, projectList, clientList]) => {
        if (cancelled) return;
        setItems(queue);
        setMetrics(reviewMetrics);
        setProjects(projectList);
        setClients(clientList);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isManager]);

  const projectOptions = useMemo(
    () => projects.map((p) => ({ id: p.id, label: p.title })),
    [projects]
  );
  const clientOptions = useMemo(
    () => clients.map((c) => ({ id: c.id, label: c.name })),
    [clients]
  );
  const editorOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of items) {
      seen.set(item.editorId, item.editorName);
    }
    return Array.from(seen, ([id, label]) => ({ id, label }));
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (projectId !== "all") {
      list = list.filter((item) => item.projectId === projectId);
    }
    if (clientId !== "all") {
      list = list.filter((item) => item.clientId === clientId);
    }
    if (editorId !== "all") {
      list = list.filter((item) => item.editorId === editorId);
    }
    if (status !== "all") {
      list = list.filter((item) => item.status === status);
    }
    if (priority !== "all") {
      list = list.filter((item) => item.priority === priority);
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.taskTitle?.toLowerCase().includes(term) ||
          item.projectTitle?.toLowerCase().includes(term) ||
          item.clientName?.toLowerCase().includes(term) ||
          item.editorName.toLowerCase().includes(term)
      );
    }

    const sorted = [...list];
    if (sortBy === "priority") {
      const rank: Record<string, number> = {
        urgent: 0,
        high: 1,
        medium: 2,
        low: 3
      };
      sorted.sort((a, b) => (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9));
    } else if (sortBy === "version") {
      sorted.sort((a, b) => b.version - a.version);
    } else if (sortBy === "oldest") {
      sorted.sort(
        (a, b) =>
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      );
    } else if (sortBy === "dueDate") {
      sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (sortBy === "client") {
      sorted.sort((a, b) =>
        (a.clientName ?? "").localeCompare(b.clientName ?? "")
      );
    } else if (sortBy === "project") {
      sorted.sort((a, b) =>
        (a.projectTitle ?? "").localeCompare(b.projectTitle ?? "")
      );
    } else if (sortBy === "editor") {
      sorted.sort((a, b) => a.editorName.localeCompare(b.editorName));
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    }
    return sorted;
  }, [items, projectId, clientId, editorId, status, priority, search, sortBy]);

  function toggleSelect(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleRequestChanges(comment: string) {
    if (!requestChangesTarget) return;
    for (const id of requestChangesTarget.ids) {
      await requestDeliverableRevision(id, comment);
    }
    setRequestChangesTarget(null);
    await refresh();
  }

  async function handleReassign(newEditorId: string) {
    if (!reassignTarget) return;
    for (const id of reassignTarget.ids) {
      await reassignDeliverable(id, newEditorId);
    }
    setReassignTarget(null);
    await refresh();
  }

  async function handleBulkApprove() {
    await bulkReviewAction("approve", Array.from(selectedIds));
    setSelectedIds(new Set());
    await refresh();
  }

  if (!isManager) {
    return (
      <div className="grid min-h-[60vh] place-items-center gap-2 p-8 text-center">
        <p className="text-sm font-semibold text-[#4b5268] dark:text-[#c7cad9]">
          Reviewers and Admins only.
        </p>
        <p className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
          You&apos;ll see your own submitted work under your crew profile
          instead.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-black text-[#11142c] sm:text-3xl dark:text-[#f1f2f8]">
          Review
        </h1>
        <p className="mt-1 text-sm text-[#5f667d] sm:text-base dark:text-[#a8acbf]">
          Approve, request changes and reassign submitted work across every
          project.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {METRIC_CARDS.map((card) => (
          <div
            className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]"
            key={card.key}
          >
            <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
              {card.label}
            </span>
            <strong className={`block text-2xl font-black ${card.accent}`}>
              {metrics ? metrics[card.key] : "—"}
            </strong>
          </div>
        ))}
      </div>

      <ReviewToolbar
        clientId={clientId}
        clientOptions={clientOptions}
        editorId={editorId}
        editorOptions={editorOptions}
        onBulkApprove={() => void handleBulkApprove()}
        onBulkReassign={() =>
          setReassignTarget({ ids: Array.from(selectedIds) })
        }
        onBulkRequestChanges={() =>
          setRequestChangesTarget({ ids: Array.from(selectedIds) })
        }
        onClearSelection={() => setSelectedIds(new Set())}
        onClientChange={setClientId}
        onEditorChange={setEditorId}
        onPriorityChange={setPriority}
        onProjectChange={setProjectId}
        onSearchChange={setSearch}
        onSortByChange={setSortBy}
        onStatusChange={setStatus}
        priority={priority}
        projectId={projectId}
        projectOptions={projectOptions}
        search={search}
        selectedCount={selectedIds.size}
        sortBy={sortBy}
        status={status}
      />

      {loading ? (
        <p className="text-sm text-[#8a90a3] dark:text-[#7d8299]">
          Loading review queue...
        </p>
      ) : filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-black/10 p-12 text-center dark:border-white/10">
          <p className="text-sm font-semibold text-[#4b5268] dark:text-[#c7cad9]">
            Nothing to review right now.
          </p>
          <p className="mt-1 text-xs text-[#8a90a3] dark:text-[#7d8299]">
            Submitted drafts will show up here for approval.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((item) => (
            <ReviewItemCard
              item={item}
              key={item.id}
              onOpen={() => router.push(`/review/${item.id}`)}
              onToggleSelect={() => toggleSelect(item.id)}
              selected={selectedIds.has(item.id)}
            />
          ))}
        </div>
      )}

      {requestChangesTarget ? (
        <RequestChangesDialog
          onOpenChange={(open) => {
            if (!open) setRequestChangesTarget(null);
          }}
          onSubmit={handleRequestChanges}
          open
        />
      ) : null}

      {reassignTarget ? (
        <ReassignDialog
          currentEditorId={
            reassignTarget.ids.length === 1
              ? items.find((i) => i.id === reassignTarget.ids[0])?.editorId
              : undefined
          }
          members={activeHouse?.members ?? []}
          onOpenChange={(open) => {
            if (!open) setReassignTarget(null);
          }}
          onSubmit={handleReassign}
          open
        />
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Camera,
  Loader2,
  Pencil
} from "lucide-react";
import { useWorkspace } from "@/lib/workspace-context";
import {
  approveDeliverable,
  archiveClient,
  getClient,
  listCalendarEvents,
  listDeliverablesForOwner,
  listShootsForOwner,
  requestDeliverableRevision,
  updateClient
} from "@/services/base-workspace.service";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { toInitials } from "@/components/tasks/task-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ClientEditDialog } from "@/components/projects/client-edit-dialog";
import { DeliverableRow } from "@/components/projects/deliverable-row";
import type {
  CalendarEvent,
  ClientItem,
  CreateClientRequest,
  Deliverable,
  Shoot
} from "@/types/base";

const SHOOT_STATUS_LABELS: Record<Shoot["status"], string> = {
  scheduled: "Scheduled",
  "crew-reached": "Crew Reached",
  started: "In Progress",
  finished: "Finished",
  uploading: "Uploading Data",
  uploaded: "Data Uploaded",
  "ready-for-editing": "Ready For Editing",
  archived: "Archived",
  cancelled: "Cancelled"
};

export function ClientDetailPage() {
  const params = useParams<{ clientId: string }>();
  const router = useRouter();
  const { workspace } = useWorkspace();

  const [client, setClient] = useState<ClientItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);

  useEffect(() => {
    let cancelled = false;

    getClient(params.clientId)
      .then((data) => {
        if (!cancelled) {
          setClient(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    listCalendarEvents()
      .then((data) => {
        if (!cancelled) {
          setEvents(data);
        }
      })
      .catch(() => undefined);

    listShootsForOwner({ ownerType: "client", ownerId: params.clientId })
      .then((data) => {
        if (!cancelled) {
          setShoots(data);
        }
      })
      .catch(() => undefined);

    listDeliverablesForOwner({ ownerType: "client", ownerId: params.clientId })
      .then((data) => {
        if (!cancelled) {
          setDeliverables(data);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [params.clientId]);

  async function refreshDeliverables() {
    const data = await listDeliverablesForOwner({
      ownerType: "client",
      ownerId: params.clientId
    });
    setDeliverables(data);
  }

  const tasks = useMemo(
    () => workspace.tasks.filter((task) => task.clientId === params.clientId),
    [workspace.tasks, params.clientId]
  );

  const clientEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          event.ownerType === "client" && event.ownerId === params.clientId
      ),
    [events, params.clientId]
  );

  async function handleSave(request: CreateClientRequest) {
    const updated = await updateClient(params.clientId, request);
    setClient(updated);
  }

  async function handleArchive() {
    if (
      !window.confirm(
        "Archive this client? It will be removed from the active list."
      )
    ) {
      return;
    }
    try {
      await archiveClient(params.clientId);
      router.push("/projects");
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not archive the client."
      );
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[24rem] place-items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#654cff]" />
      </div>
    );
  }

  if (notFound || !client) {
    return (
      <div className="grid min-h-[24rem] place-items-center gap-3 p-8 text-center">
        <p className="text-lg font-bold text-[#11142c] dark:text-[#f1f2f8]">
          Client not found
        </p>
        <Button onClick={() => router.push("/projects")} variant="outline">
          Back to Projects & Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:p-8">
      <button
        className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[#5f667d] hover:text-[#11142c] dark:text-[#a8acbf] dark:hover:text-[#f1f2f8]"
        onClick={() => router.push("/projects")}
        type="button"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects & Clients
      </button>

      <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <div className="grid min-w-0 gap-4 p-6">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {client.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- client logos are arbitrary external URLs, not local/optimizable assets
                <img
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-xl object-cover"
                  src={client.logoUrl}
                />
              ) : (
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#654cff]/10 text-base font-bold text-[#654cff]">
                  {client.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
                  {client.name}
                </h1>
                {client.contactName ? (
                  <span className="text-sm text-[#8a90a3] dark:text-[#7d8299]">
                    {client.contactName}
                    {client.contactEmail ? ` • ${client.contactEmail}` : ""}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                className="h-9 rounded-lg border-black/10 px-3.5 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
                onClick={() => setEditOpen(true)}
                variant="outline"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                className="h-9 rounded-lg border-red-200 px-3.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                onClick={handleArchive}
                variant="outline"
              >
                Archive
              </Button>
            </div>
          </div>

          {client.notes ? (
            <p className="text-sm leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
              {client.notes}
            </p>
          ) : null}
        </div>
      </div>

      <Tabs
        className="max-w-full min-w-0 overflow-x-auto"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList className="shrink-0" variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="shoots">Shoots ({shoots.length})</TabsTrigger>
          <TabsTrigger value="deliverables">
            Deliverables ({deliverables.length})
          </TabsTrigger>
          <TabsTrigger value="calendar">
            Calendar ({clientEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent className="mt-4" value="overview">
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-black/[0.06] bg-white p-5 text-sm text-[#5f667d] shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] sm:grid-cols-2 dark:border-white/[0.08] dark:bg-[#171a28] dark:text-[#a8acbf]">
            <div>
              <strong className="block text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
                Phone
              </strong>
              {client.phone || "Not set"}
            </div>
            <div>
              <strong className="block text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
                Address
              </strong>
              {client.address || "Not set"}
            </div>
            <div>
              <strong className="block text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
                GST
              </strong>
              {client.gst || "Not set"}
            </div>
          </div>
        </TabsContent>

        <TabsContent className="mt-4" value="tasks">
          <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
            {tasks.length === 0 ? (
              <p className="p-6 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
                No tasks are tagged to this client yet.
              </p>
            ) : (
              tasks.map((task) => {
                const firstAssignee = task.assignees[0];

                return (
                  <div
                    className="flex items-center gap-4 border-b border-black/5 px-4 py-3 last:border-b-0 dark:border-white/[0.06]"
                    key={task.id}
                  >
                    <AvatarWithStatus
                      label={toInitials(firstAssignee?.name ?? "?")}
                      size="sm"
                      userId={firstAssignee?.userId ?? ""}
                    />
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                        {task.title}
                      </strong>
                      <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                        {firstAssignee?.name ?? "Unassigned"} &bull; Due{" "}
                        {task.dueDate ?? "TBD"}
                      </span>
                    </div>
                    <span className="shrink-0 rounded-md bg-black/[0.04] px-2.5 py-1 text-xs font-bold text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]">
                      {task.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent className="mt-4" value="shoots">
          <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
            {shoots.length === 0 ? (
              <p className="p-6 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
                No shoots scheduled yet. Schedule one from New Task &gt; Shoot.
              </p>
            ) : (
              shoots.map((shoot) => (
                <div
                  className="flex items-center gap-4 border-b border-black/5 px-4 py-3 last:border-b-0 dark:border-white/[0.06]"
                  key={shoot.id}
                >
                  <Camera className="h-4 w-4 shrink-0 text-[#654cff]" />
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                      {shoot.name}
                    </strong>
                    <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                      {new Date(shoot.scheduledDate).toLocaleDateString()}
                      {shoot.callTime ? ` at ${shoot.callTime}` : ""}
                      {shoot.callTime && shoot.estFinishTime
                        ? ` - ${shoot.estFinishTime}`
                        : ""}
                      {shoot.location ? ` • ${shoot.location}` : ""}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-md bg-black/[0.04] px-2.5 py-1 text-xs font-bold text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]">
                    {SHOOT_STATUS_LABELS[shoot.status]}
                  </span>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent className="mt-4" value="deliverables">
          <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
            {deliverables.length === 0 ? (
              <p className="p-6 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
                No deliverables submitted yet. Submit a draft from an editing
                task to create the first version.
              </p>
            ) : (
              [...deliverables].reverse().map((deliverable) => (
                <DeliverableRow
                  deliverable={deliverable}
                  key={deliverable.id}
                  onApprove={async () => {
                    await approveDeliverable(deliverable.id);
                    await refreshDeliverables();
                  }}
                  onRequestRevision={async () => {
                    await requestDeliverableRevision(deliverable.id);
                    await refreshDeliverables();
                  }}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent className="mt-4" value="calendar">
          <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
            {clientEvents.length === 0 ? (
              <p className="p-6 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
                No calendar events are linked to this client yet.
              </p>
            ) : (
              clientEvents.map((event) => (
                <div
                  className="flex items-center gap-3 border-b border-black/5 px-4 py-3 last:border-b-0 dark:border-white/[0.06]"
                  key={event.id}
                >
                  <CalendarIcon className="h-4 w-4 shrink-0 text-[#654cff]" />
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                      {event.title}
                    </strong>
                    <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                      {event.date} at {event.time}
                      {event.location ? ` • ${event.location}` : ""}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {editOpen ? (
        <ClientEditDialog
          client={client}
          onOpenChange={setEditOpen}
          onSave={handleSave}
          open={editOpen}
        />
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Plus } from "lucide-react";
import { CallSheetEditor } from "@/components/call-sheets/call-sheet-editor";
import { NewCallSheetDialog } from "@/components/call-sheets/new-call-sheet-dialog";
import {
  createCallSheet,
  deleteCallSheet,
  listCallSheets,
  listCrew,
  listProjects,
  updateCallSheet
} from "@/services/base-workspace.service";
import type { CallSheet, CrewMember, Project } from "@/types/base";

export function CallSheetsPage() {
  const [callSheets, setCallSheets] = useState<CallSheet[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([listCallSheets(), listProjects(), listCrew()])
      .then(([callSheetData, projectData, crewData]) => {
        if (cancelled) {
          return;
        }
        setCallSheets(callSheetData);
        setProjects(projectData);
        setCrew(crewData);
        if (callSheetData[0]) {
          setActiveId(callSheetData[0].id);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          window.alert(
            error instanceof Error
              ? error.message
              : "Could not load call sheets."
          );
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
  }, []);

  const activeCallSheet = callSheets.find((sheet) => sheet.id === activeId);

  async function handleCreate(request: Parameters<typeof createCallSheet>[0]) {
    const created = await createCallSheet(request);
    setCallSheets((current) => [created, ...current]);
    setActiveId(created.id);
  }

  async function handleSave(updates: Parameters<typeof updateCallSheet>[1]) {
    if (!activeCallSheet) {
      return;
    }
    const updated = await updateCallSheet(activeCallSheet.id, updates);
    setCallSheets((current) =>
      current.map((sheet) => (sheet.id === updated.id ? updated : sheet))
    );
  }

  async function handleDelete() {
    if (!activeCallSheet) {
      return;
    }
    if (
      !window.confirm(
        `Delete "${activeCallSheet.title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteCallSheet(activeCallSheet.id);
      const remaining = callSheets.filter(
        (sheet) => sheet.id !== activeCallSheet.id
      );
      setCallSheets(remaining);
      setActiveId(remaining[0]?.id ?? null);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not delete the call sheet."
      );
    }
  }

  return (
    <div className="grid min-h-full grid-cols-1 gap-6 p-4 sm:p-6 lg:h-full lg:min-h-0 lg:p-8">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-black text-[#11142c] sm:text-3xl dark:text-[#f1f2f8]">
            Call Sheets
          </h1>
          <p className="mt-1 text-sm text-[#5f667d] sm:text-base dark:text-[#a8acbf]">
            Publish shoot-day logistics - call times, location, and crew
            assignments - in one place.
          </p>
        </div>
        <button
          className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#654cff] px-4 text-sm font-bold text-white hover:bg-[#5a41ea]"
          onClick={() => setCreateOpen(true)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          New Call Sheet
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="grid min-h-0 content-start gap-2 overflow-y-auto rounded-2xl border border-black/[0.06] bg-white p-3 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] lg:max-h-none dark:border-white/[0.08] dark:bg-[#171a28]">
          {loading ? (
            <p className="px-3 py-6 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
              Loading call sheets...
            </p>
          ) : callSheets.length === 0 ? (
            <div className="grid place-items-center gap-2 px-3 py-10 text-center">
              <CalendarClock className="h-6 w-6 text-[#8a90a3] dark:text-[#7d8299]" />
              <p className="text-sm text-[#8a90a3] dark:text-[#7d8299]">
                No call sheets yet. Create one to get started.
              </p>
            </div>
          ) : (
            callSheets.map((sheet) => (
              <button
                className={`grid gap-0.5 rounded-xl px-3 py-2.5 text-left transition ${
                  activeId === sheet.id
                    ? "bg-[#654cff]/10 text-[#654cff]"
                    : "hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                }`}
                key={sheet.id}
                onClick={() => setActiveId(sheet.id)}
                type="button"
              >
                <span className="truncate text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                  {sheet.title}
                </span>
                <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                  {sheet.shootDate} &bull; {sheet.generalCallTime}
                </span>
              </button>
            ))
          )}
        </div>

        {activeCallSheet ? (
          <CallSheetEditor
            callSheet={activeCallSheet}
            crew={crew}
            key={activeCallSheet.id}
            onDelete={handleDelete}
            onSave={handleSave}
            projects={projects}
          />
        ) : (
          <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-black/10 bg-white/60 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <div className="grid gap-2 p-10">
              <p className="text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                Select a call sheet or create a new one
              </p>
              <p className="text-sm text-[#8a90a3] dark:text-[#7d8299]">
                Shoot-day logistics live here.
              </p>
            </div>
          </div>
        )}
      </div>

      <NewCallSheetDialog
        onCreate={handleCreate}
        onOpenChange={setCreateOpen}
        open={createOpen}
        projects={projects}
      />
    </div>
  );
}

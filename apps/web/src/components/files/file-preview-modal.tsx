"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  FILE_KIND_META,
  formatFileSize,
  inferFileKind
} from "@/components/files/file-data";
import { getFileDownloadUrl } from "@/services/base-workspace.service";
import type { FileEntryItem } from "@/types/base";

export function FilePreviewModal({
  file,
  onOpenChange,
  onDownload
}: {
  file: FileEntryItem;
  onOpenChange: (open: boolean) => void;
  onDownload: (entryId: string) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getFileDownloadUrl(file.id)
      .then((resolvedUrl) => {
        if (!cancelled) {
          setUrl(resolvedUrl);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load this file."
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
  }, [file]);

  const kind = inferFileKind(file.type, file.mimeType);
  const meta = FILE_KIND_META[kind];
  const Icon = meta.icon;

  return (
    <Dialog onOpenChange={(next) => !next && onOpenChange(false)} open>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 truncate">
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{file.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid min-h-[20rem] place-items-center overflow-hidden rounded-xl bg-black/[0.02] dark:bg-white/[0.03]">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-[var(--fylmico-accent)]" />
          ) : error ? (
            <p className="p-8 text-center text-sm text-red-600">{error}</p>
          ) : kind === "image" && url ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote signed Supabase Storage URL, not an optimizable local asset
            <img
              alt={file.name}
              className="max-h-[32rem] w-full object-contain"
              src={url}
            />
          ) : kind === "pdf" && url ? (
            <iframe
              className="h-[32rem] w-full rounded-xl"
              src={url}
              title={file.name}
            />
          ) : kind === "video" && url ? (
            <video className="max-h-[32rem] w-full" controls src={url} />
          ) : kind === "audio" && url ? (
            <audio className="w-full px-8" controls src={url} />
          ) : (
            <div className="grid place-items-center gap-3 p-8 text-center">
              <span
                className={`grid h-16 w-16 place-items-center rounded-2xl ${meta.bg} ${meta.color}`}
              >
                <Icon className="h-8 w-8" />
              </span>
              <p className="text-sm text-[#5f667d] dark:text-[#a8acbf]">
                No preview available for this file type.
                {file.size ? ` (${formatFileSize(file.size)})` : ""}
              </p>
              <button
                className="flex h-9 items-center gap-2 rounded-lg bg-[var(--fylmico-accent)] px-4 text-sm font-bold text-white hover:bg-[var(--fylmico-accent-strong)]"
                onClick={() => onDownload(file.id)}
                type="button"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

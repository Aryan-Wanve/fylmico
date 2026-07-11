import {
  Archive,
  File,
  FileSpreadsheet,
  FileText,
  Folder,
  Image,
  Music,
  Video,
  type LucideIcon
} from "lucide-react";

export type FileKind =
  | "folder"
  | "video"
  | "audio"
  | "image"
  | "pdf"
  | "spreadsheet"
  | "archive"
  | "other";

export const FILE_KIND_META: Record<
  FileKind,
  { icon: LucideIcon; color: string; bg: string; label: string }
> = {
  folder: {
    icon: Folder,
    color: "text-amber-500",
    bg: "bg-amber-50",
    label: "Folder"
  },
  video: {
    icon: Video,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Video"
  },
  audio: {
    icon: Music,
    color: "text-violet-600",
    bg: "bg-violet-50",
    label: "Audio"
  },
  image: {
    icon: Image,
    color: "text-pink-600",
    bg: "bg-pink-50",
    label: "Image"
  },
  pdf: {
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "PDF"
  },
  spreadsheet: {
    icon: FileSpreadsheet,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "Sheet"
  },
  archive: {
    icon: Archive,
    color: "text-orange-600",
    bg: "bg-orange-50",
    label: "Archive"
  },
  other: {
    icon: File,
    color: "text-slate-500",
    bg: "bg-slate-100",
    label: "File"
  }
};

export function inferFileKind(
  type: "folder" | "file",
  mimeType: string | null
): FileKind {
  if (type === "folder") {
    return "folder";
  }
  if (!mimeType) {
    return "other";
  }
  if (mimeType.startsWith("video/")) {
    return "video";
  }
  if (mimeType.startsWith("audio/")) {
    return "audio";
  }
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  if (mimeType === "application/pdf") {
    return "pdf";
  }
  if (mimeType.includes("spreadsheet") || mimeType === "text/csv") {
    return "spreadsheet";
  }
  if (mimeType.includes("zip") || mimeType.includes("compressed")) {
    return "archive";
  }
  return "other";
}

export function formatFileSize(bytes: number | null): string {
  if (bytes === null) {
    return "";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
}

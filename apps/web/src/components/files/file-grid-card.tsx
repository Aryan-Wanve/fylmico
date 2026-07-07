import { FILE_KIND_META, type FileEntry } from "@/components/files/file-data";
import { FileCardMenu } from "@/components/files/file-card-menu";

export function FileGridCard({
  file,
  onDelete
}: {
  file: FileEntry;
  onDelete: () => void;
}) {
  const meta = FILE_KIND_META[file.kind];
  const Icon = meta.icon;

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-black/[0.06] bg-white p-4 text-center shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] hover:-translate-y-0.5 hover:shadow-[0_1.2rem_3rem_rgba(53,45,124,0.1)]">
      <div className="flex w-full justify-end">
        <FileCardMenu onDelete={onDelete} />
      </div>
      <span
        className={`grid h-14 w-14 place-items-center rounded-xl ${meta.bg} ${meta.color}`}
      >
        <Icon className="h-7 w-7" />
      </span>
      <strong className="line-clamp-2 w-full truncate text-sm font-semibold text-[#11142c]">
        {file.name}
      </strong>
      <span className="text-xs text-[#8a90a3]">
        {file.size ?? `${file.itemCount} items`}
      </span>
    </div>
  );
}

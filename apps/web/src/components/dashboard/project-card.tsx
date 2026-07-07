import Image from "next/image";

export function ProjectCard({
  title,
  type,
  progress,
  image
}: {
  title: string;
  type: string;
  progress: number;
  image: string;
}) {
  return (
    <article className="w-44 shrink-0">
      <div className="relative h-28 w-full overflow-hidden rounded-xl">
        <Image alt="" className="object-cover" fill sizes="176px" src={image} />
      </div>
      <strong className="mt-2 block text-sm font-bold text-[#11142c]">
        {title}
      </strong>
      <span className="text-xs text-[#8a90a3]">{type}</span>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full bg-[#654cff]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-[#5f667d]">
          {progress}%
        </span>
      </div>
    </article>
  );
}

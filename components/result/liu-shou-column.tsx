export function LiuShouColumn({ labels }: { labels: string[] }) {
  return (
    <div className="flex w-9 shrink-0 flex-col sm:w-10">
      <div className="min-h-[2.5rem]" aria-hidden />
      <div className="flex flex-col gap-1">
        {labels.map((label, i) => (
          <div
            key={i}
            className="flex min-h-[1.5rem] items-center justify-center text-xs font-medium text-amber-700"
          >
            <span className="max-w-full truncate text-center">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

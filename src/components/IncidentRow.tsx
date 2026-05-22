type Props = {
  id: string;
  serviceName: string;
  serviceId: string;
  startedAt: Date;
  endedAt: Date | null;
  duration: number | null;
  error: string | null;
  resolved: boolean;
};

export function IncidentRow({ id, serviceName, serviceId, startedAt, endedAt, duration, error, resolved }: Props) {
  return (
    <a
      href={`/report/${id}`}
      className="block rounded-xl border border-[#e5e5e5] dark:border-[#222] bg-white dark:bg-[#0a0a0a] p-4 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${resolved ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="font-medium text-[#111] dark:text-[#eee]">{serviceName}</span>
          </div>
          {error && (
            <p className="text-sm text-[#666] dark:text-[#888] line-clamp-2">{error}</p>
          )}
          <p className="text-xs text-[#888] dark:text-[#555]">
            {startedAt.toLocaleString()} · {duration != null ? `${duration}s` : 'ongoing'}
          </p>
        </div>

        <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
          resolved
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-red-500/10 text-red-600 dark:text-red-400'
        }`}>
          {resolved ? 'Resolved' : 'Ongoing'}
        </span>
      </div>
    </a>
  );
}

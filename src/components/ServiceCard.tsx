import type { ServiceStatus } from '../generated/prisma/client';
import type { ServiceTimeline } from '../lib/uptime';
import { dayTooltipParts } from '../lib/uptime';

type Props = {
  id: string;
  name: string;
  source: string;
  status: ServiceStatus;
  timeline: ServiceTimeline;
  lastError?: string | null;
  lastErrorAt?: Date | null;
};

function formatDate(d: Date): string {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const statusConfig = {
  UP: { label: 'Operational', dot: 'bg-emerald-500', text: 'text-emerald-500' },
  DOWN: { label: 'Down', dot: 'bg-red-500', text: 'text-red-500' },
  DEGRADED: { label: 'Degraded', dot: 'bg-amber-500', text: 'text-amber-500' },
};

export function ServiceCard({ id, name, source, status, timeline, lastError, lastErrorAt }: Props) {
  const cfg = statusConfig[status];

  return (
    <div className="rounded-2xl border border-[#e5e5e5] dark:border-[#222] bg-white dark:bg-[#0a0a0a]">
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-[#111] dark:text-[#eee]">{name}</h3>
            <div className="relative group">
              <svg className="w-3.5 h-3.5 text-[#999] dark:text-[#555] cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="bg-[#111] dark:bg-[#eee] text-white dark:text-black text-[11px] font-medium px-2 py-1 rounded whitespace-nowrap">
                  {source}
                </div>
              </div>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${cfg.text}`}>
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 flex gap-px h-8 items-end">
            {timeline.days.map((day, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (timeline.days.length - 1 - i));
              const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const tip = dayTooltipParts(day, label);
              return (
                <div key={i} className="relative group flex-1 h-full">
                  <div
                    className="w-full h-full rounded-sm"
                    style={{
                      backgroundColor: day.up ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)',
                    }}
                  />
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="bg-[#111] dark:bg-[#eee] text-white dark:text-black text-[11px] font-medium px-2.5 py-1.5 rounded whitespace-nowrap flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${tip.dot}`} />
                      {label}
                      <span className="text-[#888] dark:text-[#555]">{tip.status}</span>
                      {tip.extra && (
                        <span className="text-[#666] dark:text-[#777]">{tip.extra}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <span className="text-xs font-semibold text-[#555] dark:text-[#999] tabular-nums shrink-0">
            {timeline.uptime}%
          </span>
        </div>

        {lastError && (
          <div className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2 line-clamp-2">
            {lastErrorAt && <span className="font-medium">{formatDate(lastErrorAt)} — </span>}
            {lastError}
          </div>
        )}
      </div>
    </div>
  );
}



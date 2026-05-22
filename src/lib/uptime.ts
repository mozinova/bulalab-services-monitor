export interface DowntimeWindow {
  startedAt: Date;
  endedAt: Date | null;
  duration: number | null;
}

export interface DayInfo {
  up: boolean;
  downtimes: { endedAt: Date | null; duration: number | null }[];
}

export interface ServiceTimeline {
  days: DayInfo[];
  uptime: number;
}

export function computeTimeline(
  downtimes: DowntimeWindow[],
  days: number = 30,
): ServiceTimeline {
  const now = new Date();
  const dayInfos: DayInfo[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const overlapping = downtimes.filter((d) => {
      const dStart = d.startedAt;
      const dEnd = d.endedAt ?? now;
      return dStart < dayEnd && dEnd > dayStart;
    });

    dayInfos.push({
      up: overlapping.length === 0,
      downtimes: overlapping.map((d) => ({
        endedAt: d.endedAt,
        duration: d.duration,
      })),
    });
  }

  const upDays = dayInfos.filter((d) => d.up).length;
  const uptime = Math.round((upDays / days) * 100);

  return { days: dayInfos, uptime };
}

function fmtDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  const min = mins % 60;
  return `${hrs}h ${min}m`;
}

function fmtRelative(d: Date): string {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function dayTooltip(day: DayInfo, label: string, i: number): string {
  if (day.up) return `${label} - UP`;

  const first = day.downtimes[0];
  if (!first || !first.endedAt) return `${label} - DOWN`;

  const dur = first.duration ?? 0;
  return `${label} - DOWN ${fmtDuration(dur)} · resolved ${fmtRelative(first.endedAt)}`;
}

export function dayTooltipParts(day: DayInfo, label: string) {
  if (day.up) {
    return {
      dot: 'bg-emerald-500',
      status: 'UP',
      extra: null as string | null,
    };
  }

  const first = day.downtimes[0];
  if (!first || !first.endedAt) {
    return {
      dot: 'bg-red-500',
      status: 'DOWN',
      extra: null as string | null,
    };
  }

  const dur = first.duration ?? 0;
  return {
    dot: 'bg-emerald-500',
    status: 'Resolved',
    extra: `${fmtDuration(dur)} · ago`,
  };
}

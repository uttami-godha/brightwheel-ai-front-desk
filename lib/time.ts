import { CENTER } from "./seed";

export type ClockMode = "morning" | "live";

function centerParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CENTER.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((p) => [p.type, p.value])) as Record<string, string>;
}

/** Calendar date and time at the center (not in the viewer's timezone). */
export function centerDay(date: Date) {
  const p = centerParts(date);
  return {
    ymd: `${p.year}-${p.month}-${p.day}`,
    weekday: p.weekday, // "Mon"…"Sun"
    hour: Number(p.hour),
    minute: Number(p.minute),
  };
}

/**
 * The time the front desk believes it is. "morning" pins it to 8:15 AM (center
 * time) on today or the next weekday, so reviewers opening the demo at night or on
 * a weekend still see the school-day experience. "live" uses the real clock.
 */
export function demoNow(mode: ClockMode): Date {
  if (mode === "live") return new Date();
  let probe = new Date();
  let p = centerParts(probe);
  for (let i = 0; i < 7 && (p.weekday === "Sat" || p.weekday === "Sun"); i++) {
    probe = new Date(probe.getTime() + 86_400_000);
    p = centerParts(probe);
  }
  for (const offset of ["-04:00", "-05:00"]) {
    const candidate = new Date(`${p.year}-${p.month}-${p.day}T08:15:00${offset}`);
    if (centerParts(candidate).hour === "08") return candidate;
  }
  return new Date();
}

export function describeClock(mode: ClockMode): string {
  return demoNow(mode).toLocaleString("en-US", {
    timeZone: CENTER.timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Next open tour slots (Tue/Thu 9:30 AM & 4:00 PM, per the "tours" handbook entry). */
export function nextTourSlots(count = 4, from = new Date()): string[] {
  const slots: string[] = [];
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  while (slots.length < count) {
    const dow = d.getDay();
    if (dow === 2 || dow === 4) {
      const day = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      slots.push(`${day}, 9:30 AM`, `${day}, 4:00 PM`);
    }
    d.setDate(d.getDate() + 1);
  }
  return slots.slice(0, count);
}

export function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: CENTER.timezone,
  });
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

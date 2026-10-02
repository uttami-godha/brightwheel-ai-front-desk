import { normalizeAllergen, parseMenu } from "./allergy";
import { CENTER, FUN_FACTS } from "./seed";
import { centerDay } from "./time";
import type { KnowledgeEntry, MealKey, Weekday } from "./types";

/**
 * Builds the parent "School Info" screen from the same handbook entries the AI
 * answers from, so an edit in the Knowledge tab updates both at once.
 */

const MONTHS: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

export interface Closure {
  when: string; // as written in the handbook, e.g. "Thu Nov 26 & Fri Nov 27, 2026"
  label: string;
  start: string; // YYYY-MM-DD
  end: string;
}

/** Pulls the dates out of text like "Thu Dec 24, 2026 through Fri Jan 1, 2027". */
function datesIn(text: string): string[] {
  const matches = [...text.matchAll(/\b([A-Z][a-z]{2}) (\d{1,2})(?:, (\d{4}))?/g)].filter((m) => MONTHS[m[1]]);
  const out: string[] = [];
  matches.forEach((m, i) => {
    // A date without its own year takes the next year written after it ("Nov 26 & Nov 27, 2026").
    const year = m[3] ?? matches.slice(i + 1).find((n) => n[3])?.[3] ?? matches.findLast((n) => n[3])?.[3];
    if (!year) return;
    out.push(`${year}-${String(MONTHS[m[1]]).padStart(2, "0")}-${m[2].padStart(2, "0")}`);
  });
  return out;
}

function parseCalendar(content: string) {
  const closures: Closure[] = [];
  const earlyClose: string[] = [];
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (/^EARLY CLOSE/i.test(line)) earlyClose.push(...datesIn(line));
    if (!line.startsWith("- ")) continue;
    const [when, label] = line.slice(2).split(/\s+[–—-]\s+/, 2);
    const dates = datesIn(when ?? "");
    if (!dates.length) continue;
    closures.push({ when, label: label ?? "", start: dates[0], end: dates[dates.length - 1] });
  }
  return { closures, earlyClose };
}

function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function shortDay(ymd: string): string {
  return new Date(`${ymd}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function weekdayOf(ymd: string): string {
  return new Date(`${ymd}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

const FULL_DAY: Record<string, Weekday> = {
  Mon: "monday", Tue: "tuesday", Wed: "wednesday", Thu: "thursday", Fri: "friday",
};

export interface MenuLine {
  meal: MealKey;
  item: string;
  contains: string[] | null;
  conflicts: string[];
}

export interface SchoolInfo {
  status: { open: boolean; headline: string; detail: string };
  upcoming: Closure[];
  menu: { label: string; items: MenuLine[] } | null;
  funFact: string;
}

export function buildSchoolInfo(knowledge: KnowledgeEntry[], now: Date, allergies: string[]): SchoolInfo {
  const today = centerDay(now);
  const calendar = knowledge.find((k) => k.id === "calendar");
  const { closures, earlyClose } = calendar ? parseCalendar(calendar.content) : { closures: [], earlyClose: [] };
  const closureOn = (ymd: string) => closures.find((c) => ymd >= c.start && ymd <= c.end);
  const isSchoolDay = (ymd: string) => !["Sat", "Sun"].includes(weekdayOf(ymd)) && !closureOn(ymd);

  const nextSchoolDay = (after: string) => {
    let d = addDays(after, 1);
    for (let i = 0; i < 21 && !isSchoolDay(d); i++) d = addDays(d, 1);
    return d;
  };
  const reopens = (after: string) => {
    const d = nextSchoolDay(after);
    return d === addDays(after, 1) ? "Reopens tomorrow at 7:00 AM." : `Reopens ${shortDay(d)} at 7:00 AM.`;
  };

  // Open / closed right now
  const closedFor = closureOn(today.ymd);
  const closeHour = earlyClose.includes(today.ymd) ? 15 : CENTER.closeHour;
  const closeLabel = closeHour === 15 ? "3:00 PM (early close)" : "6:00 PM";
  let status: SchoolInfo["status"];
  if (["Sat", "Sun"].includes(today.weekday)) {
    status = { open: false, headline: "Closed today", detail: reopens(today.ymd) };
  } else if (closedFor) {
    status = { open: false, headline: `Closed: ${closedFor.label}`, detail: reopens(today.ymd) };
  } else if (today.hour < CENTER.openHour) {
    status = { open: false, headline: "Opens at 7:00 AM", detail: `Open until ${closeLabel} today.` };
  } else if (today.hour >= closeHour) {
    status = { open: false, headline: "Closed for the day", detail: reopens(today.ymd) };
  } else {
    status = { open: true, headline: "Open now", detail: `Until ${closeLabel} today.` };
  }

  const upcoming = closures
    .filter((c) => c.end >= today.ymd && !(c.start <= today.ymd && c.end >= today.ymd))
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 3);

  // Today's menu, or the next school day's if there's no school today
  const menuDay = isSchoolDay(today.ymd) && today.hour < closeHour ? today.ymd : nextSchoolDay(today.ymd);
  const menuEntry = knowledge.find((k) => k.id === "menu");
  let menu: SchoolInfo["menu"] = null;
  const weekday = FULL_DAY[weekdayOf(menuDay)];
  if (menuEntry && weekday) {
    const parsed = parseMenu(menuEntry.content);
    const mine = allergies.map(normalizeAllergen);
    const items = (["breakfast", "backup_lunch", "snack"] as MealKey[]).flatMap((meal) => {
      const found = parsed.get(`${weekday}:${meal}`);
      return found
        ? [{ meal, item: found.item, contains: found.contains, conflicts: found.contains ? mine.filter((a) => found.contains!.includes(a)) : [] }]
        : [];
    });
    const label = menuDay === today.ymd ? "Today's menu" : `Menu for ${shortDay(menuDay)}`;
    if (items.length) menu = { label, items };
  }

  const dayNumber = Math.floor(Date.parse(`${today.ymd}T00:00:00Z`) / 86_400_000);
  return { status, upcoming, menu, funFact: FUN_FACTS[dayNumber % FUN_FACTS.length] };
}

export function formatClosureDate(c: Closure): string {
  return c.when.replace(/, \d{4}/g, "");
}

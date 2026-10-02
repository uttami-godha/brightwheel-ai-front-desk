"use client";

import { useMemo } from "react";
import { MEAL_NAMES } from "@/lib/allergy";
import { buildSchoolInfo, formatClosureDate, type SchoolInfo } from "@/lib/schoolInfo";
import { CENTER } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { centerDay, demoNow } from "@/lib/time";
import {
  AlertIcon,
  BackIcon,
  CalendarIcon,
  ChevronIcon,
  ClockIcon,
  InfoIcon,
  MealIcon,
  PhoneIcon,
  PinIcon,
  SparkIcon,
  StarIcon,
} from "./icons";

function useSchoolInfo(): SchoolInfo {
  const { knowledge, clock, family } = useStore();
  return useMemo(() => buildSchoolInfo(knowledge, demoNow(clock), family.allergies), [knowledge, clock, family.allergies]);
}

const tel = `tel:${CENTER.phone.replace(/\D/g, "")}`;

// ------------------------------------------------------------------ Landing

export function ParentHome({ onChat, onInfo }: { onChat: () => void; onInfo: () => void }) {
  const { family, chats, clock } = useStore();
  const info = useSchoolInfo();
  const hour = centerDay(demoNow(clock)).hour;
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const messageCount = (chats[family.id] ?? []).length;
  const lunch = info.menu?.items.find((i) => i.meal === "backup_lunch");

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
      <h2 className="font-display text-2xl text-slate-900">
        {greeting}, {family.parentName.split(" ")[0]}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {family.childName ? `${family.childName} · ${family.room}` : `Welcome to ${CENTER.short}`}
      </p>

      <StatusPill status={info.status} className="mt-4" />

      <button
        onClick={onChat}
        className="mt-5 block w-full rounded-3xl bg-brand-700 p-5 text-left text-white shadow-lg shadow-brand-700/20 transition hover:bg-brand-800"
      >
        <div className="flex items-center gap-3">
          <JuniAvatar className="h-12 w-12 bg-white/15 text-white" />
          <div className="min-w-0 flex-1">
            <div className="text-lg font-semibold">Ask {CENTER.assistantName}</div>
            <div className="text-sm text-brand-100">Our AI assistant · answers in seconds</div>
          </div>
          <ChevronIcon className="h-5 w-5 opacity-70" />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-brand-50/90">
          {messageCount > 0
            ? `Pick up where you left off (${messageCount} message${messageCount === 1 ? "" : "s"}).`
            : `Illness rules, closures, billing, pickup… ${CENTER.assistantName} answers from the ${CENTER.short} handbook and loops in ${CENTER.directorFirst} when needed.`}
        </p>
      </button>

      <button
        onClick={onInfo}
        className="mt-3 block w-full rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 transition hover:ring-brand-300"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <InfoIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-semibold text-slate-900">School Info</div>
            <div className="text-sm text-slate-500">Hours, closures, menu & more</div>
          </div>
          <ChevronIcon className="h-5 w-5 text-slate-400" />
        </div>
        {lunch && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <MealIcon className="mt-0.5 h-4 w-4 text-slate-400" />
            <span className="min-w-0">
              <span className="font-medium text-slate-700">{info.menu?.label === "Today's menu" ? "Today's lunch" : `Lunch, ${info.menu?.label.replace("Menu for ", "")}`}:</span>{" "}
              {lunch.item}
            </span>
          </div>
        )}
      </button>
    </div>
  );
}

function StatusPill({ status, className = "" }: { status: SchoolInfo["status"]; className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ring-1 ${
        status.open ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-slate-100 text-slate-700 ring-slate-200"
      } ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${status.open ? "bg-emerald-500" : "bg-slate-400"}`} />
      <span className="font-semibold">{status.headline}</span>
      <span className="opacity-80">{status.detail}</span>
    </div>
  );
}

export function JuniAvatar({ className = "" }: { className?: string }) {
  return (
    <div className={`grid shrink-0 place-items-center rounded-2xl ${className}`}>
      <SparkIcon className="h-1/2 w-1/2" />
    </div>
  );
}

// ------------------------------------------------------------------ Sub-screen header

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  icon,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-2 py-2">
      <button
        onClick={onBack}
        aria-label="Back to home"
        className="grid h-9 w-9 place-items-center rounded-xl text-slate-600 hover:bg-slate-100"
      >
        <BackIcon className="h-5 w-5" />
      </button>
      {icon}
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-slate-900">{title}</div>
        {subtitle && <div className="truncate text-xs text-slate-500">{subtitle}</div>}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ School Info

export function SchoolInfoScreen({ onBack, onChat }: { onBack: () => void; onChat: () => void }) {
  const { family } = useStore();
  const info = useSchoolInfo();

  return (
    <>
      <ScreenHeader title="School Info" subtitle={CENTER.name} onBack={onBack} />
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <StatusPill status={info.status} />

        <Card icon={<ClockIcon />} title="Hours">
          <p>{CENTER.hours}</p>
          <p className="mt-0.5 text-slate-500">Please arrive by 9:30 AM for the morning program.</p>
        </Card>

        <Card icon={<PinIcon />} title="Location & contact">
          <p>{CENTER.address}</p>
          <p className="text-slate-500">{CENTER.neighborhood}</p>
          <a
            href={tel}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-800 ring-1 ring-brand-100"
          >
            <PhoneIcon className="h-3.5 w-3.5" /> {CENTER.phone}
          </a>
        </Card>

        <Card icon={<CalendarIcon />} title="Upcoming closures">
          {info.upcoming.length ? (
            <ul className="space-y-1.5">
              {info.upcoming.map((c) => (
                <li key={c.start} className="flex gap-3">
                  <span className="w-28 shrink-0 font-medium text-slate-800">{formatClosureDate(c)}</span>
                  <span className="text-slate-600">{c.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">No closures on the calendar. Ask {CENTER.assistantName} for details.</p>
          )}
        </Card>

        {info.menu && (
          <Card icon={<MealIcon />} title={info.menu.label}>
            <ul className="space-y-2">
              {info.menu.items.map((i) => (
                <li key={i.meal}>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{MEAL_NAMES[i.meal]}</div>
                  <div className="text-slate-800">{i.item}</div>
                  {family.childName && family.allergies.length > 0 && i.conflicts.length > 0 && (
                    <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-800 ring-1 ring-rose-200">
                      <AlertIcon className="h-3 w-3" /> Contains {i.conflicts.join(" & ")}, on {family.childName}&apos;s allergy list
                    </div>
                  )}
                  {family.childName && family.allergies.length > 0 && i.contains === null && (
                    <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">
                      <AlertIcon className="h-3 w-3" /> Allergens not listed
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-400">Forgot lunch? The backup lunch is $7. Let us know by 10:30 AM.</p>
          </Card>
        )}

        <Card icon={<StarIcon />} title="Fun fact">
          <p>{info.funFact}</p>
        </Card>

        <button
          onClick={onChat}
          className="flex w-full items-center gap-3 rounded-2xl bg-brand-700 px-4 py-3 text-left text-white"
        >
          <JuniAvatar className="h-9 w-9 bg-white/15" />
          <span className="flex-1 text-sm">
            <span className="font-semibold">Have a question?</span> Ask {CENTER.assistantName}
          </span>
          <ChevronIcon className="h-4 w-4 opacity-70" />
        </button>
      </div>
    </>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
      <h3 className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
        <span className="text-brand-700">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

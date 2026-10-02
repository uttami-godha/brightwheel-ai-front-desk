"use client";

import { useEffect, useMemo, useState } from "react";
import { CENTER } from "@/lib/seed";
import { uid, useStore } from "@/lib/store";
import { shortDate, timeAgo } from "@/lib/time";
import { CATEGORIES, type AnswerStatus, type Category, type KnowledgeEntry, type Ticket } from "@/lib/types";
import {
  AlertIcon,
  BookIcon,
  CalendarIcon,
  ChartIcon,
  ChatIcon,
  CheckIcon,
  InboxIcon,
  PlusIcon,
  SearchIcon,
  SparkIcon,
} from "./icons";

type Tab = "inbox" | "insights" | "knowledge" | "log";

export function OperatorConsole() {
  const { tickets } = useStore();
  const [tab, setTab] = useState<Tab>("inbox");
  const [newEntryTitle, setNewEntryTitle] = useState<string | null>(null);
  const openCount = tickets.filter((t) => t.status === "open").length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "inbox", label: "Needs you", icon: <InboxIcon />, badge: openCount },
    { id: "insights", label: "Insights", icon: <ChartIcon /> },
    { id: "knowledge", label: "Knowledge", icon: <BookIcon /> },
    { id: "log", label: "Conversations", icon: <ChatIcon /> },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-stone-200 px-5 pt-5">
        <div className="pb-3">
          <div className="text-xs font-medium uppercase tracking-wider text-stone-400">Control center</div>
          <h1 className="font-display text-2xl text-stone-900">Front desk</h1>
        </div>
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 pb-3 pt-2 text-sm transition ${
                tab === t.id
                  ? "border-juniper-700 font-medium text-juniper-800"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              {t.icon}
              {t.label}
              {!!t.badge && (
                <span className="rounded-full bg-amber-500 px-1.5 text-[11px] font-semibold text-white">{t.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {tab === "inbox" && <Inbox />}
        {tab === "insights" && (
          <Insights
            onWriteEntry={(title) => {
              setNewEntryTitle(title);
              setTab("knowledge");
            }}
          />
        )}
        {tab === "knowledge" && (
          <Knowledge prefillTitle={newEntryTitle} onConsumePrefill={() => setNewEntryTitle(null)} />
        )}
        {tab === "log" && <Log />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Inbox

function Inbox() {
  const { tickets } = useStore();
  const open = tickets.filter((t) => t.status === "open");
  const resolved = tickets.filter((t) => t.status === "resolved").slice(0, 6);
  const order = { urgent: 0, question: 1, tour: 2 } as const;
  open.sort((a, b) => order[a.kind] - order[b.kind] || b.at.localeCompare(a.at));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <p className="text-sm text-stone-500">
        Questions the front desk handed to you. Reply once, and teach it the answer so the next family gets it
        instantly.
      </p>
      {open.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
          All caught up. New hand-offs from parents will appear here.
        </div>
      )}
      {open.map((t) => (
        <TicketCard key={t.id} t={t} />
      ))}
      {resolved.length > 0 && (
        <div className="pt-4">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-400">Recently resolved</h3>
          <div className="divide-y divide-stone-100 rounded-2xl bg-white ring-1 ring-stone-200">
            {resolved.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <CheckIcon className="h-4 w-4 text-juniper-600" />
                <span className="min-w-0 flex-1 truncate text-stone-600">{t.question}</span>
                {t.taughtEntryId && (
                  <span className="rounded-full bg-juniper-50 px-2 py-0.5 text-[11px] font-medium text-juniper-700 ring-1 ring-juniper-100">
                    Taught to front desk
                  </span>
                )}
                <span className="text-xs text-stone-400">{timeAgo(t.at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const KIND_STYLE: Record<Ticket["kind"], { label: string; cls: string; icon: React.ReactNode }> = {
  urgent: { label: "Urgent", cls: "bg-rose-600 text-white", icon: <AlertIcon className="h-3.5 w-3.5" /> },
  question: { label: "Question", cls: "bg-amber-100 text-amber-900", icon: <ChatIcon className="h-3.5 w-3.5" /> },
  tour: { label: "Tour booked", cls: "bg-juniper-100 text-juniper-800", icon: <CalendarIcon className="h-3.5 w-3.5" /> },
};

function TicketCard({ t }: { t: Ticket }) {
  const { resolveTicket, dismissTicket, knowledge, saveEntry, tickets } = useStore();
  // Other families waiting on the same topic can get the new answer in the same click.
  const similar = tickets.filter(
    (x) =>
      x.id !== t.id &&
      x.status === "open" &&
      x.kind === "question" &&
      x.topic.toLowerCase() === t.topic.toLowerCase(),
  );
  const [reply, setReply] = useState("");
  const [teach, setTeach] = useState(t.kind === "question");
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<KnowledgeEntry | null>(null);
  const k = KIND_STYLE[t.kind];

  const send = async () => {
    if (!reply.trim()) return;
    if (!teach) {
      resolveTicket(t.id, reply);
      return;
    }
    setDrafting(true);
    try {
      const res = await fetch("/api/draft-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: t.question,
          reply,
          topic: t.topic,
          existingTitles: knowledge.map((e) => e.title),
        }),
      });
      const { draft: d } = await res.json();
      setDraft({
        id: `learned-${uid()}`,
        title: d.title,
        category: (CATEGORIES as string[]).includes(d.category) ? d.category : "Policies",
        content: d.content,
        updatedAt: new Date().toISOString(),
        updatedBy: CENTER.director,
        learnedFrom: t.question,
      });
    } catch {
      setDraft({
        id: `learned-${uid()}`,
        title: t.topic,
        category: "Policies",
        content: reply,
        updatedAt: new Date().toISOString(),
        updatedBy: CENTER.director,
        learnedFrom: t.question,
      });
    }
    setDrafting(false);
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${k.cls}`}>
          {k.icon}
          {k.label}
        </span>
        <span className="font-medium text-stone-700">
          {t.parentName}
          {t.childName ? ` · ${t.childName}` : " · prospective"}
        </span>
        <span className="text-stone-400">{timeAgo(t.at)}</span>
        {t.topic && <span className="ml-auto rounded-full bg-stone-100 px-2 py-0.5 text-stone-500">{t.topic}</span>}
      </div>
      <p className="mt-2.5 text-[15px] font-medium leading-snug text-stone-900">&ldquo;{t.question}&rdquo;</p>

      {t.kind !== "tour" && (
        <div className="mt-2 space-y-1 text-xs text-stone-500">
          <div>
            <span className="font-medium text-stone-600">Why it came to you:</span> {t.reason}
          </div>
          {t.aiAnswer && (
            <details>
              <summary className="cursor-pointer select-none text-stone-500 hover:text-stone-700">
                What the front desk told them
              </summary>
              <div className="mt-1 whitespace-pre-wrap rounded-lg bg-stone-50 p-2.5 text-stone-600">{t.aiAnswer}</div>
            </details>
          )}
        </div>
      )}

      {t.kind === "tour" ? (
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-stone-500">
          <span>Added to your calendar. The family gets a reminder the day before.</span>
          <button
            onClick={() => dismissTicket(t.id)}
            className="rounded-lg bg-juniper-700 px-3 py-1.5 font-medium text-white"
          >
            Got it
          </button>
        </div>
      ) : draft ? (
        <TeachDraft
          draft={draft}
          setDraft={setDraft}
          similar={similar}
          onSave={(alsoReplySimilar) => {
            saveEntry({ ...draft, updatedAt: new Date().toISOString() });
            resolveTicket(t.id, reply, draft.id);
            if (alsoReplySimilar) {
              for (const x of similar) {
                resolveTicket(x.id, `Following up on your question: ${draft.content}`, draft.id);
              }
            }
          }}
          onSkip={() => resolveTicket(t.id, reply)}
        />
      ) : (
        <div className="mt-3">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder={`Reply to ${t.parentName.split(" ")[0]}…`}
            className="w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 outline-none focus:border-juniper-400 focus:bg-white"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <label
              className={`flex cursor-pointer items-center gap-2 text-xs text-stone-600 ${t.kind === "urgent" ? "invisible" : ""}`}
            >
              <input
                type="checkbox"
                checked={teach}
                onChange={(e) => setTeach(e.target.checked)}
                className="accent-juniper-700"
              />
              <SparkIcon className="h-3.5 w-3.5 text-juniper-600" />
              Teach the front desk this answer
            </label>
            <div className="flex gap-2">
              <button onClick={() => dismissTicket(t.id)} className="px-2 text-xs text-stone-400 hover:text-stone-600">
                Dismiss
              </button>
              <button
                onClick={send}
                disabled={!reply.trim() || drafting}
                className="rounded-lg bg-juniper-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
              >
                {drafting ? "Drafting handbook entry…" : "Send reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeachDraft({
  draft,
  setDraft,
  similar,
  onSave,
  onSkip,
}: {
  draft: KnowledgeEntry;
  setDraft: (d: KnowledgeEntry) => void;
  similar: Ticket[];
  onSave: (alsoReplySimilar: boolean) => void;
  onSkip: () => void;
}) {
  const [alsoReply, setAlsoReply] = useState(true);
  const names = [...new Set(similar.map((s) => s.parentName))];
  return (
    <div className="mt-3 rounded-xl bg-juniper-50 p-3 ring-1 ring-juniper-100">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-juniper-800">
        <SparkIcon className="h-4 w-4" /> Your reply is ready to send. Review the new handbook entry drafted from it:
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="rounded-lg border border-juniper-200 bg-white px-2.5 py-1.5 text-sm font-medium outline-none focus:border-juniper-500"
        />
        <select
          value={draft.category}
          onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}
          className="rounded-lg border border-juniper-200 bg-white px-2 py-1.5 text-sm outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <textarea
        value={draft.content}
        onChange={(e) => setDraft({ ...draft, content: e.target.value })}
        rows={4}
        className="mt-2 w-full resize-y rounded-lg border border-juniper-200 bg-white px-2.5 py-2 text-sm leading-relaxed outline-none focus:border-juniper-500"
      />
      {similar.length > 0 && (
        <label className="mt-1 flex cursor-pointer items-center gap-2 text-xs text-juniper-900">
          <input
            type="checkbox"
            checked={alsoReply}
            onChange={(e) => setAlsoReply(e.target.checked)}
            className="accent-juniper-700"
          />
          Also send this answer to {names.join(", ")}, who {similar.length > 1 ? "are" : "is"} waiting on the same
          question
        </label>
      )}
      <div className="mt-2 flex justify-end gap-2">
        <button onClick={onSkip} className="px-2 text-xs text-stone-500 hover:text-stone-700">
          Send reply only
        </button>
        <button
          onClick={() => onSave(alsoReply)}
          className="rounded-lg bg-juniper-700 px-3 py-1.5 text-sm font-medium text-white"
        >
          Send reply & add to handbook
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Insights

const MINUTES_SAVED_PER_ANSWER = 4;

function Insights({ onWriteEntry }: { onWriteEntry: (title: string) => void }) {
  const { logs, knowledge, tickets } = useStore();
  const [now] = useState(() => Date.now());
  const week = useMemo(() => logs.filter((l) => now - new Date(l.at).getTime() < 7 * 86_400_000), [logs, now]);
  const answered = week.filter((l) => l.status === "answered").length;
  const handed = week.filter((l) => l.status !== "answered").length;
  const rate = week.length ? Math.round((answered / week.length) * 100) : 0;
  const hours = ((answered * MINUTES_SAVED_PER_ANSWER) / 60).toFixed(1);

  // Gaps: topics the front desk couldn't fully answer, grouped, most-asked first.
  const gaps = useMemo(() => {
    const coveredTitles = knowledge.map((k) => k.title.toLowerCase());
    const taughtTopics = new Set(tickets.filter((t) => t.taughtEntryId).map((t) => t.topic.toLowerCase()));
    const groups = new Map<string, { topic: string; count: number; examples: string[]; latest: string }>();
    for (const l of week) {
      if (l.status === "answered" || l.sensitivity !== "none" || l.engine === "emergency") continue;
      const key = l.topic.toLowerCase();
      const g = groups.get(key) ?? { topic: l.topic, count: 0, examples: [], latest: l.at };
      g.count++;
      if (g.examples.length < 2) g.examples.push(l.question);
      if (l.at > g.latest) g.latest = l.at;
      groups.set(key, g);
    }
    return [...groups.values()]
      .filter(
        (g) =>
          !taughtTopics.has(g.topic.toLowerCase()) &&
          !coveredTitles.some((t) => t.includes(g.topic.toLowerCase())),
      )
      .sort((a, b) => b.count - a.count);
  }, [week, knowledge, tickets]);

  const topics = useMemo(() => {
    const counts = new Map<string, [string, number]>();
    for (const l of week) {
      const key = l.topic.toLowerCase();
      const [label, n] = counts.get(key) ?? [l.topic, 0];
      counts.set(key, [label, n + 1]);
    }
    return [...counts.values()].sort((a, b) => b[1] - a[1]).slice(0, 7);
  }, [week]);
  const maxTopic = Math.max(1, ...topics.map(([, c]) => c));

  const flagged = week.filter((l) => l.feedback === "down");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Questions this week" value={String(week.length)} />
        <Stat label="Answered instantly" value={`${rate}%`} sub={`${answered} of ${week.length}`} />
        <Stat label="Handed to staff" value={String(handed)} sub="sensitive or unknown" />
        <Stat label="Staff time saved" value={`${hours} h`} sub={`~${MINUTES_SAVED_PER_ANSWER} min per answer`} />
      </div>

      <section>
        <h3 className="font-semibold text-stone-900">Gaps in your handbook</h3>
        <p className="mb-3 text-sm text-stone-500">
          Parents asked about these and the front desk had nothing to go on. One entry fixes every future question.
        </p>
        {gaps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
            No open gaps this week.
          </div>
        ) : (
          <div className="space-y-2">
            {gaps.map((g) => (
              <div
                key={g.topic}
                className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-lg font-semibold text-amber-800 ring-1 ring-amber-200">
                  {g.count}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-stone-900">{g.topic}</div>
                  <div className="truncate text-xs text-stone-500">
                    {g.examples.map((e) => `“${e}”`).join("  ·  ")}
                  </div>
                </div>
                <button
                  onClick={() => onWriteEntry(g.topic)}
                  className="inline-flex items-center gap-1 rounded-lg bg-juniper-700 px-3 py-1.5 text-sm font-medium text-white"
                >
                  <PlusIcon className="h-4 w-4" /> Write entry
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className="mb-3 font-semibold text-stone-900">What parents ask about</h3>
          <div className="space-y-2.5 rounded-2xl bg-white p-4 ring-1 ring-stone-200">
            {topics.map(([topic, count]) => (
              <div key={topic} className="group" title={`${topic}: ${count} question${count > 1 ? "s" : ""}`}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-stone-700">{topic}</span>
                  <span className="tabular-nums text-stone-500">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-stone-100">
                  <div
                    className="h-2 rounded-full bg-juniper-600 transition-all group-hover:bg-juniper-800"
                    style={{ width: `${(count / maxTopic) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3 className="mb-3 font-semibold text-stone-900">Answers parents flagged</h3>
          <div className="rounded-2xl bg-white ring-1 ring-stone-200">
            {flagged.length === 0 ? (
              <p className="p-4 text-sm text-stone-500">
                No answers marked “not helpful” this week. Flagged answers also land in your inbox.
              </p>
            ) : (
              <div className="divide-y divide-stone-100">
                {flagged.map((l) => (
                  <div key={l.id} className="p-3 text-sm">
                    <div className="font-medium text-stone-800">{l.question}</div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-stone-500">{l.answer}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
      <div className="text-xs text-stone-500">{label}</div>
      <div className="mt-1 font-display text-3xl tabular-nums text-stone-900">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-stone-400">{sub}</div>}
    </div>
  );
}

// ---------------------------------------------------------------- Knowledge

function Knowledge({ prefillTitle, onConsumePrefill }: { prefillTitle: string | null; onConsumePrefill: () => void }) {
  const { knowledge, logs, saveEntry, deleteEntry } = useStore();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<KnowledgeEntry | null>(() =>
    prefillTitle
      ? {
          id: `entry-${uid()}`,
          title: prefillTitle,
          category: "Policies",
          content: "",
          updatedAt: new Date().toISOString(),
          updatedBy: CENTER.director,
        }
      : null,
  );
  useEffect(() => {
    if (prefillTitle) onConsumePrefill();
    // Only on mount: the initial state above already captured the prefill.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usage = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of logs) for (const s of l.sources) m.set(s, (m.get(s) ?? 0) + 1);
    return m;
  }, [logs]);

  const q = query.toLowerCase();
  const filtered = knowledge.filter(
    (k) => !q || k.title.toLowerCase().includes(q) || k.content.toLowerCase().includes(q),
  );
  const isNew = editing && !knowledge.some((k) => k.id === editing.id);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-stone-200">
          <SearchIcon className="h-4 w-4 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the handbook…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <button
          onClick={() =>
            setEditing({
              id: `entry-${uid()}`,
              title: "",
              category: "Policies",
              content: "",
              updatedAt: new Date().toISOString(),
              updatedBy: CENTER.director,
            })
          }
          className="inline-flex items-center gap-1 rounded-xl bg-juniper-700 px-3 py-2 text-sm font-medium text-white"
        >
          <PlusIcon className="h-4 w-4" /> New entry
        </button>
      </div>
      <p className="mb-4 text-sm text-stone-500">
        This is everything the front desk knows. Write it the way you&apos;d explain it to a parent. Changes take
        effect on the very next question.
      </p>

      {editing && isNew && (
        <EntryEditor
          entry={editing}
          onCancel={() => setEditing(null)}
          onSave={(e) => {
            saveEntry(e);
            setEditing(null);
          }}
        />
      )}

      <div className="space-y-6">
        {CATEGORIES.map((cat) => {
          const items = filtered.filter((k) => k.category === cat);
          if (!items.length) return null;
          return (
            <section key={cat}>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-400">{cat}</h3>
              <div className="space-y-2">
                {items.map((k) =>
                  editing?.id === k.id ? (
                    <EntryEditor
                      key={k.id}
                      entry={editing}
                      onCancel={() => setEditing(null)}
                      onDelete={() => {
                        deleteEntry(k.id);
                        setEditing(null);
                      }}
                      onSave={(e) => {
                        saveEntry(e);
                        setEditing(null);
                      }}
                    />
                  ) : (
                    <button
                      key={k.id}
                      onClick={() => setEditing(k)}
                      className="block w-full rounded-2xl bg-white p-4 text-left ring-1 ring-stone-200 transition hover:ring-juniper-300"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-stone-900">{k.title}</span>
                        {k.learnedFrom && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-juniper-50 px-2 py-0.5 text-[11px] font-medium text-juniper-700 ring-1 ring-juniper-100">
                            <SparkIcon className="h-3 w-3" /> Learned from a parent question
                          </span>
                        )}
                        <span className="ml-auto text-xs text-stone-400">
                          Used in {usage.get(k.id) ?? 0} {usage.get(k.id) === 1 ? "answer" : "answers"} · updated{" "}
                          {shortDate(k.updatedAt)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-stone-500">{k.content}</p>
                    </button>
                  ),
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function EntryEditor({
  entry,
  onSave,
  onCancel,
  onDelete,
}: {
  entry: KnowledgeEntry;
  onSave: (e: KnowledgeEntry) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [e, setE] = useState(entry);
  return (
    <div className="mb-4 rounded-2xl bg-white p-4 shadow-md ring-2 ring-juniper-300">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          autoFocus
          value={e.title}
          onChange={(ev) => setE({ ...e, title: ev.target.value })}
          placeholder="Title, e.g. Summer camp"
          className="rounded-lg border border-stone-200 px-3 py-2 font-medium outline-none focus:border-juniper-500"
        />
        <select
          value={e.category}
          onChange={(ev) => setE({ ...e, category: ev.target.value as Category })}
          className="rounded-lg border border-stone-200 px-2 py-2 text-sm outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <textarea
        value={e.content}
        onChange={(ev) => setE({ ...e, content: ev.target.value })}
        rows={8}
        placeholder="Explain it like you would to a parent: dates, prices, who to contact, exceptions…"
        className="mt-2 w-full resize-y rounded-lg border border-stone-200 px-3 py-2 text-sm leading-relaxed outline-none focus:border-juniper-500"
      />
      <div className="mt-2 flex items-center gap-2">
        {onDelete && (
          <button onClick={onDelete} className="text-xs text-rose-600 hover:underline">
            Delete entry
          </button>
        )}
        <div className="ml-auto flex gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 text-sm text-stone-500">
            Cancel
          </button>
          <button
            disabled={!e.title.trim() || !e.content.trim()}
            onClick={() => onSave({ ...e, updatedAt: new Date().toISOString(), updatedBy: CENTER.director })}
            className="rounded-lg bg-juniper-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Conversation log

const STATUS_STYLE: Record<AnswerStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  answered: { label: "Answered", cls: "bg-juniper-50 text-juniper-800 ring-juniper-100", icon: <CheckIcon className="h-3 w-3" /> },
  partial: { label: "Partial", cls: "bg-amber-50 text-amber-800 ring-amber-200", icon: <AlertIcon className="h-3 w-3" /> },
  needs_staff: { label: "To staff", cls: "bg-orange-50 text-orange-800 ring-orange-200", icon: <InboxIcon className="h-3 w-3" /> },
};

function Log() {
  const { logs, knowledge } = useStore();
  const [filter, setFilter] = useState<AnswerStatus | "all">("all");
  const rows = logs.filter((l) => filter === "all" || l.status === filter);
  const title = (id: string) => knowledge.find((k) => k.id === id)?.title ?? id;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(["all", "answered", "partial", "needs_staff"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs ring-1 ${
              filter === f ? "bg-stone-900 text-white ring-stone-900" : "bg-white text-stone-600 ring-stone-200"
            }`}
          >
            {f === "all" ? `All (${logs.length})` : STATUS_STYLE[f].label}
          </button>
        ))}
      </div>
      <div className="divide-y divide-stone-100 rounded-2xl bg-white ring-1 ring-stone-200">
        {rows.map((l) => {
          const s = STATUS_STYLE[l.status];
          return (
            <details key={l.id} className="group px-4 py-3">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 text-sm">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${s.cls}`}>
                  {s.icon}
                  {s.label}
                </span>
                <span className="min-w-0 flex-1 truncate text-stone-800">{l.question}</span>
                {l.feedback === "down" && <span className="text-[11px] font-medium text-rose-600">Flagged</span>}
                <span className="text-xs text-stone-400">
                  {l.parentName.split(" ")[0]} · {timeAgo(l.at)}
                </span>
              </summary>
              <div className="mt-2 space-y-1.5 pl-1 text-xs text-stone-600">
                <div className="whitespace-pre-wrap rounded-lg bg-stone-50 p-2.5">{l.answer}</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-stone-400">
                  <span>Topic: {l.topic}</span>
                  {l.sensitivity !== "none" && <span>Sensitivity: {l.sensitivity.replace("_", " ")}</span>}
                  <span>Sources: {l.sources.length ? l.sources.map(title).join(", ") : "none"}</span>
                  <span>Engine: {l.engine}</span>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

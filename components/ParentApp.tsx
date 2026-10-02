"use client";

import { useEffect, useRef, useState } from "react";
import { CENTER, FAMILIES } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { nextTourSlots, shortDate } from "@/lib/time";
import type { ChatMessage, KnowledgeEntry } from "@/lib/types";
import {
  AlertIcon,
  BookIcon,
  CalendarIcon,
  CheckIcon,
  MicIcon,
  PhoneIcon,
  SendIcon,
  ThumbDownIcon,
  ThumbUpIcon,
} from "./icons";

const STARTERS: Record<string, string[]> = {
  jordan: [
    "Are you open on Veterans Day?",
    "I forgot Maya's lunch. What's for lunch today?",
    "Maya had a 101° fever last night. I gave her Tylenol at 6am and she seems fine. Can she come in today?",
    "Can my sister pick Maya up on Friday?",
  ],
  sam: [
    "I forgot Leo's formula today. Can you give him some?",
    "Are you open the day after Thanksgiving?",
    "Leo was just diagnosed with pink eye. When can he come back?",
    "Is there summer camp next year for his older brother?",
  ],
  prospect: [
    "What is the tuition for infants?",
    "How can I schedule a tour?",
    "How long is the infant waitlist?",
    "What's your staff-to-child ratio for babies?",
  ],
};

export function ParentApp() {
  const { family, chats, pending, ask, setFamily } = useStore();
  const messages = chats[family.id] ?? [];
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, pending]);

  const submit = (text: string) => {
    const q = text.trim();
    if (!q || pending) return;
    setDraft("");
    void ask(q);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#fbfaf7]">
      {/* App header */}
      <div className="border-b border-stone-200 bg-white px-4 pb-3 pt-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-juniper-700 font-display text-lg text-white">
            J
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-stone-900">{CENTER.name}</div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <span className="h-1.5 w-1.5 rounded-full bg-juniper-500" />
              Front desk · answers instantly, staff on call
            </div>
          </div>
        </div>
        <label className="mt-3 flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-1.5 text-xs text-stone-600">
          <span className="shrink-0">Signed in as</span>
          <select
            value={family.id}
            onChange={(e) => setFamily(e.target.value)}
            className="min-w-0 flex-1 truncate bg-transparent font-medium text-stone-800 outline-none"
          >
            {FAMILIES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.length === 0 && (
          <Welcome name={family.parentName.split(" ")[0]} starters={STARTERS[family.id]} onPick={submit} />
        )}
        {messages.map((m) => (
          <Message key={m.id} m={m} onAsk={submit} />
        ))}
        {pending && <Typing />}
      </div>

      <Composer draft={draft} setDraft={setDraft} onSubmit={submit} disabled={pending} />
    </div>
  );
}

function Welcome({ name, starters, onPick }: { name: string; starters: string[]; onPick: (q: string) => void }) {
  return (
    <div className="pt-2">
      <h2 className="font-display text-2xl text-stone-900">Hi {name}, how can we help?</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
        Ask about hours, illness rules, menus, billing, or pickup. Answers come straight from the Juniper Hill
        handbook, and anything I&apos;m unsure about goes to {CENTER.director}.
      </p>
      <div className="mt-5 space-y-2">
        {starters.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="block w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-left text-sm text-stone-700 shadow-sm transition hover:border-juniper-300 hover:bg-juniper-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex items-center gap-2 text-xs text-stone-500">
      <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm ring-1 ring-stone-200">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
      Checking the handbook…
    </div>
  );
}

function Message({ m, onAsk }: { m: ChatMessage; onAsk: (q: string) => void }) {
  if (m.role === "parent") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-juniper-700 px-4 py-2.5 text-[15px] leading-snug text-white">
          {m.text}
        </div>
      </div>
    );
  }
  if (m.role === "system") {
    return (
      <div className="mx-auto max-w-[90%] rounded-xl bg-juniper-50 px-3 py-2 text-center text-xs text-juniper-800 ring-1 ring-juniper-100">
        {m.text}
      </div>
    );
  }
  if (m.role === "staff") {
    return (
      <div className="flex gap-2">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800">
          {CENTER.directorInitials}
        </div>
        <div className="max-w-[85%]">
          <div className="mb-1 text-xs text-stone-500">
            <span className="font-medium text-stone-700">{m.staffName}</span> · Director
          </div>
          <div className="whitespace-pre-wrap rounded-2xl rounded-tl-md bg-amber-50 px-4 py-2.5 text-[15px] leading-snug text-stone-800 ring-1 ring-amber-200">
            {m.text}
          </div>
        </div>
      </div>
    );
  }
  return <AssistantMessage m={m} onAsk={onAsk} />;
}

function AssistantMessage({
  m,
  onAsk,
}: {
  m: Extract<ChatMessage, { role: "assistant" }>;
  onAsk: (q: string) => void;
}) {
  const { knowledge, giveFeedback, family } = useStore();
  const r = m.result;
  const sources = r.sources
    .map((id) => knowledge.find((k) => k.id === id))
    .filter((k): k is KnowledgeEntry => Boolean(k));
  const emergency = m.engine === "emergency";
  const handedOff = r.status !== "answered" && !emergency && m.engine !== "offline";

  return (
    <div className="max-w-[92%] space-y-2">
      <div
        className={`whitespace-pre-wrap rounded-2xl rounded-bl-md px-4 py-3 text-[15px] leading-relaxed shadow-sm ring-1 ${
          emergency ? "bg-rose-50 text-rose-950 ring-rose-200" : "bg-white text-stone-800 ring-stone-200"
        }`}
      >
        {r.answer}

        {emergency && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a href="tel:911" className="rounded-xl bg-rose-600 py-2.5 text-center font-semibold text-white">
              Call 911
            </a>
            <a
              href={`tel:${CENTER.phone.replace(/\D/g, "")}`}
              className="rounded-xl bg-white py-2.5 text-center font-semibold text-rose-700 ring-1 ring-rose-200"
            >
              Call center
            </a>
          </div>
        )}

        {sources.length > 0 && <Sources sources={sources} />}
      </div>

      {handedOff && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-snug text-amber-900 ring-1 ring-amber-200">
          <PersonIcon />
          <span>
            <strong className="font-semibold">Sent to {CENTER.director}.</strong> You&apos;ll get a reply in this chat,{" "}
            {CENTER.replyWindow}.
          </span>
        </div>
      )}

      {m.engine === "offline" && (
        <div className="text-[11px] text-stone-400">Offline demo mode: quoting the handbook directly.</div>
      )}

      {r.suggested_actions.includes("book_tour") && family.id === "prospect" && <TourPicker />}
      {r.suggested_actions.includes("call_center") && !emergency && (
        <a
          href={`tel:${CENTER.phone.replace(/\D/g, "")}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-juniper-800 ring-1 ring-juniper-200"
        >
          <PhoneIcon className="h-3.5 w-3.5" /> Call the front desk · {CENTER.phone}
        </a>
      )}

      {r.follow_ups.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {r.follow_ups.map((f) => (
            <button
              key={f}
              onClick={() => onAsk(f)}
              className="rounded-full bg-juniper-50 px-3 py-1.5 text-left text-xs text-juniper-800 ring-1 ring-juniper-100 hover:bg-juniper-100"
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {!emergency && (
        <div className="flex items-center gap-1 pl-1 text-[11px] text-stone-400">
          {m.feedback ? (
            <span>{m.feedback === "up" ? "Thanks for the feedback" : "Flagged for staff review"}</span>
          ) : (
            <>
              Helpful?
              <button
                aria-label="Helpful"
                onClick={() => giveFeedback(m.id, "up")}
                className="rounded p-1 hover:bg-stone-100 hover:text-juniper-700"
              >
                <ThumbUpIcon className="h-3.5 w-3.5" />
              </button>
              <button
                aria-label="Not helpful"
                onClick={() => giveFeedback(m.id, "down")}
                className="rounded p-1 hover:bg-stone-100 hover:text-rose-600"
              >
                <ThumbDownIcon className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PersonIcon() {
  return <AlertIcon className="mt-0.5 h-3.5 w-3.5 text-amber-600" />;
}

/** Source chips: tap to see the exact handbook text the answer came from. */
function Sources({ sources }: { sources: KnowledgeEntry[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const openEntry = sources.find((s) => s.id === open);
  return (
    <div className="mt-3 border-t border-stone-100 pt-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-juniper-700">
          <CheckIcon className="h-3.5 w-3.5" /> From the handbook
        </span>
        {sources.map((s) => (
          <button
            key={s.id}
            onClick={() => setOpen(open === s.id ? null : s.id)}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ring-1 transition ${
              open === s.id
                ? "bg-juniper-700 text-white ring-juniper-700"
                : "bg-stone-50 text-stone-600 ring-stone-200 hover:ring-juniper-300"
            }`}
          >
            <BookIcon className="h-3 w-3" />
            {s.title}
          </button>
        ))}
      </div>
      {openEntry && (
        <div className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-stone-50 p-2.5 text-xs leading-relaxed text-stone-600 ring-1 ring-stone-200">
          <div className="mb-1 text-[10px] uppercase tracking-wide text-stone-400">
            Updated {shortDate(openEntry.updatedAt)} by {openEntry.updatedBy}
          </div>
          {openEntry.content}
        </div>
      )}
    </div>
  );
}

function TourPicker() {
  const { bookTour } = useStore();
  const [slots] = useState(() => nextTourSlots(4));
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  if (done) return null;
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone-200">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-stone-700">
        <CalendarIcon className="h-4 w-4 text-juniper-600" /> Pick a tour time · 30 min with {CENTER.director}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {slots.map((s) => (
          <button
            key={s}
            onClick={() => setPicked(s)}
            className={`rounded-lg px-2 py-2 text-xs ring-1 transition ${
              picked === s
                ? "bg-juniper-700 text-white ring-juniper-700"
                : "bg-stone-50 text-stone-700 ring-stone-200 hover:ring-juniper-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <button
        disabled={!picked}
        onClick={() => {
          if (!picked) return;
          bookTour(picked);
          setDone(true);
        }}
        className="mt-2 w-full rounded-lg bg-juniper-700 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        Book this tour
      </button>
    </div>
  );
}

// Minimal typing for the Web Speech API (not in TS's DOM lib).
interface Recognition {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}
type RecognitionCtor = new () => Recognition;

function Composer({
  draft,
  setDraft,
  onSubmit,
  disabled,
}: {
  draft: string;
  setDraft: (s: string) => void;
  onSubmit: (s: string) => void;
  disabled: boolean;
}) {
  const [listening, setListening] = useState(false);
  const [speechCtor] = useState<RecognitionCtor | null>(() => {
    const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
  });
  const recRef = useRef<Recognition | null>(null);

  const toggleMic = () => {
    if (!speechCtor) return;
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new speechCtor();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setDraft(text);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(draft);
      }}
      className="border-t border-stone-200 bg-white p-3"
    >
      <div className="flex items-end gap-2 rounded-2xl bg-stone-100 p-1.5 pl-3 ring-juniper-300 focus-within:ring-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit(draft);
            }
          }}
          rows={1}
          placeholder={listening ? "Listening…" : "Ask the front desk…"}
          className="max-h-28 min-h-[36px] flex-1 resize-none bg-transparent py-2 text-[15px] text-stone-800 outline-none placeholder:text-stone-400"
        />
        {speechCtor && (
          <button
            type="button"
            onClick={toggleMic}
            aria-label={listening ? "Stop voice input" : "Speak your question"}
            className={`grid h-9 w-9 place-items-center rounded-xl transition ${
              listening ? "animate-pulse bg-rose-500 text-white" : "text-stone-500 hover:bg-stone-200"
            }`}
          >
            <MicIcon className="h-5 w-5" />
          </button>
        )}
        <button
          type="submit"
          disabled={disabled || !draft.trim()}
          aria-label="Send"
          className="grid h-9 w-9 place-items-center rounded-xl bg-juniper-700 text-white transition disabled:opacity-30"
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}

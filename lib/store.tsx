"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CENTER, FAMILIES, SEED_KNOWLEDGE, SEED_LOGS, SEED_TICKETS } from "./seed";
import { demoNow, type ClockMode } from "./time";
import type {
  ChatMessage,
  Engine,
  Family,
  FrontDeskAnswer,
  KnowledgeEntry,
  LogEntry,
  Ticket,
} from "./types";

const STORAGE_KEY = "juniper-front-desk-v1";

interface State {
  knowledge: KnowledgeEntry[];
  logs: LogEntry[];
  tickets: Ticket[];
  chats: Record<string, ChatMessage[]>;
  familyId: string;
  clock: ClockMode;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

function seedState(): State {
  return {
    knowledge: SEED_KNOWLEDGE,
    logs: SEED_LOGS.map(({ hoursAgo: h, ...l }) => ({ ...l, id: uid(), at: hoursAgo(h) })),
    tickets: SEED_TICKETS.map(({ hoursAgo: h, ...t }) => ({ ...t, id: uid(), at: hoursAgo(h) })),
    chats: {},
    familyId: FAMILIES[0].id,
    clock: "morning",
  };
}

interface Store extends State {
  family: Family;
  pending: boolean;
  setFamily: (id: string) => void;
  setClock: (mode: ClockMode) => void;
  ask: (question: string) => Promise<void>;
  giveFeedback: (messageId: string, value: "up" | "down") => void;
  bookTour: (slot: string) => void;
  resolveTicket: (ticketId: string, reply: string, taughtEntryId?: string) => void;
  dismissTicket: (ticketId: string) => void;
  saveEntry: (entry: KnowledgeEntry) => void;
  deleteEntry: (id: string) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Rendered client-only (see app/page.tsx), so localStorage is available here.
  const [state, setState] = useState<State | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { clock: "morning", ...JSON.parse(raw) } as State;
    } catch {}
    return seedState();
  });
  const [pending, setPending] = useState(false);
  const stateRef = useRef<State | null>(state);

  useEffect(() => {
    stateRef.current = state;
    if (!state) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const update = useCallback((fn: (s: State) => State) => setState((s) => (s ? fn(s) : s)), []);

  const pushMessage = (s: State, familyId: string, msg: ChatMessage): State => ({
    ...s,
    chats: { ...s.chats, [familyId]: [...(s.chats[familyId] ?? []), msg] },
  });

  const ask = useCallback(
    async (question: string) => {
      const s = stateRef.current;
      if (!s) return;
      const family = FAMILIES.find((f) => f.id === s.familyId)!;
      const now = new Date().toISOString();
      const history = (s.chats[family.id] ?? []).flatMap((m): { role: "user" | "assistant"; text: string }[] =>
        m.role === "parent"
          ? [{ role: "user" as const, text: m.text }]
          : m.role === "assistant"
            ? [{ role: "assistant" as const, text: m.result.answer }]
            : m.role === "staff"
              ? [{ role: "assistant" as const, text: `(Reply from ${m.staffName}, staff) ${m.text}` }]
              : [],
      );

      update((st) => pushMessage(st, family.id, { id: uid(), role: "parent", text: question, at: now }));
      setPending(true);

      let result: FrontDeskAnswer;
      let engine: Engine;
      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            familyContext: family.context,
            knowledge: s.knowledge,
            history,
            now: demoNow(s.clock).toISOString(),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        result = data.result;
        engine = data.engine;
      } catch {
        engine = "error";
        result = {
          answer: `I couldn't connect just now. I've sent your question to ${CENTER.director}. For anything urgent, call ${CENTER.phone}.`,
          status: "needs_staff",
          topic: "System Error",
          sensitivity: "none",
          sources: [],
          handoff_reason: "Network error reaching the AI front desk.",
          suggested_actions: ["call_center"],
          follow_ups: [],
        };
      }
      setPending(false);

      const logId = uid();
      const at = new Date().toISOString();
      // Offline mode labels everything "partial" because it only quotes; don't flood the inbox with those.
      const escalate = result.status === "needs_staff" || (result.status === "partial" && engine === "claude");

      update((st) => {
        let next = pushMessage(st, family.id, { id: uid(), role: "assistant", at, result, engine, logId });
        const log: LogEntry = {
          id: logId,
          at,
          familyId: family.id,
          parentName: family.parentName,
          childName: family.childName,
          question,
          answer: result.answer,
          status: result.status,
          topic: result.topic,
          sensitivity: result.sensitivity,
          sources: result.sources,
          engine,
        };
        next = { ...next, logs: [log, ...next.logs] };
        if (escalate) {
          const ticket: Ticket = {
            id: uid(),
            kind: engine === "emergency" ? "urgent" : "question",
            at,
            familyId: family.id,
            parentName: family.parentName,
            childName: family.childName,
            question,
            reason: result.handoff_reason || "Front desk handed this off.",
            aiAnswer: result.answer,
            topic: result.topic,
            logId,
            status: "open",
          };
          next = { ...next, tickets: [ticket, ...next.tickets] };
        }
        return next;
      });
    },
    [update],
  );

  const giveFeedback = useCallback(
    (messageId: string, value: "up" | "down") =>
      update((st) => {
        const msgs = st.chats[st.familyId] ?? [];
        const msg = msgs.find((m) => m.id === messageId);
        if (!msg || msg.role !== "assistant" || msg.feedback) return st;
        const family = FAMILIES.find((f) => f.id === st.familyId)!;
        let next: State = {
          ...st,
          chats: {
            ...st.chats,
            [st.familyId]: msgs.map((m) => (m.id === messageId ? { ...m, feedback: value } : m)),
          },
          logs: st.logs.map((l) => (l.id === msg.logId ? { ...l, feedback: value } : l)),
        };
        if (value === "down") {
          const question = st.logs.find((l) => l.id === msg.logId)?.question ?? "";
          const alreadyOpen = st.tickets.some((t) => t.logId === msg.logId && t.status === "open");
          if (!alreadyOpen) {
            next = {
              ...next,
              tickets: [
                {
                  id: uid(),
                  kind: "question",
                  at: new Date().toISOString(),
                  familyId: family.id,
                  parentName: family.parentName,
                  childName: family.childName,
                  question,
                  reason: "Parent marked the AI answer as not helpful.",
                  aiAnswer: msg.result.answer,
                  topic: msg.result.topic,
                  logId: msg.logId,
                  status: "open",
                },
                ...next.tickets,
              ],
            };
            next = pushMessage(next, family.id, {
              id: uid(),
              role: "system",
              at: new Date().toISOString(),
              text: `Thanks for telling us. ${CENTER.director} will follow up here.`,
            });
          }
        }
        return next;
      }),
    [update],
  );

  const bookTour = useCallback(
    (slot: string) =>
      update((st) => {
        const family = FAMILIES.find((f) => f.id === st.familyId)!;
        const at = new Date().toISOString();
        const next = pushMessage(st, family.id, {
          id: uid(),
          role: "system",
          at,
          text: `Tour booked: ${slot} with ${CENTER.director}. You'll get a reminder the day before. Children are welcome!`,
        });
        return {
          ...next,
          tickets: [
            {
              id: uid(),
              kind: "tour",
              at,
              familyId: family.id,
              parentName: family.parentName,
              childName: family.childName,
              question: `Tour booked for ${slot}`,
              reason: family.context,
              topic: "Tour Booking",
              status: "open",
            },
            ...next.tickets,
          ],
        };
      }),
    [update],
  );

  const resolveTicket = useCallback(
    (ticketId: string, reply: string, taughtEntryId?: string) =>
      update((st) => {
        const t = st.tickets.find((x) => x.id === ticketId);
        if (!t) return st;
        let next: State = {
          ...st,
          tickets: st.tickets.map((x) =>
            x.id === ticketId ? { ...x, status: "resolved", reply, taughtEntryId } : x,
          ),
        };
        if (reply.trim()) {
          next = pushMessage(next, t.familyId, {
            id: uid(),
            role: "staff",
            at: new Date().toISOString(),
            text: reply,
            staffName: CENTER.director,
          });
        }
        return next;
      }),
    [update],
  );

  const dismissTicket = useCallback(
    (ticketId: string) =>
      update((st) => ({
        ...st,
        tickets: st.tickets.map((x) => (x.id === ticketId ? { ...x, status: "resolved" } : x)),
      })),
    [update],
  );

  const saveEntry = useCallback(
    (entry: KnowledgeEntry) =>
      update((st) => {
        const exists = st.knowledge.some((k) => k.id === entry.id);
        return {
          ...st,
          knowledge: exists
            ? st.knowledge.map((k) => (k.id === entry.id ? entry : k))
            : [...st.knowledge, entry],
        };
      }),
    [update],
  );

  const deleteEntry = useCallback(
    (id: string) => update((st) => ({ ...st, knowledge: st.knowledge.filter((k) => k.id !== id) })),
    [update],
  );

  const setFamily = useCallback((id: string) => update((st) => ({ ...st, familyId: id })), [update]);

  const setClock = useCallback((clock: ClockMode) => update((st) => ({ ...st, clock })), [update]);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setState(seedState());
  }, []);

  if (!state) {
    return <div className="flex flex-1 items-center justify-center text-stone-400">Loading…</div>;
  }

  const family = FAMILIES.find((f) => f.id === state.familyId) ?? FAMILIES[0];

  return (
    <Ctx.Provider
      value={{
        ...state,
        family,
        pending,
        setFamily,
        setClock,
        ask,
        giveFeedback,
        bookTour,
        resolveTicket,
        dismissTicket,
        saveEntry,
        deleteEntry,
        reset,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export { uid };

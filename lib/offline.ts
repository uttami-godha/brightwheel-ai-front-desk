import { CENTER } from "./seed";
import type { FrontDeskAnswer, KnowledgeEntry } from "./types";

/**
 * Keyword fallback used only when no ANTHROPIC_API_KEY is configured, so the
 * hosted demo still behaves sensibly. It never paraphrases: it quotes the most
 * relevant handbook lines and labels the answer "partial", so it can't state
 * anything the handbook doesn't.
 */
const STOP = new Set(
  "a an the is are am be do does did can could would should will i my me we you your our to of for on in at it its this that and or what when how much many any there today have has with from about".split(
    " ",
  ),
);

const SYNONYMS: Record<string, string[]> = {
  fever: ["fever", "temperature", "sick", "ill", "illness"],
  sick: ["sick", "ill", "illness", "fever", "vomit", "diarrhea"],
  lunch: ["lunch", "meal", "menu", "food", "forgot"],
  cost: ["tuition", "cost", "price", "rate", "monthly"],
  tuition: ["tuition", "cost", "price", "rate"],
  open: ["open", "closed", "closure", "holiday", "calendar"],
  closed: ["open", "closed", "closure", "holiday", "calendar"],
  holiday: ["closed", "closure", "holiday", "calendar"],
  tour: ["tour", "visit", "enroll", "waitlist"],
  pickup: ["pickup", "pick", "authorized", "grandma", "grandparent"],
  medicine: ["medication", "medicine", "tylenol", "motrin"],
};

function terms(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
  return [...new Set(words.flatMap((w) => SYNONYMS[w] ?? [w]))];
}

export function offlineAnswer(question: string, entries: KnowledgeEntry[]): FrontDeskAnswer {
  const qTerms = terms(question);
  const scored = entries
    .map((e) => {
      const hay = `${e.title} ${e.content}`.toLowerCase();
      const score = qTerms.reduce((s, t) => s + (hay.includes(t) ? (e.title.toLowerCase().includes(t) ? 3 : 1) : 0), 0);
      return { e, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < 2) {
    return {
      answer: `I don't want to guess about that, so I've sent your question to ${CENTER.director}. You'll get a reply right here ${CENTER.replyWindow}.`,
      status: "needs_staff",
      topic: "Unmatched Question",
      sensitivity: "none",
      sources: [],
      handoff_reason: "Offline mode: no handbook entry matched.",
      suggested_actions: [],
      follow_ups: [],
    };
  }

  const lines = best.e.content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => ({ l, s: qTerms.filter((t) => l.toLowerCase().includes(t)).length }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((x) => `• ${x.l.replace(/^[-•]\s*/, "")}`);

  return {
    answer: `Here's what our handbook says (${best.e.title}):\n${lines.join("\n") || best.e.content.slice(0, 280)}`,
    status: "partial",
    topic: best.e.title.split(/[,&(]/)[0].trim(),
    sensitivity: "none",
    sources: [best.e.id],
    handoff_reason: "Offline mode: quoted the closest handbook entry without interpretation.",
    suggested_actions: best.e.id === "tours" ? ["book_tour"] : [],
    follow_ups: [],
  };
}

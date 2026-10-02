import Anthropic from "@anthropic-ai/sdk";
import { crossCheckAllergies, MEAL_NAMES } from "@/lib/allergy";
import {
  emergencyAnswer,
  isInstantEmergency,
  TRIAGE_INSTRUCTIONS,
  TRIAGE_SCHEMA,
  type Triage,
} from "@/lib/emergency";
import { offlineAnswer } from "@/lib/offline";
import { ANSWER_SCHEMA, buildContextBlock, buildInstructions, buildKnowledgeBlock } from "@/lib/prompt";
import { CENTER } from "@/lib/seed";
import type { Engine, FrontDeskAnswer, KnowledgeEntry } from "@/lib/types";

export const maxDuration = 60;

const MODEL = "claude-opus-5-5";

interface AskBody {
  question: string;
  familyContext: string;
  childName?: string;
  allergies?: string[];
  knowledge: KnowledgeEntry[];
  history: { role: "user" | "assistant"; text: string }[];
  now?: string;
}

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

function reply(result: FrontDeskAnswer, engine: Engine) {
  return Response.json({ result, engine });
}

/** Reads the message only for "is a child in danger right now?", separately from answering it. */
async function triage(question: string): Promise<Triage> {
  const response = await client!.beta.messages.create({
    model: MODEL,
    max_tokens: 2000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: { type: "json_schema", schema: TRIAGE_SCHEMA } },
    system: TRIAGE_INSTRUCTIONS,
    messages: [{ role: "user", content: `Parent's message:\n"""${question}"""` }],
  });
  const text = response.content.find((b) => b.type === "text");
  if (response.stop_reason === "refusal" || !text || text.type !== "text") throw new Error("triage failed");
  return JSON.parse(text.text) as Triage;
}

async function answer(body: AskBody, question: string, knowledge: KnowledgeEntry[], now: Date) {
  // Keep the last few turns so follow-ups ("what about Friday?") resolve,
  // merged so roles strictly alternate and the list starts with the parent.
  const messages: Anthropic.Beta.BetaMessageParam[] = [];
  for (const turn of (body.history ?? []).slice(-8)) {
    const last = messages[messages.length - 1];
    if (!last && turn.role === "assistant") continue;
    if (last && last.role === turn.role) last.content += `\n\n${turn.text}`;
    else messages.push({ role: turn.role, content: turn.text });
  }
  if (messages.at(-1)?.role === "user") messages.pop();
  messages.push({ role: "user", content: question });

  const response = await client!.beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: { type: "json_schema", schema: ANSWER_SCHEMA } },
    system: [
      // Stable prefix (instructions + handbook) is cached; it only changes when staff edit knowledge.
      {
        type: "text",
        text: `${buildInstructions()}\n\n${buildKnowledgeBlock(knowledge)}`,
        cache_control: { type: "ephemeral" },
      },
      { type: "text", text: buildContextBlock(body.familyContext, now) },
    ],
    messages,
  });
  if (response.stop_reason === "refusal") throw new Error("Model declined to answer");
  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("No text in response");
  return JSON.parse(text.text) as FrontDeskAnswer;
}

export async function POST(req: Request) {
  const body = (await req.json()) as AskBody;
  const question = String(body.question ?? "").slice(0, 1200).trim();
  // The demo sends the operator-edited handbook from the browser; cap it so a
  // public endpoint can't be used to push arbitrarily large prompts.
  let budget = 60_000;
  const knowledge = (body.knowledge ?? []).slice(0, 60).filter((k) => (budget -= k.content.length) >= 0);
  if (!question) return Response.json({ error: "Empty question" }, { status: 400 });
  // The client may pin a demo clock (see lib/time.ts demoNow).
  const now = body.now && !Number.isNaN(Date.parse(body.now)) ? new Date(body.now) : new Date();

  // Unmistakable emergencies never wait on a model call.
  if (isInstantEmergency(question)) {
    return reply(emergencyAnswer("medical", "Message described an emergency in plain terms."), "emergency");
  }
  if (!client) return reply(offlineAnswer(question, knowledge), "offline");

  // Triage and answer run in parallel, so emergency screening adds no wait.
  const [triaged, answered] = await Promise.allSettled([
    triage(question),
    answer(body, question, knowledge, now),
  ]);

  const t = triaged.status === "fulfilled" ? triaged.value : null;
  const a = answered.status === "fulfilled" ? answered.value : null;
  if (!t) console.error("triage failed", triaged.status === "rejected" ? triaged.reason : "");
  if (t?.emergency || a?.sensitivity === "emergency") {
    const kind = t && t.kind !== "none" ? t.kind : "medical";
    return reply(emergencyAnswer(kind, t?.reason || "Answer model flagged an emergency."), "emergency");
  }

  if (!a) {
    console.error("ask failed", answered.status === "rejected" ? answered.reason : "");
    // Fail toward a human, never toward a guess.
    return reply(
      {
        answer: `Sorry, I'm having trouble answering right now. I've sent your question to ${CENTER.director} so a person can reply here ${CENTER.replyWindow}. For anything urgent, call ${CENTER.phone}.`,
        status: "needs_staff",
        topic: "System Error",
        sensitivity: "none",
        sources: [],
        handoff_reason: "The AI front desk hit an error; the question was routed to staff.",
        suggested_actions: ["call_center"],
        follow_ups: [],
      },
      "error",
    );
  }

  const known = new Set(knowledge.map((k) => k.id));
  a.sources = a.sources.filter((s) => known.has(s));
  a.follow_ups = a.follow_ups.slice(0, 2);

  // Allergy cross-check: code, not the model, decides whether the menu items
  // this answer is about conflict with the child's allergies on file.
  const check = crossCheckAllergies({
    childName: body.childName ?? "your child",
    allergies: body.allergies ?? [],
    menuRefs: a.menu_refs ?? [],
    knowledge,
    answer: a.answer,
  });
  if (check) {
    a.allergy_check = check;
    const unverified = check.checked.filter((c) => c.contains === null);
    const problems = [
      check.answerMissedConflict &&
        `answer did not mention a conflict (${check.checked
          .filter((c) => c.conflicts.length)
          .map((c) => `${c.conflicts.join(", ")} in ${c.day} ${MEAL_NAMES[c.meal].toLowerCase()}`)
          .join("; ")})`,
      unverified.length &&
        `no allergen info for ${unverified.map((c) => `${c.day} ${MEAL_NAMES[c.meal].toLowerCase()}`).join(", ")}`,
    ].filter(Boolean);
    if (problems.length) {
      if (a.status === "answered") a.status = "partial";
      a.handoff_reason = `Allergy cross-check for ${check.childName}: ${problems.join("; ")}. ${a.handoff_reason}`.trim();
    }
  }
  return reply(a, "claude");
}

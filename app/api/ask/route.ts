import Anthropic from "@anthropic-ai/sdk";
import { detectEmergency, EMERGENCY_ANSWER } from "@/lib/emergency";
import { offlineAnswer } from "@/lib/offline";
import { ANSWER_SCHEMA, buildContextBlock, buildInstructions, buildKnowledgeBlock } from "@/lib/prompt";
import { CENTER } from "@/lib/seed";
import type { Engine, FrontDeskAnswer, KnowledgeEntry } from "@/lib/types";

export const maxDuration = 60;

const MODEL = "claude-opus-5-5";

interface AskBody {
  question: string;
  familyContext: string;
  knowledge: KnowledgeEntry[];
  history: { role: "user" | "assistant"; text: string }[];
  now?: string;
}

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

function reply(result: FrontDeskAnswer, engine: Engine) {
  return Response.json({ result, engine });
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

  if (detectEmergency(question)) return reply(EMERGENCY_ANSWER, "emergency");
  if (!client) return reply(offlineAnswer(question, knowledge), "offline");

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

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: ANSWER_SCHEMA },
      },
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

    const result = JSON.parse(text.text) as FrontDeskAnswer;
    const known = new Set(knowledge.map((k) => k.id));
    result.sources = result.sources.filter((s) => known.has(s));
    result.follow_ups = result.follow_ups.slice(0, 2);
    return reply(result, "claude");
  } catch (err) {
    console.error("ask failed", err);
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
}

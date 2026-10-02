import Anthropic from "@anthropic-ai/sdk";
import { CATEGORIES, type Category } from "@/lib/types";

export const maxDuration = 60;

interface DraftBody {
  question: string;
  reply: string;
  topic: string;
  existingTitles: string[];
}

interface Draft {
  title: string;
  category: Category;
  content: string;
}

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

/**
 * Turns one staff reply to one parent into a reusable handbook entry, so the
 * next parent who asks gets an instant answer. The staff member still reviews
 * and edits the draft before it's saved.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as DraftBody;
  const fallback: Draft = {
    title: body.topic || body.question.slice(0, 60),
    category: "Policies",
    content: body.reply,
  };
  if (!client) return Response.json({ draft: fallback, engine: "offline" });

  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 3000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "low",
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["title", "category", "content"],
            properties: {
              title: { type: "string" },
              category: { type: "string", enum: CATEGORIES },
              content: { type: "string" },
            },
          },
        },
      },
      system: `You help a child care center director maintain the center's handbook, which an AI front desk uses to answer parents.
Turn the director's reply to one parent into a general, reusable handbook entry that would answer the same question for any family.
- Keep every fact the director stated; add nothing they didn't say. If the reply only says that something will be decided later, write exactly that.
- Remove anything specific to this one family or child (names, "I'll check with...", greetings).
- Write in the center's voice ("We..."), plain and concise, 1–6 short lines.
- Title: short and scannable, like the existing titles.`,
      messages: [
        {
          role: "user",
          content: `Existing handbook titles: ${body.existingTitles.join("; ")}\n\nParent asked: ${body.question}\n\nDirector replied: ${body.reply}`,
        },
      ],
    });
    if (response.stop_reason === "refusal") throw new Error("refused");
    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") throw new Error("no text");
    return Response.json({ draft: JSON.parse(text.text) as Draft, engine: "claude" });
  } catch (err) {
    console.error("draft failed", err);
    return Response.json({ draft: fallback, engine: "error" });
  }
}

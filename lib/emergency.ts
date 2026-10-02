import { CENTER } from "./seed";
import type { FrontDeskAnswer } from "./types";

/**
 * Deterministic pre-check that runs before any model call. A parent typing
 * "she's not breathing" should never wait on an LLM round-trip, and should never
 * get a policy answer instead of "call 911".
 */
const EMERGENCY_PATTERNS = [
  /\b(not|isn'?t|stopped|can'?t|cannot|trouble|hard (time )?)\s*breath/i,
  /\bchok(ing|ed|es)\b/i,
  /\b(unconscious|unresponsive|passed out|won'?t wake)\b/i,
  /\bseizure|convuls/i,
  /\banaphyla/i,
  /\b(allergic reaction|throat (is )?(closing|swelling)|lips? (are |is )?swelling)\b/i,
  /\bturning blue|lips? (are |is )?blue\b/i,
  /\b(bleeding (a lot|badly|heavily)|won'?t stop bleeding)\b/i,
  /\b(swallowed|ate|drank)\b.*\b(battery|batteries|magnet|poison|bleach|pills?|medicine|detergent|pod)\b/i,
  /\bpoison(ed|ing)?\b/i,
  /\b911\b/,
  /\b(can'?t find|missing|lost)\b.*\b(child|son|daughter|kid|baby)\b/i,
];

export function detectEmergency(text: string): boolean {
  return EMERGENCY_PATTERNS.some((re) => re.test(text));
}

export const EMERGENCY_ANSWER: FrontDeskAnswer = {
  answer: `If your child is in danger or having trouble breathing, call 911 now.\n\nThen call the center directly at ${CENTER.phone}. I've also alerted ${CENTER.director} and the front desk as urgent.`,
  status: "needs_staff",
  topic: "Emergency",
  sensitivity: "emergency",
  sources: [],
  handoff_reason: "Possible emergency detected. Parent was told to call 911 and the center.",
  suggested_actions: ["call_center"],
  follow_ups: [],
};

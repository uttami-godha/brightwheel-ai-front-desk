import { CENTER } from "./seed";
import type { FrontDeskAnswer } from "./types";

/**
 * Emergency detection runs in two layers:
 *
 * 1. Instant path (here): a short list of unmistakable phrases ("not breathing",
 *    "choking") shows the 911 card with no model call at all. It is skipped for
 *    messages that read as questions about policy ("what's your choking policy?").
 * 2. Model triage (TRIAGE_* below, run in app/api/ask/route.ts in parallel with
 *    the answer): reads the message the way a person would, so "her lips are
 *    puffy and she's wheezing after a cookie" is caught without any keyword, and
 *    "what do you do if a child chokes?" is not a false alarm.
 *
 * If triage fails, the route falls back to the answer model's own sensitivity tag.
 */
const INSTANT_PATTERNS = [
  /\b(not|isn'?t|stopped|can'?t|cannot)\s+breath/i,
  /\bchoking\b/i,
  /\b(unconscious|unresponsive|won'?t wake up)\b/i,
  /\b(having a seizure|seizing)\b/i,
  /\banaphyla/i,
  /\b(turning blue|lips are blue)\b/i,
  /\bcall(ed|ing)? 911\b/i,
];

const POLICY_QUESTION =
  /\b(policy|policies|procedure|protocol|training|trained|certified|hazard|what (do|would|happens)|how do you (handle|respond)|in case of|if a child|if my child (ever|were))\b/i;

export function isInstantEmergency(text: string): boolean {
  return INSTANT_PATTERNS.some((re) => re.test(text)) && !POLICY_QUESTION.test(text);
}

export type EmergencyKind = "medical" | "missing_child" | "safety_threat";

export function emergencyAnswer(kind: EmergencyKind, reason: string): FrontDeskAnswer {
  const lead =
    kind === "missing_child"
      ? "If you can't find your child, call 911 now."
      : kind === "safety_threat"
        ? "If your child or anyone is in danger, call 911 now."
        : "If your child is in danger or needs urgent medical help, call 911 now.";
  return {
    answer: `${lead}\n\nThen call the center directly at ${CENTER.phone}. I've also alerted ${CENTER.director} and the front desk as urgent.`,
    status: "needs_staff",
    topic: "Emergency",
    sensitivity: "emergency",
    sources: [],
    handoff_reason: `Possible emergency (${kind.replace("_", " ")}): ${reason} Parent was told to call 911 and the center.`,
    suggested_actions: ["call_center"],
    follow_ups: [],
  };
}

export const TRIAGE_INSTRUCTIONS = `You triage messages a parent sends to their child care center's front desk. Decide whether the message describes an emergency happening now or just happened: a situation where a child (or anyone) may be in danger and needs help in the next few minutes.

Emergencies include: trouble breathing, choking, signs of a severe allergic reaction (swelling of lips/face/throat, wheezing, hives spreading after eating), unresponsiveness, seizures, serious injury or heavy bleeding, possible poisoning or swallowing a battery/magnet/medicine, a missing child, or a threat to safety (someone dangerous at pickup, a child taken by an unauthorized person).

Not emergencies: questions about policies or what the center would do hypothetically; a parent asking what to do, how to set something up, or what the rules are, even about a serious topic (e.g. "My ex isn't allowed to pick up my child, what do I do?" is a custody question, not an emergency); ordinary illness (fever, vomiting, rash) without danger signs; minor bumps; anything about scheduling, billing, meals, or pickup logistics.

Watch for medical red flags described in plain words, without alarming terms. Flag only what the message says is happening now or just happened. If it does describe danger happening now but the details are unclear, choose emergency.`;

export const TRIAGE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["emergency", "kind", "reason"],
  properties: {
    emergency: { type: "boolean" },
    kind: { type: "string", enum: ["none", "medical", "missing_child", "safety_threat"] },
    reason: { type: "string" },
  },
} as const;

export interface Triage {
  emergency: boolean;
  kind: "none" | EmergencyKind;
  reason: string;
}

export type Category =
  | "Hours & Calendar"
  | "Tuition & Billing"
  | "Health & Illness"
  | "Meals"
  | "Enrollment & Tours"
  | "Pickup & Safety"
  | "Daily Life"
  | "Policies";

export const CATEGORIES: Category[] = [
  "Hours & Calendar",
  "Tuition & Billing",
  "Health & Illness",
  "Meals",
  "Enrollment & Tours",
  "Pickup & Safety",
  "Daily Life",
  "Policies",
];

export interface KnowledgeEntry {
  id: string;
  title: string;
  category: Category;
  content: string;
  updatedAt: string; // ISO
  updatedBy: string;
  /** Set when an entry was created from an answered parent question. */
  learnedFrom?: string;
}

export type AnswerStatus = "answered" | "partial" | "needs_staff";

export type Sensitivity =
  | "none"
  | "medical"
  | "custody_legal"
  | "safety_concern"
  | "complaint"
  | "billing_dispute"
  | "emergency";

export type Engine = "claude" | "offline" | "emergency" | "error";

export type SuggestedAction = "book_tour" | "call_center" | "message_staff";

export type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
export type MealKey = "breakfast" | "backup_lunch" | "snack";

export interface MenuRef {
  day: Weekday;
  meal: MealKey;
}

/** Deterministic allergen check of the menu items an answer refers to (lib/allergy.ts). */
export interface AllergyCheck {
  childName: string;
  allergies: string[];
  checked: { day: Weekday; meal: MealKey; item: string; contains: string[] | null; conflicts: string[] }[];
  /** True when the model's answer text failed to mention a conflicting allergen. */
  answerMissedConflict: boolean;
}

/** Shape the model is constrained to return (see app/api/ask/route.ts). */
export interface FrontDeskAnswer {
  answer: string;
  status: AnswerStatus;
  topic: string;
  sensitivity: Sensitivity;
  sources: string[];
  handoff_reason: string;
  suggested_actions: SuggestedAction[];
  follow_ups: string[];
  menu_refs?: MenuRef[];
  /** Added server-side after the model answers; never produced by the model. */
  allergy_check?: AllergyCheck;
}

export interface Family {
  id: string;
  parentName: string;
  label: string;
  /** Plain-language context handed to the model. Empty for prospective families. */
  context: string;
  childName?: string;
  room?: string;
  /** Structured allergies on file (normalized names, e.g. "milk", "peanut"). */
  allergies: string[];
}

export type ChatMessage =
  | { id: string; role: "parent"; text: string; at: string }
  | {
      id: string;
      role: "assistant";
      at: string;
      result: FrontDeskAnswer;
      engine: Engine;
      logId: string;
      feedback?: "up" | "down";
    }
  | { id: string; role: "staff"; text: string; at: string; staffName: string }
  | { id: string; role: "system"; text: string; at: string };

export interface LogEntry {
  id: string;
  at: string;
  familyId: string;
  parentName: string;
  childName?: string;
  question: string;
  answer: string;
  status: AnswerStatus;
  topic: string;
  sensitivity: Sensitivity;
  sources: string[];
  engine: Engine;
  feedback?: "up" | "down";
}

export type TicketKind = "question" | "tour" | "urgent";

export interface Ticket {
  id: string;
  kind: TicketKind;
  at: string;
  familyId: string;
  parentName: string;
  childName?: string;
  question: string;
  reason: string;
  aiAnswer?: string;
  topic: string;
  logId?: string;
  status: "open" | "resolved";
  reply?: string;
  taughtEntryId?: string;
}

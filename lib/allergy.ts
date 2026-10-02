import type { AllergyCheck, KnowledgeEntry, MealKey, MenuRef, Weekday } from "./types";

/**
 * Deterministic allergy cross-check. The model decides which menu items its
 * answer is about (menu_refs); this code, not the model, decides whether those
 * items conflict with the child's allergies on file. If the answer text misses
 * a conflict, the route downgrades the answer and alerts staff.
 */

const SYNONYMS: Record<string, string> = {
  dairy: "milk",
  cheese: "milk",
  lactose: "milk",
  "cow's milk": "milk",
  eggs: "egg",
  peanuts: "peanut",
  "tree nuts": "tree nut",
  nuts: "tree nut",
  gluten: "wheat",
  sesame: "sesame",
  soy: "soy",
  shellfish: "shellfish",
  fish: "fish",
};

/** Words that count as the answer "mentioning" an allergen. */
const MENTIONS: Record<string, string[]> = {
  milk: ["milk", "dairy", "cheese", "lactose"],
  egg: ["egg"],
  wheat: ["wheat", "gluten"],
  peanut: ["peanut"],
  "tree nut": ["nut"],
  sesame: ["sesame"],
  soy: ["soy"],
  fish: ["fish"],
  shellfish: ["shellfish"],
};

export function normalizeAllergen(a: string): string {
  const k = a.trim().toLowerCase();
  return SYNONYMS[k] ?? k;
}

const DAYS: Weekday[] = ["monday", "tuesday", "wednesday", "thursday", "friday"];

const MEAL_LABELS: Record<string, MealKey> = {
  breakfast: "breakfast",
  "backup lunch": "backup_lunch",
  lunch: "backup_lunch",
  snack: "snack",
};

export interface MenuItem {
  item: string;
  /** null when the item has no "(contains: ...)" tag, so it can't be verified. */
  contains: string[] | null;
}

/** Parses the menu entry's "DAY / - Meal: item (contains: a, b)" format. */
export function parseMenu(content: string): Map<string, MenuItem> {
  const items = new Map<string, MenuItem>();
  let day: Weekday | null = null;
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    const header = line.toLowerCase().replace(/[^a-z]/g, "");
    if (DAYS.includes(header as Weekday)) {
      day = header as Weekday;
      continue;
    }
    const m = line.match(/^[-•]\s*([^:]+):\s*(.+)$/);
    if (!day || !m) continue;
    const meal = MEAL_LABELS[m[1].trim().toLowerCase()];
    if (!meal) continue;
    const tag = m[2].match(/\(contains:\s*([^)]*)\)\s*$/i);
    const item = m[2].replace(/\(contains:[^)]*\)\s*$/i, "").trim();
    const contains = tag
      ? tag[1]
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s && s.toLowerCase() !== "none")
          .map(normalizeAllergen)
      : null;
    items.set(`${day}:${meal}`, { item, contains });
  }
  return items;
}

export function crossCheckAllergies(params: {
  childName: string;
  allergies: string[];
  menuRefs: MenuRef[];
  knowledge: KnowledgeEntry[];
  answer: string;
}): AllergyCheck | undefined {
  const allergies = params.allergies.map(normalizeAllergen);
  if (!allergies.length || !params.menuRefs.length) return undefined;
  const menu = params.knowledge.find((k) => k.id === "menu");
  const parsed = menu ? parseMenu(menu.content) : new Map<string, MenuItem>();

  const seen = new Set<string>();
  const checked: AllergyCheck["checked"] = [];
  for (const ref of params.menuRefs) {
    const key = `${ref.day}:${ref.meal}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const found = parsed.get(key);
    const contains = found?.contains ?? null;
    checked.push({
      day: ref.day,
      meal: ref.meal,
      item: found?.item ?? "Item not found on the menu",
      contains,
      conflicts: contains ? allergies.filter((a) => contains.includes(a)) : [],
    });
  }

  const text = params.answer.toLowerCase();
  const conflicting = [...new Set(checked.flatMap((c) => c.conflicts))];
  const answerMissedConflict = conflicting.some(
    (a) => !(MENTIONS[a] ?? [a]).some((word) => text.includes(word)),
  );

  return { childName: params.childName, allergies, checked, answerMissedConflict };
}

export const MEAL_NAMES: Record<MealKey, string> = {
  breakfast: "Breakfast",
  backup_lunch: "Backup lunch",
  snack: "Snack",
};

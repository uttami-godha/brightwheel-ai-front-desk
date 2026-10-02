import type { Family, KnowledgeEntry, LogEntry, Ticket } from "./types";

export const CENTER = {
  name: "Juniper Hill Early Learning",
  short: "Juniper Hill",
  city: "Washington, DC",
  timezone: "America/New_York",
  timezoneLabel: "Eastern Time",
  phone: "(202) 555-0142",
  director: "Uttami Godha",
  directorFirst: "Uttami",
  directorInitials: "UG",
  directorTitle: "Director",
  replyWindow: "within 2 hours during school hours",
};

const by = "Uttami Godha";

/**
 * The center's source of truth. Deliberately plain prose: an operator should be
 * able to edit any of this without learning a schema. A few common topics
 * (summer camp, potty training) are intentionally missing so the "gaps" loop
 * has something real to show.
 */
export const SEED_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: "center-basics",
    title: "Center basics & contacts",
    category: "Policies",
    updatedAt: "2026-08-12T15:00:00Z",
    updatedBy: by,
    content: `Juniper Hill Early Learning, 4200 Juniper Lane NW, Washington, DC 20011 (Petworth). Licensed by the DC Office of the State Superintendent of Education (OSSE) for 84 children, ages 6 weeks to 5 years.
Front desk phone: (202) 555-0142 (answered 7:00 AM–6:00 PM on school days). Parents can also message staff any time in the app.
Director: Uttami Godha. Assistant Director: Luis Mendez. Nurse consultant visits monthly.
Staff-to-child ratios: Infants 1:4, Toddlers 1:5, Twos 1:6, Preschool 1:8, Pre-K 1:10 (all better than state minimums).`,
  },
  {
    id: "hours",
    title: "Hours, drop-off & late pickup",
    category: "Hours & Calendar",
    updatedAt: "2026-08-12T15:00:00Z",
    updatedBy: by,
    content: `We are open Monday–Friday, 7:00 AM to 6:00 PM.
Please arrive by 9:30 AM so your child can join the morning core program. If you will arrive after 9:30 (appointments, etc.), message your teacher in the app so we can save lunch and plan ratios.
Late pickup: the center closes at 6:00 PM. A late fee of $1 per minute per child is charged starting at 6:01 PM and is billed to your account. Staff cannot waive late fees; please call the front desk if you are running late so your child is not worried.
Early-close days (see calendar) close at 3:00 PM and the same late fee applies after 3:00 PM.`,
  },
  {
    id: "calendar",
    title: "2026–27 calendar & closures",
    category: "Hours & Calendar",
    updatedAt: "2026-08-20T15:00:00Z",
    updatedBy: by,
    content: `CLOSED (no care, tuition is not prorated):
- Fri Oct 9, 2026 – Staff professional development day
- Thu Nov 26 & Fri Nov 27, 2026 – Thanksgiving
- Thu Dec 24, 2026 through Fri Jan 1, 2027 – Winter break (reopen Mon Jan 4)
- Mon Jan 18, 2027 – Martin Luther King Jr. Day
- Mon Feb 15, 2027 – Presidents' Day
- Fri Mar 26, 2027 – Staff professional development day
- Fri Apr 16, 2027 – DC Emancipation Day
- Mon May 31, 2027 – Memorial Day
- Fri Jun 18, 2027 – Juneteenth (observed)
- Mon Jul 5, 2027 – Independence Day (observed)

EARLY CLOSE at 3:00 PM: Wed Nov 25, 2026 and Wed Dec 23, 2026.

OPEN regular hours on: Indigenous Peoples' Day (Mon Oct 12, 2026), Veterans Day (Wed Nov 11, 2026), and spring break week for DC Public Schools (Mar 22–26, 2027, except the Mar 26 PD day).
On Veterans Day (Nov 11), DC Public Schools (DCPS) are closed; enrolled families may book a school-age sibling (ages 5–8) for a drop-in day at $65, space limited, book with the front desk by Nov 4.`,
  },
  {
    id: "weather",
    title: "Snow days & emergency closures",
    category: "Hours & Calendar",
    updatedAt: "2026-08-12T15:00:00Z",
    updatedBy: by,
    content: `We do NOT automatically follow DC Public Schools (DCPS) or federal government (OPM) snow closures. If we must close or delay for weather, we send an app announcement and text by 6:00 AM. A 2-hour delayed opening means we open at 9:00 AM.
If there is no announcement by 6:00 AM, we are open normal hours.`,
  },
  {
    id: "tuition",
    title: "Tuition rates 2026–27",
    category: "Tuition & Billing",
    updatedAt: "2026-07-01T15:00:00Z",
    updatedBy: by,
    content: `Monthly tuition (full-time = 5 days; part-time = 3 days Mon/Wed/Fri):
- Infants (6 weeks–12 months), Caterpillars room: $2,450 full-time / $1,690 part-time
- Toddlers (12–24 months), Bumblebees room: $2,250 full-time / $1,550 part-time
- Twos (2–3 years), Ladybugs room: $2,050 full-time / $1,410 part-time
- Preschool (3–4 years), Dragonflies room: $1,850 full-time / $1,280 part-time
- Pre-K (4–5 years), Owls room: $1,750 full-time. We are a DC Pre-K Enhancement and Expansion Program (PKEEP) partner: for eligible DC-resident 3- and 4-year-olds, the 6.5-hour school day (8:30 AM–3:00 PM, DCPS calendar) is tuition-free, and before/after care is $420/month.
Two-day schedules are not offered.
One-time registration fee: $150. Annual supply fee: $200, billed each August.
Sibling discount: 10% off the older child's tuition.
Tuition includes breakfast and afternoon snack. Diapers and wipes are not included; families supply them.`,
  },
  {
    id: "billing",
    title: "Billing, payments & subsidies",
    category: "Tuition & Billing",
    updatedAt: "2026-07-01T15:00:00Z",
    updatedBy: by,
    content: `Tuition is billed monthly on the 1st through the app and is due by the 5th. Autopay (bank or card) is available in the app's Billing tab. A $35 late fee applies after the 5th.
We accept DC Child Care Subsidy Program vouchers (through OSSE) and DC PKEEP pre-K seats. Families using a subsidy voucher pay only their assigned copay.
No tuition credit is given for sick days, vacations, or listed closures. Families get 2 weeks of "vacation credit" per year (50% tuition off for a full week) with 2 weeks' notice to the office.
Withdrawal requires 30 days' written notice.
Questions about a specific charge, payment plans, or financial hardship are handled privately by the Director.`,
  },
  {
    id: "illness",
    title: "When your child must stay home (illness policy)",
    category: "Health & Illness",
    updatedAt: "2026-09-02T15:00:00Z",
    updatedBy: by,
    content: `Children must stay home, or will be sent home, with any of the following:
- Fever of 100.4°F (38°C) or higher. Infants under 3 months: 100.4°F or higher, call your pediatrician.
- Vomiting 2 or more times in 24 hours.
- Diarrhea 3 or more times in 24 hours, or any diarrhea that cannot be contained in a diaper/underwear.
- Rash with fever or behavior change, until a doctor says it is not contagious.
- Pink eye with yellow/green discharge, until 24 hours after starting treatment.
- Strep throat, until 24 hours after starting antibiotics and fever-free.
- Head lice, until after first treatment.
- Too unwell to participate in normal activities, including outdoor time.

RETURN RULE: your child may return once they have been symptom-free for 24 hours WITHOUT fever-reducing medicine (Tylenol/acetaminophen, Motrin/Advil/ibuprofen). Start the 24 hours from whichever is LATER: the last time they had the symptom (e.g., a temperature of 100.4°F+), or the last dose of fever-reducing medicine. Example: fever last on Monday night, Tylenol given Tuesday at 6:00 AM, no fever after that → earliest return is Wednesday at 6:00 AM (so, Wednesday's drop-off). Giving fever-reducing medicine before drop-off does not count as fever-free.
If symptoms start at school, we call you and the child must be picked up within 1 hour. The child rests in a quiet supervised area until then.
A doctor's note does not override the 24-hour rule for fever, vomiting, or diarrhea.
We cannot give medical advice. For questions about whether your child needs care, call your pediatrician; for emergencies call 911.`,
  },
  {
    id: "medications",
    title: "Medications at school",
    category: "Health & Illness",
    updatedAt: "2026-09-02T15:00:00Z",
    updatedBy: by,
    content: `Staff can give medication only with a signed Medication Authorization form (in the app under Forms) completed for each medication.
Prescription medicine must be in the original pharmacy container with your child's name.
Over-the-counter medicine (including Tylenol/Motrin) requires a doctor's written instructions. We do not give fever-reducers to keep a child at school.
Diaper cream, sunscreen, and insect repellent need only the parent permission form.
Inhalers and EpiPens must stay at school with a current care plan from your doctor.`,
  },
  {
    id: "allergies",
    title: "Allergies & nut-free policy",
    category: "Health & Illness",
    updatedAt: "2026-08-12T15:00:00Z",
    updatedBy: by,
    content: `Juniper Hill is a nut-free center (peanuts and tree nuts). Please do not send any food containing nuts or "may contain" nut warnings, including peanut butter and Nutella. Sunflower butter is allowed.
Children with food allergies need an Allergy Action Plan signed by a doctor on file. Their allergies are posted (privately) in the kitchen and classroom.
Our kitchen prepares allergy-safe substitutes for the backup lunch and snacks for any allergy on file.`,
  },
  {
    id: "meals",
    title: "Meals, packed lunch & forgotten lunch",
    category: "Meals",
    updatedAt: "2026-09-10T15:00:00Z",
    updatedBy: by,
    content: `We provide breakfast (served 7:30–8:30 AM) and afternoon snack (3:00 PM) for all children. Families pack lunch for children 12 months and older.
FORGOT LUNCH? No problem. We serve a backup hot lunch from that day's menu for $7, charged to your account. Message your teacher or the front desk by 10:30 AM so the kitchen can plan; after 10:30 we will still feed your child with a simple backup (sunflower butter sandwich, fruit, milk) at the same price.
INFANTS (under 12 months): parents supply all formula, breast milk, and baby food. We cannot substitute formula or breast milk. If you forgot a bottle or formula, please bring it or call the front desk right away.
Lunches must be nut-free. We have refrigerators; we can warm food but not cook it.`,
  },
  {
    id: "menu",
    title: "Menu – fall rotation (backup lunch & snacks)",
    category: "Meals",
    updatedAt: "2026-09-28T15:00:00Z",
    updatedBy: "Chef Rosa Delgado",
    content: `This menu repeats every week from Sept 28 through Nov 20, 2026. "Backup lunch" is what children receive if lunch is forgotten. Every item lists its allergens as (contains: ...); keep this format so allergies can be checked automatically.

MONDAY
- Breakfast: oatmeal made with milk, bananas (contains: milk)
- Backup lunch: turkey & cheese quesadilla, black beans, cucumber (contains: milk, wheat)
- Snack: apple slices & cheddar (contains: milk)
TUESDAY
- Breakfast: whole-grain waffles & berries (contains: wheat, egg, milk)
- Backup lunch: chicken noodle soup, whole-wheat roll, green beans (contains: wheat, egg)
- Snack: yogurt & nut-free granola (contains: milk, wheat)
WEDNESDAY
- Breakfast: scrambled eggs & toast (contains: egg, wheat, milk)
- Backup lunch: pasta with marinara and turkey meatballs, steamed broccoli (contains: wheat, egg)
- Snack: hummus & pita (contains: sesame, wheat)
THURSDAY
- Breakfast: cereal & milk with pears (contains: milk, wheat)
- Backup lunch: bean & cheese burrito bowl with rice, corn, and mild salsa; vegetarian (contains: milk)
- Snack: banana & sunflower-butter toast (contains: wheat)
FRIDAY
- Breakfast: yogurt parfait (contains: milk, wheat)
- Backup lunch: baked fish sticks, sweet potato wedges, peas (contains: fish, wheat)
- Snack: cheese crackers & grapes cut in quarters (contains: milk, wheat)

For any child with an Allergy Action Plan on file, the kitchen serves an allergy-safe version of every item (for example, dairy-free cheese and oat milk for a milk allergy, or rice crackers for wheat). Vegetarian versions are available on request.`,
  },
  {
    id: "tours",
    title: "Tours, enrollment & waitlist",
    category: "Enrollment & Tours",
    updatedAt: "2026-08-12T15:00:00Z",
    updatedBy: by,
    content: `Tours are 30 minutes with the Director, Tuesdays and Thursdays at 9:30 AM and 4:00 PM. Book in the app or call the front desk. Children are welcome on tours.
Current availability (fall 2026): Infants – waitlist about 5–6 months; Toddlers – waitlist about 3 months; Twos – 1 opening; Preschool – 2 openings; Pre-K – waitlist about 1 month.
Joining the waitlist is free. Enrollment requires the $150 registration fee, enrollment forms, immunization records (or exemption), and a physical within the last 12 months.
Siblings of enrolled children and children of staff get waitlist priority.`,
  },
  {
    id: "pickup",
    title: "Pickup authorization & custody",
    category: "Pickup & Safety",
    updatedAt: "2026-08-12T15:00:00Z",
    updatedBy: by,
    content: `We release children only to adults on the Authorized Pickup list in the app, who must show photo ID the first time (and any time staff ask).
To add someone for a single day (e.g., a grandparent), add them in the app under Authorized Pickup, or message the front desk with their full name before pickup. We cannot accept new pickup authorizations by phone call alone.
Pickup adults must be 18 or older.
Custody or restraining orders: we can only follow a court order that is on file with the Director. Please bring a copy to the Director in person. Staff cannot refuse a parent pickup without a court order on file.
If someone appears impaired at pickup, staff will not release the child and will follow our safety procedure.`,
  },
  {
    id: "daily",
    title: "Daily schedule, naps & what to bring",
    category: "Daily Life",
    updatedAt: "2026-08-12T15:00:00Z",
    updatedBy: by,
    content: `Typical day: 7:00 arrival & free play, 7:30 breakfast, 9:30 morning circle & learning centers, 10:30 outdoor play, 11:30 lunch, 12:30–2:30 rest time, 3:00 snack, 3:30 outdoor play, 4:30 choice activities until pickup. Infants follow their own feeding and nap schedules.
Rest time: every child has a cot (or crib for infants) and rests quietly; children who do not sleep may read quietly after 30 minutes.
What to bring: two full changes of weather-appropriate clothes, a small crib sheet and blanket for rest (sent home Fridays for washing), labeled water bottle, sunscreen permission form. Infants/toddlers: diapers, wipes, and bottles labeled with name and date. We go outside daily unless it is below 20°F with wind chill, so please send a coat, hat, and mittens in winter.
Daily updates, photos, and naps/meals/diapers are posted in the app throughout the day.`,
  },
  {
    id: "rooms",
    title: "Classrooms & lead teachers",
    category: "Daily Life",
    updatedAt: "2026-08-20T15:00:00Z",
    updatedBy: by,
    content: `Caterpillars (infants): Ms. Priya Nair and Ms. Grace Kim.
Bumblebees (toddlers): Ms. Sofia Alvarez (lead) and Mr. Theo Park.
Ladybugs (twos): Ms. Hannah Brooks (lead).
Dragonflies (preschool): Mr. Marcus Reed (lead).
Owls (Pre-K): Ms. Aisha Coleman (lead).
You can message your child's teachers directly in the app; teachers check messages during rest time and after 4:30 PM, so time-sensitive messages should also go to the front desk.`,
  },
];

export const FAMILIES: Family[] = [
  {
    id: "jordan",
    parentName: "Jordan Chen",
    label: "Jordan · parent of Maya (toddler)",
    childName: "Maya",
    room: "Bumblebees",
    allergies: ["peanut", "milk"],
    context: `Parent: Jordan Chen (enrolled family).
Child: Maya Chen, age 22 months, Bumblebees (toddler) room, full-time. Lead teacher: Ms. Sofia Alvarez.
Allergies on file: peanut and milk/dairy (Allergy Action Plan on file; EpiPen kept at school).
Authorized pickup: Jordan Chen, Wei Chen (co-parent), Lin Chen (grandmother).
Billing: autopay on; balance $0.`,
  },
  {
    id: "sam",
    parentName: "Sam Rivera",
    label: "Sam · parent of Leo (infant)",
    childName: "Leo",
    room: "Caterpillars",
    allergies: [],
    context: `Parent: Sam Rivera (enrolled family).
Child: Leo Rivera, age 7 months, Caterpillars (infant) room, part-time Mon/Wed/Fri. Teachers: Ms. Priya Nair and Ms. Grace Kim.
Feeding: formula (parent-supplied). No allergies on file.
Authorized pickup: Sam Rivera, Alex Rivera.
Billing: DC child care subsidy voucher; copay $115/month; balance $0.`,
  },
  {
    id: "prospect",
    parentName: "Taylor Brooks",
    label: "Taylor · prospective family",
    allergies: [],
    context: `Prospective family, not enrolled. Name: Taylor Brooks. Has a 9-month-old and is exploring child care starting in early 2027.`,
  },
];

// ---------------------------------------------------------------------------
// A week of history so the operator console isn't empty on first load.
// Hours-ago offsets are resolved relative to "now" when the store initializes.
// ---------------------------------------------------------------------------

type SeedLog = Omit<LogEntry, "id" | "at"> & { hoursAgo: number };

const L = (
  hoursAgo: number,
  familyId: string,
  question: string,
  topic: string,
  status: LogEntry["status"],
  sources: string[],
  answer: string,
  extra: Partial<LogEntry> = {},
): SeedLog => {
  const fam = FAMILIES.find((f) => f.id === familyId)!;
  return {
    hoursAgo,
    familyId,
    parentName: fam.parentName,
    childName: fam.childName,
    question,
    topic,
    status,
    sources,
    answer,
    sensitivity: "none",
    engine: "claude",
    ...extra,
  };
};

export const SEED_LOGS: SeedLog[] = [
  L(2, "jordan", "Is there school on Oct 9?", "PD day closure", "answered", ["calendar"], "No, we're closed Friday, Oct 9 for a staff professional development day."),
  L(5, "prospect", "Do you have a summer camp for 5 year olds?", "Summer camp", "needs_staff", [], "I don't have information about summer camp yet, so I've passed your question to Uttami."),
  L(7, "sam", "What time is tummy time / does Leo nap on a schedule?", "Infant naps", "answered", ["daily"], "Infants follow their own feeding and nap schedules, set with you."),
  L(20, "jordan", "Can you help with potty training? Maya is starting to show interest", "Potty training", "needs_staff", [], "I don't have our potty training approach in the handbook, so I've asked Ms. Alvarez's team to follow up."),
  L(22, "prospect", "How much is infant tuition?", "Infant tuition", "answered", ["tuition"], "Infant care is $2,450/month full-time or $1,690/month for 3 days (Mon/Wed/Fri)."),
  L(26, "sam", "Do you take DC child care vouchers?", "Subsidies", "answered", ["billing"], "Yes, we accept DC Child Care Subsidy Program vouchers; you pay only your assigned copay."),
  L(28, "sam", "Leo had a 100.8 fever last night, gave motrin, he's fine now. ok to come?", "Fever return", "answered", ["illness"], "Not yet. He needs to be fever-free for 24 hours without Motrin or Tylenol.", { sensitivity: "medical" }),
  L(30, "prospect", "Is there summer programming next year?", "Summer camp", "needs_staff", [], "I don't have summer program details yet, so I've sent this to the Director."),
  L(46, "jordan", "What's for lunch today? I forgot Maya's", "Forgotten lunch", "answered", ["meals", "menu", "allergies"], "Yes! Today's backup lunch is pasta with marinara and turkey meatballs ($7)."),
  L(50, "sam", "Are you open Veterans Day?", "Veterans Day", "answered", ["calendar"], "Yes, we're open regular hours on Wed, Nov 11."),
  L(52, "jordan", "Does Ms. Alvarez do potty training with the kids or should we start at home first?", "Potty training", "needs_staff", [], "I've sent your question to the Bumblebees team."),
  L(70, "prospect", "Can I tour this week?", "Tour booking", "answered", ["tours"], "Tours are Tue/Thu at 9:30 AM and 4:00 PM. Pick a time below."),
  L(73, "sam", "Can grandma pick up Leo Friday? She's not on the list", "Temporary pickup", "answered", ["pickup"], "Yes, add her in the app under Authorized Pickup before Friday."),
  L(75, "jordan", "Do you offer photos / picture day?", "Picture day", "needs_staff", [], "I don't have picture day info yet; I've asked the office."),
  L(96, "sam", "When does tuition get charged", "Billing date", "answered", ["billing"], "Tuition bills on the 1st and is due by the 5th."),
  L(99, "jordan", "How cold does it have to be to skip outside time?", "Outdoor weather", "answered", ["daily"], "We go outside daily unless it's below 20°F with wind chill."),
  L(120, "prospect", "Is there summer camp?", "Summer camp", "needs_staff", [], "I've passed this to the Director."),
  L(122, "sam", "Is the center nut free?", "Nut-free", "answered", ["allergies"], "Yes, Juniper Hill is fully nut-free."),
  L(124, "jordan", "I want to dispute the late fee from Tuesday, traffic was awful", "Late fee dispute", "needs_staff", ["hours", "billing"], "I understand. Fee questions are handled privately by Uttami, the Director; I've sent your message.", { sensitivity: "billing_dispute" }),
  L(140, "sam", "What should I pack for Leo?", "What to bring", "answered", ["daily", "meals"], "Two changes of clothes, a crib sheet, diapers, wipes, and labeled bottles/formula.", { feedback: "up" }),
  L(143, "jordan", "Is there a snow day today?", "Snow closure", "answered", ["weather"], "No announcement went out by 6 AM, so we're open normal hours."),
  L(150, "prospect", "What's the teacher to kid ratio for infants", "Ratios", "answered", ["center-basics"], "1 teacher for every 4 infants."),
  L(160, "sam", "Can I bring Leo's baby food from home?", "Infant food", "answered", ["meals"], "Yes, parents supply all infant formula, breast milk, and baby food.", { feedback: "up" }),
];

export const SEED_TICKETS: (Omit<Ticket, "id" | "at"> & { hoursAgo: number })[] = [
  {
    hoursAgo: 5,
    kind: "question",
    familyId: "prospect",
    parentName: "Taylor Brooks",
    question: "Do you have a summer camp for 5 year olds?",
    reason: "No handbook entry covers summer programs.",
    topic: "Summer camp",
    status: "open",
  },
  {
    hoursAgo: 20,
    kind: "question",
    familyId: "jordan",
    parentName: "Jordan Chen",
    childName: "Maya",
    question: "Can you help with potty training? Maya is starting to show interest",
    reason: "No handbook entry describes the potty training approach.",
    topic: "Potty training",
    status: "open",
  },
];

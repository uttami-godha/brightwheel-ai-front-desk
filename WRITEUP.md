# AI Front Desk: write-up

**Prototype:** https://brightwheel-ai-front-desk-uttami-godha.vercel.app/

**Context:** Fictional center: Juniper Hill Early Learning, Washington, DC (ages 6 weeks–5). Director: Uttami Godha :) All data is invented.

**What It Is:** a front desk parents can trust and directors can teach. It answers routine questions instantly, with sources, and hands anything sensitive or unknown to the director. Each director reply becomes new knowledge.

## Scope: depth on trust
I chose **Depth**: one confident wrong answer about a fever rule or a closure ends parents' trust. I covered the brief's five question types thoroughly, set explicit escalation rules, and built one complete loop: question → hand-off → reply → new knowledge → instant answer next time.

## 1. Parent experience: the front desk
Parents are anxious and often typing one-handed. The app opens to a home screen with two paths:

- **Ask Juni**, the AI assistant, by text, voice, or a suggested question.
- **School Info:** open/closed status, hours, address and phone, upcoming closures, today's menu with the child's allergy badges, and a fun fact. All of it is read from the same handbook Juni answers from, so one edit updates both.

- **This child, this date.** Answers lead with yes or no, in 2–4 sentences. "Maya had a 101° fever, I gave Tylenol at 6am" gets *"No"* plus the exact earliest drop-off day, because the 24-hour clock starts at the last dose.
- **Allergy cross-check.** Menu items in an answer are checked in code against the child's allergies. Maya is allergic to milk, so Thursday's cheese burrito bowl gets a red "Allergy check" card.
- **Checkable.** "From the handbook" chips show the exact source text.
- **Knows when not to answer.** Sensitive topics and unknowns go to the director, with a kind acknowledgement and when to expect a reply.
- **Emergencies, recognized by meaning.** "Her lips are puffy and she's wheezing" shows Call 911 / Call center and alerts staff, with no keyword needed.

## 2. Operator experience: the control center
Directors run small businesses. What they'd pay for is fewer interruptions, from a system that improves without setup work.

- **Needs you inbox.** Each hand-off shows the question, child, reason, and what the AI told the parent.
- **Reply once, teach forever.** The reply goes to the parent, and AI drafts a reusable handbook entry from it with family details removed. In one click the director saves the entry and can answer every other family waiting on the same question.
- **Insights + Knowledge.** Staff hours saved and ranked **handbook gaps** (e.g., "Potty training, asked 2×") with a "Write entry" button. The handbook is plain, editable prose.

## How it works
1. **Emergency triage in parallel.** A separate model call checks each message only for "is a child in danger right now?" without adding wait. Unmistakable phrases skip the model for an instant 911 card.
2. **Whole-handbook grounding, no RAG.** The handbook is about 5k tokens, so the model reads all of it every time and can't answer from the wrong page. It also gets today's date and the family's record.
3. **Structured output, verified in code.** Each answer returns a status, sources, a sensitivity tag, a topic, a hand-off reason, and the menu items it mentions. Code checks those items against allergen tags, so the AI never has the final word on allergy safety.
4. **Fail toward a human.** Errors become hand-offs, never guesses.
5. **Measured.** `npm run eval` runs 17 questions through the live API. All 11 auto-scored checks pass.

**Edge cases considered:** medicine masking a fever; allergen conflicts on the menu; allergies not yet on file; unlabeled menu items; infant formula (no substitute); holidays and early closes; custody; fee disputes; questions the handbook doesn't cover; emergencies without alarm words; policy questions that shouldn't trigger 911; prompt injection; API failure or a missing key; opening the demo after hours (a demo clock pins "today").

**The model: Claude Opus 5.5.** Chosen over a free tier because the hard part is judgment. At low effort it answers in 3–5 seconds, about 1–3¢ per question.

**What I'd Do Next:** real auth with family data from Brightwheel records, SMS and phone entry points, proactive closure notices, evals built from real conversation logs, and multilingual answers to support diverse clients and needs.

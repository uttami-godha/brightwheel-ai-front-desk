# AI Front Desk: write-up

**Prototype:** [hosted URL]  ·  **Code:** github.com/uttami-godha/brightwheel-ai-front-desk
Fictional center: Juniper Hill Early Learning, Washington, DC (ages 6 weeks–5). Director: Uttami Godha. All families and policies are invented.

**The bet:** one confident wrong answer about a fever rule or a closure date and parents stop trusting the tool, and the phone starts ringing again. So I chose **depth on trust** over breadth: answer common questions specifically and verifiably, know exactly when *not* to answer, and make every hand-off improve the system.

## 1. Parent experience: the front desk

A mobile chat in the parent app. Ask by text or voice, or tap a suggested question. You can switch between three demo families: a toddler, an infant, and a prospective family.

- **Specific, not generic.** Answers lead with yes or no and apply the policy to this child on this date. "Maya had a 101° fever, I gave Tylenol at 6am" gets *"No. The earliest she can return is Friday's drop-off,"* because the 24-hour clock starts at the last dose. A forgotten lunch gets today's menu, the $7 charge, the 10:30 deadline, and a note about her peanut allergy.
- **Verifiable.** "From the handbook" chips show the exact source text and when it was last updated.
- **Graceful hand-offs.** Custody, safety, complaints, fee disputes, exceptions, and anything not in the handbook go to the director. The parent gets a kind acknowledgement, any relevant rule, and when to expect a reply.
- **Emergencies skip the AI.** "Choking" or "not breathing" instantly shows Call 911 / Call center and alerts staff.
- **Actions, not just answers.** Tour questions open a booking picker. Thumbs-down flags an answer for staff.

## 2. Operator experience: the control center

The director's console, live alongside the parent's phone.

- **Needs you inbox.** Each hand-off shows the question, the child, a one-line reason ("No handbook entry covers summer programs"), and what the AI already told the parent.
- **Reply once, teach forever.** The reply goes to the parent's chat, and AI drafts a reusable handbook entry from it with family details removed. In one click the director adds the entry and can send the answer to every other family waiting on the same question. The next parent gets an instant, cited answer.
- **Insights.** Share of questions answered instantly, staff hours saved, top topics, flagged answers, and ranked **handbook gaps** (e.g., "Potty training, asked 2×") with a "Write entry" button.
- **Knowledge + Conversations.** The source of truth is plain prose anyone can edit, with "used in N answers" on each entry. A full log shows the status and sources behind every answer.

## How it works

Next.js on Vercel · Claude Opus 5.5 (low effort) · demo state kept in the browser.

1. **Emergency check first.** A deterministic pattern match, so no model call stands between a parent and "call 911."
2. **Whole-handbook grounding, no RAG.** One center's handbook is about 5k tokens, so the model reads all of it, prompt-cached, on every question. It can't answer from the wrong page. It also gets today's date and the family's record (child, room, allergies, schedule). A demo clock pins "today" to a school-day morning.
3. **Structured output.** Each answer returns a status (answered / partial / needs_staff), its sources, a sensitivity tag, a topic label, and the hand-off reason. One schema drives the parent UI, the inbox, and the gap analytics.
4. **Fail toward a human.** On an API error or refusal, the parent gets a hand-off, never a guess. With no API key, the app quotes the handbook word for word.
5. **Quality check.** `npm run eval` runs 10 realistic and adversarial questions through the live API, including a prompt injection. All 10 pass.

**What I'd Do Next:** real auth with family data from Brightwheel records, SMS and phone entry points, proactive closure notices, evals built from real conversation logs, and multilingual answers to support diverse clients and needs. 

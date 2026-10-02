# AI Front Desk

A working prototype of an AI front desk for a child care center. The parent asks a question in the app and gets a specific, cited answer, or a graceful hand-off to the director. The director gets an inbox of hand-offs. Replying to one also teaches the front desk, so the next family gets the answer instantly.

Everything here is fictional: the center (Juniper Hill Early Learning, Washington, DC; Director: Uttami Godha), the families, and the policies.

**What it does and how it works:** see [WRITEUP.md](WRITEUP.md). It covers the parent and operator experiences, the architecture, and the design decisions.

## Run it

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Without a key, the app still runs in an **offline mode**. It quotes the closest handbook entry word for word and hands everything else to staff, so a missing key doesn't produce an invented answer.

To check answer quality after changing the prompt or the handbook, run `npm run eval` while the dev server is up. It sends realistic parent questions, including edge cases, through the real API.

## Deploy (Vercel)

1. Import this GitHub repo at vercel.com/new (framework: Next.js, no settings to change).
2. Add the environment variable `ANTHROPIC_API_KEY`.
3. Deploy.

## Where things live

Handbook: [lib/seed.ts](lib/seed.ts). 
Prompt and output schema: [lib/prompt.ts](lib/prompt.ts). 
Answer route: [app/api/ask/route.ts](app/api/ask/route.ts). 
Teach-from-reply route: [app/api/draft-entry/route.ts](app/api/draft-entry/route.ts). 
Emergency check: [lib/emergency.ts](lib/emergency.ts). 
UI: [components/](components/).

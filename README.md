# AI Front Desk

**Prototype:** https://brightwheel-ai-front-desk-uttami-godha.vercel.app/

A working prototype of an AI front desk for a fictional child care center. Parents land on a home screen where they can check School Info or ask Juni, the AI assistant, a question and get a specific, cited answer, or a nice hand-off to the director. The director gets an inbox of hand-offs. Replying to one also teaches the front desk, so the next family gets the answer instantly.

**What it does & how it works:** see [WRITEUP.md](WRITEUP.md). It covers the parent and operator experiences, the architecture, and the design decisions.

## Running it locally

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm run dev
```

Without a key, the app still runs in an **offline mode**. It quotes the closest handbook entry word for word and hands everything else to staff, so a missing key doesn't produce an invented answer.

To check answer quality after changing the prompt or the handbook, run `npm run eval` while the dev server is up. It sends realistic parent questions, including edge cases, through the real API.

## Where things live

- Handbook: [lib/seed.ts](lib/seed.ts)
- Prompt and output schema: [lib/prompt.ts](lib/prompt.ts)
- Answer route: [app/api/ask/route.ts](app/api/ask/route.ts)
- Teach-from-reply route: [app/api/draft-entry/route.ts](app/api/draft-entry/route.ts)
- Emergency check: [lib/emergency.ts](lib/emergency.ts)
- Allergy cross-check: [lib/allergy.ts](lib/allergy.ts)
- School Info (built from the handbook): [lib/schoolInfo.ts](lib/schoolInfo.ts)
- UI: [components/](components/)

# AI Support Inbox

A small multi-channel support inbox where incoming Telegram messages get an
AI-drafted reply (via Google's Gemini API, structured JSON output) generated
asynchronously through a BullMQ/Redis job queue, and pushed live to a
Next.js dashboard over WebSockets, where a human agent reviews/edits/sends it.

Built to demonstrate the stack used in modern AI-platform backend roles:
NestJS, Prisma/PostgreSQL, Redis/BullMQ, WebSockets, and LLM integration
with structured outputs.

## Architecture

```
Telegram --> NestJS (TelegramService, long-polling)
                  |
                  v
          ConversationsService --> PostgreSQL (Prisma)
                  |
                  v
          BullMQ queue (Redis) --> AiReplyProcessor --> Gemini API
                  |
                  v
          EventsGateway (Socket.io) --> Next.js dashboard (live update)
```

## Setup

1. `cd backend && cp .env.example .env` and fill in:
   - `TELEGRAM_BOT_TOKEN` — message [@BotFather](https://t.me/BotFather) on Telegram, `/newbot`, copy the token.
   - `GEMINI_API_KEY` — from aistudio.google.com/apikey (Google AI Studio, free tier available).
2. `docker compose up -d` (starts Postgres + Redis)
3. `npm install`
4. `npx prisma migrate dev --name init`
5. `npm run start:dev`
6. In another terminal: `cd ../frontend && cp .env.local.example .env.local && npm install && npm run dev`
7. Open `http://localhost:3000`, message your Telegram bot, watch the reply appear live.
8. API docs: `http://localhost:3001/docs` (Swagger)

## What's implemented

- NestJS REST API (Conversations, Swagger-documented)
- Prisma + PostgreSQL schema
- Telegram channel ingestion (long polling)
- BullMQ + Redis background job for AI reply generation (decoupled from request cycle)
- Gemini API integration with native JSON schema mode (reply/confidence/tags)
- Socket.io gateway for real-time dashboard updates
- Next.js dashboard: conversation list, live chat view, human-in-the-loop reply

## Deliberately out of scope (next steps)

This was built as a focused proof-of-concept, not a production system. Left out on purpose:

- **Real RAG**: `AiService.retrieveContext()` is a placeholder — swap for
  pgvector embeddings + cosine similarity search over a real knowledge base.
- **Auth**: no JWT/OAuth yet on the dashboard or API.
- **Observability**: no OpenTelemetry tracing/metrics yet.
- **Second channel**: email via IMAP/SMTP not wired up yet.
- **Tool-use/function-calling**: the AI only drafts replies; no agent actions
  (e.g. "escalate", "create ticket") yet.

## Why this project

Built to demonstrate hands-on familiarity with the exact stack (NestJS,
Prisma/PostgreSQL, Redis/BullMQ, WebSockets, LLM structured-output
integration) rather than just listing it on a resume. Uses Gemini here for
cost reasons during development — the AI service is isolated in one file
(`ai.service.ts`), so swapping in Anthropic or OpenAI later is a small,
contained change, not a rewrite.

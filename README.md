# Voice Customer Service Agent

Assessment-focused voice customer service agent for a fictional online store.
The application will accept customer audio, send it directly to an
audio-capable OpenAI model, execute real OpenAI tool calls against local stub
tools, and return a text response.

This project is intentionally separate from
[AutoEnquiry](../AutoEnquiry/). AutoEnquiry is reference material only; its
.NET backend, provider-key flow, and text-only orchestration are not used here.

## Status

Phase 2 is complete: direct audio orchestration, real OpenAI tool calls, and
server-side order confirmation enforcement are implemented. The customer-facing
frontend remains deferred to Phase 3.

## Requirements

- Node.js 20.9 or newer
- npm
- An OpenAI API key with access to the model selected after compatibility
  verification

## Setup

```bash
npm install
Copy-Item .env.example .env.local
```

Set `OPENAI_API_KEY` in `.env.local`. The key is server-only and must never be
placed in client-side code, committed, logged, or included in AI chat exports.

## Development

```bash
npm run dev
```

Open <http://localhost:3000>.

The current page is only the Phase 0 foundation placeholder. The phased
implementation plan is in [PLAN.md](./PLAN.md).

## Verification gate

Before Phase 1, the selected OpenAI request shape must be verified to support
both:

1. Direct audio input, without Whisper or any separate transcription step.
2. Function/tool calling in the same model/API approach.

Official documentation currently distinguishes audio Chat Completions,
Responses API tool orchestration, and Realtime/GPT-Live sessions. A live API
request cannot be claimed until an assessment API key and a small sample audio
file are available. The implementation will record the exact model, SDK
request shape, and observed result before proceeding.

## Project records

- `AGENTS.md` contains standing development rules.
- `CLAUDE.md` points tools that look for it to `AGENTS.md`.
- `PHASE-1-COMPATIBILITY.md` records the verified audio and tool-call request.
- `ai-chats/` is reserved for complete raw Copilot conversation exports.
- `PLAN.md` contains the lean implementation phases and Definitions of Done.

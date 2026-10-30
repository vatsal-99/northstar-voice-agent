# Voice Customer Service Agent

An assessment-focused voice customer service agent for Northstar Goods, a
fictional online store. Customers upload or record audio, the server sends the
audio directly to `gpt-audio-1.5`, and the model can call local catalog/order
tools before returning a text response.

This project is independent from [AutoEnquiry](../AutoEnquiry/). AutoEnquiry
was not used as the backend and no files in it are modified.

## Current status

Phases 0–10 implementation work is complete. The repository contains the
foundation, verified direct audio/function-calling integration, tools, backend
confirmation enforcement, responsive voice interface, Northstar storefront,
catalog-backed product detail pages, real product photography, samples, tests,
and process documentation.

The final assessment demo video and raw AI session exports must be supplied
from the coding-assistant environment used for the assessment. See
[PROCESS_REPORT.md](./PROCESS_REPORT.md) and [ai-chats/README.md](./ai-chats/README.md).

## Requirements

- Node.js 20.9 or newer
- npm
- An OpenAI API key with access to `gpt-audio-1.5`

## Setup

PowerShell:

```powershell
npm install
Copy-Item .env.example .env.local
```

Set the key in `.env.local`:

```text
OPENAI_API_KEY=your-assessment-key
```

The key is read only by the server-side OpenAI SDK. Never put it in frontend
code, browser storage, request fields, logs, samples, screenshots, commits, or
AI chat exports.

## Run

```powershell
npm run dev
```

Open <http://localhost:3000>.

The storefront homepage displays three featured premium products from
[tools/catalog.json](./tools/catalog.json). Select **View all products** or
the **Products** navigation link to browse the full catalogue. Select **See
full details** on any product for its dedicated product page. The floating
**Talk to us** button
opens the existing voice agent in a popup; the full-page voice experience is
also available at <http://localhost:3000/voice>.

Choose an MP3/WAV file or use **Record**. Browsers that record WebM internally
are converted client-side into a WAV file before upload, so the server still
receives only the formats required by the assessment.

Each browser session receives a session ID stored in `sessionStorage`. The
server uses that ID to preserve the tool conversation and pending order
confirmation. The terminal prints structured tool-call events.

## API

`POST /api/voice` accepts `multipart/form-data`:

- `audio`: non-empty MP3 or WAV file, maximum 10 MB
- `sessionId`: non-empty session identifier

The route returns:

```json
{
  "response": "The agent's final text response.",
  "sessionId": "session-id"
}
```

Errors return JSON with an `error` field and an appropriate `400`, `415`, or
`502` status.

## Direct audio and tools

The server sends the uploaded bytes as an `input_audio` content part directly
to `gpt-audio-1.5` using the official OpenAI Node.js SDK. There is no
transcription step. The same request includes the tool definitions, and the
server executes returned function calls before continuing the model loop.

The system prompt is in [prompts/system_prompt.md](./prompts/system_prompt.md).
Tool schemas are in [tools/definitions.json](./tools/definitions.json).
Catalog-backed implementations are in [tools/](./tools/).

Before `place_order` can execute, the backend requires a matching pending
product, quantity, and total price confirmation. Prompt instructions alone are
not trusted for this safety rule.

## Samples

See [samples/expected-behavior.md](./samples/expected-behavior.md):

- `samples/product-question.wav`
- `samples/order-confirmation.wav`
- `samples/unclear-audio.wav`

## Verification commands

```powershell
npm run test:tools
npm run test:orders
npm run test:phase-2
npm run test:phase-4
npm run lint
npx tsc --noEmit
npm run build
```

The tests cover catalog tools, shared in-memory order creation and tracking,
unique order numbers, order confirmation, unsupported/empty audio, missing
sessions, invalid arguments, out-of-stock products, and unknown tools.
The live OpenAI audio/tool compatibility result is recorded in
[PHASE-1-COMPATIBILITY.md](./PHASE-1-COMPATIBILITY.md).

## Project records

- [AGENTS.md](./AGENTS.md): standing implementation rules
- [CLAUDE.md](./CLAUDE.md): instruction-file entry point
- [PLAN.md](./PLAN.md): approval-gated phases and Definitions of Done
- [PROCESS_REPORT.md](./PROCESS_REPORT.md): process reflection and manual work
- [ai-chats/](./ai-chats/): native raw coding-assistant exports

Orders are intentionally stored in memory only. Newly created orders can be
tracked while the current application process is running; restarting the
server clears those orders.

The storefront's **Buy now** action opens the order flow and then the voice
agent performs the required confirmation before calling `place_order`. It does
not collect payment or create a live retail order. The Orders page also
supports manual placement: choose a quantity and select **Place order**. That
button performs the same stock validation, explicit confirmation, application
order-number generation, and in-memory storage without opening the full-page
voice experience. The floating voice-agent launcher is mounted in the root
layout and is available on every page.

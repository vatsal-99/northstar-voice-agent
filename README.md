# Voice Customer Service Agent

An assessment-focused voice customer service agent for Northstar Goods, a
fictional online store. Customers upload or record audio, the server sends the
audio directly to `gpt-audio-1.5`, and the model can call local catalog/order
tools before returning a text response.

This project is independent from [AutoEnquiry](../AutoEnquiry/). AutoEnquiry
was not used as the backend and no files in it are modified.

## Current status

Phases 0–5 implementation work is complete. The repository contains the
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

The storefront homepage displays the six products from
[tools/catalog.json](./tools/catalog.json). Select **See full details** on any
product for its dedicated product page. The floating **Talk to us** button
opens the existing voice agent in a popup; the full-page voice experience is
also available at <http://localhost:3000/voice>.

Choose an MP3/WAV file or use **Record** when the browser supports MP3/WAV
recording. Some browsers expose only WebM recording; the interface reports
that limitation and asks for an MP3/WAV upload because the server intentionally
accepts only the formats required by the assessment.

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
npm run test:phase-2
npm run test:phase-4
npm run lint
npx tsc --noEmit
npm run build
```

The tests cover catalog tools, order confirmation, unsupported/empty audio,
missing sessions, invalid arguments, out-of-stock products, and unknown tools.
The live OpenAI audio/tool compatibility result is recorded in
[PHASE-1-COMPATIBILITY.md](./PHASE-1-COMPATIBILITY.md).

## Project records

- [AGENTS.md](./AGENTS.md): standing implementation rules
- [CLAUDE.md](./CLAUDE.md): instruction-file entry point
- [PLAN.md](./PLAN.md): approval-gated phases and Definitions of Done
- [PROCESS_REPORT.md](./PROCESS_REPORT.md): process reflection and manual work
- [ai-chats/](./ai-chats/): native raw coding-assistant exports

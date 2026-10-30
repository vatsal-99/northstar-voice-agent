<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Voice Customer Service Agent: AI Development Rules

## Goal and scope

Build a small assessment-focused customer service agent for a fictional online
store. Customers submit audio recordings. The server sends the audio directly
to an audio-capable OpenAI model, lets that model use real function calls, and
returns a natural text response.

Keep the scope small and working. The initial release is not a production
store, payment system, shipping system, authentication system, or live
telephony product. Do not add an avatar until the complete core flow works.

## Architecture

- Next.js App Router with TypeScript.
- React UI for audio upload and conversation display.
- Node.js through Next.js route handlers.
- Official `openai` Node.js SDK.
- Server-only `OPENAI_API_KEY`.
- Local JSON catalog and deterministic stub tool implementations.
- Prompt and tool schemas remain inspectable under `prompts/` and `tools/`.
- Runtime interaction records use simple structured logs.
- Raw AI coding-assistant exports belong in `ai-chats/`.

The planned layout is:

```text
src/app/       Next.js pages and API route handlers
src/components React UI components
src/lib/       server orchestration, audio, validation, and logging helpers
src/types/     shared TypeScript types
prompts/       GPT-facing system prompt
tools/         catalog, schemas, implementations, and tool logging
samples/       assessment recordings and expected behavior
tests/         focused automated tests
ai-chats/      complete raw coding-assistant exports
```

## Non-negotiable behavior

- Never add a transcription step. Do not use Whisper, `gpt-4o-transcribe`,
  browser speech recognition, or another speech-to-text service.
- Verify that the selected model/API supports direct audio and function calling
  before building the full flow.
- Keep the OpenAI key on the server. Never accept it from the browser.
- The model may only offer products from the catalog.
- Do not invent prices, stock, order numbers, statuses, or delivery dates.
- Ask for missing details rather than guessing.
- Backend confirmation state must prevent `place_order` until the customer
  explicitly confirms the product, quantity, and price.
- Every tool call and result must be logged in a simple structured form.
- Errors must be explicit and useful; do not silently return success-shaped
  fallbacks.

## Coding conventions

- Use strict TypeScript and existing Next.js conventions.
- Prefer small, typed functions with explicit return values.
- Validate all untrusted input at the route and tool boundaries.
- Keep prompt text and tool schemas out of large route-handler literals.
- Avoid unnecessary dependencies. Ask before adding a library or changing the
  approved architecture.
- Preserve unrelated work and do not rewrite generated or reference files
  without a reason.
- Comments should explain non-obvious decisions only.

## Testing and verification

- Run the smallest relevant test or build command after each phase.
- Test unclear audio, missing details, unknown orders, out-of-stock products,
  failed tools, and rejected order confirmations.
- Verify the actual model request and tool-call loop rather than mocking the
  core behavior as the only evidence.
- Do not claim live OpenAI compatibility without a successful API test.

## Process and documentation

- After each step, explain what you changed and why.
- Save every complete Copilot conversation export in `ai-chats/` as the raw
  tool format, in chronological order. Include failed attempts.
- Redact only secrets in exported records, replacing them with `[REDACTED]`.
- Record manual code changes and their reasons in `docs/PROCESS_REPORT.md`.
- Keep commits regular and do not squash or rewrite assessment history.

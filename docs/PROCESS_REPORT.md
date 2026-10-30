# Process report

## 1. AI tools and models used

The implementation was developed with Copilot SDK in VS Code. The application
uses the official OpenAI Node.js SDK and the `gpt-audio-1.5` model.

The OpenAI model was used for direct audio understanding and function calling.
No Whisper, transcription endpoint, browser speech-recognition API, or
separate speech-to-text service was used.

## 2. Strategy and sequencing

The work was deliberately split into four approval-gated phases:

1. Establish an independent Next.js foundation and standing instructions.
2. Verify direct audio plus function calling before building dependent code,
   then implement the catalog and deterministic tools.
3. Implement the external system prompt, OpenAI tool loop, backend confirmation
   state, and a small customer-facing interface.
4. Add samples, error tests, documentation, and final verification.

The highest-risk decision was tested before the full application was built.
The verified request uses Chat Completions with `gpt-audio-1.5`,
direct `input_audio`, `modalities: ["text"]`, and function tools. A follow-up
live request confirmed that text-only output is accepted for direct audio, so
the application does not request generated audio.

## 3. Important instructions

The most important standing rules were:

- Never add a transcription step; send audio directly to the audio-capable
  model.
- Use only catalog and tool results; never invent products, prices, stock,
  order numbers, or delivery information.
- Enforce order confirmation in backend state rather than relying only on the
  GPT prompt.

These rules shaped the architecture: prompt and schemas are inspectable files,
tools have a local source of truth, and `place_order` checks a matching
server-side confirmation before executing.

## 4. Problems found and corrections

### Phase 8 — audio-transcript bug

The first audio-output request succeeded at the API level but returned
`message.content: null`; the assistant text was in
`message.audio.transcript`. Treating the null content as a failed response
caused a false 502. The interim fix read the official transcript field.
A later live test proved that `modalities: ["text"]` is accepted for the same
direct-audio request, so the final implementation requests text-only output
and no longer needs the audio-transcript workaround.

### Phase 9 — audio-replay bug

Generated audio response data was retained in the in-memory conversation and
replayed in a later request. That replay shape was not accepted reliably by
the next Chat Completions call. Assistant history was therefore sanitized to
the text/tool-call fields needed for conversation continuity. The final
text-only response configuration also prevents generated audio data from
being stored in the first place.

- The initial compatibility test verified audio input but did not produce a
  tool call because the supplied sample did not request a product. A second
  request used the same audio shape with explicit tool choice and verified the
  real tool-call response shape.
- A live follow-up compatibility request with `modalities: ["text"]` returned
  a successful text response. The production request was changed to text-only
  output and the audio-transcript fallback was removed.
- Native Node type stripping did not resolve extensionless TypeScript imports
  for the focused scripts. The test script uses transient `tsx` execution
  without adding another application dependency.
- Next.js lint rejected synchronous state initialization in an effect. Session
  initialization was moved to an event-driven ref-based flow to avoid a
  cascading render and hydration risk.
- TypeScript and Next.js build checks caught SDK tool-call union narrowing,
  route runtime configuration, and typed argument issues; these were corrected
  before completion.

## 5. Manual changes

Manual changes were limited to the following files and reasons:

- `AGENTS.md` — recorded project architecture, safety, testing, export, and
  step-explanation rules.
- `CLAUDE.md` — linked the standing rules and repeated the step-explanation
  requirement at the entry point.
- `src/lib/agent.ts` — implemented direct audio submission, the OpenAI tool
  loop, backend confirmation enforcement, and the verified text-only response
  shape.
- `src/lib/confirmation.ts` — kept pending and confirmed order state
  server-side so prompt instructions cannot bypass confirmation.
- `src/lib/audio-validation.ts` and `src/app/api/voice/route.ts` — validated
  uploaded MP3/WAV input and exposed the server voice endpoint.
- `src/components/voice-agent.tsx`,
  `src/components/voice-agent.module.css`,
  `src/components/voice-agent-widget.tsx`, and
  `src/components/voice-agent-widget.module.css` — implemented the upload,
  recording, drag/drop, transcript display, and popup customer experience.
- `tools/catalog.json`, `tools/*.ts`, and `tools/definitions.json` —
  created the 15-product catalog and deterministic inspect/order tools.
- `tests/*.mts` and `tools/tool-tests.mts` — added focused validation,
  confirmation, order-store, error-path, and current-catalog coverage.
- `README.md`, `docs/PLAN.md`, `docs/PHASE-1-COMPATIBILITY.md`, and
  `docs/PROCESS_REPORT.md` — documented architecture, verification results,
  limitations, manual changes, and assessment traceability.
- `samples/*.wav` — supplied local assessment recordings for product,
  confirmation, and unclear-audio scenarios.

The remaining manually authored project files and their purposes are:

- `.env.example` — documented the server-only API-key setting.
- `.gitignore` — excluded local environment secrets, build output, and
  generated files.
- `package.json` and `package-lock.json` — defined the approved Next.js,
  React, TypeScript, OpenAI SDK, Font Awesome, and test tooling dependencies.
- `eslint.config.mjs`, `next.config.ts`, `tsconfig.json`, and
  `next-env.d.ts` — configured linting, Next.js image/runtime behavior, and
  strict TypeScript compilation.
- `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, and
  `src/app/page.module.css` — provided the storefront shell and global
  styling.
- `src/app/products/page.tsx`,
  `src/app/products/[productId]/page.tsx`,
  `src/app/orders/page.tsx`,
  `src/app/orders/new/page.tsx`, and
  `src/app/orders/success/page.tsx` — provided catalog, product-detail, and
  order pages.
- `src/app/api/orders/route.ts` — exposed shared in-memory orders to the
  storefront.
- `src/components/storefront.tsx`,
  `src/components/storefront.module.css`,
  `src/components/product-catalogue.tsx`,
  `src/components/product-detail.tsx`,
  `src/components/product-detail.module.css`, and
  `src/components/orders-content.tsx` — rendered the Northstar storefront and
  order flows.
- `src/components/voice-agent.tsx`,
  `src/components/voice-agent.module.css`,
  `src/components/voice-agent-widget.tsx`, and
  `src/components/voice-agent-widget.module.css` — implemented the voice
  popup, recording/upload controls, drag/drop, and visual states.
- `src/lib/audio-validation.ts` — enforced the MP3/WAV upload contract.
- `src/lib/confirmation.ts` — enforced exact server-side order confirmation.
- `tools/catalog.ts`, `tools/types.ts`, `tools/list-products.ts`,
  `tools/get-product-details.ts`, `tools/get-order-status.ts`,
  `tools/place-order.ts`, `tools/order-store.ts`, `tools/registry.ts`,
  `tools/logger.ts`, `tools/definitions.json`, and `tools/catalog.json` —
  defined the typed 15-product source of truth, tools, storage, schemas, and
  structured logging.
- `tests/order-store-tests.mts`, `tests/phase-2-tests.mts`,
  `tests/phase-4-tests.mts`, and `tools/tool-tests.mts` — verified order
  storage, confirmation, validation, out-of-scope handling, and catalog
  behavior.
- `public/avatars/woman.png` — supplied the Olivia profile image without
  modifying AutoEnquiry.

Inline autocomplete was provided by GitHub Copilot in VS Code. No external
code-generation service was used.

No AutoEnquiry files were changed. No API key was written to source, samples,
logs, or documentation.

## 6. Limitations and future work

The tool loop and compatibility request were live-verified with the supplied
OpenAI key during Phase 1. Automated tests cover tool behavior, confirmation,
validation, and error paths without requiring a live key. A final live demo
requires an available, rotated assessment key and should be recorded as the
assessment video.

The current in-memory session state is intentionally assessment-sized. A
production service would need authenticated, durable, bounded session storage,
rate limiting, retention controls, and observability.

## 7. Raw coding-assistant export

The native Copilot session event export is stored in
[`ai-chats/2026-10-30-voice-agent-session.events.jsonl`](../ai-chats/2026-10-30-voice-agent-session.events.jsonl).
It contains 4,012 valid JSONL events, including user messages, assistant
messages, tool requests and completions, permissions, and recorded file
changes. API-key values in the source event log were replaced with
`[REDACTED]` before adding the export to the repository. No summary was used
as a substitute for the native event structure.

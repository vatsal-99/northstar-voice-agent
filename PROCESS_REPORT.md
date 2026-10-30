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
`input_audio`, `modalities: ["text", "audio"]`, and function tools.

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

- The initial compatibility test verified audio input but did not produce a
  tool call because the supplied sample did not request a product. A second
  request used the same audio shape with explicit tool choice and verified the
  real tool-call response shape.
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

Manual changes were limited to:

- Creating and reviewing the project instruction and documentation files.
- Selecting the verified OpenAI request shape after the live compatibility
  test.
- Implementing the catalog, tool loop, confirmation state, upload route, and
  interface through the approved coding workflow.
- Creating three local WAV samples with the Windows speech synthesizer and a
  generated one-second silent WAV.

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
[`ai-chats/2026-10-30-voice-agent-session.events.jsonl`](./ai-chats/2026-10-30-voice-agent-session.events.jsonl).
It contains 4,012 valid JSONL events, including user messages, assistant
messages, tool requests and completions, permissions, and recorded file
changes. API-key values in the source event log were replaced with
`[REDACTED]` before adding the export to the repository. No summary was used
as a substitute for the native event structure.

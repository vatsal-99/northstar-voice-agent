# Lean implementation plan

This plan follows the approved assessment scope. Each phase requires review
before the next phase begins.

## Phase 0 — Project foundation

### Tasks

- Scaffold an independent Next.js App Router TypeScript application.
- Establish the approved folder structure.
- Add `AGENTS.md`, `CLAUDE.md`, `README.md`, `.env.example`, and `.gitignore`.
- Reserve `ai-chats/`, `prompts/`, `tools/`, `samples/`, and `tests/`.
- Investigate official OpenAI audio and tool-calling support.
- Record the exact compatibility gate and any limitation.

### Definition of Done

- The app starts locally and the production build can be checked.
- No AutoEnquiry file is modified.
- No business logic or audio/transcription implementation exists.
- API keys are protected by environment configuration and gitignore rules.
- The complete plan and compatibility limitation are documented.

## Phase 1 — Audio/API compatibility and store tools

### Dependencies

- Phase 0 approved.
- A usable assessment OpenAI API key and model access, or an explicitly
  documented blocker.

### Tasks

- Run the smallest direct-audio compatibility test with the official SDK.
- Confirm the same model/API approach accepts tools.
- Record model, request format, response shape, and observed limitations.
- Add a 5–10 item catalog.
- Implement and test `list_products`, `get_product_details`,
  `place_order`, and `get_order_status`.
- Add schemas, validation, and simple structured tool logging.

### Definition of Done

- Direct audio is sent to GPT without transcription.
- Compatibility evidence exists or the blocker is clearly reported.
- Tools return deterministic, realistic results from the catalog/source of
  truth only.
- Tool errors and out-of-stock/unknown-order cases are explicit.

## Phase 2 — Prompt, tool loop, and confirmation

### Dependencies

- Phase 1 tool contracts and API compatibility are complete.

### Tasks

- Write `prompts/system_prompt.md`.
- Write `tools/definitions.json`.
- Implement the OpenAI tool-call loop in a server route/service.
- Preserve tool-call IDs and return tool results to the model.
- Add server-side conversation/confirmation state.
- Prevent `place_order` until explicit confirmation of product, quantity, and
  price.

### Definition of Done

- Real OpenAI function calls invoke matching local functions.
- The loop handles one or more tool calls before the final response.
- Missing details produce clarification requests.
- Order confirmation is enforced by backend logic, not only prompting.
- No fabricated store data is returned after a failed tool.

## Phase 3 — Minimal responsive interface and records

### Dependencies

- Phase 2 end-to-end route is working.

### Tasks

- Build a clean audio-upload interface for MP3/WAV.
- Display loading, error, conversation, and final-response states.
- Add simple structured runtime interaction logs.
- Add two or three sample recordings and expected behavior.
- Keep API keys server-only.

### Definition of Done

- A user can submit supported audio from the browser.
- The response and meaningful errors are visible.
- Runtime logs include request, model, tool, result, and final-response
  events without secrets.
- No avatar is required for completion.

## Phase 4 — Verification and assessment documentation

### Dependencies

- Phases 1–3 complete.

### Tasks

- Add focused automated tests.
- Run clean-install, lint, build, and core-flow checks.
- Test unclear/silent audio, unrelated requests, missing details, unknown
  orders, out-of-stock products, and confirmation rejection.
- Save complete raw AI chat exports in `ai-chats/`.
- Write `PROCESS_REPORT.md`, including manual changes and corrections.
- Record a 2–5 minute demonstration video.

### Definition of Done

- Tests and production build pass.
- The direct-audio and real-tool flows are demonstrated.
- Required repository deliverables are present.
- AI transcripts are complete, ordered, raw, and secret-redacted only where
  necessary.
- The final process report honestly describes failures, fixes, and limitations.

## Phase 5 — Storefront and voice-agent experience

### Status

Complete.

### Tasks completed

- Added a Northstar Goods storefront homepage using the existing 15-product
  catalog as the only product data source.
- Added responsive product cards with real product photography, prices,
  descriptions, and stock status.
- Added a catalog-backed product details modal and dedicated
  `/products/[productId]` detail pages.
- Added a floating customer-facing voice-agent launcher and popup on the
  storefront, reusing the existing voice component and `/api/voice` route.
- Preserved the full-page `/voice` experience and all existing backend
  confirmation and tool behavior.
- Added remote image configuration and optimized image rendering.

### Definition of Done

- The storefront homepage renders all 15 products from the shared catalog.
- Each valid product ID has a server-rendered detail page with image, price,
  stock, delivery estimate, and a voice-agent link.
- Unknown product IDs return the normal Next.js not-found response.
- The floating voice popup opens, closes, supports Escape/backdrop dismissal,
  and retains the existing audio interaction.
- Lint, TypeScript checks, production build, and existing voice/tool tests pass.

## Phase 6 — Shopping navigation and order entry

### Status

Complete.

### Tasks completed

- Added Products, Orders, and Voice help navigation to the storefront and
  product detail pages.
- Replaced the product-detail voice CTA with a Buy now entry point.
- Added a lightweight `/orders` order-request page with product context,
  while intentionally keeping payments, checkout, and cart functionality out
  of scope.
- Kept voice assistance as an integrated project capability rather than the
  primary storefront navigation or shopping action.

### Definition of Done

- Customers can navigate directly between Products and Orders.
- In-stock product detail pages expose a Buy now action.
- The selected product is carried into the order-request page.
- Out-of-stock products cannot be started through Buy now.
- Existing voice functionality, API behavior, and backend confirmation rules
  remain intact.

## Phase 7 — Browser recording compatibility

### Status

Complete.

### Tasks completed

- Updated the Record control to use any compatible browser `MediaRecorder`
  format, including WebM/Opus.
- Added client-side audio decoding and PCM WAV encoding after recording.
- Kept `/api/voice` restricted to the existing MP3/WAV input contract.
- Updated setup documentation to explain the conversion behavior.

### Definition of Done

- Browsers that expose only WebM recording can produce a selectable WAV file.
- The recorded WAV follows the same upload path as an uploaded WAV file.
- No transcription service or new runtime dependency is introduced.
- Lint, TypeScript checks, and production build pass.

## Phase 8 — Audio response compatibility fix

### Status

Complete.

### Tasks completed

- Investigated the generic voice request failure using server logs and a known
  WAV sample.
- Confirmed OpenAI returned a successful audio response whose transcript was
  present in `message.audio.transcript`, while `message.content` was null.
- Updated the agent response extraction to accept either text content or the
  official audio transcript field.
- Preserved the existing direct-audio input, tool loop, and frontend response
  contract.

### Definition of Done

- Audio responses with a transcript are returned to the browser instead of
  being reported as a false 502.
- Tool-call responses continue through the existing loop.

## Phase 11 — Shared in-memory order storage

### Status

Complete.

### Tasks completed

- Added one process-local order store backed by a `Map` keyed by order number.
- Updated `place_order` to persist complete validated orders with session IDs.
- Updated `get_order_status` to read newly created orders and the seeded order
  `10481` from the same store.
- Preserved server-side confirmation, stock validation, and confirmation
  clearing to prevent reuse of a confirmed request.
- Added tests for placement-to-tracking, order fields, unique numbers,
  unknown orders, and confirmation protections.
- Documented the process-lifetime limitation of in-memory order storage.

### Definition of Done

- A successfully placed order can be retrieved by its generated order number
  in the same running process.
- Restarting the process honestly clears newly created orders; no database or
  external storage service is introduced.
- Tests, lint, TypeScript checks, and production build pass.

## Phase 12 — Global voice agent and storefront order CTA cleanup

### Status

Complete.

### Tasks completed

- Removed the misleading product-specific voice enquiry CTA from the product
  details modal.
- Renamed the order page action to clearly open the voice agent rather than
  implying that a payment or manual retail order is completed there.
- Mounted the floating voice-agent widget in the root layout so it is available
  on the storefront, product details, orders, voice, and not-found pages.
- Removed the duplicate storefront-only widget instance.
- Documented that the assessment order flow requires voice-agent confirmation
  and does not process payment.

### Definition of Done

- No product-specific “Ask about this product” or order-assistance CTA remains.
- The voice-agent launcher is rendered globally without duplicate launchers.
- Existing order validation, confirmation, storage, and voice functionality
  remain unchanged.
- The known WAV sample completes successfully when valid OpenAI credentials
  and model access are available.

## Phase 9 — Multi-turn audio conversation fix

### Status

Complete.

### Tasks completed

- Investigated a repeated-request failure using the running server logs.
- Found that generated assistant audio bytes were being retained in the
  in-memory conversation and replayed as `messages[*].audio.data`.
- Sanitized stored assistant messages to retain only role, text content,
  transcript fallback, and tool calls.
- Prevented generated audio payloads from being sent back to OpenAI on later
  turns.

### Definition of Done

- A second request in the same browser session does not replay generated
  audio bytes.
- Multi-turn tool and confirmation conversations retain their tool calls.
- Direct audio input and final response behavior remain unchanged.

## Phase 10 — Raw Copilot conversation export

### Status

Complete.

### Tasks completed

- Exported the native Copilot session event log into `ai-chats/`.
- Preserved chronological JSONL events, including user messages, assistant
  messages, tool calls, permissions, and file changes.
- Replaced API-key values only with `[REDACTED]`.
- Validated all 4,012 exported lines as valid JSON.

### Definition of Done

- A native-format raw export is present in `ai-chats/`.
- The export is not replaced by a summary.
- No API-key value remains in the committed export.

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

- Added a Northstar Goods storefront homepage using the existing six-product
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

- The storefront homepage renders all six products from the shared catalog.
- Each valid product ID has a server-rendered detail page with image, price,
  stock, delivery estimate, and a voice-agent link.
- Unknown product IDs return the normal Next.js not-found response.
- The floating voice popup opens, closes, supports Escape/backdrop dismissal,
  and retains the existing audio interaction.
- Lint, TypeScript checks, production build, and existing voice/tool tests pass.

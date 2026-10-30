# Sample recordings

These samples are local WAV recordings created for the assessment workflow.
They are intentionally small and contain no secrets.

| File | Scenario | Expected behavior |
|---|---|---|
| `product-question.wav` | Customer asks about a desk lamp under $50 | GPT sends a product lookup/list tool call, then answers using only catalog data. |
| `order-confirmation.wav` | Customer explicitly confirms two Aurora mugs for $37 | In a session with the matching pending order, GPT may call `confirm_order`, then `place_order`; the response must include the returned order number and status. |
| `unclear-audio.wav` | One second of silence | GPT should ask the customer to repeat themselves; no product or order tool should be invented or called. |

## Running a sample

1. Start the application with `npm run dev`.
2. Open <http://localhost:3000>.
3. Choose a sample file and click **Send audio**.
4. Inspect the terminal for structured `tool_call` events.

The order-confirmation sample is meaningful only after the same browser session
has established a matching pending order. The backend deliberately does not
allow a confirmation recording to bypass server-side state.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateAudioUpload } from "../src/lib/audio-validation";
import {
  executeTool,
  formatCustomerResponse,
  resetAgentSession,
} from "../src/lib/agent";

const validFile = new File(["RIFF audio sample"], "sample.wav", {
  type: "audio/wav",
});

const missingFile = validateAudioUpload(null, "session");
assert.equal(missingFile.ok, false);
if (!missingFile.ok) assert.equal(missingFile.status, 400);

const missingSession = validateAudioUpload(validFile, null);
assert.equal(missingSession.ok, false);

const unsupportedFile = new File(["audio"], "sample.webm", {
  type: "audio/webm",
});
const unsupported = validateAudioUpload(unsupportedFile, "session");
assert.equal(unsupported.ok, false);
if (!unsupported.ok) assert.equal(unsupported.status, 415);

const emptyFile = new File([], "empty.wav", { type: "audio/wav" });
const empty = validateAudioUpload(emptyFile, "session");
assert.equal(empty.ok, false);

const valid = validateAudioUpload(validFile, "  session-1  ");
assert.deepEqual(valid, { ok: true, format: "wav", sessionId: "session-1" });

const sessionId = "phase-4-confirmation";
resetAgentSession(sessionId);
const outOfStock = executeTool(
  sessionId,
  "request_order_confirmation",
  JSON.stringify({ productId: "playstation-5-slim", quantity: 1 }),
);
assert.equal(outOfStock.ok, false);

const invalidArguments = executeTool(sessionId, "place_order", "{invalid");
assert.equal(invalidArguments.ok, false);

const unknownTool = executeTool(sessionId, "unknown_tool", "{}");
assert.equal(unknownTool.ok, false);

const prompt = readFileSync("prompts/system_prompt.md", "utf8");
assert.match(prompt, /Help only with products, product information, orders, and order status/);
assert.match(prompt, /Politely decline unrelated requests/);
const outOfScopeTool = executeTool(
  sessionId,
  "weather_forecast",
  JSON.stringify({ location: "London" }),
);
assert.equal(outOfScopeTool.ok, false);

assert.match(prompt, /Never return raw JSON/);
const orderText =
  "Your order for one Apple MacBook Air 13-inch has been successfully placed. The total price is $999, and the order number is 10485. The current status is processing, and the estimated delivery time is 3-5 business days. Thank you for your purchase!";
assert.equal(formatCustomerResponse(`{"${orderText}"}`), orderText);
assert.equal(
  formatCustomerResponse(JSON.stringify({ response: orderText })),
  orderText,
);
assert.equal(
  formatCustomerResponse(
    `Northstar\n{"productId": "apple-macbook-air-13", "quantity": 1}\n{"productId": "apple-macbook-air-13", "quantity": 1}`,
  ),
  "I’m sorry, I couldn’t generate a clear response. Please try again.",
);

console.log("Phase 4 validation and error tests passed.");

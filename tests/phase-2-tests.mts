import assert from "node:assert/strict";
import { executeTool, resetAgentSession } from "../src/lib/agent";

const sessionId = "phase-2-test-session";
resetAgentSession(sessionId);

const blocked = executeTool(
  sessionId,
  "place_order",
  JSON.stringify({ productId: "aurora-mug", quantity: 1 }),
);
assert.equal(blocked.ok, false);

const pending = executeTool(
  sessionId,
  "request_order_confirmation",
  JSON.stringify({ productId: "aurora-mug", quantity: 2 }),
);
assert.equal(pending.ok, true);

const wrongConfirmation = executeTool(
  sessionId,
  "confirm_order",
  JSON.stringify({ productId: "aurora-mug", quantity: 2, totalPrice: 18.5 }),
);
assert.equal(wrongConfirmation.ok, false);

const confirmation = executeTool(
  sessionId,
  "confirm_order",
  JSON.stringify({ productId: "aurora-mug", quantity: 2, totalPrice: 37 }),
);
assert.equal(confirmation.ok, true);

const placed = executeTool(
  sessionId,
  "place_order",
  JSON.stringify({ productId: "aurora-mug", quantity: 2 }),
);
assert.equal(placed.ok, true);

const cannotPlaceAgain = executeTool(
  sessionId,
  "place_order",
  JSON.stringify({ productId: "aurora-mug", quantity: 2 }),
);
assert.equal(cannotPlaceAgain.ok, false);

console.log("Phase 2 confirmation tests passed.");

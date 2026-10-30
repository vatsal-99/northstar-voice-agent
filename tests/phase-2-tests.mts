import assert from "node:assert/strict";
import { executeTool, resetAgentSession } from "../src/lib/agent";
import { getOrderStatus } from "../tools/get-order-status";

const sessionId = "phase-2-test-session";
resetAgentSession(sessionId);

const blocked = executeTool(
  sessionId,
  "place_order",
  JSON.stringify({ productId: "apple-airpods-pro", quantity: 1 }),
);
assert.equal(blocked.ok, false);

const pending = executeTool(
  sessionId,
  "request_order_confirmation",
  JSON.stringify({ productId: "apple-airpods-pro", quantity: 2 }),
);
assert.equal(pending.ok, true);

const rejected = executeTool(
  sessionId,
  "place_order",
  JSON.stringify({ productId: "apple-airpods-pro", quantity: 2 }),
);
assert.equal(rejected.ok, false);

const wrongConfirmation = executeTool(
  sessionId,
  "confirm_order",
  JSON.stringify({ productId: "apple-airpods-pro", quantity: 2, totalPrice: 100 }),
);
assert.equal(wrongConfirmation.ok, false);

const confirmation = executeTool(
  sessionId,
  "confirm_order",
  JSON.stringify({ productId: "apple-airpods-pro", quantity: 2, totalPrice: 498 }),
);
assert.equal(confirmation.ok, true);

const placed = executeTool(
  sessionId,
  "place_order",
  JSON.stringify({ productId: "apple-airpods-pro", quantity: 2 }),
);
assert.equal(placed.ok, true);

if (placed.ok) {
  const orderNumber = (placed.data as { orderNumber: string }).orderNumber;
  const tracked = getOrderStatus({ orderNumber });
  assert.equal(tracked.ok, true);
  if (tracked.ok) {
    const stored = tracked.data as {
      product: string;
      quantity: number;
      totalPrice: number;
      status: string;
    };
    assert.equal(stored.product, "Apple AirPods Pro");
    assert.equal(stored.quantity, 2);
    assert.equal(stored.totalPrice, 498);
    assert.equal(stored.status, "processing");
  }

  const cannotPlaceAgain = executeTool(
    sessionId,
    "place_order",
    JSON.stringify({ productId: "apple-airpods-pro", quantity: 2 }),
  );
  assert.equal(cannotPlaceAgain.ok, false);
}

console.log("Phase 2 confirmation tests passed.");

import assert from "node:assert/strict";
import { getOrderStatus } from "../tools/get-order-status";
import { createOrder, getOrder } from "../tools/order-store";
import { catalog } from "../tools/catalog";

const mug = catalog.find((product) => product.id === "aurora-mug");
assert.ok(mug);

const first = createOrder(mug, 1, "order-store-test");
const second = createOrder(mug, 2, "order-store-test");
assert.notEqual(first.orderNumber, second.orderNumber);
assert.equal(getOrder(first.orderNumber), first);
assert.equal(getOrder(second.orderNumber), second);

const tracked = getOrderStatus({ orderNumber: first.orderNumber });
assert.deepEqual(tracked, { ok: true, data: first });

const unknown = getOrderStatus({ orderNumber: "99999" });
assert.deepEqual(unknown, {
  ok: false,
  error: "Order '99999' was not found.",
});

console.log("Order store tests passed.");

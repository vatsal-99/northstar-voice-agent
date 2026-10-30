import assert from "node:assert/strict";
import { getOrderStatus } from "./get-order-status";
import { getProductDetails } from "./get-product-details";
import { listProducts } from "./list-products";
import { placeOrder } from "./place-order";

const allProducts = listProducts();
assert.equal(allProducts.ok, true);
if (allProducts.ok) {
  assert.equal(JSON.stringify(allProducts.data).includes('"count":6'), true);
}

const mug = getProductDetails({ productId: "aurora-mug" });
assert.equal(mug.ok, true);

const order = placeOrder({ productId: "aurora-mug", quantity: 2 });
assert.equal(order.ok, true);
if (order.ok) {
  assert.equal(JSON.stringify(order.data).includes('"totalPrice":37'), true);
}

const unavailable = placeOrder({
  productId: "summit-water-bottle",
  quantity: 1,
});
assert.equal(unavailable.ok, false);

const knownOrder = getOrderStatus({ orderNumber: "10481" });
assert.equal(knownOrder.ok, true);

const unknownOrder = getOrderStatus({ orderNumber: "99999" });
assert.equal(unknownOrder.ok, false);

console.log("Tool tests passed.");

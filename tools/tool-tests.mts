import assert from "node:assert/strict";
import { getOrderStatus } from "./get-order-status";
import { getProductDetails } from "./get-product-details";
import { listProducts } from "./list-products";
import { placeOrder } from "./place-order";

const allProducts = listProducts();
assert.equal(allProducts.ok, true);
if (allProducts.ok) {
  assert.equal(JSON.stringify(allProducts.data).includes('"count":15'), true);
}

const airPods = getProductDetails({ productId: "apple-airpods-pro" });
assert.equal(airPods.ok, true);

const order = placeOrder({ productId: "apple-airpods-pro", quantity: 2 });
assert.equal(order.ok, true);
if (order.ok) {
  assert.equal(JSON.stringify(order.data).includes('"totalPrice":498'), true);
}

const unavailable = placeOrder({
  productId: "playstation-5-slim",
  quantity: 1,
});
assert.equal(unavailable.ok, false);

const knownOrder = getOrderStatus({ orderNumber: "10481" });
assert.equal(knownOrder.ok, true);

const unknownOrder = getOrderStatus({ orderNumber: "99999" });
assert.equal(unknownOrder.ok, false);

console.log("Tool tests passed.");

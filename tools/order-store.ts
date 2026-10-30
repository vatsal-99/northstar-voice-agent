import type { Product, StoredOrder } from "./types";

const orders = new Map<string, StoredOrder>([
  [
    "10481",
    {
      orderNumber: "10481",
      productId: "trailhead-backpack",
      product: "Trailhead Day Backpack",
      quantity: 1,
      unitPrice: 64,
      totalPrice: 64,
      currency: "USD",
      status: "shipped",
      estimatedDelivery: "2026-11-03",
      sessionId: "seeded-order",
      createdAt: "2026-10-29T12:00:00.000Z",
    },
  ],
]);

let nextOrderNumber = 10482;

export function createOrder(
  product: Product,
  quantity: number,
  sessionId: string,
): StoredOrder {
  const orderNumber = String(nextOrderNumber++);
  const totalPrice = Number((product.price * quantity).toFixed(2));
  const order: StoredOrder = {
    orderNumber,
    productId: product.id,
    product: product.name,
    quantity,
    unitPrice: product.price,
    totalPrice,
    currency: product.currency,
    status: "processing",
    estimatedDelivery: product.deliveryEstimate,
    sessionId,
    createdAt: new Date().toISOString(),
  };

  orders.set(orderNumber, order);
  return order;
}

export function getOrder(orderNumber: string): StoredOrder | undefined {
  return orders.get(orderNumber);
}

export function listOrdersForSession(sessionId: string): StoredOrder[] {
  return [...orders.values()].filter((order) => order.sessionId === sessionId);
}

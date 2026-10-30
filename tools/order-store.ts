import type { Product, StoredOrder } from "./types";

const orders = new Map<string, StoredOrder>([
  [
    "10481",
    {
      orderNumber: "10481",
      productId: "apple-macbook-air-13",
      product: "Apple MacBook Air 13-inch",
      quantity: 1,
      unitPrice: 999,
      totalPrice: 999,
      currency: "USD",
      status: "shipped",
      estimatedDelivery: "2026-11-03",
      sessionId: "seeded-order",
      createdAt: "2026-10-29T12:00:00.000Z",
    },
  ],
  [
    "10480",
    {
      orderNumber: "10480",
      productId: "sony-wh-1000xm5",
      product: "Sony WH-1000XM5 Headphones",
      quantity: 1,
      unitPrice: 399.99,
      totalPrice: 399.99,
      currency: "USD",
      status: "processing",
      estimatedDelivery: "2026-11-05",
      sessionId: "seeded-order",
      createdAt: "2026-10-28T15:30:00.000Z",
    },
  ],
  [
    "10479",
    {
      orderNumber: "10479",
      productId: "playstation-5-dualsense-controller",
      product: "PlayStation 5 DualSense Controller",
      quantity: 2,
      unitPrice: 74.99,
      totalPrice: 149.98,
      currency: "USD",
      status: "shipped",
      estimatedDelivery: "2026-11-01",
      sessionId: "seeded-order",
      createdAt: "2026-10-26T09:15:00.000Z",
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
  return [...orders.values()]
    .filter((order) => order.sessionId === sessionId || order.sessionId === "seeded-order")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listOrders(): StoredOrder[] {
  return [...orders.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

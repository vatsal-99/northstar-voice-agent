import { logToolCall } from "./logger";
import type { OrderStatusArgs, ToolResult } from "./types";

const orders = new Map([
  [
    "10481",
    {
      orderNumber: "10481",
      status: "shipped",
      items: [{ product: "Trailhead Day Backpack", quantity: 1 }],
      deliveryDate: "2026-11-03",
    },
  ],
]);

export function getOrderStatus(args: OrderStatusArgs): ToolResult {
  const orderNumber = args.orderNumber.trim();
  const order = orders.get(orderNumber);
  const result: ToolResult = order
    ? { ok: true, data: order }
    : { ok: false, error: `Order '${orderNumber}' was not found.` };

  logToolCall("get_order_status", args, result);
  return result;
}
